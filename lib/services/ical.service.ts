import { addBlockedDates, clearBlockedDatesFromSource } from "@/lib/repositories/blockedDate.repository";
import { getActiveProperties } from "@/lib/repositories/property.repository";

interface ICSVeEvent {
  dtstart?: { value: string };
  dtend?: { value: string };
  summary?: { value: string };
  uid?: { value: string };
}

function parseICSDate(value: string): Date {
  const cleaned = value.replace(/[^0-9T]/g, "");
  const year = cleaned.slice(0, 4);
  const month = cleaned.slice(4, 6);
  const day = cleaned.slice(6, 8);
  const hour = cleaned.slice(9, 11) || "00";
  const minute = cleaned.slice(11, 13) || "00";
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
}

function parseICSEvents(icsText: string): ICSVeEvent[] {
  const events: ICSVeEvent[] = [];
  const eventMatches = icsText.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g);

  if (!eventMatches) return events;

  for (const eventText of eventMatches) {
    const event: ICSVeEvent = {};
    const dtstartMatch = eventText.match(/DTSTART[^:]*:([^\r\n]+)/);
    const dtendMatch = eventText.match(/DTEND[^:]*:([^\r\n]+)/);
    const summaryMatch = eventText.match(/SUMMARY[^:]*:([^\r\n]+)/);
    const uidMatch = eventText.match(/UID[^:]*:([^\r\n]+)/);

    if (dtstartMatch) event.dtstart = { value: dtstartMatch[1] };
    if (dtendMatch) event.dtend = { value: dtendMatch[1] };
    if (summaryMatch) event.summary = { value: summaryMatch[1] };
    if (uidMatch) event.uid = { value: uidMatch[1] };

    events.push(event);
  }

  return events;
}

export async function syncIcalFromUrl(
  propertyId: string,
  icalUrl: string,
  source: string
): Promise<number> {
  try {
    const response = await fetch(icalUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal: ${response.status}`);
    }

    const icsText = await response.text();
    const events = parseICSEvents(icsText);

    await clearBlockedDatesFromSource(propertyId, source);

    const dates: Date[] = [];

    for (const event of events) {
      if (!event.dtstart?.value || !event.dtend?.value) continue;

      const start = parseICSDate(event.dtstart.value);
      const end = parseICSDate(event.dtend.value);

      const current = new Date(start);
      while (current < end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }

    if (dates.length > 0) {
      await addBlockedDates(propertyId, dates, source);
    }

    return dates.length;
  } catch (error) {
    console.error(`iCal sync error for property ${propertyId}:`, error);
    return 0;
  }
}

export async function syncAllIcalFeeds(): Promise<{
  synced: number;
  errors: number;
}> {
  const properties = await getActiveProperties();
  let synced = 0;
  let errors = 0;

  for (const property of properties) {
    if (property.airbnbIcalUrl) {
      try {
        const count = await syncIcalFromUrl(
          property.id,
          property.airbnbIcalUrl,
          "airbnb"
        );
        synced += count;
      } catch {
        errors++;
      }
    }

    if (property.bookingIcalUrl) {
      try {
        const count = await syncIcalFromUrl(
          property.id,
          property.bookingIcalUrl,
          "booking"
        );
        synced += count;
      } catch {
        errors++;
      }
    }
  }

  return { synced, errors };
}

export function generateIcalFeed(
  propertyName: string,
  reservations: Array<{
    checkIn: Date;
    checkOut: Date;
    guestName: string;
  }>
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Heritage Housing//Booking System//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  reservations.forEach((res, index) => {
    const uid = `${Date.now()}-${index}@heritagehousing.cl`;
    const dtstart = res.checkIn.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtend = res.checkOut.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstart}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:Ocupado - ${res.guestName}`,
      `DESCRIPTION:Reservación directa en ${propertyName}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

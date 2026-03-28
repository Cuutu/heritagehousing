import { NextRequest, NextResponse } from "next/server";
import { getUnavailableDatesInRange } from "@/lib/services/availability.service";
import { addYears, endOfDay, startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json(
      { error: "propertyId es obligatorio" },
      { status: 400 }
    );
  }

  const startDate = startOfDay(new Date());
  const endDate = endOfDay(addYears(new Date(), 2));
  const dates = await getUnavailableDatesInRange(propertyId, startDate, endDate);

  return NextResponse.json({
    blockedDates: dates.map((d) => d.toISOString()),
  });
}

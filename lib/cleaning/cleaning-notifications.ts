import { prisma } from "@/lib/prisma";
import { CleaningStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    console.warn("Meta WhatsApp: faltan META_PHONE_NUMBER_ID o META_ACCESS_TOKEN");
    return false;
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    }
  );

  return res.ok;
}

function buildCleaningMessage(params: {
  staffName: string;
  propertyName: string;
  propertyAddress: string;
  cleaningDate: Date;
  daysUntil: number;
}): string {
  const { staffName, propertyName, propertyAddress, cleaningDate, daysUntil } =
    params;
  const dateStr = format(cleaningDate, "EEEE dd 'de' MMMM", { locale: es });
  const when =
    daysUntil === 0
      ? "HOY"
      : daysUntil === 1
        ? "mañana"
        : `en ${daysUntil} días`;

  return `Hola ${staffName} 👋
Recordatorio de limpieza *Heritage Housing*:

🏠 *${propertyName}*
📍 ${propertyAddress}
📅 *${dateStr}* (${when})
⏰ Checkout: 11:00 hs

Por favor confirmá respondiendo *SÍ* ✅`;
}

const MAX_WHATSAPP_TEXT = 4096;

export type SendWhatsAppReminderOptions = {
  /** Si viene con texto, se envía tal cual (pruebas) y no se actualiza la asignación. */
  customMessage?: string;
};

export async function sendWhatsAppReminder(
  assignmentId: string,
  options?: SendWhatsAppReminderOptions
) {
  const id = z.string().cuid().parse(assignmentId);

  const assignment = await prisma.cleaningAssignment.findUnique({
    where: { id },
    include: {
      staff: true,
      property: true,
    },
  });

  if (!assignment) throw new Error("Assignment not found");

  const custom = options?.customMessage?.trim();
  const useCustom = Boolean(custom && custom.length > 0);

  if (custom && custom.length > MAX_WHATSAPP_TEXT) {
    throw new Error(`El mensaje supera ${MAX_WHATSAPP_TEXT} caracteres`);
  }

  const message = useCustom && custom
    ? custom
    : buildCleaningMessage({
        staffName: assignment.staff.name,
        propertyName: assignment.property.name,
        propertyAddress: assignment.property.location,
        cleaningDate: assignment.cleaningDate,
        daysUntil: Math.ceil(
          (assignment.cleaningDate.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        ),
      });

  const success = await sendWhatsApp(assignment.staff.phone, message);

  if (success && !useCustom) {
    await prisma.cleaningAssignment.update({
      where: { id },
      data: { notifiedAt: new Date(), status: CleaningStatus.NOTIFIED },
    });
  }

  revalidatePath("/admin/limpieza");
  return success;
}

/**
 * Prueba de WhatsApp sin asignación (mismo canal Meta que los recordatorios).
 */
export async function sendWhatsAppTestToStaff(
  staffId: string,
  message: string
): Promise<boolean> {
  const id = z.string().cuid().parse(staffId);
  const trimmed = message.trim();
  if (!trimmed.length) {
    throw new Error("El mensaje está vacío");
  }
  if (trimmed.length > MAX_WHATSAPP_TEXT) {
    throw new Error(`El mensaje supera ${MAX_WHATSAPP_TEXT} caracteres`);
  }

  const staff = await prisma.cleaningStaff.findUnique({
    where: { id },
  });
  if (!staff?.active) {
    throw new Error("Personal no encontrado o inactivo");
  }

  const success = await sendWhatsApp(staff.phone, trimmed);
  revalidatePath("/admin/limpieza");
  return success;
}

export async function runCleaningCronJob() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const assignments = await prisma.cleaningAssignment.findMany({
    where: {
      cleaningDate: { gte: tomorrow, lt: dayAfterTomorrow },
      status: CleaningStatus.PENDING,
    },
    include: { staff: true, property: true },
  });

  const results = await Promise.all(
    assignments.map((a) => sendWhatsAppReminder(a.id))
  );

  return { sent: results.filter(Boolean).length, total: assignments.length };
}

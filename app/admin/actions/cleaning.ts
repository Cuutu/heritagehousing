"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  sendWhatsAppReminder as sendWhatsAppReminderSvc,
  sendWhatsAppTestToStaff as sendWhatsAppTestToStaffSvc,
} from "@/lib/cleaning/cleaning-notifications";
import {
  normalizeWhatsAppPhone,
  whatsappPhoneHint,
} from "@/lib/phone/whatsapp-phone";

export type SendWhatsAppReminderActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendWhatsAppReminder(
  assignmentId: string,
  customMessage?: string | null
): Promise<SendWhatsAppReminderActionResult> {
  const trimmed = customMessage?.trim() ?? "";
  if (trimmed.length > 4096) {
    return { ok: false, error: "El mensaje no puede superar 4096 caracteres." };
  }
  try {
    const result = await sendWhatsAppReminderSvc(
      assignmentId,
      trimmed ? { customMessage: trimmed } : undefined
    );
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al enviar";
    return { ok: false, error: msg };
  }
}

export async function sendWhatsAppTestToStaff(
  staffId: string,
  message: string | null
): Promise<SendWhatsAppReminderActionResult> {
  const trimmed = message?.trim() ?? "";
  if (!trimmed.length) {
    return { ok: false, error: "Escribí un mensaje de prueba arriba." };
  }
  if (trimmed.length > 4096) {
    return { ok: false, error: "El mensaje no puede superar 4096 caracteres." };
  }
  try {
    const result = await sendWhatsAppTestToStaffSvc(staffId, trimmed);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al enviar";
    return { ok: false, error: msg };
  }
}

const assignmentCreateSchema = z.object({
  reservationId: z.string().cuid(),
  staffId: z.string().cuid(),
  propertyId: z.string().cuid(),
  cleaningDate: z.coerce.date(),
});

export async function createAssignment(
  data: z.infer<typeof assignmentCreateSchema>
) {
  const parsed = assignmentCreateSchema.parse(data);
  await prisma.cleaningAssignment.create({
    data: {
      reservationId: parsed.reservationId,
      staffId: parsed.staffId,
      propertyId: parsed.propertyId,
      cleaningDate: parsed.cleaningDate,
    },
  });
  revalidatePath("/admin/limpieza");
}

const staffCreateSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresá el teléfono")
    .transform((s) => normalizeWhatsAppPhone(s))
    .refine((s): s is string => s !== null, { message: whatsappPhoneHint() }),
});

export type CleaningStaffActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createCleaningStaff(
  data: unknown
): Promise<CleaningStaffActionResult> {
  const parsed = staffCreateSchema.safeParse(data);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg =
      [...(flat.fieldErrors.name ?? []), ...(flat.fieldErrors.phone ?? [])][0] ??
      "Revisá los datos";
    return { success: false, error: msg };
  }
  try {
    await prisma.cleaningStaff.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        active: true,
      },
    });
    revalidatePath("/admin/limpieza");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo guardar. Probá de nuevo." };
  }
}

const staffIdSchema = z.string().cuid();

export async function setCleaningStaffActive(
  id: string,
  active: boolean
): Promise<CleaningStaffActionResult> {
  const parsedId = staffIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: "Identificador inválido" };
  }
  try {
    await prisma.cleaningStaff.update({
      where: { id: parsedId.data },
      data: { active },
    });
    revalidatePath("/admin/limpieza");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo actualizar el personal." };
  }
}

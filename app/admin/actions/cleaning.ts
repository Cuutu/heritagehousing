"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendWhatsAppReminder as sendWhatsAppReminderSvc } from "@/lib/cleaning/cleaning-notifications";

export async function sendWhatsAppReminder(assignmentId: string) {
  return sendWhatsAppReminderSvc(assignmentId);
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

/** Normaliza a 569XXXXXXXX (WhatsApp Chile, sin +). */
function normalizeChileWhatsApp(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("569")) return d;
  if (d.length === 9 && d.startsWith("9")) return `56${d}`;
  return d;
}

const staffCreateSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresá el teléfono")
    .transform((s) => normalizeChileWhatsApp(s))
    .refine(
      (s) => /^569[0-9]{8}$/.test(s),
      "Móvil Chile: ej. +56 9 1234 5678 o 912345678"
    ),
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

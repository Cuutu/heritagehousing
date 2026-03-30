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

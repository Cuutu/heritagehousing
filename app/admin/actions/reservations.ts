"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ReservationLifecycleStatus } from "@prisma/client";
import { z } from "zod";

const idSchema = z.string().cuid();
const lifecycleSchema = z.nativeEnum(ReservationLifecycleStatus);

export async function updateReservationStatus(
  id: string,
  status: string,
  notes?: string
) {
  const parsedId = idSchema.parse(id);
  const parsedStatus = lifecycleSchema.parse(status);
  const notesTrimmed =
    notes === undefined ? undefined : notes.trim() || null;

  await prisma.reservation.update({
    where: { id: parsedId },
    data: {
      lifecycleStatus: parsedStatus,
      ...(notesTrimmed !== undefined && { notes: notesTrimmed }),
    },
  });
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  revalidatePath("/admin/calendario");
}

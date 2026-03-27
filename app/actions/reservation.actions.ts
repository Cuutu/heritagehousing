"use server";

import { revalidatePath } from "next/cache";
import { updateReservationStatus } from "@/lib/repositories/reservation.repository";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

const statusSchema = z.nativeEnum(PaymentStatus);

export async function updateReservationStatusAction(id: string, status: string) {
  try {
    z.string().cuid().parse(id);
    const s = statusSchema.parse(status);
    await updateReservationStatus(id, s);
    revalidatePath("/admin/reservas");
    revalidatePath("/admin");
    revalidatePath("/admin/calendario");
    return { success: true as const };
  } catch (e) {
    console.error("updateReservationStatusAction", e);
    return { success: false as const, error: "No se pudo actualizar el estado" };
  }
}

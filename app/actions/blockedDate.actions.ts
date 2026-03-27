"use server";

import { revalidatePath } from "next/cache";
import { eachDayOfInterval, startOfDay } from "date-fns";
import { addBlockedDate } from "@/lib/repositories/blockedDate.repository";
import { z } from "zod";

const manualBlockSchema = z.object({
  propertyId: z.string().cuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export async function addManualBlockedRangeAction(raw: unknown) {
  try {
    const { propertyId, startDate, endDate } = manualBlockSchema.parse(raw);
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    if (end < start) {
      return { success: false as const, error: "La fecha fin debe ser posterior al inicio" };
    }
    const days = eachDayOfInterval({ start, end });
    for (const d of days) {
      await addBlockedDate(propertyId, d, "manual");
    }
    revalidatePath("/admin/calendario");
    revalidatePath("/alquileres");
    return { success: true as const, daysBlocked: days.length };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false as const, error: "Datos inválidos", issues: e.errors };
    }
    console.error("addManualBlockedRangeAction", e);
    return { success: false as const, error: "No se pudo guardar" };
  }
}

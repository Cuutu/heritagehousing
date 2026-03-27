"use server";

import { revalidatePath } from "next/cache";
import { propertySchema, type PropertyInput } from "@/lib/validations/property.schema";
import {
  createProperty as repoCreate,
  updateProperty as repoUpdate,
  deleteProperty as repoDelete,
} from "@/lib/repositories/property.repository";
import { z } from "zod";

const idSchema = z.string().cuid();

export async function createPropertyAction(raw: unknown) {
  try {
    const data = propertySchema.parse(raw) as PropertyInput;
    await repoCreate({
      ...data,
      airbnbIcalUrl: data.airbnbIcalUrl || undefined,
      bookingIcalUrl: data.bookingIcalUrl || undefined,
    });
    revalidatePath("/admin/propiedades");
    revalidatePath("/alquileres");
    return { success: true as const };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false as const, error: "Validación fallida", issues: e.errors };
    }
    console.error("createPropertyAction", e);
    return { success: false as const, error: "No se pudo crear la propiedad" };
  }
}

export async function updatePropertyAction(id: string, raw: unknown) {
  try {
    idSchema.parse(id);
    const data = propertySchema.partial().parse(raw);
    await repoUpdate(id, data as Partial<PropertyInput>);
    revalidatePath("/admin/propiedades");
    revalidatePath("/alquileres");
    return { success: true as const };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false as const, error: "Validación fallida", issues: e.errors };
    }
    console.error("updatePropertyAction", e);
    return { success: false as const, error: "No se pudo actualizar" };
  }
}

export async function togglePropertyActiveAction(id: string) {
  try {
    idSchema.parse(id);
    const { prisma } = await import("@/lib/prisma");
    const current = await prisma.property.findUnique({ where: { id } });
    if (!current) {
      return { success: false as const, error: "No encontrada" };
    }
    await prisma.property.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    revalidatePath("/admin/propiedades");
    revalidatePath("/alquileres");
    return { success: true as const };
  } catch (e) {
    console.error("togglePropertyActiveAction", e);
    return { success: false as const, error: "Error al cambiar estado" };
  }
}

export async function deletePropertyAction(id: string) {
  try {
    idSchema.parse(id);
    await repoDelete(id);
    revalidatePath("/admin/propiedades");
    revalidatePath("/alquileres");
    return { success: true as const };
  } catch (e) {
    console.error("deletePropertyAction", e);
    return { success: false as const, error: "No se pudo eliminar" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import {
  propertySchema,
  propertyUpdateSchema,
  type PropertyInput,
} from "@/lib/validations/property.schema";
import {
  createProperty as repoCreate,
  updateProperty as repoUpdate,
  deleteProperty as repoDelete,
} from "@/lib/repositories/property.repository";
import { resolveGoogleMapsCoordinates } from "@/lib/maps/parseGoogleMapsUrl";
import { z } from "zod";

const idSchema = z.string().cuid();

async function mergeCoordsFromGoogleLink(
  data: Partial<PropertyInput>
): Promise<Partial<PropertyInput>> {
  const hasPair =
    data.latitude != null &&
    data.longitude != null &&
    Number.isFinite(data.latitude) &&
    Number.isFinite(data.longitude);
  if (hasPair) return data;
  const link = data.googleMapsLink?.trim();
  if (!link) return data;
  const c = await resolveGoogleMapsCoordinates(link);
  if (!c) return data;
  return { ...data, latitude: c.lat, longitude: c.lng };
}

export async function parseGoogleMapsLinkAction(url: string) {
  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Pegá un enlace de Google Maps" };
  }
  const c = await resolveGoogleMapsCoordinates(trimmed);
  if (!c) {
    return {
      ok: false as const,
      error:
        "No se pudieron leer coordenadas. Probá con el enlace completo desde “Compartir” en Google Maps, o cargá lat/lng a mano.",
    };
  }
  return { ok: true as const, lat: c.lat, lng: c.lng };
}

export async function createPropertyAction(raw: unknown) {
  try {
    const parsed = propertySchema.parse(raw) as PropertyInput;
    const data = (await mergeCoordsFromGoogleLink(
      parsed
    )) as PropertyInput;
    const created = await repoCreate({
      ...data,
      airbnbIcalUrl: data.airbnbIcalUrl || undefined,
      bookingIcalUrl: data.bookingIcalUrl || undefined,
    });
    revalidatePath("/admin/propiedades");
    revalidatePath("/alquileres");
    return { success: true as const, id: created.id };
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
    let data = propertyUpdateSchema.parse(raw) as Partial<PropertyInput>;
    data = await mergeCoordsFromGoogleLink(data);
    await repoUpdate(id, data);
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

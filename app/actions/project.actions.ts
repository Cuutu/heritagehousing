"use server";

import { revalidatePath } from "next/cache";
import { projectSchema } from "@/lib/validations/project.schema";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const idSchema = z.string().cuid();

export async function createProjectAction(raw: unknown) {
  try {
    const data = projectSchema.parse(raw);
    await prisma.project.create({ data });
    revalidatePath("/admin/proyectos");
    revalidatePath("/remodelaciones");
    return { success: true as const };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false as const, error: "Validación fallida", issues: e.errors };
    }
    console.error("createProjectAction", e);
    return { success: false as const, error: "No se pudo crear el proyecto" };
  }
}

export async function updateProjectAction(id: string, raw: unknown) {
  try {
    idSchema.parse(id);
    const data = projectSchema.partial().parse(raw);
    await prisma.project.update({ where: { id }, data });
    revalidatePath("/admin/proyectos");
    revalidatePath("/remodelaciones");
    return { success: true as const };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false as const, error: "Validación fallida", issues: e.errors };
    }
    console.error("updateProjectAction", e);
    return { success: false as const, error: "No se pudo actualizar" };
  }
}

export async function toggleProjectActiveAction(id: string) {
  try {
    idSchema.parse(id);
    const current = await prisma.project.findUnique({ where: { id } });
    if (!current) return { success: false as const, error: "No encontrado" };
    await prisma.project.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    revalidatePath("/admin/proyectos");
    revalidatePath("/remodelaciones");
    return { success: true as const };
  } catch (e) {
    console.error("toggleProjectActiveAction", e);
    return { success: false as const, error: "Error" };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    idSchema.parse(id);
    await prisma.project.delete({ where: { id } });
    revalidatePath("/admin/proyectos");
    revalidatePath("/remodelaciones");
    return { success: true as const };
  } catch (e) {
    console.error("deleteProjectAction", e);
    return { success: false as const, error: "No se pudo eliminar" };
  }
}

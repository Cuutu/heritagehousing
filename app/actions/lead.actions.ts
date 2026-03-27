"use server";

import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations/lead.schema";
import { z } from "zod";

export async function submitLead(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || undefined,
      projectType: formData.get("projectType") as string,
      message: formData.get("message") as string,
    };

    const validated = leadSchema.parse(data);

    await prisma.lead.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        projectType: validated.projectType,
        message: validated.message,
      },
    });

    return { success: true, message: "Lead creado exitosamente" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Datos inválidos", errors: error.errors };
    }
    console.error("Lead submission error:", error);
    return { success: false, message: "Error al procesar la solicitud" };
  }
}

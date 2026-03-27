import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations/lead.schema";
import { sendLeadNotification } from "@/lib/services/email.service";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = leadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        projectType: data.projectType,
        message: data.message,
      },
    });

    try {
      await sendLeadNotification({
        name: data.name,
        email: data.email,
        phone: data.phone,
        projectType: data.projectType,
        message: data.message,
      });
    } catch (emailError) {
      console.error("Failed to send lead notification email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Lead creado exitosamente",
      leadId: lead.id,
    });
  } catch (error) {
    console.error("Lead creation error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

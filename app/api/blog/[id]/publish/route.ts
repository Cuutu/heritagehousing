import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { PostPublishSchema } from "@/lib/validations/post.schema";

type RouteContext = { params: { id: string } };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) return authResult.response;

  const { id } = context.params;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { published } = PostPublishSchema.parse(body);

    const post = await prisma.post.update({
      where: { id },
      data: {
        published,
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("PATCH /api/blog/[id]/publish", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar la publicación" },
      { status: 500 }
    );
  }
}

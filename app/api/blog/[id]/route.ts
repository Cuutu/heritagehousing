import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { PostUpdateSchema } from "@/lib/validations/post.schema";
import { ensureUniquePostSlug } from "@/lib/repositories/post.repository";
import { generateSlug } from "@/lib/utils";

type RouteContext = { params: { id: string } };

export async function PUT(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) return authResult.response;

  const { id } = context.params;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const data = PostUpdateSchema.parse(body);

    const nextSlug =
      data.slug !== undefined
        ? await ensureUniquePostSlug(
            generateSlug(data.slug) || data.slug,
            id
          )
        : undefined;

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.coverImage !== undefined && {
          coverImage: data.coverImage ?? null,
        }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.author !== undefined && { author: data.author }),
        ...(nextSlug !== undefined && { slug: nextSlug }),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("PUT /api/blog/[id]", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar el post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) return authResult.response;

  const { id } = context.params;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/blog/[id]", error);
    return NextResponse.json(
      { error: "Error al eliminar el post" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { PostCreateSchema } from "@/lib/validations/post.schema";
import { ensureUniquePostSlug } from "@/lib/repositories/post.repository";
import { generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const data = PostCreateSchema.parse(body);

    const baseSlug = data.slug
      ? generateSlug(data.slug)
      : generateSlug(data.title);
    const slug = await ensureUniquePostSlug(baseSlug || data.title);

    const post = await prisma.post.create({
      data: {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage ?? null,
        tags: data.tags ?? [],
        author: data.author ?? "Heritage Housing",
        published: false,
        publishedAt: null,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST /api/blog", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear el post" },
      { status: 500 }
    );
  }
}

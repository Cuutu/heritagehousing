"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ImageSchema = z.object({
  url: z.string().url(),
  order: z.number().int().min(0),
});

const ImagesSchema = z.array(ImageSchema);

export async function savePropertyImages(
  propertyId: string,
  images: z.infer<typeof ImagesSchema>
) {
  const parsed = ImagesSchema.parse(images);
  const urls = parsed.map((img) => img.url);
  await prisma.$transaction([
    prisma.propertyImage.deleteMany({ where: { propertyId } }),
    ...(parsed.length
      ? [
          prisma.propertyImage.createMany({
            data: parsed.map((img) => ({
              url: img.url,
              order: img.order,
              propertyId,
            })),
          }),
        ]
      : []),
    prisma.property.update({
      where: { id: propertyId },
      data: { images: urls.length ? urls : [] },
    }),
  ]);
  revalidatePath("/admin/propiedades");
  revalidatePath("/alquileres");
}

export async function saveProjectImages(
  projectId: string,
  images: z.infer<typeof ImagesSchema>
) {
  const parsed = ImagesSchema.parse(images);
  const urls = parsed.map((img) => img.url);
  await prisma.$transaction([
    prisma.projectImage.deleteMany({ where: { projectId } }),
    ...(parsed.length
      ? [
          prisma.projectImage.createMany({
            data: parsed.map((img) => ({
              url: img.url,
              order: img.order,
              projectId,
            })),
          }),
        ]
      : []),
    prisma.project.update({
      where: { id: projectId },
      data: { afterImages: urls.length ? urls : [] },
    }),
  ]);
  revalidatePath("/admin/proyectos");
  revalidatePath("/remodelaciones");
}

export async function savePostImages(
  postId: string,
  images: z.infer<typeof ImagesSchema>
) {
  const parsed = ImagesSchema.parse(images);
  await prisma.$transaction([
    prisma.postImage.deleteMany({ where: { postId } }),
    ...(parsed.length
      ? [
          prisma.postImage.createMany({
            data: parsed.map((img) => ({
              url: img.url,
              order: img.order,
              postId,
            })),
          }),
        ]
      : []),
    prisma.post.update({
      where: { id: postId },
      data: {
        coverImage: parsed[0]?.url ?? null,
      },
    }),
  ]);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

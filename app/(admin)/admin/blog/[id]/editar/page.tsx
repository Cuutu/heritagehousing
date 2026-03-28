import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostEditor } from "@/components/blog/PostEditor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    notFound();
  }

  const initial = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    author: post.author,
    tags: post.tags,
  };

  return (
    <>
      <AdminPageHeader
        title="Editar artículo"
        description="Los cambios se guardan al hacer clic en Guardar. Publicá o despublicá desde el listado del blog."
      />
      <PostEditor mode="edit" initial={initial} />
    </>
  );
}

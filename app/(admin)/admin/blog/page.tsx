import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogPostsAdminClient } from "@/components/blog/BlogPostsAdminClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Creá, editá y publicá artículos para el sitio público."
      />
      <div className="mb-6 flex justify-end">
        <Button asChild>
          <Link href="/admin/blog/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo artículo
          </Link>
        </Button>
      </div>
      <BlogPostsAdminClient posts={posts} />
    </>
  );
}

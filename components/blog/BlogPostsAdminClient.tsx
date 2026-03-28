"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type AdminPostRow = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: Date | string | null;
  createdAt: Date | string;
};

type BlogPostsAdminClientProps = {
  posts: AdminPostRow[];
};

function formatCellDate(value: Date | string | null) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return format(d, "dd/MM/yyyy HH:mm", { locale: es });
}

export function BlogPostsAdminClient({ posts: initialPosts }: BlogPostsAdminClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = () => {
    router.refresh();
  };

  const handlePublishToggle = async (post: AdminPostRow) => {
    setLoadingId(post.id);
    try {
      const res = await fetch(`/api/blog/${post.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      const updated = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                published: updated.published,
                publishedAt: updated.publishedAt,
              }
            : p
        )
      );
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (post: AdminPostRow) => {
    if (
      !window.confirm(
        `¿Eliminar el artículo "${post.title}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setLoadingId(post.id);
    try {
      const res = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-md border border-[var(--brand-border)] bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead className="w-[120px]">Estado</TableHead>
            <TableHead className="w-[160px]">Fecha</TableHead>
            <TableHead className="w-[220px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No hay artículos todavía. Creá el primero.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-[280px] font-medium">
                  <span className="line-clamp-2">{post.title}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
                      post.published
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    )}
                  >
                    {post.published ? "Publicado" : "Borrador"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {post.published
                    ? formatCellDate(post.publishedAt)
                    : formatCellDate(post.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/blog/${post.id}/editar`}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      disabled={loadingId === post.id}
                      onClick={() => handlePublishToggle(post)}
                    >
                      {loadingId === post.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : post.published ? (
                        "Despublicar"
                      ) : (
                        "Publicar"
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      type="button"
                      disabled={loadingId === post.id}
                      onClick={() => handleDelete(post)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

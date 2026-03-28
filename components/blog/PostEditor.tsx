"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug } from "@/lib/utils";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[320px] items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
      Cargando editor…
    </div>
  ),
});

export type PostEditorInitial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string;
  tags: string[];
};

type PostEditorProps = {
  mode: "create" | "edit";
  initial?: PostEditorInitial;
};

function tagsToInput(tags: string[]) {
  return tags.join(", ");
}

function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export function PostEditor({ mode, initial }: PostEditorProps) {
  const router = useRouter();
  const slugTouched = useRef(mode === "edit");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [author, setAuthor] = useState(
    initial?.author ?? "Heritage Housing"
  );
  const [tagsInput, setTagsInput] = useState(
    tagsToInput(initial?.tags ?? [])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTitleBlur = useCallback(() => {
    if (slugTouched.current) return;
    const next = generateSlug(title);
    if (next) setSlug(next);
  }, [title]);

  const onSlugChange = (v: string) => {
    slugTouched.current = true;
    setSlug(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const tags = parseTagsInput(tagsInput);
    const payload = {
      title,
      excerpt,
      content,
      coverImage: coverImage.trim() || undefined,
      author: author.trim() || "Heritage Housing",
      tags,
      ...(slug.trim() ? { slug: slug.trim() } : {}),
    };

    try {
      const url =
        mode === "create" ? "/api/blog" : `/api/blog/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={onTitleBlur}
            required
            minLength={5}
            maxLength={100}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="se-genera-desde-el-titulo"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Solo letras minúsculas, números y guiones. Podés editarlo antes de
            publicar.
          </p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="excerpt">Resumen</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            minLength={10}
            maxLength={300}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverImage">Imagen de portada (URL)</Label>
          <Input
            id="coverImage"
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Autor</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tags">Etiquetas (máx. 5, separadas por coma)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="diseño, chile, remodelación"
          />
        </div>
      </div>

      <div className="space-y-2" data-color-mode="light">
        <Label>Contenido (Markdown)</Label>
        <div className="overflow-hidden rounded-md border border-input">
          <MDEditor
            value={content}
            onChange={(v) => setContent(v ?? "")}
            height={420}
            preview="edit"
            visibleDragbar={false}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Mínimo 50 caracteres en el cuerpo del artículo.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : mode === "create" ? (
            "Crear borrador"
          ) : (
            "Guardar cambios"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blog")}
          disabled={saving}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  createProjectAction,
  updateProjectAction,
  toggleProjectActiveAction,
  deleteProjectAction,
} from "@/app/actions/project.actions";
import { saveProjectImages } from "@/app/admin/actions/images";
import { ImageUploader, type ImageItem } from "@/components/admin/ImageUploader";
import {
  projectCategories,
  type ProjectInput,
} from "@/lib/validations/project.schema";
import type { Project, ProjectImage } from "@prisma/client";

type Row = Project & { projectImages: ProjectImage[] };

const categoryLabels: Record<string, string> = Object.fromEntries(
  projectCategories.map((c) => [c.value, c.label])
);

export function ProjectsAdminClient({ initialProjects }: { initialProjects: Row[] }) {
  const [projects] = useState(initialProjects);
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "cocina",
    area: "",
    duration: "",
    beforeText: "",
  });
  const [projectGallery, setProjectGallery] = useState<ImageItem[]>([]);

  const refresh = () => window.location.reload();

  const parseUrls = (t: string) =>
    t
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

  const submitCreate = async () => {
    setLoading(true);
    setError(null);
    if (projectGallery.length < 1) {
      setError("Subí al menos una imagen en la galería (después).");
      setLoading(false);
      return;
    }
    const beforeImages = parseUrls(form.beforeText);
    if (beforeImages.length < 1) {
      setError("Agregá al menos una URL en “antes”.");
      setLoading(false);
      return;
    }
    const afterImages = projectGallery.map((g) => g.url);
    const payload: ProjectInput = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      category: form.category as ProjectInput["category"],
      area: form.area ? Number(form.area) : undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      beforeImages,
      afterImages,
      isActive: true,
    };
    const r = await createProjectAction(payload);
    setLoading(false);
    if (r.success && "id" in r && r.id) {
      await saveProjectImages(
        r.id,
        projectGallery.map((img, i) => ({ url: img.url, order: i }))
      );
      setIsCreating(false);
      setProjectGallery([]);
      refresh();
    } else if (r.success) {
      setIsCreating(false);
      setProjectGallery([]);
      refresh();
    } else {
      setError(r.error ?? "Error");
    }
  };

  const openEdit = (p: Row) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      category: p.category,
      area: p.area != null ? String(p.area) : "",
      duration: p.duration != null ? String(p.duration) : "",
      beforeText: p.beforeImages.join("\n"),
    });
    setProjectGallery(
      p.projectImages.length > 0
        ? p.projectImages.map((img) => ({ url: img.url, order: img.order }))
        : p.afterImages.map((url, i) => ({ url, order: i }))
    );
  };

  const submitEdit = async () => {
    if (!editId) return;
    setLoading(true);
    setError(null);
    if (projectGallery.length < 1) {
      setError("Subí al menos una imagen en la galería (después).");
      setLoading(false);
      return;
    }
    const beforeImages = parseUrls(form.beforeText);
    if (beforeImages.length < 1) {
      setError("Agregá al menos una URL en “antes”.");
      setLoading(false);
      return;
    }
    const afterImages = projectGallery.map((g) => g.url);
    const r = await updateProjectAction(editId, {
      title: form.title,
      slug: form.slug,
      description: form.description,
      category: form.category as ProjectInput["category"],
      area: form.area ? Number(form.area) : undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      beforeImages,
      afterImages,
    });
    setLoading(false);
    if (r.success) {
      await saveProjectImages(
        editId,
        projectGallery.map((img, i) => ({ url: img.url, order: i }))
      );
      setEditId(null);
      refresh();
    } else {
      setError(r.error ?? "Error");
    }
  };

  const FormFields = (
    <>
      <div className="grid gap-2">
        <Label>Título</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label>Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label>Descripción</Label>
        <Textarea
          rows={4}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>Categoría</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Área (m²)</Label>
          <Input
            type="number"
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Duración (días)</Label>
          <Input
            type="number"
            value={form.duration}
            onChange={(e) =>
              setForm((f) => ({ ...f, duration: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Imágenes antes (URLs)</Label>
        <Textarea
          rows={2}
          value={form.beforeText}
          onChange={(e) =>
            setForm((f) => ({ ...f, beforeText: e.target.value }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>Galería (después)</Label>
        <ImageUploader
          endpoint="projectImages"
          initialImages={projectGallery}
          onChange={setProjectGallery}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Proyectos"
        description="Portfolio de remodelaciones: antes/después, categoría y visibilidad en el sitio público."
        actions={
          <Dialog
            open={isCreating}
            onOpenChange={(open) => {
              setIsCreating(open);
              if (open) setProjectGallery([]);
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[var(--headline)] text-white hover:bg-[var(--headline)]/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo proyecto
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo proyecto</DialogTitle>
              <DialogDescription>
                URLs de imagen deben ser HTTPS válidas.
              </DialogDescription>
            </DialogHeader>
            {FormFields}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={submitCreate} disabled={loading}>
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        }
      />

      <div className="overflow-hidden rounded-lg border border-[var(--brand-border)] bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px] font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Miniatura
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Título
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Categoría
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Área
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Estado
              </TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow
                key={p.id}
                className="border-[var(--brand-border)]/80 hover:bg-[var(--bg-surface)]/80"
              >
                <TableCell>
                  <div className="relative w-16 h-12 rounded overflow-hidden">
                    <Image
                      src={
                        p.afterImages[0] ??
                        "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400"
                      }
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">/{p.slug}</p>
                </TableCell>
                <TableCell>
                  {categoryLabels[p.category] ?? p.category}
                </TableCell>
                <TableCell>{p.area != null ? `${p.area} m²` : "—"}</TableCell>
                <TableCell>
                  <Badge variant={p.isActive ? "default" : "secondary"}>
                    {p.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(p)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/remodelaciones/${p.slug}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          await toggleProjectActiveAction(p.id);
                          refresh();
                        }}
                      >
                        {p.isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(p.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
          </DialogHeader>
          {FormFields}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
              Cancelar
            </Button>
            <Button onClick={submitEdit} disabled={loading}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar proyecto?</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteId) return;
                setLoading(true);
                await deleteProjectAction(deleteId);
                setLoading(false);
                setDeleteId(null);
                refresh();
              }}
              disabled={loading}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

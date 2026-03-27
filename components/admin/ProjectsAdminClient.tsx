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
import {
  createProjectAction,
  updateProjectAction,
  toggleProjectActiveAction,
  deleteProjectAction,
} from "@/app/actions/project.actions";
import {
  projectCategories,
  type ProjectInput,
} from "@/lib/validations/project.schema";
import type { Project } from "@prisma/client";

type Row = Project;

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
    afterText: "",
  });

  const refresh = () => window.location.reload();

  const parseUrls = (t: string) =>
    t
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

  const submitCreate = async () => {
    setLoading(true);
    setError(null);
    const payload: ProjectInput = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      category: form.category as ProjectInput["category"],
      area: form.area ? Number(form.area) : undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      beforeImages: parseUrls(form.beforeText),
      afterImages: parseUrls(form.afterText),
      isActive: true,
    };
    const r = await createProjectAction(payload);
    setLoading(false);
    if (r.success) {
      setIsCreating(false);
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
      afterText: p.afterImages.join("\n"),
    });
  };

  const submitEdit = async () => {
    if (!editId) return;
    setLoading(true);
    const r = await updateProjectAction(editId, {
      title: form.title,
      slug: form.slug,
      description: form.description,
      category: form.category as ProjectInput["category"],
      area: form.area ? Number(form.area) : undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      beforeImages: parseUrls(form.beforeText),
      afterImages: parseUrls(form.afterText),
    });
    setLoading(false);
    if (r.success) {
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
        <Label>Imágenes después (URLs)</Label>
        <Textarea
          rows={2}
          value={form.afterText}
          onChange={(e) =>
            setForm((f) => ({ ...f, afterText: e.target.value }))
          }
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Portfolio de remodelaciones</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
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
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Miniatura</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
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

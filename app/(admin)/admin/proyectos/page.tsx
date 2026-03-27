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
import Link from "next/link";

const mockProjects = [
  {
    id: "1",
    title: "Remodelación Cocina Moderna",
    slug: "remodelacion-cocina-moderna",
    category: "cocina",
    area: 15,
    isActive: true,
    thumbnail: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400",
  },
  {
    id: "2",
    title: "Baño Principal Elegante",
    slug: "bano-principal-elegante",
    category: "baño",
    area: 8,
    isActive: true,
    thumbnail: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
  },
  {
    id: "3",
    title: "Vivienda Familiar Completa",
    slug: "vivienda-familiar-completa",
    category: "vivienda_completa",
    area: 120,
    isActive: false,
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
  },
];

const categoryLabels: Record<string, string> = {
  cocina: "Cocina",
  baño: "Baño",
  vivienda_completa: "Vivienda Completa",
  exterior: "Espacios Exteriores",
  oficina: "Oficina",
  comercial: "Espacio Comercial",
  otro: "Otro",
};

export default function ProjectsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState(mockProjects);

  const toggleActive = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona tu portfolio de remodelaciones
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              <DialogDescription>
                Agregá un nuevo proyecto a tu portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Remodelación Cocina Moderna" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Categoría</Label>
                  <Input placeholder="cocina" />
                </div>
                <div className="grid gap-2">
                  <Label>Área (m²)</Label>
                  <Input type="number" placeholder="15" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descripción</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Describe el proyecto..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsCreating(false)}>
                Crear Proyecto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Imagen</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="relative w-16 h-12 rounded overflow-hidden">
                    <Image
                      src={project.thumbnail}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      /{project.slug}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categoryLabels[project.category] || project.category}
                  </Badge>
                </TableCell>
                <TableCell>{project.area ? `${project.area} m²` : "-"}</TableCell>
                <TableCell>
                  <Badge variant={project.isActive ? "default" : "secondary"}>
                    {project.isActive ? "Activo" : "Inactivo"}
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
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/remodelaciones/${project.slug}`}
                          target="_blank"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver en Sitio
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleActive(project.id)}>
                        {project.isActive ? (
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
                      <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}

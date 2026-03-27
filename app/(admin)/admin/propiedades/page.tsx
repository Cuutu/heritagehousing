"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
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
import { formatCLP } from "@/lib/utils";
import Link from "next/link";

const mockProperties = [
  {
    id: "1",
    name: "Departamento Centro Santiago",
    slug: "departamento-centro-santiago",
    location: "Santiago Centro",
    pricePerNight: 45000,
    maxGuests: 4,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
  },
  {
    id: "2",
    name: "Casa Moderna Providencia",
    slug: "casa-providencia",
    location: "Providencia",
    pricePerNight: 85000,
    maxGuests: 6,
    isActive: true,
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"],
  },
  {
    id: "3",
    name: "Depto Vista al Mar Viña",
    slug: "depto-vina-del-mar",
    location: "Viña del Mar",
    pricePerNight: 65000,
    maxGuests: 5,
    isActive: false,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
  },
];

export default function PropertiesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [properties, setProperties] = useState(mockProperties);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/sync/ical", { method: "POST" });
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleActive = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground">
            Gestiona tus propiedades y sus configuraciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing} variant="outline">
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            Sincronizar iCal
          </Button>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Propiedad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Propiedad</DialogTitle>
                <DialogDescription>
                  Completá los datos de la nueva propiedad
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Departamento Centro" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input id="location" placeholder="Santiago Centro" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Precio por noche (CLP)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="45000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Huéspedes</Label>
                    <Input type="number" placeholder="4" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Dormitorios</Label>
                    <Input type="number" placeholder="2" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Baños</Label>
                    <Input type="number" placeholder="1" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsCreating(false)}>
                  Crear Propiedad
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>
                  <div className="relative w-16 h-12 rounded overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">
                      /{property.slug}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>{formatCLP(property.pricePerNight)}</TableCell>
                <TableCell>{property.maxGuests} huéspedes</TableCell>
                <TableCell>
                  <Badge variant={property.isActive ? "default" : "secondary"}>
                    {property.isActive ? "Activa" : "Inactiva"}
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
                          href={`/alquileres/${property.slug}`}
                          target="_blank"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver en Sitio
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleActive(property.id)}
                      >
                        {property.isActive ? (
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

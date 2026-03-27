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
  RefreshCw,
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
import { formatCLP } from "@/lib/utils";
import Link from "next/link";
import {
  createPropertyAction,
  updatePropertyAction,
  togglePropertyActiveAction,
  deletePropertyAction,
} from "@/app/actions/property.actions";
import { syncIcalAdminAction } from "@/app/actions/sync.actions";
import type { Property } from "@prisma/client";

type Row = Omit<Property, "pricePerNight"> & { pricePerNight: number };

function parseImages(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAmenities(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  location: "",
  pricePerNight: "",
  maxGuests: "4",
  bedrooms: "1",
  bathrooms: "1",
  imagesText: "",
  amenitiesText: "",
  airbnbIcalUrl: "",
  bookingIcalUrl: "",
};

export function PropertiesAdminClient({
  initialProperties,
}: {
  initialProperties: Row[];
}) {
  const [properties] = useState<Row[]>(initialProperties);
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => window.location.reload();

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    try {
      const data = await syncIcalAdminAction();
      if (!data.success) {
        setSyncMsg(data.error ?? "Error");
      } else {
        setSyncMsg(data.message);
      }
    } catch {
      setSyncMsg("Error de red");
    } finally {
      setIsSyncing(false);
    }
  };

  const submitCreate = async () => {
    setLoading(true);
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      location: form.location,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      images: parseImages(form.imagesText),
      amenities: parseAmenities(form.amenitiesText),
      airbnbIcalUrl: form.airbnbIcalUrl || undefined,
      bookingIcalUrl: form.bookingIcalUrl || undefined,
      isActive: true,
    };
    const r = await createPropertyAction(payload);
    setLoading(false);
    if (r.success) {
      setIsCreating(false);
      setForm(emptyForm);
      refresh();
    } else {
      setError(r.error ?? "Error");
    }
  };

  const openEdit = (p: Row) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      location: p.location,
      pricePerNight: String(p.pricePerNight),
      maxGuests: String(p.maxGuests),
      bedrooms: String(p.bedrooms),
      bathrooms: String(p.bathrooms),
      imagesText: p.images.join("\n"),
      amenitiesText: p.amenities.join(", "),
      airbnbIcalUrl: p.airbnbIcalUrl ?? "",
      bookingIcalUrl: p.bookingIcalUrl ?? "",
    });
  };

  const submitEdit = async () => {
    if (!editId) return;
    setLoading(true);
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      location: form.location,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      images: parseImages(form.imagesText),
      amenities: parseAmenities(form.amenitiesText),
      airbnbIcalUrl: form.airbnbIcalUrl || "",
      bookingIcalUrl: form.bookingIcalUrl || "",
    };
    const r = await updatePropertyAction(editId, payload);
    setLoading(false);
    if (r.success) {
      setEditId(null);
      refresh();
    } else {
      setError(r.error ?? "Error");
    }
  };

  const toggleActive = async (id: string) => {
    const r = await togglePropertyActiveAction(id);
    if (r.success) refresh();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    const r = await deletePropertyAction(deleteId);
    setLoading(false);
    if (r.success) {
      setDeleteId(null);
      refresh();
    }
  };

  const FormFields = (
    <>
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (url)</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="desc">Descripción (mín. 50 caracteres)</Label>
        <Textarea
          id="desc"
          rows={4}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Ubicación</Label>
          <Input
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Precio / noche (CLP)</Label>
          <Input
            type="number"
            value={form.pricePerNight}
            onChange={(e) =>
              setForm((f) => ({ ...f, pricePerNight: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Huéspedes</Label>
          <Input
            type="number"
            value={form.maxGuests}
            onChange={(e) =>
              setForm((f) => ({ ...f, maxGuests: e.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Dormitorios</Label>
          <Input
            type="number"
            value={form.bedrooms}
            onChange={(e) =>
              setForm((f) => ({ ...f, bedrooms: e.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Baños</Label>
          <Input
            type="number"
            value={form.bathrooms}
            onChange={(e) =>
              setForm((f) => ({ ...f, bathrooms: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Imágenes (una URL por línea)</Label>
        <Textarea
          rows={3}
          value={form.imagesText}
          onChange={(e) =>
            setForm((f) => ({ ...f, imagesText: e.target.value }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>Comodidades (separadas por coma)</Label>
        <Input
          value={form.amenitiesText}
          onChange={(e) =>
            setForm((f) => ({ ...f, amenitiesText: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>iCal Airbnb (opcional)</Label>
          <Input
            value={form.airbnbIcalUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, airbnbIcalUrl: e.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>iCal Booking (opcional)</Label>
          <Input
            value={form.bookingIcalUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, bookingIcalUrl: e.target.value }))
            }
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground">
            Gestión de propiedades y sincronización iCal
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
                Nueva propiedad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva propiedad</DialogTitle>
                <DialogDescription>
                  Completá los datos. Las URLs de imagen deben ser HTTPS.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">{FormFields}</div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
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
      </div>

      {syncMsg && (
        <p className="text-sm rounded-md border p-3 bg-muted">{syncMsg}</p>
      )}

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>
                  <div className="relative w-16 h-12 rounded overflow-hidden">
                    <Image
                      src={
                        property.images[0] ??
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
                      }
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
                      <DropdownMenuItem onClick={() => openEdit(property)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/alquileres/${property.slug}`}
                          target="_blank"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver en sitio
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
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(property.id)}
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
            <DialogTitle>Editar propiedad</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">{FormFields}</div>
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
            <DialogTitle>¿Eliminar propiedad?</DialogTitle>
            <DialogDescription>
              Se eliminarán también reservas y fechas bloqueadas asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

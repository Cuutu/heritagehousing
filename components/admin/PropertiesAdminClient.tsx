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
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  createPropertyAction,
  updatePropertyAction,
  togglePropertyActiveAction,
  deletePropertyAction,
  parseGoogleMapsLinkAction,
} from "@/app/actions/property.actions";
import { syncIcalAdminAction } from "@/app/actions/sync.actions";
import { savePropertyImages } from "@/app/admin/actions/images";
import { ImageUploader, type ImageItem } from "@/components/admin/ImageUploader";
import type { Property, PropertyImage } from "@prisma/client";

type Row = Omit<Property, "pricePerNight"> & {
  pricePerNight: number;
  propertyImages: PropertyImage[];
};

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
  mapAddress: "",
  googleMapsLink: "",
  latitude: "",
  longitude: "",
  pricePerNight: "",
  maxGuests: "4",
  bedrooms: "1",
  bathrooms: "1",
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
  const [parsingMaps, setParsingMaps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyGallery, setPropertyGallery] = useState<ImageItem[]>([]);

  const refresh = () => window.location.reload();

  const extractCoordsFromMapsLink = async () => {
    setParsingMaps(true);
    setError(null);
    try {
      const r = await parseGoogleMapsLinkAction(form.googleMapsLink);
      if (r.ok) {
        setForm((f) => ({
          ...f,
          latitude: String(r.lat),
          longitude: String(r.lng),
        }));
      } else {
        setError(r.error);
      }
    } catch {
      setError("No se pudo leer el enlace");
    } finally {
      setParsingMaps(false);
    }
  };

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
    if (propertyGallery.length < 1) {
      setError("Subí al menos una imagen.");
      setLoading(false);
      return;
    }
    const lat =
      form.latitude.trim() === "" ? null : Number(form.latitude);
    const lng =
      form.longitude.trim() === "" ? null : Number(form.longitude);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      location: form.location,
      mapAddress: form.mapAddress.trim() || undefined,
      googleMapsLink: form.googleMapsLink.trim() || undefined,
      latitude: lat !== null && Number.isFinite(lat) ? lat : null,
      longitude: lng !== null && Number.isFinite(lng) ? lng : null,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      images: propertyGallery.map((g) => g.url),
      amenities: parseAmenities(form.amenitiesText),
      airbnbIcalUrl: form.airbnbIcalUrl || undefined,
      bookingIcalUrl: form.bookingIcalUrl || undefined,
      isActive: true,
    };
    const r = await createPropertyAction(payload);
    setLoading(false);
    if (r.success && "id" in r && r.id) {
      await savePropertyImages(
        r.id,
        propertyGallery.map((img, i) => ({ url: img.url, order: i }))
      );
      setIsCreating(false);
      setForm(emptyForm);
      setPropertyGallery([]);
      refresh();
    } else if (r.success) {
      setIsCreating(false);
      setForm(emptyForm);
      setPropertyGallery([]);
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
      mapAddress: p.mapAddress ?? "",
      googleMapsLink: p.googleMapsLink ?? "",
      latitude: p.latitude != null ? String(p.latitude) : "",
      longitude: p.longitude != null ? String(p.longitude) : "",
      pricePerNight: String(p.pricePerNight),
      maxGuests: String(p.maxGuests),
      bedrooms: String(p.bedrooms),
      bathrooms: String(p.bathrooms),
      amenitiesText: p.amenities.join(", "),
      airbnbIcalUrl: p.airbnbIcalUrl ?? "",
      bookingIcalUrl: p.bookingIcalUrl ?? "",
    });
    setPropertyGallery(
      p.propertyImages.length > 0
        ? p.propertyImages.map((img) => ({ url: img.url, order: img.order }))
        : p.images.map((url, i) => ({ url, order: i }))
    );
  };

  const submitEdit = async () => {
    if (!editId) return;
    setLoading(true);
    setError(null);
    if (propertyGallery.length < 1) {
      setError("Debe haber al menos una imagen.");
      setLoading(false);
      return;
    }
    const lat =
      form.latitude.trim() === "" ? null : Number(form.latitude);
    const lng =
      form.longitude.trim() === "" ? null : Number(form.longitude);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      location: form.location,
      mapAddress: form.mapAddress.trim() || undefined,
      googleMapsLink: form.googleMapsLink.trim() || undefined,
      latitude: lat !== null && Number.isFinite(lat) ? lat : null,
      longitude: lng !== null && Number.isFinite(lng) ? lng : null,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      images: propertyGallery.map((g) => g.url),
      amenities: parseAmenities(form.amenitiesText),
      airbnbIcalUrl: form.airbnbIcalUrl || "",
      bookingIcalUrl: form.bookingIcalUrl || "",
    };
    const r = await updatePropertyAction(editId, payload);
    setLoading(false);
    if (r.success) {
      await savePropertyImages(
        editId,
        propertyGallery.map((img, i) => ({ url: img.url, order: i }))
      );
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
          <Label>Ubicación (zona)</Label>
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
      <div className="grid gap-2">
        <Label>Dirección para mapa (opcional)</Label>
        <Input
          placeholder="Ej. Av. Libertad 123"
          value={form.mapAddress}
          onChange={(e) =>
            setForm((f) => ({ ...f, mapAddress: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Se muestra en el mapa de /alquileres junto al pin y en la ficha.
        </p>
      </div>
      <div className="grid gap-2">
        <Label>Link de Google Maps (recomendado)</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            placeholder="https://maps.app.goo.gl/... o maps.google.com/..."
            value={form.googleMapsLink}
            onChange={(e) =>
              setForm((f) => ({ ...f, googleMapsLink: e.target.value }))
            }
            className="sm:flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={parsingMaps || !form.googleMapsLink.trim()}
            onClick={extractCoordsFromMapsLink}
          >
            {parsingMaps ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              "Extraer coordenadas"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Pegá el enlace desde <strong>Compartir</strong> en Google Maps. Al
          guardar también intentamos leer coordenadas automáticamente si faltan.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Latitud (opcional)</Label>
          <Input
            placeholder="-33.4372"
            value={form.latitude}
            onChange={(e) =>
              setForm((f) => ({ ...f, latitude: e.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Longitud (opcional)</Label>
          <Input
            placeholder="-70.6506"
            value={form.longitude}
            onChange={(e) =>
              setForm((f) => ({ ...f, longitude: e.target.value }))
            }
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Podés ajustar lat/lng a mano si hace falta. Ambas o ninguna.
      </p>
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
        <Label>Imágenes</Label>
        <ImageUploader
          endpoint="propertyImages"
          initialImages={propertyGallery}
          onChange={setPropertyGallery}
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
    <div className="space-y-8">
      <AdminPageHeader
        title="Propiedades"
        description="Creá y editá alojamientos, imágenes y enlaces iCal. La sincronización trae bloqueos de Airbnb/Booking."
        actions={
          <>
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              className="border-[var(--brand-border)]"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              Sincronizar iCal
            </Button>
            <Dialog
              open={isCreating}
              onOpenChange={(open) => {
                setIsCreating(open);
                if (open) setPropertyGallery([]);
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-[var(--headline)] text-white hover:bg-[var(--headline)]/90">
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
          </>
        }
      />

      {syncMsg && (
        <p className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-accent-soft)] px-4 py-3 text-sm text-[var(--headline)]">
          {syncMsg}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-[var(--brand-border)] bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px] font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Imagen
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Nombre
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Ubicación
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Precio
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Capacidad
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Estado
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow
                key={property.id}
                className="border-[var(--brand-border)]/80 hover:bg-[var(--bg-surface)]/80"
              >
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
                <TableCell className="font-mono text-sm tabular-nums">
                  {formatCLP(property.pricePerNight)}
                </TableCell>
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

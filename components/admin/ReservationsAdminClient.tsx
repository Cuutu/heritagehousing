"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Download,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCLP, cn } from "@/lib/utils";
import {
  adminPaymentBadgeClass,
  adminSourceBadgeClass,
} from "@/lib/admin-badges";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateReservationStatusAction } from "@/app/actions/reservation.actions";

export type ReservationRow = {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  source: string;
  paymentStatus: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  PAID: "Pagado",
  PENDING: "Pendiente",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const sourceLabels: Record<string, string> = {
  DIRECT: "Directa",
  AIRBNB: "Airbnb",
  BOOKING: "Booking",
  MANUAL: "Manual",
};

export function ReservationsAdminClient({
  reservations,
  properties,
}: {
  reservations: ReservationRow[];
  properties: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return reservations.filter((res) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        res.guestName.toLowerCase().includes(q) ||
        res.guestEmail.toLowerCase().includes(q) ||
        res.propertyName.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || res.paymentStatus === statusFilter;
      const matchesSource =
        sourceFilter === "all" || res.source === sourceFilter;
      const matchesProp =
        propertyFilter === "all" || res.propertyId === propertyFilter;
      return matchesSearch && matchesStatus && matchesSource && matchesProp;
    });
  }, [reservations, search, statusFilter, sourceFilter, propertyFilter]);

  const exportCsv = () => {
    const headers = [
      "ID",
      "Huésped",
      "Email",
      "Propiedad",
      "Check-in",
      "Check-out",
      "Total",
      "Fuente",
      "Estado",
      "Creado",
    ];
    const rows = filtered.map((res) => [
      res.id,
      res.guestName,
      res.guestEmail,
      res.propertyName,
      res.checkIn,
      res.checkOut,
      String(res.totalPrice),
      res.source,
      res.paymentStatus,
      res.createdAt,
    ]);
    const csv =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeStatus = async (id: string, status: string) => {
    await updateReservationStatusAction(id, status);
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Reservas"
        description="Filtrá por propiedad, estado de pago o canal. Exportá el resultado a CSV para Excel."
        actions={
          <Button
            type="button"
            onClick={exportCsv}
            className="gap-2 bg-[var(--headline)] text-white hover:bg-[var(--headline)]/90"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Exportar CSV
          </Button>
        }
      />

      <Card className="border-[var(--brand-border)] bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg font-normal text-[var(--headline)]">
            Buscar y filtrar
          </CardTitle>
          <CardDescription>
            Los filtros se combinan: solo verás filas que cumplan todas las
            condiciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--paragraph)]" />
            <Input
              placeholder="Huésped, email o propiedad…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-[var(--brand-border)] pl-9"
            />
          </div>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-full border-[var(--brand-border)] lg:w-[220px]">
              <SelectValue placeholder="Propiedad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las propiedades</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full border-[var(--brand-border)] lg:w-[170px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="PAID">Pagado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
              <SelectItem value="REFUNDED">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full border-[var(--brand-border)] lg:w-[170px]">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              <SelectItem value="DIRECT">Directa</SelectItem>
              <SelectItem value="AIRBNB">Airbnb</SelectItem>
              <SelectItem value="BOOKING">Booking</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-lg border border-[var(--brand-border)] bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--brand-border)] hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Huésped
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Propiedad
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Fechas
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Total
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Fuente
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Estado
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                Creado
              </TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((reservation) => (
              <TableRow
                key={reservation.id}
                className="border-[var(--brand-border)]/80 hover:bg-[var(--bg-surface)]/80"
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{reservation.guestName}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.guestEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{reservation.propertyName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>
                      {format(new Date(reservation.checkIn), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </p>
                    <p className="text-muted-foreground">
                      {format(new Date(reservation.checkOut), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm tabular-nums text-[var(--headline)]">
                  {formatCLP(reservation.totalPrice)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wide",
                      adminSourceBadgeClass(reservation.source)
                    )}
                  >
                    {sourceLabels[reservation.source] ?? reservation.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wide",
                      adminPaymentBadgeClass(reservation.paymentStatus)
                    )}
                  >
                    {statusLabels[reservation.paymentStatus] ??
                      reservation.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(reservation.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => changeStatus(reservation.id, "PAID")}
                      >
                        Marcar pagado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          changeStatus(reservation.id, "PENDING")
                        }
                      >
                        Marcar pendiente
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          changeStatus(reservation.id, "CANCELLED")
                        }
                      >
                        Cancelar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          changeStatus(reservation.id, "REFUNDED")
                        }
                      >
                        Reembolsado
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--bg-surface)] py-12 text-center text-sm text-[var(--paragraph)]">
          No hay reservas que coincidan con los filtros. Probá limpiar la búsqueda
          o ampliar el criterio.
        </p>
      )}
    </div>
  );
}

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
import { formatCLP } from "@/lib/utils";
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

const statusStyle: Record<
  string,
  { label: string; className: string }
> = {
  PAID: {
    label: "Pagado",
    className: "bg-emerald-600 hover:bg-emerald-600 text-white",
  },
  PENDING: {
    label: "Pendiente",
    className: "bg-amber-500 hover:bg-amber-500 text-stone-900",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-600 hover:bg-red-600 text-white",
  },
  REFUNDED: {
    label: "Reembolsado",
    className: "bg-stone-400 hover:bg-stone-400 text-white",
  },
};

const sourceStyle: Record<string, { label: string; className: string }> = {
  DIRECT: {
    label: "Directa",
    className: "bg-blue-600 hover:bg-blue-600 text-white",
  },
  AIRBNB: {
    label: "Airbnb",
    className: "bg-pink-500 hover:bg-pink-500 text-white",
  },
  BOOKING: {
    label: "Booking",
    className: "bg-indigo-600 hover:bg-indigo-600 text-white",
  },
  MANUAL: {
    label: "Manual",
    className: "bg-stone-500 hover:bg-stone-500 text-white",
  },
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Todas las reservas del sistema
          </p>
        </div>
        <Button type="button" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar huésped, email o propiedad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[200px]">
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
          <SelectTrigger className="w-[160px]">
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
          <SelectTrigger className="w-[160px]">
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
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Huésped</TableHead>
              <TableHead>Propiedad</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((reservation) => (
              <TableRow key={reservation.id}>
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
                <TableCell>{formatCLP(reservation.totalPrice)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      (sourceStyle[reservation.source] ?? sourceStyle.MANUAL)
                        .className
                    }
                  >
                    {(sourceStyle[reservation.source] ?? sourceStyle.MANUAL)
                      .label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      (statusStyle[reservation.paymentStatus] ??
                        statusStyle.PENDING).className
                    }
                  >
                    {(statusStyle[reservation.paymentStatus] ??
                      statusStyle.PENDING).label}
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
        <p className="text-center text-muted-foreground py-8">
          No se encontraron reservas
        </p>
      )}
    </div>
  );
}

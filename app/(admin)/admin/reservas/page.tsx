"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  XCircle,
  RefreshCw,
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

const mockReservations = [
  {
    id: "1",
    guestName: "María González",
    guestEmail: "maria@email.cl",
    propertyName: "Depto Centro Santiago",
    checkIn: new Date("2026-03-28"),
    checkOut: new Date("2026-03-30"),
    totalPrice: 90000,
    source: "DIRECT",
    status: "PAID",
  },
  {
    id: "2",
    guestName: "Carlos López",
    guestEmail: "carlos@email.cl",
    propertyName: "Casa Providencia",
    checkIn: new Date("2026-04-01"),
    checkOut: new Date("2026-04-05"),
    totalPrice: 340000,
    source: "AIRBNB",
    status: "PENDING",
  },
  {
    id: "3",
    guestName: "Ana Martínez",
    guestEmail: "ana@email.cl",
    propertyName: "Depto Viña del Mar",
    checkIn: new Date("2026-04-02"),
    checkOut: new Date("2026-04-07"),
    totalPrice: 325000,
    source: "BOOKING",
    status: "PAID",
  },
  {
    id: "4",
    guestName: "Pedro Sánchez",
    guestEmail: "pedro@email.cl",
    propertyName: "Cabaña Pucón",
    checkIn: new Date("2026-03-20"),
    checkOut: new Date("2026-03-25"),
    totalPrice: 475000,
    source: "DIRECT",
    status: "COMPLETED",
  },
  {
    id: "5",
    guestName: "Laura Torres",
    guestEmail: "laura@email.cl",
    propertyName: "Loft Valparaíso",
    checkIn: new Date("2026-03-15"),
    checkOut: new Date("2026-03-18"),
    totalPrice: 165000,
    source: "AIRBNB",
    status: "CANCELLED",
  },
];

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  PAID: { label: "Pagado", variant: "default" },
  REFUNDED: { label: "Reembolsado", variant: "outline" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  COMPLETED: { label: "Completado", variant: "outline" },
};

const sourceLabels: Record<string, string> = {
  DIRECT: "Directa",
  AIRBNB: "Airbnb",
  BOOKING: "Booking.com",
  MANUAL: "Manual",
};

export default function ReservationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const filteredReservations = mockReservations.filter((res) => {
    const matchesSearch =
      res.guestName.toLowerCase().includes(search.toLowerCase()) ||
      res.guestEmail.toLowerCase().includes(search.toLowerCase()) ||
      res.propertyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || res.status === statusFilter;
    const matchesSource =
      sourceFilter === "all" || res.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const exportToCSV = () => {
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
    ];
    const rows = filteredReservations.map((res) => [
      res.id,
      res.guestName,
      res.guestEmail,
      res.propertyName,
      format(res.checkIn, "dd/MM/yyyy"),
      format(res.checkOut, "dd/MM/yyyy"),
      res.totalPrice,
      sourceLabels[res.source],
      statusLabels[res.status].label,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona todas las reservas del sistema
          </p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por huésped, email o propiedad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
            <SelectItem value="BOOKING">Booking.com</SelectItem>
            <SelectItem value="MANUAL">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Huésped</TableHead>
              <TableHead>Propiedad</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.map((reservation) => (
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
                    <p>{format(reservation.checkIn, "dd/MM/yyyy", { locale: es })}</p>
                    <p className="text-muted-foreground">
                      {format(reservation.checkOut, "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{formatCLP(reservation.totalPrice)}</TableCell>
                <TableCell>{sourceLabels[reservation.source]}</TableCell>
                <TableCell>
                  <Badge variant={statusLabels[reservation.status].variant}>
                    {statusLabels[reservation.status].label}
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
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Cambiar Estado
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredReservations.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No se encontraron reservas
        </p>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  ReservationLifecycleStatus,
  PaymentStatus,
  ReservationSource,
} from "@prisma/client";
import { ReservationModal } from "@/components/admin/ReservationModal";
import { formatCLP } from "@/lib/utils";

export type ReservationTableRow = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  source: ReservationSource;
  lifecycleStatus: ReservationLifecycleStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  property: { name: string };
};

const SOURCE_CONFIG: Record<
  ReservationSource,
  { label: string; className: string }
> = {
  AIRBNB: {
    label: "Airbnb",
    className: "border border-orange-200 bg-orange-100 text-orange-700",
  },
  BOOKING: {
    label: "Booking",
    className: "border border-blue-200 bg-blue-100 text-blue-700",
  },
  DIRECT: {
    label: "Directa",
    className: "border border-green-200 bg-green-100 text-green-700",
  },
  MANUAL: {
    label: "Manual",
    className: "border border-gray-200 bg-gray-100 text-gray-700",
  },
};

const LIFECYCLE_CONFIG: Record<
  ReservationLifecycleStatus,
  { label: string; className: string }
> = {
  CONFIRMED: { label: "Confirmada", className: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
  CANCELLED: { label: "Cancelada", className: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Completada", className: "bg-gray-100 text-gray-600" },
};

type SourceFilter = ReservationSource | "all";
type LifecycleFilter = ReservationLifecycleStatus | "all";

interface Props {
  reservations: ReservationTableRow[];
}

export function ReservationsTable({ reservations }: Props) {
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<SourceFilter>("all");
  const [filterLifecycle, setFilterLifecycle] =
    useState<LifecycleFilter>("all");
  const [filterProperty, setFilterProperty] = useState("all");
  const [selected, setSelected] = useState<ReservationTableRow | null>(null);

  const properties = useMemo(() => {
    const names = reservations.map((r) => r.property.name);
    return Array.from(new Set(names));
  }, [reservations]);

  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.guestName.toLowerCase().includes(search.toLowerCase()) ||
      r.guestEmail.toLowerCase().includes(search.toLowerCase());
    const matchSource = filterSource === "all" || r.source === filterSource;
    const matchLifecycle =
      filterLifecycle === "all" || r.lifecycleStatus === filterLifecycle;
    const matchProperty =
      filterProperty === "all" || r.property.name === filterProperty;
    return matchSearch && matchSource && matchLifecycle && matchProperty;
  });

  const exportCsv = () => {
    const headers = [
      "Huésped",
      "Email",
      "Propiedad",
      "Check-in",
      "Check-out",
      "Total CLP",
      "Fuente",
      "Estado reserva",
      "Pago",
    ];
    const rows = filtered.map((r) => [
      r.guestName,
      r.guestEmail,
      r.property.name,
      r.checkIn,
      r.checkOut,
      String(r.totalPrice),
      r.source,
      r.lifecycleStatus,
      r.paymentStatus,
    ]);
    const csv =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows.map((row) =>
          row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <input
          type="text"
          placeholder="Buscar huésped..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        <select
          value={filterSource}
          onChange={(e) =>
            setFilterSource(e.target.value as SourceFilter)
          }
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="all">Todas las fuentes</option>
          <option value="AIRBNB">Airbnb</option>
          <option value="BOOKING">Booking.com</option>
          <option value="DIRECT">Directa</option>
          <option value="MANUAL">Manual</option>
        </select>
        <select
          value={filterLifecycle}
          onChange={(e) =>
            setFilterLifecycle(e.target.value as LifecycleFilter)
          }
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="CONFIRMED">Confirmadas</option>
          <option value="PENDING">Pendientes</option>
          <option value="CANCELLED">Canceladas</option>
          <option value="COMPLETED">Completadas</option>
        </select>
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="all">Todas las propiedades</option>
          {properties.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span className="ml-auto self-center text-sm text-gray-400">
          {filtered.length} reserva{filtered.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
        >
          Exportar CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Huésped
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Propiedad
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Check-in
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Check-out
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Noches
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Fuente
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No hay reservas con esos filtros
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const nights = differenceInDays(
                    new Date(r.checkOut),
                    new Date(r.checkIn)
                  );
                  const src = SOURCE_CONFIG[r.source];
                  const lc = LIFECYCLE_CONFIG[r.lifecycleStatus];
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {r.guestName}
                        </div>
                        <div className="text-xs text-gray-400">{r.guestEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.property.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {format(new Date(r.checkIn), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {format(new Date(r.checkOut), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{nights}n</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatCLP(r.totalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${src.className}`}
                        >
                          {src.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${lc.className}`}
                        >
                          {lc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ReservationModal
          reservation={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

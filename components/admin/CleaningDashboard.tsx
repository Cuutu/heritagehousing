"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  User,
} from "lucide-react";
import type {
  CleaningAssignment,
  CleaningStaff,
  Property,
  Reservation,
} from "@prisma/client";
import { CleaningStatus } from "@prisma/client";
import { createAssignment, sendWhatsAppReminder } from "@/app/admin/actions/cleaning";

type StaffRow = CleaningStaff & { properties: Property[] };

type AssignmentRow = CleaningAssignment & {
  staff: CleaningStaff;
  property: Property;
  reservation: Pick<Reservation, "guestName" | "checkIn" | "checkOut">;
};

type UnassignedRow = Reservation & {
  property: Property;
};

const STATUS_CONFIG: Record<
  CleaningStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  PENDING: {
    label: "Pendiente",
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50",
  },
  NOTIFIED: {
    label: "Notificado",
    icon: Send,
    className: "text-blue-600 bg-blue-50",
  },
  CONFIRMED: {
    label: "Confirmado",
    icon: CheckCircle,
    className: "text-emerald-600 bg-emerald-50",
  },
  IN_PROGRESS: {
    label: "En curso",
    icon: AlertCircle,
    className: "text-orange-600 bg-orange-50",
  },
  DONE: {
    label: "Listo",
    icon: CheckCircle,
    className: "text-gray-500 bg-gray-50",
  },
};

interface Props {
  staff: StaffRow[];
  assignments: AssignmentRow[];
  unassignedCheckouts: UnassignedRow[];
}

export function CleaningDashboard({
  staff,
  assignments,
  unassignedCheckouts,
}: Props) {
  const router = useRouter();
  const [sending, setSending] = useState<string | null>(null);

  const handleSendReminder = async (assignmentId: string) => {
    setSending(assignmentId);
    try {
      await sendWhatsAppReminder(assignmentId);
      router.refresh();
    } finally {
      setSending(null);
    }
  };

  const handleAssign = async (
    reservation: UnassignedRow,
    staffId: string
  ) => {
    await createAssignment({
      reservationId: reservation.id,
      staffId,
      propertyId: reservation.propertyId,
      cleaningDate: reservation.checkOut,
    });
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <User size={16} /> Equipo
          </h2>
        </div>
        <div className="space-y-3">
          {staff.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              No hay personal activo. Agregá registros en la base (Prisma) o
              ampliá el admin más adelante.
            </p>
          ) : (
            staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {s.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone size={10} /> {s.phone}
                  </p>
                </div>
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
          <AlertCircle size={16} className="text-orange-500" />
          Sin asignar ({unassignedCheckouts.length})
        </h2>
        <div className="space-y-3">
          {unassignedCheckouts.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Todos los checkouts próximos tienen limpieza asignada.
            </p>
          ) : (
            unassignedCheckouts.map((r) => (
              <div
                key={r.id}
                className="space-y-2 rounded-lg border border-orange-100 bg-orange-50 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {r.property.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Checkout:{" "}
                    {format(new Date(r.checkOut), "dd MMM", { locale: es })}
                  </p>
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) void handleAssign(r, v);
                  }}
                  className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">Asignar a...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
          <CheckCircle size={16} className="text-emerald-500" />
          Próximos 14 días
        </h2>
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Sin asignaciones próximas
            </p>
          ) : (
            assignments.map((a) => {
              const cfg = STATUS_CONFIG[a.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={a.id}
                  className="space-y-2 rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {a.property.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(a.cleaningDate), "EEEE dd MMM", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-xs text-gray-400">{a.staff.name}</p>
                    </div>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${cfg.className}`}
                    >
                      <Icon size={10} /> {cfg.label}
                    </span>
                  </div>
                  {a.status === CleaningStatus.PENDING && (
                    <button
                      type="button"
                      onClick={() => void handleSendReminder(a.id)}
                      disabled={sending === a.id}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {sending === a.id ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send size={12} /> Enviar WhatsApp
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

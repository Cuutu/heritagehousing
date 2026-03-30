"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  X,
  Calendar,
  User,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { ReservationLifecycleStatus, PaymentStatus } from "@prisma/client";
import { updateReservationStatus } from "@/app/admin/actions/reservations";
import { formatCLP } from "@/lib/utils";
import type { ReservationTableRow } from "@/components/admin/ReservationsTable";

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  PAID: "Pagado",
  PENDING: "Pendiente",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

interface Props {
  reservation: ReservationTableRow;
  onClose: () => void;
}

export function ReservationModal({ reservation: r, onClose }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(r.notes ?? "");
  const [saving, setSaving] = useState(false);
  const nights = differenceInDays(new Date(r.checkOut), new Date(r.checkIn));

  const handleStatusChange = async (newStatus: ReservationLifecycleStatus) => {
    setSaving(true);
    try {
      await updateReservationStatus(r.id, newStatus, notes);
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{r.guestName}</h2>
            <p className="text-sm text-gray-400">{r.property.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex gap-4">
            <div className="flex-1 rounded-xl bg-gray-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} /> CHECK-IN
              </div>
              <p className="font-semibold text-gray-900">
                {format(new Date(r.checkIn), "dd MMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex-1 rounded-xl bg-gray-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} /> CHECK-OUT
              </div>
              <p className="font-semibold text-gray-900">
                {format(new Date(r.checkOut), "dd MMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="min-w-[64px] rounded-xl bg-black p-4 text-center text-white">
              <p className="text-2xl font-bold">{nights}</p>
              <p className="text-xs opacity-70">noches</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <User size={14} className="text-gray-400" />
              <span className="text-gray-600">{r.guestEmail}</span>
            </div>
            {r.guestPhone && (
              <div className="text-sm text-gray-600">{r.guestPhone}</div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <CreditCard size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-900">
                {formatCLP(r.totalPrice)}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Pago: {PAYMENT_LABEL[r.paymentStatus] ?? r.paymentStatus}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-500">
              <MessageSquare size={12} /> NOTAS INTERNAS
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas visibles solo para el equipo..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={() => handleStatusChange(ReservationLifecycleStatus.CONFIRMED)}
              disabled={saving || r.lifecycleStatus === "CONFIRMED"}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange(ReservationLifecycleStatus.COMPLETED)}
              disabled={saving || r.lifecycleStatus === "COMPLETED"}
              className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
            >
              Completada
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange(ReservationLifecycleStatus.CANCELLED)}
              disabled={saving || r.lifecycleStatus === "CANCELLED"}
              className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-40"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

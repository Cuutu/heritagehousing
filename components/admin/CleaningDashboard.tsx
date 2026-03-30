"use client";

import { useState, type FormEvent } from "react";
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
  Plus,
} from "lucide-react";
import type {
  CleaningAssignment,
  CleaningStaff,
  Property,
  Reservation,
} from "@prisma/client";
import { CleaningStatus } from "@prisma/client";
import {
  createAssignment,
  createCleaningStaff,
  sendWhatsAppReminder,
  setCleaningStaffActive,
} from "@/app/admin/actions/cleaning";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffFormError, setStaffFormError] = useState<string | null>(null);
  const [equipoError, setEquipoError] = useState<string | null>(null);
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [customWhatsAppMessage, setCustomWhatsAppMessage] = useState("");
  const [sendWhatsAppError, setSendWhatsAppError] = useState<string | null>(
    null
  );

  const handleSendReminder = async (assignmentId: string) => {
    setSending(assignmentId);
    setSendWhatsAppError(null);
    try {
      const res = await sendWhatsAppReminder(
        assignmentId,
        customWhatsAppMessage || null
      );
      if (!res.ok) {
        setSendWhatsAppError(res.error);
        return;
      }
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

  const handleCreateStaff = async (e: FormEvent) => {
    e.preventDefault();
    setStaffFormError(null);
    setStaffSubmitting(true);
    try {
      const res = await createCleaningStaff({
        name: staffName,
        phone: staffPhone,
      });
      if (!res.success) {
        setStaffFormError(res.error);
        return;
      }
      setStaffDialogOpen(false);
      setStaffName("");
      setStaffPhone("");
      router.refresh();
    } finally {
      setStaffSubmitting(false);
    }
  };

  const handleDeactivateStaff = async (id: string) => {
    if (
      !confirm(
        "¿Dar de baja a esta persona? Dejará de aparecer en el equipo y no podrás asignarle nuevas limpiezas."
      )
    ) {
      return;
    }
    setDeactivatingId(id);
    try {
      const res = await setCleaningStaffActive(id, false);
      if (!res.success) {
        setEquipoError(res.error);
        return;
      }
      setEquipoError(null);
      router.refresh();
    } finally {
      setDeactivatingId(null);
    }
  };

  const hasCustomWhatsApp = customWhatsAppMessage.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5">
        <Label
          htmlFor="whatsapp-custom-message"
          className="text-base font-semibold text-gray-900"
        >
          Mensaje personalizado (pruebas WhatsApp)
        </Label>
        <p className="mt-1 text-sm text-gray-500">
          Escribí un texto de prueba y usá <strong>Enviar prueba</strong> en
          una asignación. Se envía al número del staff de esa fila; no cambia
          el estado de la asignación. Dejá vacío para usar la plantilla oficial
          al enviar recordatorios normales.
        </p>
        <Textarea
          id="whatsapp-custom-message"
          value={customWhatsAppMessage}
          onChange={(e) => {
            setCustomWhatsAppMessage(e.target.value);
            setSendWhatsAppError(null);
          }}
          placeholder="Ej. Prueba Heritage: si leés esto, la API de Meta funciona ✅"
          className="mt-3 min-h-[100px] text-sm"
          maxLength={4096}
        />
        <p className="mt-1 text-xs text-gray-400">
          {customWhatsAppMessage.length}/4096
          {hasCustomWhatsApp
            ? " · Modo prueba: no se marca como «Notificado»."
            : null}
        </p>
        {sendWhatsAppError ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {sendWhatsAppError}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <User size={16} /> Equipo
          </h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 gap-1"
            onClick={() => {
              setStaffFormError(null);
              setEquipoError(null);
              setStaffDialogOpen(true);
            }}
          >
            <Plus size={14} /> Agregar
          </Button>
        </div>
        {equipoError ? (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {equipoError}
          </p>
        ) : null}
        <div className="space-y-3">
          {staff.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              No hay personal activo. Usá <strong>Agregar</strong> para dar de
              alta nombre y WhatsApp.
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
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <button
                    type="button"
                    disabled={deactivatingId === s.id}
                    onClick={() => void handleDeactivateStaff(s.id)}
                    className="text-[10px] font-medium text-gray-400 underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deactivatingId === s.id ? "…" : "Dar de baja"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <details className="mt-4 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs text-gray-600">
          <summary className="cursor-pointer font-medium text-gray-700">
            Flujo autónomo (sin tocar código)
          </summary>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-gray-600">
            <li>
              Alta: nombre y número de WhatsApp (Chile: 9 + 8 dígitos; se
              guarda como 569… para Meta).
            </li>
            <li>
              Asignación: en <strong>Sin asignar</strong>, elegí persona por
              checkout.
            </li>
            <li>
              Recordatorios: en <strong>Próximos 14 días</strong>, enviá
              WhatsApp cuando el estado sea Pendiente (requiere variables de
              entorno de Meta configuradas en el servidor).
            </li>
            <li>
              Pruebas: completá <strong>Mensaje personalizado</strong> arriba y
              enviá desde una fila; no se actualiza el estado (solo prueba).
            </li>
          </ol>
        </details>
      </div>

      <Dialog
        open={staffDialogOpen}
        onOpenChange={(open) => {
          setStaffDialogOpen(open);
          if (!open) setStaffFormError(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateStaff}>
            <DialogHeader>
              <DialogTitle>Agregar personal de limpieza</DialogTitle>
              <DialogDescription>
                El número se usa para WhatsApp. Formato Chile:{" "}
                <code className="rounded bg-muted px-1">912345678</code> o{" "}
                <code className="rounded bg-muted px-1">56912345678</code>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="cleaning-staff-name">Nombre</Label>
                <Input
                  id="cleaning-staff-name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Ej. María González"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cleaning-staff-phone">WhatsApp</Label>
                <Input
                  id="cleaning-staff-phone"
                  type="tel"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                  required
                />
              </div>
              {staffFormError ? (
                <p className="text-sm text-red-600" role="alert">
                  {staffFormError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStaffDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={staffSubmitting}>
                {staffSubmitting ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  {(a.status === CleaningStatus.PENDING ||
                    hasCustomWhatsApp) && (
                    <button
                      type="button"
                      onClick={() => void handleSendReminder(a.id)}
                      disabled={sending === a.id}
                      className={
                        hasCustomWhatsApp
                          ? "flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                          : "flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      }
                    >
                      {sending === a.id ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send size={12} />{" "}
                          {hasCustomWhatsApp
                            ? "Enviar prueba WhatsApp"
                            : "Enviar WhatsApp"}
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
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { format, startOfMonth, endOfMonth, subDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  ClipboardList,
  Wrench,
  TrendingUp,
  ArrowRight,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default async function AdminDashboard() {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const chartStart = subDays(startOfDay(new Date()), 6);
  const chartEnd = new Date();

  const [
    propertyCount,
    reservationCount,
    projectCount,
    upcomingReservations,
    revenueAgg,
    reservationsForChart,
    recentLeads,
  ] = await Promise.all([
    prisma.property.count({ where: { isActive: true } }),
    prisma.reservation.count({
      where: {
        checkIn: { gte: monthStart },
      },
    }),
    prisma.project.count({ where: { isActive: true } }),
    prisma.reservation.findMany({
      where: {
        checkIn: { gte: new Date() },
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PAID] },
      },
      include: {
        property: { select: { name: true } },
      },
      orderBy: { checkIn: "asc" },
      take: 5,
    }),
    prisma.reservation.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalPrice: true },
    }),
    prisma.reservation.findMany({
      where: {
        createdAt: { gte: chartStart, lte: chartEnd },
      },
      select: { createdAt: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const monthlyRevenue = Number(revenueAgg._sum.totalPrice ?? 0);

  const dayKeys = Array.from({ length: 7 }, (_, i) =>
    format(subDays(startOfDay(new Date()), 6 - i), "yyyy-MM-dd")
  );
  const countByDay = new Map<string, number>();
  for (const k of dayKeys) countByDay.set(k, 0);
  for (const r of reservationsForChart) {
    const k = format(r.createdAt, "yyyy-MM-dd");
    if (countByDay.has(k)) {
      countByDay.set(k, (countByDay.get(k) ?? 0) + 1);
    }
  }
  const maxCount = Math.max(1, ...Array.from(countByDay.values()));

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Dashboard"
        description="Resumen de actividad: reservas, ingresos y leads. Usá el menú lateral para ir directo a cada área."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="overflow-hidden border-[var(--brand-border)] bg-white shadow-sm">
          <div className="border-l-4 border-[var(--brand-accent)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--paragraph)]">
                Propiedades activas
              </CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <Building2 className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-light text-[var(--headline)]">
                {propertyCount}
              </div>
              <p className="mt-1 text-xs text-[var(--paragraph)]">
                Publicadas y disponibles
              </p>
            </CardContent>
          </div>
        </Card>

        <Card className="overflow-hidden border-[var(--brand-border)] bg-white shadow-sm">
          <div className="border-l-4 border-[var(--brand-accent)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--paragraph)]">
                Reservas del mes
              </CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-light text-[var(--headline)]">
                {reservationCount}
              </div>
              <p className="mt-1 text-xs text-[var(--paragraph)]">
                Check-in programados este mes
              </p>
            </CardContent>
          </div>
        </Card>

        <Card className="overflow-hidden border-[var(--brand-border)] bg-white shadow-sm">
          <div className="border-l-4 border-[var(--brand-accent)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--paragraph)]">
                Ingresos del mes
              </CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-medium tabular-nums text-[var(--headline)]">
                {clp.format(monthlyRevenue)}
              </div>
              <p className="mt-1 text-xs text-[var(--paragraph)]">
                Reservas pagadas creadas este mes
              </p>
            </CardContent>
          </div>
        </Card>

        <Card className="overflow-hidden border-[var(--brand-border)] bg-white shadow-sm">
          <div className="border-l-4 border-[var(--brand-accent)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--paragraph)]">
                Proyectos activos
              </CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <Wrench className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl font-light text-[var(--headline)]">
                {projectCount}
              </div>
              <p className="mt-1 text-xs text-[var(--paragraph)]">En portfolio</p>
            </CardContent>
          </div>
        </Card>
      </div>

      <Card className="border-[var(--brand-border)] bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg font-normal text-[var(--headline)]">
            Reservas creadas · últimos 7 días
          </CardTitle>
          <p className="text-sm text-[var(--paragraph)]">
            Cantidad de reservas nuevas por día (útil para ver picos de demanda).
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex h-36 items-end justify-between gap-2">
            {dayKeys.map((k) => {
              const c = countByDay.get(k) ?? 0;
              const barPx = Math.max(8, Math.round((c / maxCount) * 112));
              return (
                <div
                  key={k}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full max-w-[44px] rounded-t-md bg-primary/90 shadow-sm transition-all hover:bg-primary"
                    style={{ height: `${barPx}px` }}
                    title={`${c} reserva(s)`}
                  />
                  <span className="w-full truncate text-center font-mono text-[10px] uppercase tracking-wide text-[var(--paragraph)]">
                    {format(new Date(k + "T12:00:00"), "EEE", { locale: es })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--brand-border)] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl font-normal text-[var(--headline)]">
              Próximas reservas
            </CardTitle>
            <p className="text-sm text-[var(--paragraph)]">
              Próximos check-in confirmados o pendientes de pago.
            </p>
          </CardHeader>
          <CardContent>
            {upcomingReservations.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--bg-surface)] px-4 py-8 text-center text-sm text-[var(--paragraph)]">
                No hay reservas próximas. Sincronizá iCal o revisá reservas en la
                sección correspondiente.
              </p>
            ) : (
              <div className="space-y-0 divide-y divide-[var(--brand-border)]">
                {upcomingReservations.map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col gap-1 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[var(--headline)]">
                        {res.guestName}
                      </p>
                      <p className="text-sm text-[var(--paragraph)]">
                        {res.property.name}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-mono text-sm tabular-nums text-[var(--headline)]">
                        {format(res.checkIn, "dd/MM")} →{" "}
                        {format(res.checkOut, "dd/MM")}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
                        {res.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              asChild
              variant="outline"
              className="mt-6 w-full border-[var(--brand-border)]"
            >
              <Link href="/admin/reservas">Ver todas las reservas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[var(--brand-border)] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl font-normal text-[var(--headline)]">
              <Mail className="h-5 w-5 text-[var(--brand-accent)]" strokeWidth={1.75} />
              Últimos leads
            </CardTitle>
            <p className="text-sm text-[var(--paragraph)]">
              Mensajes recientes desde el formulario de contacto.
            </p>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--bg-surface)] px-4 py-8 text-center text-sm text-[var(--paragraph)]">
                Sin leads recientes.
              </p>
            ) : (
              <ul className="space-y-0 divide-y divide-[var(--brand-border)]">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="py-4 first:pt-0">
                    <p className="font-medium text-[var(--headline)]">{lead.name}</p>
                    <p className="text-xs text-[var(--paragraph)]">{lead.email}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--paragraph)]/90">
                      {lead.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--brand-border)] bg-[var(--headline)] text-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl font-normal">
            Accesos rápidos
          </CardTitle>
          <p className="text-sm text-white/60">
            Lo que más usás, a un clic.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button
            asChild
            className="h-auto justify-between border-white/20 bg-white/10 py-4 text-white hover:bg-white/20"
            variant="secondary"
          >
            <Link href="/admin/propiedades">
              <span className="text-left">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--brand-accent)]">
                  Catálogo
                </span>
                <span className="font-sans font-normal">Propiedades</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-80" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-auto justify-between border-white/20 bg-white/10 py-4 text-white hover:bg-white/20"
            variant="secondary"
          >
            <Link href="/admin/proyectos">
              <span className="text-left">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--brand-accent)]">
                  Portfolio
                </span>
                <span className="font-sans font-normal">Proyectos</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-80" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-auto justify-between border-white/20 bg-white/10 py-4 text-white hover:bg-white/20"
            variant="secondary"
          >
            <Link href="/admin/calendario">
              <span className="text-left">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--brand-accent)]">
                  Ocupación
                </span>
                <span className="font-sans font-normal">Calendario</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-80" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

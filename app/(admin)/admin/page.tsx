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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tu actividad en Heritage Housing
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Propiedades activas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyCount}</div>
            <p className="text-xs text-muted-foreground">
              Propiedades disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas del mes
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationCount}</div>
            <p className="text-xs text-muted-foreground">Check-in este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clp.format(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Reservas pagadas (creadas este mes)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proyectos activos
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">En portfolio</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reservas creadas (últimos 7 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {dayKeys.map((k) => {
              const c = countByDay.get(k) ?? 0;
              const barPx = Math.max(6, Math.round((c / maxCount) * 96));
              return (
                <div
                  key={k}
                  className="flex-1 flex flex-col items-center gap-1 min-w-0"
                >
                  <div
                    className="w-full max-w-[40px] mx-auto rounded-t bg-amber-800/80 transition-all"
                    style={{ height: `${barPx}px` }}
                    title={`${c} reservas`}
                  />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                    {format(new Date(k + "T12:00:00"), "EEE", { locale: es })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReservations.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay reservas próximas
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{res.guestName}</p>
                      <p className="text-sm text-muted-foreground">
                        {res.property.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {format(res.checkIn, "dd/MM")} -{" "}
                        {format(res.checkOut, "dd/MM")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {res.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/admin/reservas">Ver todas las reservas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Últimos leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin leads recientes</p>
            ) : (
              <ul className="space-y-3">
                {recentLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="text-sm border-b border-stone-100 pb-2 last:border-0"
                  >
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-muted-foreground text-xs">{lead.email}</p>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {lead.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full justify-between">
            <Link href="/admin/propiedades">
              Gestionar propiedades
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/admin/proyectos">
              Gestionar proyectos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href="/admin/calendario">
              Ver calendario unificado
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  ClipboardList,
  Wrench,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

export default async function AdminDashboard() {
  const [propertyCount, reservationCount, projectCount, upcomingReservations] =
    await Promise.all([
      prisma.property.count({ where: { isActive: true } }),
      prisma.reservation.count({
        where: {
          checkIn: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.project.count({ where: { isActive: true } }),
      prisma.reservation.findMany({
        where: {
          checkIn: { gte: new Date() },
          paymentStatus: { in: ["PENDING", "PAID"] },
        },
        include: {
          property: { select: { name: true } },
        },
        orderBy: { checkIn: "asc" },
        take: 5,
      }),
    ]);

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
              Propiedades Activas
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
              Reservas del Mes
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationCount}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Sin datos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proyectos Activos
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">En portfolio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReservations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay reservas próximas</p>
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
              <Link href="/admin/reservas">Ver Todas las Reservas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between">
              <Link href="/admin/propiedades">
                Gestionar Propiedades
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/admin/proyectos">
                Gestionar Proyectos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/admin/calendario">
                Ver Calendario Unificado
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

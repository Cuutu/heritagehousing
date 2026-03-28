"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  differenceInDays,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatCLP } from "@/lib/utils";

interface BookingFlowProps {
  property: {
    id: string;
    name: string;
    pricePerNight: unknown;
    maxGuests: number;
  };
  mode?: "select-dates" | "complete";
  initialCheckInIso?: string;
  initialCheckOutIso?: string;
  initialGuests?: number;
}

type CheckoutStep = 2 | 3;

export function BookingFlow({
  property,
  mode = "select-dates",
  initialCheckInIso,
  initialCheckOutIso,
  initialGuests = 1,
}: BookingFlowProps) {
  const router = useRouter();
  const isComplete = mode === "complete";

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState<Date | undefined>(() =>
    isComplete && initialCheckInIso ? new Date(initialCheckInIso) : undefined
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(() =>
    isComplete && initialCheckOutIso ? new Date(initialCheckOutIso) : undefined
  );
  const [guestCount, setGuestCount] = useState(
    isComplete ? initialGuests : 1
  );

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/reservations/check?propertyId=${encodeURIComponent(property.id)}`
        );
        if (!res.ok) return;
        const data: { blockedDates: string[] } = await res.json();
        if (cancelled) return;
        setBlockedDates(
          (data.blockedDates ?? []).map((iso) => startOfDay(new Date(iso)))
        );
      } catch {
        /* sin bloqueos si falla */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [property.id]);

  const isDayBlocked = (date: Date) =>
    blockedDates.some((b) => isSameDay(b, date));

  const nights =
    checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice =
    nights > 0 ? Number(property.pricePerNight) * nights : 0;

  const handleSelectDatesContinue = () => {
    if (!checkIn || !checkOut) {
      setError("Por favor seleccioná fechas de check-in y check-out");
      return;
    }
    if (nights < 1) {
      setError("La estadía debe ser de al menos 1 noche");
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      propertyId: property.id,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guests: String(guestCount),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  const handleGuestNext = () => {
    if (!guestName || !guestEmail) {
      setError("Por favor completá todos los campos obligatorios");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      setError("Por favor ingresá un email válido");
      return;
    }
    setError(null);
    setCheckoutStep(3);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn: checkIn?.toISOString(),
          checkOut: checkOut?.toISOString(),
          guestCount,
          guestName,
          guestEmail,
          guestPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la reserva");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar");
      setIsLoading(false);
    }
  };

  const today = startOfDay(new Date());

  if (!isComplete) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "w-full justify-start text-left",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    {checkIn
                      ? format(checkIn, "dd/MM/yyyy", { locale: es })
                      : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => {
                      setCheckIn(date);
                      if (checkOut && date && date >= checkOut) {
                        setCheckOut(undefined);
                      }
                    }}
                    disabled={(date) =>
                      isBefore(startOfDay(date), today) || isDayBlocked(date)
                    }
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "w-full justify-start text-left",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    {checkOut
                      ? format(checkOut, "dd/MM/yyyy", { locale: es })
                      : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => {
                      if (!checkIn) return true;
                      const d = startOfDay(date);
                      const ci = startOfDay(checkIn);
                      return (
                        !isAfter(d, ci) || isDayBlocked(date)
                      );
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Huéspedes</Label>
            <Select
              value={guestCount.toString()}
              onValueChange={(v) => setGuestCount(parseInt(v, 10))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map(
                  (n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} {n === 1 ? "huésped" : "huéspedes"}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {nights > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>
                  {formatCLP(Number(property.pricePerNight))} x {nights}{" "}
                  noches
                </span>
                <span>{formatCLP(totalPrice)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCLP(totalPrice)}</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="button"
          className="w-full"
          onClick={handleSelectDatesContinue}
        >
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex gap-2">
        {[2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full",
              checkoutStep >= s ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {checkoutStep === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">Nombre completo *</Label>
            <Input
              id="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email *</Label>
            <Input
              id="guestEmail"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="juan@ejemplo.cl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestPhone">Teléfono</Label>
            <Input
              id="guestPhone"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <div className="mb-2 flex justify-between">
              <span>
                {checkIn && format(checkIn, "dd/MM")} -{" "}
                {checkOut && format(checkOut, "dd/MM/yyyy")}
              </span>
              <span>{nights} noches</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCLP(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {checkoutStep === 3 && (
        <div className="space-y-4">
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">Confirmá tu reserva</h3>
            <p className="text-sm text-muted-foreground">
              Estás a punto de ser redirigido a Stripe para completar el pago
              seguro.
            </p>
          </div>

          <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
            <div className="flex justify-between">
              <span>Propiedad</span>
              <span className="font-medium">{property.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Fechas</span>
              <span>
                {checkIn && format(checkIn, "dd/MM")} -{" "}
                {checkOut && format(checkOut, "dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Huéspedes</span>
              <span>{guestCount}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total a pagar</span>
              <span>{formatCLP(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        {checkoutStep === 3 && (
          <Button
            variant="outline"
            type="button"
            onClick={() => setCheckoutStep(2)}
            disabled={isLoading}
          >
            Volver
          </Button>
        )}

        {checkoutStep === 2 && (
          <Button type="button" className="flex-1" onClick={handleGuestNext}>
            Revisar Reserva
          </Button>
        )}

        {checkoutStep === 3 && (
          <Button
            type="button"
            className="flex-1"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Pagar Ahora"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

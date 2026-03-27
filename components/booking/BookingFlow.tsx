"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
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
import { cn } from "@/lib/utils";
import { formatCLP } from "@/lib/utils";

interface BookingFlowProps {
  property: {
    id: string;
    name: string;
    pricePerNight: unknown;
    maxGuests: number;
  };
}

type Step = 1 | 2 | 3;

export function BookingFlow({ property }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guestCount, setGuestCount] = useState(1);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const nights =
    checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice =
    nights > 0 ? Number(property.pricePerNight) * nights : 0;

  const handleStep1Next = () => {
    if (!checkIn || !checkOut) {
      setError("Por favor seleccioná fechas de check-in y check-out");
      return;
    }
    if (nights < 1) {
      setError("La estadía debe ser de al menos 1 noche");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!guestName || !guestEmail) {
      setError("Por favor completá todos los campos obligatorios");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      setError("Por favor ingresá un email válido");
      return;
    }
    setError(null);
    setStep(3);
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

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "flex-1 h-1 rounded-full",
              s <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
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
                    disabled={(date) => date < new Date()}
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
                    disabled={(date) => !checkIn || date <= checkIn}
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
              onValueChange={(v) => setGuestCount(parseInt(v))}
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
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm mb-2">
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
      )}

      {step === 2 && (
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

          <div className="p-4 bg-muted rounded-lg text-sm">
            <div className="flex justify-between mb-2">
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

      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Confirmá tu reserva</h3>
            <p className="text-sm text-muted-foreground">
              Estás a punto de ser redirigido a Stripe para completar el pago
              seguro.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
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
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total a pagar</span>
              <span>{formatCLP(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep((s) => (s - 1) as Step)}
            disabled={isLoading}
          >
            Volver
          </Button>
        )}

        {step === 1 && (
          <Button className="flex-1" onClick={handleStep1Next}>
            Continuar
          </Button>
        )}

        {step === 2 && (
          <Button className="flex-1" onClick={handleStep2Next}>
            Revisar Reserva
          </Button>
        )}

        {step === 3 && (
          <Button
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

import { z } from "zod";

export const reservationSchema = z.object({
  propertyId: z.string().min(1, "Propiedad requerida"),
  checkIn: z.coerce.date({
    required_error: "Fecha de check-in requerida",
  }),
  checkOut: z.coerce.date({
    required_error: "Fecha de check-out requerida",
  }),
  guestName: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100),
  guestEmail: z.string().email("Email inválido"),
  guestPhone: z.string().optional(),
  guestCount: z.coerce.number().int().min(1).max(20),
  notes: z.string().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export const quickReservationSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guestCount: z.coerce.number().int().min(1),
});

export type QuickReservationInput = z.infer<typeof quickReservationSchema>;

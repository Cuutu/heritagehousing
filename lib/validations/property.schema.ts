import { z } from "zod";

export const propertySchema = z.object({
  name: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().min(50, "Descripción debe tener al menos 50 caracteres"),
  location: z.string().min(3, "Ubicación requerida"),
  pricePerNight: z.coerce.number().positive("Precio debe ser positivo"),
  maxGuests: z.coerce.number().int().min(1).max(20),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  images: z.array(z.string().url()).min(1, "Al menos una imagen requerida"),
  amenities: z.array(z.string()),
  airbnbIcalUrl: z.string().url().optional().or(z.literal("")),
  bookingIcalUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const propertyFilterSchema = z.object({
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  guests: z.coerce.number().int().min(1).optional(),
  location: z.string().optional(),
});

export type PropertyFilter = z.infer<typeof propertyFilterSchema>;

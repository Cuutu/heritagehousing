import { z } from "zod";

export const projectSchema = z.object({
  title: z
    .string()
    .min(3, "Título debe tener al menos 3 caracteres")
    .max(200),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().min(50, "Descripción debe tener al menos 50 caracteres"),
  category: z.enum([
    "cocina",
    "baño",
    "vivienda_completa",
    "exterior",
    "oficina",
    "comercial",
    "otro",
  ]),
  area: z.coerce.number().int().positive().optional(),
  duration: z.coerce.number().int().positive().optional(),
  beforeImages: z.array(z.string().url()).min(1),
  afterImages: z.array(z.string().url()).min(1),
  isActive: z.boolean().default(true),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectCategories = [
  { value: "cocina", label: "Cocina" },
  { value: "baño", label: "Baño" },
  { value: "vivienda_completa", label: "Vivienda Completa" },
  { value: "exterior", label: "Espacios Exteriores" },
  { value: "oficina", label: "Oficina" },
  { value: "comercial", label: "Espacio Comercial" },
  { value: "otro", label: "Otro" },
] as const;

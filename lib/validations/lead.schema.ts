import { z } from "zod";

export const leadSchema = z.object({
  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  projectType: z.enum([
    "cocina",
    "baño",
    "vivienda_completa",
    "exterior",
    "oficina",
    "otro",
  ]),
  message: z
    .string()
    .min(10, "Mensaje debe tener al menos 10 caracteres")
    .max(1000),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const projectTypes = [
  { value: "cocina", label: "Cocina" },
  { value: "baño", label: "Baño" },
  { value: "vivienda_completa", label: "Vivienda Completa" },
  { value: "exterior", label: "Espacios Exteriores" },
  { value: "oficina", label: "Oficina" },
  { value: "otro", label: "Otro" },
] as const;

-- Ejecutar en Supabase → SQL Editor (una vez).
-- Alinea la tabla con prisma/schema.prisma (model Reservation.guestCount).

-- El nombre de columna debe ir entre comillas: "guestCount"
-- (sin comillas Postgres crea "guestcount" y Prisma falla con P2022).

ALTER TABLE "Reservation"
ADD COLUMN IF NOT EXISTS "guestCount" INTEGER NOT NULL DEFAULT 1;

-- Alinea Postgres con prisma/schema.prisma (enums nativos).
-- Error 42704: type "public.PaymentStatus" does not exist
--
-- Ejecutar en Supabase → SQL Editor (una vez). Si algo falla, leé el mensaje y el comentario al final.

-- 1) Tipos ENUM (nombres exactos que usa Prisma)
DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReservationSource" AS ENUM ('DIRECT', 'AIRBNB', 'BOOKING', 'MANUAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Columnas de "Reservation" → esos tipos
-- Antes hay que DROP DEFAULT: si no, error 42804 al castear el default a enum.

ALTER TABLE "Reservation" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "Reservation" ALTER COLUMN "source" DROP DEFAULT;

ALTER TABLE "Reservation"
  ALTER COLUMN "paymentStatus" TYPE "PaymentStatus"
  USING ("paymentStatus"::text::"PaymentStatus");

ALTER TABLE "Reservation"
  ALTER COLUMN "source" TYPE "ReservationSource"
  USING ("source"::text::"ReservationSource");

ALTER TABLE "Reservation"
  ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING'::"PaymentStatus";

ALTER TABLE "Reservation"
  ALTER COLUMN "source" SET DEFAULT 'DIRECT'::"ReservationSource";

-- Si falla el USING: revisá valores con:
-- SELECT DISTINCT "paymentStatus", "source" FROM "Reservation";

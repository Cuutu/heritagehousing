-- Migración incremental: galerías (PropertyImage, ProjectImage, PostImage),
-- estado operativo de reservas (lifecycleStatus) y limpieza (CleaningStaff, CleaningAssignment, M2M).
--
-- Ejecutar en Supabase → SQL Editor (una sola vez), cuando tu base ya tiene el resto de tablas alineadas con Prisma.
-- Si algo falla, leé el mensaje: suele ser "ya existe" (podés comentar ese bloque) o un nombre distinto en tu esquema.

-- 1) Enums nuevos
DO $$ BEGIN
  CREATE TYPE "ReservationLifecycleStatus" AS ENUM ('CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CleaningStatus" AS ENUM ('PENDING', 'NOTIFIED', 'CONFIRMED', 'IN_PROGRESS', 'DONE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Reservation: columna de ciclo de vida (operativa; el pago sigue en paymentStatus)
ALTER TABLE "Reservation"
  ADD COLUMN IF NOT EXISTS "lifecycleStatus" "ReservationLifecycleStatus" NOT NULL DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS "Reservation_lifecycleStatus_idx" ON "Reservation"("lifecycleStatus");

-- 3) Tablas de imágenes
CREATE TABLE IF NOT EXISTS "PropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

DO $$ BEGIN
  ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProjectImage_projectId_idx" ON "ProjectImage"("projectId");

DO $$ BEGIN
  ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PostImage" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PostImage_postId_idx" ON "PostImage"("postId");

DO $$ BEGIN
  ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4) Limpieza
CREATE TABLE IF NOT EXISTS "CleaningStaff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CleaningStaff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CleaningAssignment" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "cleaningDate" TIMESTAMP(3) NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "status" "CleaningStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CleaningAssignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CleaningAssignment_cleaningDate_idx" ON "CleaningAssignment"("cleaningDate");
CREATE INDEX IF NOT EXISTS "CleaningAssignment_staffId_idx" ON "CleaningAssignment"("staffId");
CREATE INDEX IF NOT EXISTS "CleaningAssignment_propertyId_idx" ON "CleaningAssignment"("propertyId");
CREATE UNIQUE INDEX IF NOT EXISTS "CleaningAssignment_reservationId_key" ON "CleaningAssignment"("reservationId");

DO $$ BEGIN
  ALTER TABLE "CleaningAssignment" ADD CONSTRAINT "CleaningAssignment_reservationId_fkey"
    FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CleaningAssignment" ADD CONSTRAINT "CleaningAssignment_staffId_fkey"
    FOREIGN KEY ("staffId") REFERENCES "CleaningStaff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CleaningAssignment" ADD CONSTRAINT "CleaningAssignment_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- M2M implícita Prisma: CleaningStaff ↔ Property
CREATE TABLE IF NOT EXISTS "_StaffProperties" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_StaffProperties_AB_unique" ON "_StaffProperties"("A", "B");
CREATE INDEX IF NOT EXISTS "_StaffProperties_B_index" ON "_StaffProperties"("B");

DO $$ BEGIN
  ALTER TABLE "_StaffProperties" ADD CONSTRAINT "_StaffProperties_A_fkey"
    FOREIGN KEY ("A") REFERENCES "CleaningStaff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "_StaffProperties" ADD CONSTRAINT "_StaffProperties_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

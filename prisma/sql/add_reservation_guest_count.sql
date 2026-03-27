-- Idempotente: si "guestCount" ya existe, no hace nada (no error 42701).
-- Solo para alinear guestCount; los enums van en create_enums_and_align_reservation.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'Reservation'
      AND a.attname = 'guestCount'
      AND a.attnum > 0
      AND NOT a.attisdropped
  ) THEN
    ALTER TABLE "Reservation"
      ADD COLUMN "guestCount" INTEGER NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Prisma usa el identificador "guestCount" (camelCase con comillas).
-- Si creaste la columna sin comillas, Postgres la guardó como "guestcount" y Prisma no la ve.
--
-- 1) Ver cómo quedó (ejecutá y mirá column_name):
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name ILIKE 'reservation'
-- ORDER BY column_name;

-- 2a) Si existe guestcount (minúsculas) y NO existe guestCount, renombrá:
ALTER TABLE "Reservation" RENAME COLUMN "guestcount" TO "guestCount";

-- 2b) Si la tabla se llama en minúsculas (sin comillas al crear), probá:
-- ALTER TABLE reservation RENAME COLUMN guestcount TO "guestCount";

-- 3) Si no tenés ninguna columna todavía, agregá con comillas:
-- ALTER TABLE "Reservation"
--   ADD COLUMN "guestCount" INTEGER NOT NULL DEFAULT 1;

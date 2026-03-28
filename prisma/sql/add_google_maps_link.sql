-- Ejecutar en Supabase (SQL Editor) si usás migraciones manuales
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "googleMapsLink" TEXT;

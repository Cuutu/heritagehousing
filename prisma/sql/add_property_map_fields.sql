-- Mapa en /alquileres: dirección opcional + coordenadas WGS84
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "mapAddress" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

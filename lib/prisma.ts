import { PrismaClient } from "@prisma/client";

/**
 * Supabase Transaction pooler (PgBouncer, puerto 6543) no mezcla bien los
 * prepared statements de Prisma. Sin `pgbouncer=true` Postgres devuelve
 * "prepared statement s0 already exists" (42P05). Normalizamos la URL si
 * detectamos pooler para que el deploy en Vercel no dependa de acordarse del query param.
 */
function databaseUrlForRuntime(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const u = new URL(raw);
    const isSupabaseTransactionPooler =
      u.hostname.includes("pooler.supabase.com") || u.port === "6543";

    if (isSupabaseTransactionPooler) {
      u.searchParams.set("pgbouncer", "true");
      if (process.env.VERCEL === "1") {
        u.searchParams.set("connection_limit", "1");
      }
    }

    return u.toString();
  } catch {
    return raw;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const datasourceUrl = databaseUrlForRuntime() ?? process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl
      ? { datasources: { db: { url: datasourceUrl } } }
      : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

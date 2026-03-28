-- Ejecutar en Supabase → SQL Editor solo si el resto de tablas ya existen
-- y falta únicamente la tabla del blog (Post).

CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "author" TEXT NOT NULL DEFAULT 'Heritage Housing',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "Post_published_publishedAt_idx" ON "Post"("published", "publishedAt");
CREATE INDEX IF NOT EXISTS "Post_slug_idx" ON "Post"("slug");

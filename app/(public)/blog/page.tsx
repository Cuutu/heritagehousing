import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { getPublishedPostsPaginated } from "@/lib/repositories/post.repository";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

export const metadata = {
  title: "Blog | Heritage Housing",
  description:
    "Notas sobre alojamiento, diseño y remodelaciones en Chile — Heritage Housing.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const { posts, totalPages } = await getPublishedPostsPaginated(
    page,
    PAGE_SIZE
  );

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
        Heritage Housing
      </p>
      <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-light text-[var(--headline)]">
        Blog
      </h1>
      <p className="mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-muted-foreground">
        Ideas, procesos y espacios: lo que aprendemos al hospedar y transformar
        hogares en Chile.
      </p>

      {posts.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          Pronto publicaremos el primer artículo.
        </p>
      ) : (
        <>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              {hasPrev ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog?page=${page - 1}`}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>
              )}
              <span className="font-mono text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              {hasNext ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog?page=${page + 1}`}>
                    Siguiente
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type PostCardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: Date | null;
  tags: string[];
};

type PostCardProps = {
  post: PostCardPost;
  className?: string;
};

export function PostCard({ post, className }: PostCardProps) {
  const date = post.publishedAt
    ? format(new Date(post.publishedAt), "d MMM yyyy", { locale: es })
    : null;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-card shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-[var(--brand-border-h)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="relative aspect-[16/10] overflow-hidden bg-muted"
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt=""
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/60 font-display text-4xl font-light text-muted-foreground/40">
            H
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        {date && (
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            {date}
          </p>
        )}
        <h2 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-[var(--headline)] md:text-2xl">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-[var(--brand-accent)]"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 flex-1 font-sans text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--brand-accent)] transition-colors hover:underline"
        >
          Leer artículo →
        </Link>
      </div>
    </article>
  );
}

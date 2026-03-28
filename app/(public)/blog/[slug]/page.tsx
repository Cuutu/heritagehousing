import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, Calendar, User } from "lucide-react";
import { PostContent } from "@/components/blog/PostContent";
import { getPostBySlugPublic } from "@/lib/repositories/post.repository";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlugPublic(params.slug);
  if (!post) {
    return { title: "Blog | Heritage Housing" };
  }

  return {
    title: `${post.title} | Heritage Housing`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlugPublic(params.slug);

  if (!post) {
    notFound();
  }

  const date = post.publishedAt
    ? format(new Date(post.publishedAt), "d MMMM yyyy", { locale: es })
    : null;

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Volver al blog
      </Link>

      <header className="mt-8">
        <h1 className="font-display text-[clamp(1.875rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight text-[var(--headline)]">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
              {date}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" strokeWidth={1.5} />
            {post.author}
          </span>
        </div>
        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      {post.coverImage && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={post.coverImage}
            alt=""
            fill
            unoptimized
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <p className="mt-10 border-l-4 border-[var(--brand-accent)]/50 pl-4 font-sans text-lg italic leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>

      <PostContent markdown={post.content} className="mt-12" />
    </article>
  );
}

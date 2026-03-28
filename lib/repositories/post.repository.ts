import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function ensureUniquePostSlug(
  baseTitleOrSlug: string,
  excludePostId?: string
): Promise<string> {
  let slug = generateSlug(baseTitleOrSlug);
  if (!slug) {
    slug = "post";
  }
  let candidate = slug;
  let n = 2;
  for (;;) {
    const existing = await prisma.post.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludePostId) {
      return candidate;
    }
    candidate = `${slug}-${n}`;
    n += 1;
  }
}

const publishedWhere = {
  published: true,
  publishedAt: { not: null },
};

export async function getPublishedPostsPaginated(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: publishedWhere,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.post.count({ where: publishedWhere }),
  ]);
  return { posts, total, totalPages: Math.ceil(total / pageSize) || 1 };
}

export async function getPostBySlugPublic(slug: string) {
  return prisma.post.findFirst({
    where: { slug, published: true, publishedAt: { not: null } },
  });
}

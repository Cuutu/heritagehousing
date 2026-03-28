import { z } from "zod";

export const PostSchema = z.object({
  title: z.string().min(5).max(100),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(50),
  coverImage: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.string().url().optional()
  ),
  tags: z.array(z.string()).max(5).default([]),
  author: z.string().default("Heritage Housing"),
});

export const PostCreateSchema = PostSchema.extend({
  slug: z.string().min(1).max(120).optional(),
});

export const PostUpdateSchema = z
  .object({
    title: z.string().min(5).max(100).optional(),
    excerpt: z.string().min(10).max(300).optional(),
    content: z.string().min(50).optional(),
    coverImage: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : val),
      z.string().url().optional()
    ),
    tags: z.array(z.string()).max(5).optional(),
    author: z.string().optional(),
    slug: z.string().min(1).max(120).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Al menos un campo es requerido",
  });

export const PostPublishSchema = z.object({
  published: z.boolean(),
});

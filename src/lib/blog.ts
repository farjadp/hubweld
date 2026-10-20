import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Shared validation and helpers for the blog admin routes.
 *
 * The post routes used to destructure req.json() straight into Prisma, which
 * meant an editor typo returned a 500 and a PATCH could set any column on the
 * row — `views`, `authorId`, even `id`. One schema, used by both the create and
 * the update path, keeps the writable surface explicit.
 */

const slug = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and single dashes");

export const postInput = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(300),
  slug,
  excerpt: z.string().max(1000).default(""),
  body: z.string().max(200_000).default(""),
  coverImage: z.string().max(1000).default(""),
  categoryId: z.string().min(1, "Pick a category"),
  tagSlugs: z.array(slug).max(30).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().max(300).default(""),
  seoDesc: z.string().max(500).default(""),
  seoKeywords: z.string().max(500).default(""),
});

/** Same fields, all optional — for PATCH. */
export const postPatchInput = postInput.partial();

export const categoryInput = z.object({
  name: z.string().min(2).max(160),
  slug,
  description: z.string().max(1000).default(""),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const tagInput = z.object({
  name: z.string().min(1).max(80),
  slug,
});

/** Upsert each tag slug and return the join rows Prisma expects. */
export async function resolveTagSlugs(slugs: string[]): Promise<{ tagId: string }[]> {
  const result: { tagId: string }[] = [];
  for (const s of slugs) {
    const name = s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const tag = await prisma.postTag.upsert({ where: { slug: s }, update: {}, create: { slug: s, name } });
    result.push({ tagId: tag.id });
  }
  return result;
}

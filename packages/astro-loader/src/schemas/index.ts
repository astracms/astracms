import { z } from "zod";

/**
 * Schema for author social media links
 */
export const authorSocialSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

/**
 * Schema for author data
 */
export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  bio: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  socials: z.array(authorSocialSchema).default([]),
});

/**
 * Schema for category data
 */
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
});

/**
 * Schema for tag data
 */
export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
});

/**
 * Schema for post data (used in content collections)
 */
export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  coverImage: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  category: categorySchema,
  tags: z.array(tagSchema).default([]),
  authors: z.array(authorSchema).default([]),
  attribution: z.string().nullable().optional(),
});

/**
 * Schema for categories (without id, used as collection entry data)
 */
export const categoryEntrySchema = categorySchema.omit({ id: true });

/**
 * Schema for tags (without id, used as collection entry data)
 */
export const tagEntrySchema = tagSchema.omit({ id: true });

/**
 * Schema for authors (without id, used as collection entry data)
 */
export const authorEntrySchema = authorSchema.omit({ id: true });

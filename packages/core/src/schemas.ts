import { z } from "zod";

/**
 * Schema for author social media links
 */
export const authorSocialSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

/**
 * Schema for count object (post count)
 */
export const countSchema = z
  .object({
    posts: z.number(),
  })
  .optional();

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
  count: countSchema,
});

/**
 * Schema for category data
 */
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  count: countSchema,
});

/**
 * Schema for tag data
 */
export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  count: countSchema,
});

/**
 * Schema for post data
 */
export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  content: z.string(),
  coverImage: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  publishedAt: z.string(),
  updatedAt: z.string(),
  category: categorySchema,
  tags: z.array(tagSchema).default([]),
  authors: z.array(authorSchema).default([]),
  attribution: z.string().nullable().optional(),
});

/**
 * Schema for pagination info
 */
export const paginationSchema = z.object({
  limit: z.number(),
  currentPage: z.number(),
  nextPage: z.number().nullable(),
  previousPage: z.number().nullable(),
  totalPages: z.number(),
  totalItems: z.number(),
});

/**
 * Schema for posts API response
 */
export const postsResponseSchema = z.object({
  posts: z.array(postSchema),
  pagination: paginationSchema,
});

/**
 * Schema for categories API response
 */
export const categoriesResponseSchema = z.object({
  categories: z.array(categorySchema),
  pagination: paginationSchema,
});

/**
 * Schema for tags API response
 */
export const tagsResponseSchema = z.object({
  tags: z.array(tagSchema),
  pagination: paginationSchema,
});

/**
 * Schema for authors API response
 */
export const authorsResponseSchema = z.object({
  authors: z.array(authorSchema),
  pagination: paginationSchema,
});

// Inferred types from schemas
export type AuthorSocialSchema = z.infer<typeof authorSocialSchema>;
export type AuthorSchema = z.infer<typeof authorSchema>;
export type CategorySchema = z.infer<typeof categorySchema>;
export type TagSchema = z.infer<typeof tagSchema>;
export type PostSchema = z.infer<typeof postSchema>;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorySchema = exports.categoryPostSchema = exports.postsSchema = exports.postSchema = exports.paginationSchema = void 0;
var astro_content_1 = require("astro:content");
exports.paginationSchema = astro_content_1.z.object({
    limit: astro_content_1.z.number(),
    currentPage: astro_content_1.z.number(),
    nextPage: astro_content_1.z.number().nullable(),
    previousPage: astro_content_1.z.number().nullable(),
    totalPages: astro_content_1.z.number(),
    totalItems: astro_content_1.z.number(),
});
// Main Post schema for single post retrieval (full data)
exports.postSchema = astro_content_1.z.object({
    id: astro_content_1.z.string(),
    slug: astro_content_1.z.string(),
    title: astro_content_1.z.string(),
    content: astro_content_1.z.string(),
    description: astro_content_1.z.string(),
    coverImage: astro_content_1.z.string().url().nullable().optional(),
    publishedAt: astro_content_1.z.coerce.date(),
    updatedAt: astro_content_1.z.coerce.date(),
    authors: astro_content_1.z.array(astro_content_1.z.object({
        id: astro_content_1.z.string(),
        name: astro_content_1.z.string(),
        image: astro_content_1.z.string().url().nullable().optional(),
        bio: astro_content_1.z.string().nullable(),
        role: astro_content_1.z.string().nullable(),
        slug: astro_content_1.z.string(),
        socials: astro_content_1.z.array(astro_content_1.z.object({
            url: astro_content_1.z.string().url(),
            platform: astro_content_1.z.string(),
        })),
    })),
    category: astro_content_1.z.object({
        id: astro_content_1.z.string(),
        name: astro_content_1.z.string(),
        slug: astro_content_1.z.string(),
    }),
    tags: astro_content_1.z.array(astro_content_1.z.object({
        id: astro_content_1.z.string(),
        name: astro_content_1.z.string(),
        slug: astro_content_1.z.string(),
    })),
    attribution: astro_content_1.z
        .object({
        author: astro_content_1.z.string(),
        url: astro_content_1.z.string().url(),
    })
        .nullable(),
});
exports.postsSchema = astro_content_1.z.object({
    posts: astro_content_1.z.array(exports.postSchema),
    pagination: exports.paginationSchema,
});
exports.categoryPostSchema = astro_content_1.z.object({
    id: astro_content_1.z.string(),
    title: astro_content_1.z.string(),
    slug: astro_content_1.z.string(),
    description: astro_content_1.z.string(),
    coverImage: astro_content_1.z.string().url().nullable().optional(),
    publishedAt: astro_content_1.z.coerce.date(),
    updatedAt: astro_content_1.z.coerce.date(),
    content: astro_content_1.z.string(),
    authors: astro_content_1.z.array(astro_content_1.z.object({
        id: astro_content_1.z.string(),
        name: astro_content_1.z.string(),
        image: astro_content_1.z.string().url().nullable().optional(),
    })),
    tags: astro_content_1.z.array(astro_content_1.z.object({
        id: astro_content_1.z.string(),
        name: astro_content_1.z.string(),
        slug: astro_content_1.z.string(),
    })),
    category: astro_content_1.z.object({
        id: astro_content_1.z.string(),
        name: astro_content_1.z.string(),
        slug: astro_content_1.z.string(),
    }),
});
exports.categorySchema = astro_content_1.z.object({
    id: astro_content_1.z.string(),
    name: astro_content_1.z.string(),
    slug: astro_content_1.z.string(),
    description: astro_content_1.z.string().nullable(),
    count: astro_content_1.z.object({
        posts: astro_content_1.z.number(),
    }),
});

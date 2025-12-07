import { describe, expect, it } from "vitest";
import {
    authorSchema,
    authorSocialSchema,
    authorsResponseSchema,
    categoriesResponseSchema,
    categorySchema,
    paginationSchema,
    postSchema,
    postsResponseSchema,
    tagSchema,
    tagsResponseSchema,
} from "../schemas";

describe("authorSocialSchema", () => {
    it("parses valid social link", () => {
        const result = authorSocialSchema.parse({
            platform: "twitter",
            url: "https://twitter.com/johndoe",
        });
        expect(result).toEqual({
            platform: "twitter",
            url: "https://twitter.com/johndoe",
        });
    });

    it("fails on missing platform", () => {
        expect(() =>
            authorSocialSchema.parse({
                url: "https://twitter.com/johndoe",
            })
        ).toThrow();
    });

    it("fails on missing url", () => {
        expect(() =>
            authorSocialSchema.parse({
                platform: "twitter",
            })
        ).toThrow();
    });
});

describe("authorSchema", () => {
    it("parses valid author", () => {
        const result = authorSchema.parse({
            id: "author-1",
            name: "John Doe",
            slug: "john-doe",
            bio: "A software developer",
            image: "https://example.com/avatar.jpg",
            role: "Editor",
            socials: [{ platform: "github", url: "https://github.com/johndoe" }],
        });
        expect(result.id).toBe("author-1");
        expect(result.name).toBe("John Doe");
        expect(result.socials).toHaveLength(1);
    });

    it("handles nullable optional fields", () => {
        const result = authorSchema.parse({
            id: "author-1",
            name: "Jane Doe",
            slug: "jane-doe",
            bio: null,
            image: null,
            role: null,
            socials: [],
        });
        expect(result.bio).toBeNull();
        expect(result.image).toBeNull();
        expect(result.role).toBeNull();
    });

    it("defaults socials to empty array", () => {
        const result = authorSchema.parse({
            id: "author-1",
            name: "Jane Doe",
            slug: "jane-doe",
        });
        expect(result.socials).toEqual([]);
    });

    it("fails on missing required fields", () => {
        expect(() =>
            authorSchema.parse({
                id: "author-1",
                name: "Jane Doe",
                // missing slug
            })
        ).toThrow();
    });
});

describe("categorySchema", () => {
    it("parses valid category", () => {
        const result = categorySchema.parse({
            id: "cat-1",
            name: "Technology",
            slug: "technology",
            description: "Tech articles",
        });
        expect(result.name).toBe("Technology");
        expect(result.description).toBe("Tech articles");
    });

    it("handles null description", () => {
        const result = categorySchema.parse({
            id: "cat-1",
            name: "Tech",
            slug: "tech",
            description: null,
        });
        expect(result.description).toBeNull();
    });

    it("handles missing optional description", () => {
        const result = categorySchema.parse({
            id: "cat-1",
            name: "Tech",
            slug: "tech",
        });
        expect(result.description).toBeUndefined();
    });
});

describe("tagSchema", () => {
    it("parses valid tag", () => {
        const result = tagSchema.parse({
            id: "tag-1",
            name: "JavaScript",
            slug: "javascript",
            description: "JS related",
        });
        expect(result.name).toBe("JavaScript");
    });

    it("handles nullable description", () => {
        const result = tagSchema.parse({
            id: "tag-1",
            name: "React",
            slug: "react",
            description: null,
        });
        expect(result.description).toBeNull();
    });
});

describe("postSchema", () => {
    const validPost = {
        id: "post-1",
        title: "My First Post",
        description: "A great post",
        slug: "my-first-post",
        content: "<p>Hello world</p>",
        coverImage: "https://example.com/cover.jpg",
        featured: true,
        publishedAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-16T12:00:00Z",
        category: {
            id: "cat-1",
            name: "Technology",
            slug: "technology",
        },
        tags: [{ id: "tag-1", name: "JavaScript", slug: "javascript" }],
        authors: [{ id: "author-1", name: "John", slug: "john", socials: [] }],
        attribution: "Photo by Someone",
    };

    it("parses valid full post", () => {
        const result = postSchema.parse(validPost);
        expect(result.title).toBe("My First Post");
        expect(result.category.name).toBe("Technology");
        expect(result.tags).toHaveLength(1);
        expect(result.authors).toHaveLength(1);
    });

    it("handles nullable coverImage", () => {
        const result = postSchema.parse({
            ...validPost,
            coverImage: null,
        });
        expect(result.coverImage).toBeNull();
    });

    it("handles nullable attribution", () => {
        const result = postSchema.parse({
            ...validPost,
            attribution: null,
        });
        expect(result.attribution).toBeNull();
    });

    it("defaults featured to false", () => {
        const { featured: _, ...postWithoutFeatured } = validPost;
        const result = postSchema.parse(postWithoutFeatured);
        expect(result.featured).toBe(false);
    });

    it("defaults tags to empty array", () => {
        const result = postSchema.parse({
            ...validPost,
            tags: undefined,
        });
        expect(result.tags).toEqual([]);
    });

    it("defaults authors to empty array", () => {
        const result = postSchema.parse({
            ...validPost,
            authors: undefined,
        });
        expect(result.authors).toEqual([]);
    });

    it("fails on missing required title", () => {
        const { title: _, ...postWithoutTitle } = validPost;
        expect(() => postSchema.parse(postWithoutTitle)).toThrow();
    });

    it("fails on missing category", () => {
        const { category: _, ...postWithoutCategory } = validPost;
        expect(() => postSchema.parse(postWithoutCategory)).toThrow();
    });
});

describe("paginationSchema", () => {
    it("parses valid pagination", () => {
        const result = paginationSchema.parse({
            limit: 10,
            currentPage: 1,
            nextPage: 2,
            previousPage: null,
            totalPages: 5,
            totalItems: 50,
        });
        expect(result.limit).toBe(10);
        expect(result.nextPage).toBe(2);
        expect(result.previousPage).toBeNull();
    });
});

describe("response schemas", () => {
    const pagination = {
        limit: 10,
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        totalPages: 1,
        totalItems: 1,
    };

    it("postsResponseSchema parses valid response", () => {
        const result = postsResponseSchema.parse({
            posts: [
                {
                    id: "1",
                    title: "Test",
                    description: "Test",
                    slug: "test",
                    content: "Test",
                    featured: false,
                    publishedAt: "2024-01-01",
                    updatedAt: "2024-01-01",
                    category: { id: "1", name: "Test", slug: "test" },
                    tags: [],
                    authors: [],
                },
            ],
            pagination,
        });
        expect(result.posts).toHaveLength(1);
    });

    it("categoriesResponseSchema parses valid response", () => {
        const result = categoriesResponseSchema.parse({
            categories: [{ id: "1", name: "Tech", slug: "tech" }],
            pagination,
        });
        expect(result.categories).toHaveLength(1);
    });

    it("tagsResponseSchema parses valid response", () => {
        const result = tagsResponseSchema.parse({
            tags: [{ id: "1", name: "JS", slug: "js" }],
            pagination,
        });
        expect(result.tags).toHaveLength(1);
    });

    it("authorsResponseSchema parses valid response", () => {
        const result = authorsResponseSchema.parse({
            authors: [{ id: "1", name: "John", slug: "john", socials: [] }],
            pagination,
        });
        expect(result.authors).toHaveLength(1);
    });
});

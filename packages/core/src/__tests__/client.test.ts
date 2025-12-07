import { beforeEach, describe, expect, it, vi } from "vitest";
import { AstraCMSClient, createAstraCMSClient } from "../client";

describe("AstraCMSClient", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe("constructor and config", () => {
        it("creates client with v2 config (default)", () => {
            const client = new AstraCMSClient({
                apiKey: "test-api-key",
            });
            expect(client).toBeInstanceOf(AstraCMSClient);
        });

        it("creates client with explicit v2 config", () => {
            const client = new AstraCMSClient({
                apiVersion: "v2",
                apiKey: "test-api-key",
            });
            expect(client).toBeInstanceOf(AstraCMSClient);
        });

        it("creates client with v1 config", () => {
            const client = new AstraCMSClient({
                apiVersion: "v1",
                workspaceId: "test-workspace-id",
            });
            expect(client).toBeInstanceOf(AstraCMSClient);
        });
    });

    describe("URL building", () => {
        it("builds v2 URL correctly with hardcoded API URL", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: [] }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            await client.getPosts();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("https://api.astracms.dev/v2/posts"),
                expect.any(Object)
            );
        });

        it("builds v1 URL with workspaceId correctly", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: [] }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiVersion: "v1",
                workspaceId: "my-workspace",
            });

            await client.getPosts();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("https://api.astracms.dev/v1/my-workspace/posts"),
                expect.any(Object)
            );
        });

        it("appends query params correctly", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: [] }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            await client.getPosts({
                format: "markdown",
                categories: ["tech", "news"],
                limit: 10,
            });

            const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
            expect(calledUrl).toContain("format=markdown");
            expect(calledUrl).toContain("categories=tech%2Cnews");
            expect(calledUrl).toContain("limit=10");
        });

        it("excludes undefined and empty params", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: [] }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            await client.getPosts({
                categories: undefined,
                tags: [],
            });

            const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
            expect(calledUrl).not.toContain("categories=");
            expect(calledUrl).not.toContain("tags=");
        });
    });

    describe("headers", () => {
        it("includes Authorization header for v2", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: [] }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "my-secret-key",
            });

            await client.getPosts();

            expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer my-secret-key",
                },
            });
        });

        it("does not include Authorization header for v1", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: [] }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiVersion: "v1",
                workspaceId: "my-workspace",
            });

            await client.getPosts();

            expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
                headers: {
                    "Content-Type": "application/json",
                },
            });
        });
    });

    describe("error handling", () => {
        it("throws on non-ok response", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                statusText: "Unauthorized",
                text: () => Promise.resolve("Invalid API key"),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "bad-key",
            });

            await expect(client.getPosts()).rejects.toThrow(
                "AstraCMS API error (401): Unauthorized. Invalid API key"
            );
        });

        it("throws on 500 error", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: "Internal Server Error",
                text: () => Promise.resolve("Server error"),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            await expect(client.getCategories()).rejects.toThrow(
                "AstraCMS API error (500)"
            );
        });
    });

    describe("API methods", () => {
        it("getPosts returns posts array", async () => {
            const mockPosts = [
                { id: "1", title: "Post 1", slug: "post-1" },
                { id: "2", title: "Post 2", slug: "post-2" },
            ];
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: mockPosts }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            const result = await client.getPosts();
            expect(result).toEqual(mockPosts);
        });

        it("getPost returns single post by slug", async () => {
            const mockPost = { id: "1", title: "My Post", slug: "my-post" };
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: [mockPost] }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            const result = await client.getPost("my-post");
            expect(result).toEqual(mockPost);
        });

        it("getPost returns null when not found", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ posts: [] }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            const result = await client.getPost("non-existent");
            expect(result).toBeNull();
        });

        it("getCategories returns categories array", async () => {
            const mockCategories = [{ id: "1", name: "Tech", slug: "tech" }];
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ categories: mockCategories }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            const result = await client.getCategories();
            expect(result).toEqual(mockCategories);
        });

        it("getTags returns tags array", async () => {
            const mockTags = [{ id: "1", name: "JavaScript", slug: "javascript" }];
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ tags: mockTags }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            const result = await client.getTags();
            expect(result).toEqual(mockTags);
        });

        it("getAuthors returns authors array", async () => {
            const mockAuthors = [
                { id: "1", name: "John Doe", slug: "john-doe", socials: [] },
            ];
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ authors: mockAuthors }),
            });
            vi.stubGlobal("fetch", mockFetch);

            const client = new AstraCMSClient({
                apiKey: "test-key",
            });

            const result = await client.getAuthors();
            expect(result).toEqual(mockAuthors);
        });
    });
});

describe("createAstraCMSClient", () => {
    it("returns AstraCMSClient instance", () => {
        const client = createAstraCMSClient({
            apiKey: "test-key",
        });
        expect(client).toBeInstanceOf(AstraCMSClient);
    });
});

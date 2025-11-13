import { defineCollection } from "astro:content";
import { highlightContent } from "./lib/highlight";
import { fetchCategories, fetchPosts } from "./lib/queries";
import { categorySchema, postSchema } from "./lib/schemas";

const posts = defineCollection({
  loader: async () => {
    if (import.meta.env.SKIP_API_FETCH_ON_BUILD) {
      return [
        {
          id: "placeholder-post",
          slug: "placeholder-post",
          title: "Placeholder Post",
          description: "This is a placeholder post.",
          content: "<h1>Placeholder Content</h1>",
          coverImage: null,
          publishedAt: new Date(),
          updatedAt: new Date(),
          authors: [],
          category: {
            id: "placeholder-category",
            name: "Placeholder Category",
            slug: "placeholder-category",
          },
          tags: [],
          attribution: null,
        },
      ];
    }
    const response = await fetchPosts("?excludeCategories=legal,changelog");
    // Must return an array of entries with an id property
    // or an object with IDs as keys and entries as values
    return Promise.all(
      response.posts.map(async (post) => ({
        ...post,
        content: await highlightContent(post.content),
      }))
    );
  },
  schema: postSchema,
});

const page = defineCollection({
  loader: async () => {
    if (import.meta.env.SKIP_API_FETCH_ON_BUILD) {
      return [
        {
          id: "placeholder-page",
          slug: "placeholder-page",
          title: "Placeholder Page",
          description: "This is a placeholder page.",
          content: "<h1>Placeholder Content</h1>",
          coverImage: null,
          publishedAt: new Date(),
          updatedAt: new Date(),
          authors: [],
          category: {
            id: "placeholder-category",
            name: "Placeholder Category",
            slug: "placeholder-category",
          },
          tags: [],
          attribution: null,
        },
      ];
    }
    const response = await fetchPosts("?categories=legal");

    return response.posts.map((post) => ({
      ...post,
      id: post.slug,
    }));
  },
  schema: postSchema,
});

const changelog = defineCollection({
  loader: async () => {
    if (import.meta.env.SKIP_API_FETCH_ON_BUILD) {
      return [
        {
          id: "placeholder-changelog",
          slug: "placeholder-changelog",
          title: "Placeholder Changelog",
          description: "This is a placeholder changelog entry.",
          content: "<h1>Placeholder Content</h1>",
          coverImage: null,
          publishedAt: new Date(),
          updatedAt: new Date(),
          authors: [],
          category: {
            id: "placeholder-category",
            name: "Placeholder Category",
            slug: "placeholder-category",
          },
          tags: [],
          attribution: null,
        },
      ];
    }
    const response = await fetchPosts("?categories=changelog");

    return response.posts.map((post) => ({
      ...post,
      id: post.slug,
    }));
  },
  schema: postSchema,
});

const categories = defineCollection({
  loader: async () => {
    if (import.meta.env.SKIP_API_FETCH_ON_BUILD) {
      return [
        {
          id: "placeholder-category",
          slug: "placeholder-category",
          name: "Placeholder Category",
          description: "This is a placeholder category.",
          count: { posts: 0 },
        },
      ];
    }
    const response = await fetchCategories();

    return response.categories.map((category) => ({
      ...category,
      id: category.slug,
    }));
  },
  schema: categorySchema,
});

export const collections = {
  posts,
  page,
  changelog,
  categories,
};

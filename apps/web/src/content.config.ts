import { defineCollection } from "astro:content";
import { categoriesLoader, postsLoader } from "@astracms/astro-loader";

const config = {
  apiKey: import.meta.env.ASTRACMS_API_KEY,
};

const posts = defineCollection({
  loader: postsLoader({
    ...config,
    format: "markdown", // or 'html'
    categories: ["blog"],
  }),
});

const changelog = defineCollection({
  loader: postsLoader({
    ...config,
    format: "markdown", // or 'html'
    categories: ["changelog"],
  }),
});

const categories = defineCollection({
  loader: categoriesLoader({
    ...config,
    excludeCategories: ["page"],
  }),
});

const page = defineCollection({
  loader: postsLoader({
    ...config,
    format: "markdown", // or 'html'
    categories: ["page"],
  }),
});

export const collections = {
  posts,
  page,
  changelog,
  categories,
};

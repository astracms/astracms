# @astracms/nuxt

Nuxt 3 module for AstraCMS with auto-imports and SSR support.

## Installation

```bash
npm install @astracms/nuxt @astracms/core
# or
pnpm add @astracms/nuxt @astracms/core
```

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@astracms/nuxt'],
  
  astracms: {
    apiUrl: 'https://api.astracms.dev',
    apiKey: process.env.ASTRACMS_API_KEY,
  },
});
```

Or use runtime config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@astracms/nuxt'],
  
  runtimeConfig: {
    public: {
      astracms: {
        apiUrl: 'https://api.astracms.dev',
        apiKey: '', // Set via NUXT_PUBLIC_ASTRACMS_API_KEY
      },
    },
  },
});
```

## Usage

All composables are auto-imported:

```vue
<script setup>
// Fetch all posts (SSR-ready)
const { data: posts, pending } = await usePosts();

// With filters
const { data: techPosts } = await usePosts({
  categories: ['technology'],
  format: 'html',
});

// Single post
const route = useRoute();
const { data: post } = await usePost(route.params.slug);

// Categories, tags, authors
const { data: categories } = await useCategories();
const { data: tags } = await useTags();
const { data: authors } = await useAuthors();

// Search with debounce
const query = ref('');
const { data: results } = usePostSearch(query);
</script>

<template>
  <div v-if="pending">Loading...</div>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">
      {{ post.title }}
    </li>
  </ul>
</template>
```

## API

### Auto-imported Composables

All use Nuxt's `useAsyncData` for SSR:

- `usePosts(options?)` - Fetch posts
- `usePost(slug, options?)` - Fetch single post
- `useCategories()` - Fetch categories
- `useTags()` - Fetch tags
- `useAuthors()` - Fetch authors
- `usePostSearch(query, options?)` - Search with debounce
- `useAstraCMS()` - Get client instance

### Module Options

```ts
interface ModuleOptions {
  apiUrl?: string;
  apiKey?: string;
  workspaceId?: string;
  autoImport?: boolean; // default: true
}
```

## License

MIT

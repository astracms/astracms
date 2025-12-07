# @astracms/vue

Vue 3 composables for AstraCMS data fetching.

## Installation

```bash
npm install @astracms/vue @astracms/core
# or
pnpm add @astracms/vue @astracms/core
```

## Usage

### Setup with Plugin

```ts
// main.ts
import { createApp } from 'vue';
import { createAstraCMSPlugin } from '@astracms/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createAstraCMSPlugin({
  apiKey: import.meta.env.VITE_ASTRACMS_API_KEY,
}));

app.mount('#app');
```

### Or with Provide/Inject

```vue
<!-- App.vue -->
<script setup>
import { provideAstraCMS } from '@astracms/vue';

provideAstraCMS({
  apiKey: import.meta.env.VITE_ASTRACMS_API_KEY,
});
</script>
```

### Using Composables

```vue
<script setup>
import { usePosts, usePost, useSearch } from '@astracms/vue';
import { ref } from 'vue';

// Fetch all posts
const { data: posts, loading, error } = usePosts();

// With filters
const { data: techPosts } = usePosts({
  categories: ['technology'],
  format: 'html',
});

// Search with debounce
const query = ref('');
const { data: results } = useSearch(query);
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">
      {{ post.title }}
    </li>
  </ul>
</template>
```

## API

### Plugin

- `createAstraCMSPlugin(config)` - Vue plugin for global setup
- `provideAstraCMS(config)` - Provide client to child components

### Composables

All return `{ data, loading, error, refetch }`:

- `usePosts(options?)` - Fetch posts with filtering
- `usePost(slug, options?)` - Fetch single post (supports reactive slug)
- `useCategories()` - Fetch all categories
- `useTags()` - Fetch all tags
- `useAuthors()` - Fetch all authors
- `useSearch(query, options?)` - Search with debounce (supports ref)

## License

MIT

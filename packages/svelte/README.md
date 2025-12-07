# @astracms/svelte

Svelte stores and SvelteKit utilities for AstraCMS.

## Installation

```bash
npm install @astracms/svelte @astracms/core
# or
pnpm add @astracms/svelte @astracms/core
```

## Usage

### Svelte Stores

```svelte
<script>
  import { createAstraCMSStores } from '@astracms/svelte';

  const { posts, categories, tags, authors } = createAstraCMSStores({
    apiKey: import.meta.env.VITE_ASTRACMS_API_KEY,
  });
</script>

{#if $posts.loading}
  <p>Loading...</p>
{:else if $posts.error}
  <p>Error: {$posts.error.message}</p>
{:else}
  <ul>
    {#each $posts.data ?? [] as post}
      <li>{post.title}</li>
    {/each}
  </ul>
{/if}
```

### Search with Debounce

```svelte
<script>
  import { createAstraCMSClient, createSearchStore } from '@astracms/svelte';

  const client = createAstraCMSClient({
    apiKey: import.meta.env.VITE_ASTRACMS_API_KEY,
  });

  const { query, results } = createSearchStore(client);
</script>

<input type="text" on:input={(e) => query.set(e.target.value)} />

{#if $results.loading}
  <p>Searching...</p>
{:else}
  {#each $results.data ?? [] as post}
    <p>{post.title}</p>
  {/each}
{/if}
```

### SvelteKit Server Load

```ts
// +page.server.ts
import { createAstraCMSClient } from '@astracms/svelte';
import { env } from '$env/dynamic/private';

export async function load() {
  const client = createAstraCMSClient({
    apiKey: env.ASTRACMS_API_KEY,
  });

  const posts = await client.getPosts();
  return { posts };
}
```

```ts
// +page.server.ts (single post)
import { createAstraCMSClient } from '@astracms/svelte';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const client = createAstraCMSClient({ apiKey: env.ASTRACMS_API_KEY });
  const post = await client.getPost(params.slug);
  if (!post) throw error(404, 'Post not found');
  return { post };
}
```

## API

### Store Creators

- `createAstraCMSStores(config)` - Create all stores at once
- `createPostsStore(client, options?)` - Posts store
- `createPostStore(client, slug, options?)` - Single post store
- `createCategoriesStore(client)` - Categories store
- `createTagsStore(client)` - Tags store
- `createAuthorsStore(client)` - Authors store
- `createSearchStore(client, options?)` - Search with debounce

### SvelteKit Helpers

- `loadPosts(config, options?)` - Load function for posts
- `loadPost(client, slug, options?)` - Fetch single post
- `createLoadAll(config)` - Load all CMS data

## License

MIT

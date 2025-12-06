# @astracms/astro-loader

Astro Content Collection loaders for [AstraCMS](https://astracms.dev). Seamlessly integrate your AstraCMS content into Astro.js projects.

## Features

- 🚀 **4 Content Loaders**: Posts, Categories, Tags, and Authors
- 🔐 **Dual API Support**: Works with both v1 (workspaceId) and v2 (API key) authentication
- 📝 **Markdown Rendering**: Full support for Astro's `<Content />` component
- 🔄 **Incremental Builds**: Content digests for efficient rebuilds
- 📘 **TypeScript**: Full type safety with Zod schema validation
- 🎯 **Filtering**: Filter posts by categories, tags, and search queries

## Installation

```bash
npm install @astracms/astro-loader
# or
pnpm add @astracms/astro-loader
# or
yarn add @astracms/astro-loader
```

## Quick Start

### 1. Configure Environment Variables

```bash
# .env
ASTRACMS_API_URL=https://api.astracms.dev
ASTRACMS_API_KEY=your_api_key_here
```

### 2. Set Up Content Collections

```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import {
  postsLoader,
  categoriesLoader,
  tagsLoader,
  authorsLoader,
} from '@astracms/astro-loader';

const config = {
  apiUrl: import.meta.env.ASTRACMS_API_URL,
  apiKey: import.meta.env.ASTRACMS_API_KEY,
};

const posts = defineCollection({
  loader: postsLoader({
    ...config,
    format: 'markdown', // or 'html'
  }),
});

const categories = defineCollection({
  loader: categoriesLoader(config),
});

const tags = defineCollection({
  loader: tagsLoader(config),
});

const authors = defineCollection({
  loader: authorsLoader(config),
});

export const collections = { posts, categories, tags, authors };
```

### 3. Use in Your Pages

```astro
---
// src/pages/blog/[slug].astro
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<article>
  <h1>{post.data.title}</h1>
  <p>{post.data.description}</p>
  
  {post.data.coverImage && (
    <img src={post.data.coverImage} alt={post.data.title} />
  )}
  
  <div class="meta">
    <span>Category: {post.data.category.name}</span>
    <span>Published: {post.data.publishedAt.toLocaleDateString()}</span>
  </div>
  
  <div class="tags">
    {post.data.tags.map((tag) => (
      <a href={`/tags/${tag.slug}`}>{tag.name}</a>
    ))}
  </div>
  
  <Content />
  
  <div class="authors">
    {post.data.authors.map((author) => (
      <div class="author">
        {author.image && <img src={author.image} alt={author.name} />}
        <span>{author.name}</span>
        {author.role && <span>{author.role}</span>}
      </div>
    ))}
  </div>
</article>
```

## API Reference

### `postsLoader(options)`

Loads blog posts from AstraCMS.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | `string` | ✓ | AstraCMS API base URL |
| `apiKey` | `string` | * | API key (recommended for v2 API) |
| `workspaceId` | `string` | * | Workspace ID (required for v1 API) |
| `format` | `'html' \| 'markdown'` | | Content format (default: `'markdown'`) |
| `categories` | `string[]` | | Filter by category slugs |
| `excludeCategories` | `string[]` | | Exclude category slugs |
| `tags` | `string[]` | | Filter by tag slugs |
| `excludeTags` | `string[]` | | Exclude tag slugs |
| `query` | `string` | | Search query |

\* Either `apiKey` or `workspaceId` is required

### `categoriesLoader(options)`

Loads categories from AstraCMS.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | `string` | ✓ | AstraCMS API base URL |
| `apiKey` | `string` | * | API key (recommended) |
| `workspaceId` | `string` | * | Workspace ID |
| `query` | `string` | | Search query |

### `tagsLoader(options)`

Loads tags from AstraCMS.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | `string` | ✓ | AstraCMS API base URL |
| `apiKey` | `string` | * | API key (recommended) |
| `workspaceId` | `string` | * | Workspace ID |
| `query` | `string` | | Search query |

### `authorsLoader(options)`

Loads authors from AstraCMS.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | `string` | ✓ | AstraCMS API base URL |
| `apiKey` | `string` | * | API key (recommended) |
| `workspaceId` | `string` | * | Workspace ID |
| `query` | `string` | | Search query |

## Schemas

The package exports Zod schemas that you can use for custom validation or extend:

```typescript
import {
  postSchema,
  categorySchema,
  tagSchema,
  authorSchema,
} from '@astracms/astro-loader';

// Extend the post schema
const customPostSchema = postSchema.extend({
  customField: z.string(),
});
```

## Authentication

### API Key (v2 API) - Recommended

```typescript
postsLoader({
  apiUrl: 'https://api.astracms.dev',
  apiKey: import.meta.env.ASTRACMS_API_KEY,
});
```

### Workspace ID (v1 API)

```typescript
postsLoader({
  apiUrl: 'https://api.astracms.dev',
  workspaceId: 'your-workspace-id',
});
```

## Requirements

- Astro 5.0 or later
- AstraCMS account with API access

## License

MIT

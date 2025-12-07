# @astracms/core

Core API client, types, and schemas for AstraCMS integrations.

## Installation

```bash
npm install @astracms/core
# or
pnpm add @astracms/core
```

## Usage

```typescript
import { AstraCMSClient, type Post, type Category } from '@astracms/core';

// Create a client instance
const client = new AstraCMSClient({
  apiUrl: 'https://api.astracms.dev',
  apiKey: process.env.ASTRACMS_API_KEY,
});

// Fetch posts
const posts = await client.getPosts();

// Fetch with filters
const techPosts = await client.getPosts({
  categories: ['technology'],
  tags: ['javascript'],
  format: 'html',
});

// Fetch single post
const post = await client.getPost('my-post-slug');

// Fetch categories, tags, authors
const categories = await client.getCategories();
const tags = await client.getTags();
const authors = await client.getAuthors();
```

## API

### `AstraCMSClient`

The main client class for interacting with the AstraCMS API.

#### Constructor Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | `string` | Yes | AstraCMS API base URL |
| `apiKey` | `string` | No* | API key for v2 authentication |
| `workspaceId` | `string` | No* | Workspace ID for v1 authentication |

*Either `apiKey` (recommended) or `workspaceId` is required.

### Methods

- `getPosts(options?)` - Fetch all posts with optional filtering
- `getPost(slug)` - Fetch a single post by slug
- `getCategories()` - Fetch all categories
- `getTags()` - Fetch all tags
- `getAuthors()` - Fetch all authors

## Types

The package exports all TypeScript types:

```typescript
import type {
  AstraCMSConfig,
  Post,
  Category,
  Tag,
  Author,
  AuthorSocial,
} from '@astracms/core';
```

## Schemas

Zod schemas for validation:

```typescript
import {
  postSchema,
  categorySchema,
  tagSchema,
  authorSchema,
  authorSocialSchema,
} from '@astracms/core';
```

## License

MIT

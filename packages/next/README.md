# @astracms/next

Next.js utilities for AstraCMS with React Server Components and caching support.

## Installation

```bash
npm install @astracms/next @astracms/core
# or
pnpm add @astracms/next @astracms/core
```

## Usage

### Environment Variables

Set up your environment variables in `.env.local`:

```env
ASTRACMS_API_KEY=your_api_key_here
```

### Server Components (Recommended)

```tsx
// app/blog/page.tsx
import { getPosts } from '@astracms/next';

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### With Filtering

```tsx
const techPosts = await getPosts({
  categories: ['technology'],
  tags: ['javascript'],
  format: 'html',
});
```

### Single Post with Metadata

```tsx
// app/blog/[slug]/page.tsx
import { getPost, generatePostMetadata, generatePostStaticParams } from '@astracms/next';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Generate metadata for SEO
export async function generateMetadata({ params }): Promise<Metadata> {
  return generatePostMetadata(params.slug);
}

// Static generation for all posts
export async function generateStaticParams() {
  return generatePostStaticParams();
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### Client Components

For interactive client-side features, use the client export:

```tsx
"use client";

import { AstraCMSProvider, usePosts, useSearch } from '@astracms/next/client';

export function BlogSearch() {
  const [query, setQuery] = useState('');
  const { data: results, loading } = useSearch(query);
  // ...
}
```

## API

### Server Functions

All cached per-request using React's `cache()`:

- `getPosts(options?)` - Fetch posts with optional filtering
- `getPost(slug, options?)` - Fetch single post
- `getCategories()` - Fetch all categories
- `getTags()` - Fetch all tags
- `getAuthors()` - Fetch all authors

### Static Generation Helpers

- `generatePostMetadata(slug)` - Generate Next.js metadata for a post
- `generatePostStaticParams()` - Generate static params for all posts
- `generateCategoryStaticParams()` - Generate static params for categories
- `generateTagStaticParams()` - Generate static params for tags

### Client Hooks

Available via `@astracms/next/client`:

- `<AstraCMSProvider>` - Provider for client-side hooks
- `usePosts()`, `usePost()`, `useCategories()`, `useTags()`, `useAuthors()`, `useSearch()`

## License

MIT

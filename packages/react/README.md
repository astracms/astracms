# @astracms/react

React hooks for AstraCMS data fetching.

## Installation

```bash
npm install @astracms/react
# or
pnpm add @astracms/react
```

## Usage

### Setup Provider

```tsx
import { AstraCMSProvider } from '@astracms/react';

export default function App() {
  return (
    <AstraCMSProvider apiKey={process.env.NEXT_PUBLIC_ASTRACMS_API_KEY}>
      <YourApp />
    </AstraCMSProvider>
  );
}
```

### Using Hooks

```tsx
import { usePosts, usePost, useCategories, useTags, useAuthors, useSearch } from '@astracms/react';

// Fetch all posts
function PostsList() {
  const { data: posts, loading, error } = usePosts();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {posts?.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

// Fetch posts with filters
function TechPosts() {
  const { data: posts } = usePosts({
    categories: ['technology'],
    tags: ['javascript'],
    format: 'html',
  });
  // ...
}

// Fetch single post
function PostDetail({ slug }: { slug: string }) {
  const { data: post, loading } = usePost(slug);
  // ...
}

// Search with debounce
function SearchPosts() {
  const [query, setQuery] = useState('');
  const { data: results, loading } = useSearch(query, { debounceMs: 300 });
  // ...
}
```

## API

### `<AstraCMSProvider>`

Context provider that configures the AstraCMS client for all child components.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiKey` | `string` | Yes* | API key for v2 authentication |
| `workspaceId` | `string` | No* | Workspace ID for v1 authentication |
| `apiVersion` | `'v1' \| 'v2'` | No | API version (defaults to 'v2') |

*Either `apiKey` (recommended) or `workspaceId` with `apiVersion: 'v1'` is required.

### Hooks

All hooks return `{ data, loading, error, refetch }`.

- `usePosts(options?)` - Fetch posts with optional filtering
- `usePost(slug, options?)` - Fetch single post by slug
- `useCategories()` - Fetch all categories
- `useTags()` - Fetch all tags
- `useAuthors()` - Fetch all authors
- `useSearch(query, options?)` - Search posts with debouncing

## License

MIT

# AstraCMS API

Node.js API server for AstraCMS, built with Hono and deployed on Railway.

## Features

- 🚀 High-performance Hono framework
- 📊 PostgreSQL database with Prisma
- ⚡ Redis-based rate limiting and analytics
- 🔄 REST API with workspace isolation
- 📝 Content fetching (posts, authors, categories, tags)
- 🛡️ Built-in rate limiting per workspace
- 📈 Analytics tracking

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL (via Prisma)
- **Cache/Rate Limiting**: Railway Redis (ioredis)
- **Deployment**: Railway.app

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- Redis instance (Railway Redis with ioredis recommended)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
   - `DATABASE_URL`: PostgreSQL connection string
   - `REDIS_URL`: Redis endpoint URL
   - `REDIS_TOKEN`: Redis authentication token
   - `PORT`: Server port (default: 8000)

### Development

Run the development server with hot reload:

```bash
pnpm dev
```

The API will be available at `http://localhost:8000`

### Production

Build and start the production server:

```bash
pnpm build
pnpm start
```

## API Endpoints

### Health & Status

- `GET /` - Hello message
- `GET /status` - Health check

### Content API

All content endpoints require a `workspaceId` parameter:

#### Posts
- `GET /v1/:workspaceId/posts` - List all posts
- `GET /v1/:workspaceId/posts/:identifier` - Get single post by slug or ID

**Query Parameters:**
- `limit` - Number of posts per page (or "all")
- `page` - Page number (default: 1)
- `order` - Sort order: "asc" or "desc" (default: "desc")
- `categories` - Filter by category slugs (comma-separated)
- `excludeCategories` - Exclude category slugs
- `tags` - Filter by tag slugs (comma-separated)
- `excludeTags` - Exclude tag slugs
- `query` - Search in title and content
- `format` - Response format: "html" or "markdown"

#### Authors
- `GET /v1/:workspaceId/authors` - List all authors
- `GET /v1/:workspaceId/authors/:identifier` - Get single author by slug or ID

#### Categories
- `GET /v1/:workspaceId/categories` - List all categories
- `GET /v1/:workspaceId/categories/:identifier` - Get single category by slug or ID

#### Tags
- `GET /v1/:workspaceId/tags` - List all tags
- `GET /v1/:workspaceId/tags/:identifier` - Get single tag by slug or ID

### Legacy Routes

The API supports legacy routes without `/v1` prefix and automatically redirects to the versioned endpoints:

- `/:workspaceId/posts` → `/v1/:workspaceId/posts`
- `/:workspaceId/authors` → `/v1/:workspaceId/authors`
- `/:workspaceId/categories` → `/v1/:workspaceId/categories`
- `/:workspaceId/tags` → `/v1/:workspaceId/tags`

## Rate Limiting

The API implements automatic rate limiting:

- **With workspace**: 200 requests per 10 seconds
- **Without workspace**: 10 requests per 10 seconds

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Analytics

The API tracks workspace analytics automatically:
- Total page views per workspace
- Monthly page view breakdown
- Stored in Redis for fast access

## Caching

Responses include `Cache-Control` headers with `stale-if-error` directive for improved reliability:
- Cache duration: 3600 seconds (1 hour)
- Only applies to successful GET/HEAD requests

## Deployment on Railway

### Prerequisites

1. Railway account with project created
2. PostgreSQL database provisioned
3. Redis (Railway Redis with ioredis) provisioned

### Environment Variables

Configure these in Railway:

```bash
NODE_ENV=production
PORT=8000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_TOKEN=${{Redis.REDIS_TOKEN}}
CORS_ORIGINS=https://astracms.com,https://blog.astracms.com
API_VERSION=v1
```

### Deploy

Railway will automatically:
1. Install dependencies with `pnpm install`
2. Start the server with `pnpm start`

The API will be available at your configured Railway domain (e.g., `api.astracms.com`).

## Architecture

```
src/
├── app.ts              # Main Hono app with routes
├── server.ts           # Node.js server entry point
├── index.ts            # Export for compatibility
├── middleware/
│   ├── analytics.ts    # Analytics tracking
│   └── ratelimit.ts    # Rate limiting
├── routes/
│   ├── posts.ts        # Posts endpoints
│   ├── authors.ts      # Authors endpoints
│   ├── categories.ts   # Categories endpoints
│   └── tags.ts         # Tags endpoints
├── types/
│   └── env.ts          # Environment type definitions
└── validations/
    └── posts.ts        # Request validation schemas
```

## Error Handling

The API returns JSON error responses:

```json
{
  "error": "Error message",
  "details": {
    "field": "error details"
  }
}
```

Common status codes:
- `200` - Success
- `400` - Bad request (validation errors)
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Internal server error

## Local Development Tips

1. **Database Setup**: Ensure PostgreSQL is running locally or use Railway's database
2. **Redis Setup**: Use Railway Redis with ioredis for development
3. **Hot Reload**: The dev server uses `tsx watch` for instant reloads
4. **Testing**: Use tools like `curl`, Postman, or Thunder Client

### Example Request

```bash
curl http://localhost:8000/v1/your-workspace-id/posts?limit=10&page=1
```

## License

Part of the AstraCMS monorepo.
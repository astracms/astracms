# CLAUDE.md - AI Assistant Guide for Astracms

> **Last Updated**: 2025-11-13
> **Purpose**: Comprehensive guide for AI assistants working with the Astracms codebase

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Tech Stack](#tech-stack)
4. [Development Setup](#development-setup)
5. [Key Conventions & Patterns](#key-conventions--patterns)
6. [Database Schema](#database-schema)
7. [API Architecture](#api-architecture)
8. [Authentication System](#authentication-system)
9. [Common Tasks & File Paths](#common-tasks--file-paths)
10. [Best Practices for AI Assistants](#best-practices-for-ai-assistants)

---

## Project Overview

**Astracms** is a modern, self-hostable content management system designed for publishing articles, product updates, and changelogs. It follows a monorepo architecture with a separation between the content management interface (CMS) and the public content API.

### Key Features
- Multi-workspace/tenant support (organizations)
- Rich text editor with Tiptap/Novel
- REST API for content consumption
- Tag and category organization
- Multi-author content
- File upload (S3-compatible storage)
- Webhook system for content events
- AI-assisted writing features
- Subscription billing (Polar integration)

### License
GNU Affero General Public License v3.0

---

## Repository Structure

This is a **pnpm workspace monorepo** managed by **Turbo**.

```
astracms/
├── apps/
│   ├── api/              # Hono REST API (port 8000)
│   │   ├── src/
│   │   │   ├── index.ts          # Main server entry
│   │   │   ├── routes/           # Resource endpoints
│   │   │   │   ├── posts.ts
│   │   │   │   ├── categories.ts
│   │   │   │   ├── tags.ts
│   │   │   │   └── authors.ts
│   │   │   ├── middleware/       # Rate limit, analytics
│   │   │   ├── validations/      # Zod schemas
│   │   │   └── types/
│   │   └── package.json
│   │
│   └── cms/              # Next.js 16 dashboard (port 3000)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/       # Login, register, reset
│       │   │   ├── (main)/       # Protected workspace routes
│       │   │   │   ├── [workspace]/
│       │   │   │   │   ├── (dashboard)/  # Posts, categories, tags
│       │   │   │   │   ├── (editor)/     # Post editor
│       │   │   │   │   └── settings/     # Workspace config
│       │   │   │   └── settings/         # User settings
│       │   │   ├── (share)/      # Public share links
│       │   │   └── api/          # Internal API routes
│       │   ├── components/       # React components (287 files)
│       │   ├── hooks/            # Custom React hooks
│       │   ├── lib/
│       │   │   ├── actions/      # Server actions
│       │   │   ├── queries/      # Database queries
│       │   │   ├── validations/  # Zod schemas
│       │   │   ├── auth/         # Better Auth config
│       │   │   ├── webhooks/     # QStash client
│       │   │   ├── media/        # File upload
│       │   │   └── ai/           # AI features
│       │   ├── types/
│       │   ├── utils/
│       │   └── styles/
│       └── package.json
│
├── packages/
│   ├── db/                       # Prisma ORM + client
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Database schema
│   │   └── src/
│   │       └── client.ts         # Singleton client
│   │
│   ├── ui/                       # Shadcn/Radix components
│   │   ├── src/
│   │   │   ├── components/       # Reusable UI
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── package.json
│   │
│   ├── parser/                   # Markdown ↔ Tiptap
│   │   ├── src/
│   │   │   └── index.ts          # MarkdownToTiptapParser
│   │   └── package.json
│   │
│   └── tsconfig/                 # Shared TypeScript configs
│       └── package.json
│
├── .github/
│   └── CONTRIBUTING.md           # Contribution guidelines
├── scripts/                      # Build/deploy scripts
├── .husky/                       # Git hooks
├── biome.jsonc                   # Linter config
├── turbo.json                    # Monorepo config
├── pnpm-workspace.yaml           # Workspace definition
├── docker-compose.yml            # PostgreSQL + Minio
└── package.json                  # Root package
```

---

## Tech Stack

### Frontend/CMS (apps/cms)
| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Framework** | Next.js | 16.0.0 | Turbopack enabled for faster builds |
| **Runtime** | React | 19.2.0 | Latest React with concurrent features |
| **Language** | TypeScript | 5.6.3 | Strict mode enabled |
| **Styling** | Tailwind CSS | 4.1.12 | New @layer syntax |
| **UI Components** | Shadcn/ui + Radix | Latest | Accessible primitives |
| **Forms** | React Hook Form | 7.61.1 | With Zod validation |
| **Rich Editor** | Tiptap + Novel | 2.11.2 | Markdown-aware |
| **State Management** | TanStack Query | 5.85.5 | Server state sync |
| **Authentication** | Better Auth | 1.3.8 | Database sessions |
| **File Upload** | AWS SDK S3 | 3.758 | S3-compatible (R2/Minio) |
| **Email** | Resend | 4.0.1 | Transactional emails |
| **Search Params** | Nuqs | 2.6.0 | Type-safe URL params |
| **Icons** | Lucide React | Latest | SVG icon library |

### Backend/API (apps/api)
| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Framework** | Hono | 4.10.3 | Lightweight web framework |
| **Runtime** | Node.js + tsx | 20+ | TypeScript execution |
| **Validation** | Zod | 3.25.76 | Schema validation |

### Database & ORM
| Component | Technology | Notes |
|-----------|-----------|-------|
| **Database** | PostgreSQL | Neon serverless adapter |
| **ORM** | Prisma | 6.15.0 with `@neondatabase/serverless` |
| **Cache** | Redis | Upstash serverless Redis |

### Third-party Services
| Service | Purpose | Usage |
|---------|---------|-------|
| **Better Auth** | Authentication | OAuth (Google), Email/Password, OTP |
| **Polar** | Billing | Subscription management |
| **Resend** | Email | Transactional emails |
| **Upstash Redis** | Cache | Rate limiting, sessions, analytics |
| **QStash** | Queue | Webhook delivery with retries |
| **Cloudflare R2** or **Minio** | Storage | S3-compatible file storage |

### Development Tools
| Tool | Purpose | Version |
|------|---------|---------|
| **Turbo** | Monorepo orchestration | 2.5.8 |
| **pnpm** | Package manager | 10.19.0 |
| **Biome** | Linter + Formatter | 2.3.2 |
| **Ultracite** | Biome preset | 6.0.5 |
| **Husky** | Git hooks | 9.1.7 |
| **commitlint** | Commit validation | 19.8.1 |
| **Vitest** | Unit testing | 3.2.4 |

---

## Development Setup

### Prerequisites
- **Node.js**: ≥20.x
- **pnpm**: ≥10.x (`npm i -g pnpm`)
- **PostgreSQL**: Neon or local Docker
- **Redis**: Upstash or local
- **S3 Storage**: Cloudflare R2 or Minio
- **OAuth Apps**: Google (required), GitHub (optional)

### Quick Start
```bash
# Clone repository
git clone https://github.com/astracms/astracms.git
cd astracms

# Install dependencies
pnpm install

# Setup environment files
cp apps/api/.dev.vars.example apps/api/.dev.vars
cp apps/cms/.env.example apps/cms/.env
cp packages/db/.env.example packages/db/.env

# Start PostgreSQL + Minio (Docker)
docker-compose up -d

# Wait for DB to be ready
docker compose ps  # Check STATUS is "healthy"

# Run migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Start all apps in dev mode
pnpm dev

# OR start specific apps
pnpm cms:dev  # CMS only (port 3000)
pnpm api:dev  # API only (port 8000)
```

### Environment Variables

**Required for `apps/cms/.env`:**
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/astracms?sslmode=require"

# Authentication
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="<generate with: openssl rand -base64 32>"

# OAuth (Google)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Redis (Upstash)
REDIS_URL="https://your-redis.upstash.io"
REDIS_TOKEN="your-redis-token"

# Storage (Minio local development)
CLOUDFLARE_ACCESS_KEY_ID="minioadmin"
CLOUDFLARE_SECRET_ACCESS_KEY="minioadmin"
CLOUDFLARE_BUCKET_NAME="astracms-media"
CLOUDFLARE_S3_ENDPOINT="http://localhost:9000"
CLOUDFLARE_PUBLIC_URL="http://localhost:9000/astracms-media"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"

# Workspace API key (for CMS to call API)
ASTRACMS_WORKSPACE_KEY="your-workspace-key"
ASTRACMS_API_URL="http://localhost:8000"
```

**Required for `apps/api/.dev.vars`:**
```bash
DATABASE_URL="postgresql://user:password@host:5432/astracms?sslmode=require"
REDIS_URL="https://your-redis.upstash.io"
REDIS_TOKEN="your-redis-token"
```

### Common Scripts
```bash
# Development
pnpm dev                    # Start all apps
pnpm cms:dev               # CMS only
pnpm api:dev               # API only

# Database
pnpm db:generate           # Regenerate Prisma client
pnpm db:push               # Sync schema to DB (dev)
pnpm db:migrate            # Create migration (prod)
pnpm db:studio             # Open Prisma Studio UI

# Linting & Formatting
pnpm lint                  # Check with Ultracite/Biome
pnpm format                # Auto-fix formatting

# Build
pnpm build                 # Build all apps via Turbo

# Docker
pnpm docker:up             # Start PostgreSQL + Minio
pnpm docker:down           # Stop containers
pnpm docker:clean          # Stop and remove volumes (DANGER)
```

---

## Key Conventions & Patterns

### File Naming
- **Components**: `PascalCase.tsx` (e.g., `UserForm.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useWorkspaceId.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `generate-slug.ts`)
- **Constants**: `UPPER_CASE` in files (e.g., `SITE_CONFIG`)
- **Types**: `PascalCase` interfaces/types (e.g., `PostWithAuthors`)

### Code Organization
```
Feature-based structure:
src/
├── components/       # UI components grouped by feature
│   ├── posts/
│   ├── categories/
│   └── shared/
├── lib/
│   ├── actions/      # Server actions ("use server")
│   ├── queries/      # Database queries
│   ├── validations/  # Zod schemas
│   └── utils/        # Helper functions
├── hooks/            # Custom React hooks
└── types/            # TypeScript definitions
```

### TypeScript Patterns
```typescript
// 1. Zod schemas for validation
import { z } from "zod"

export const postSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  content: z.string(),
  status: z.enum(["draft", "published"]),
  categoryId: z.string().uuid(),
})

export type PostInput = z.infer<typeof postSchema>

// 2. Server actions with "use server"
"use server"
import { db } from "@astracms/db"
import { getServerSession } from "@/lib/auth/session"

export async function createPost(data: PostInput) {
  const session = await getServerSession()
  if (!session) throw new Error("Unauthorized")

  return await db.post.create({
    data: {
      ...data,
      workspaceId: session.user.activeOrganizationId!,
    },
  })
}

// 3. Optimized database queries
export async function getPosts(workspaceId: string) {
  return await db.post.findMany({
    where: { workspaceId, status: "published" },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      authors: {
        select: { id: true, name: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { publishedAt: "desc" },
  })
}

// 4. Component patterns (Client components)
"use client"
import { Button } from "@astracms/ui/components/button"
import { toast } from "@astracms/ui/components/sonner"

export function PostForm() {
  const handleSubmit = async (data: PostInput) => {
    try {
      await createPost(data)
      toast.success("Post created!")
    } catch (error) {
      toast.error("Failed to create post")
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Architecture Patterns

**1. Multi-tenancy (Workspaces)**
- All resources are scoped to `workspaceId`
- URL pattern: `/[workspace]/posts`
- Database: `unique(workspaceId, slug)` constraints
- Session: `activeOrganizationId` field

**2. Slug-based Routing**
- Resources use slugs instead of IDs in URLs
- Slugs are unique per workspace
- Auto-generated from titles with `generateSlug()`

**3. Status Fields (Soft Deletes)**
- Use status enums instead of hard deletes
- Example: `PostStatus.draft | PostStatus.published`
- Filter by status in queries

**4. Audit Fields**
- All entities have: `createdAt`, `updatedAt`
- Some have: `publishedAt`, `deletedAt`

**5. Rate Limiting**
- Sliding window algorithm
- Scoped by IP + workspaceId
- Redis-backed with memory fallback
- Default: 200 requests per 10 seconds

**6. Error Handling**
```typescript
import { APIError } from "better-auth"

// Server actions
if (!session) {
  throw new APIError("UNAUTHORIZED", {
    message: "You must be logged in",
  })
}

// Client-side
try {
  await action()
} catch (error) {
  if (error instanceof APIError) {
    toast.error(error.message)
  } else {
    toast.error("An unexpected error occurred")
  }
}
```

### Commit Message Convention
Follow **Conventional Commits** format:
```
<type>(<scope>): <description>

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation
- style:    Code style (formatting, no logic change)
- refactor: Code refactoring
- perf:     Performance improvement
- test:     Tests
- chore:    Maintenance tasks
- ci:       CI/CD changes
- build:    Build system changes
- revert:   Revert previous commit

Examples:
feat(cms): add bulk delete for posts
fix(api): resolve rate limit memory leak
docs: update CLAUDE.md with latest schema
refactor(db): optimize post queries
```

---

## Database Schema

### Entity Relationship Diagram
```
User ──────┐
           │
Account    │
           │
Session ───┴─── Organization (Workspace) ──┬─── Member
           │                                 │
Invitation │                                 └─── Subscription
           │
           ├─── Post ──┬─── PostAuthor ─── Author
           │           │
           │           ├─── PostTag ────── Tag
           │           │
           │           └─── Category
           │
           ├─── Media
           │
           ├─── ShareLink
           │
           ├─── Webhook ─── WebhookEvent
           │
           └─── EditorPreferences
```

### Core Models

#### Authentication
```prisma
model User {
  id                    String    @id
  email                 String    @unique
  emailVerified         Boolean   @default(false)
  name                  String?
  image                 String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  accounts              Account[]
  sessions              Session[]
  authors               Author[]
}

model Session {
  id                    String    @id
  userId                String
  expiresAt             DateTime
  token                 String    @unique
  ipAddress             String?
  userAgent             String?
  activeOrganizationId  String?   // Current workspace

  user                  User      @relation(...)
}

model Organization {  // Aliased as "Workspace" in code
  id                    String    @id
  name                  String
  slug                  String    @unique
  logo                  String?
  timezone              String?   // Custom field
  createdAt             DateTime  @default(now())

  // Relations
  members               Member[]
  posts                 Post[]
  categories            Category[]
  tags                  Tag[]
  authors               Author[]
  media                 Media[]
  webhooks              Webhook[]
  subscription          Subscription?
  editorPreferences     EditorPreferences?
}
```

#### Content Models
```prisma
model Post {
  id                    String       @id @default(uuid())
  title                 String       @db.VarChar(255)
  slug                  String       @db.VarChar(255)
  excerpt               String?      @db.Text
  content               String?      @db.Text        // Markdown
  contentJson           Json?                        // Tiptap JSON
  featuredImage         String?
  featured              Boolean      @default(false)
  status                PostStatus   @default(draft)
  publishedAt           DateTime?

  workspaceId           String
  categoryId            String
  primaryAuthorId       String       // Main author

  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  // Relations
  workspace             Organization @relation(...)
  category              Category     @relation(...)
  primaryAuthor         Author       @relation(name: "PrimaryAuthor", ...)
  authors               Author[]     @relation("PostAuthors")  // Many-to-many
  tags                  Tag[]        @relation("PostTags")     // Many-to-many
  shareLinks            ShareLink[]

  @@unique([workspaceId, slug])
  @@index([workspaceId, status, publishedAt])
  @@index([workspaceId, createdAt])
}

enum PostStatus {
  draft
  published
}

model Category {
  id                    String       @id @default(uuid())
  name                  String       @db.VarChar(100)
  slug                  String       @db.VarChar(100)
  description           String?      @db.Text
  color                 String?      // Hex color
  workspaceId           String

  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  workspace             Organization @relation(...)
  posts                 Post[]

  @@unique([workspaceId, slug])
}

model Tag {
  id                    String       @id @default(uuid())
  name                  String       @db.VarChar(100)
  slug                  String       @db.VarChar(100)
  workspaceId           String

  createdAt             DateTime     @default(now())

  workspace             Organization @relation(...)
  posts                 Post[]       @relation("PostTags")

  @@unique([workspaceId, slug])
}

model Author {
  id                    String       @id @default(uuid())
  name                  String       @db.VarChar(100)
  slug                  String       @db.VarChar(100)
  email                 String?      @db.VarChar(255)
  bio                   String?      @db.Text
  avatar                String?
  website               String?

  userId                String?      // Link to User (optional)
  workspaceId           String

  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  user                  User?        @relation(...)
  workspace             Organization @relation(...)
  primaryPosts          Post[]       @relation(name: "PrimaryAuthor")
  posts                 Post[]       @relation("PostAuthors")
  socials               AuthorSocial[]

  @@unique([workspaceId, slug])
  @@index([userId])
}

model AuthorSocial {
  id                    String       @id @default(uuid())
  authorId              String
  platform              String       // twitter, github, linkedin, etc.
  url                   String

  author                Author       @relation(...)

  @@unique([authorId, platform])
}
```

#### Media & Sharing
```prisma
model Media {
  id                    String       @id @default(uuid())
  name                  String
  url                   String
  type                  MediaType
  size                  Int          // Bytes
  mimeType              String?

  workspaceId           String
  uploadedById          String?

  createdAt             DateTime     @default(now())

  workspace             Organization @relation(...)

  @@index([workspaceId, createdAt])
}

enum MediaType {
  image
  video
  audio
  document
}

model ShareLink {
  id                    String       @id @default(uuid())
  postId                String
  token                 String       @unique
  password              String?      // Hashed
  expiresAt             DateTime?
  isActive              Boolean      @default(true)

  createdAt             DateTime     @default(now())

  post                  Post         @relation(...)

  @@index([token])
  @@index([expiresAt, isActive])
}
```

#### Webhooks
```prisma
model Webhook {
  id                    String       @id @default(uuid())
  name                  String
  url                   String
  secret                String?      // Signing secret
  format                PayloadFormat @default(json)
  events                WebhookEvent[]
  enabled               Boolean      @default(true)

  workspaceId           String

  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  workspace             Organization @relation(...)
}

enum PayloadFormat {
  json
  discord
  slack
}

enum WebhookEvent {
  post_created
  post_updated
  post_deleted
  post_published
  category_created
  category_updated
  category_deleted
  tag_created
  tag_updated
  tag_deleted
  media_uploaded
  media_deleted
}
```

#### Billing
```prisma
model Subscription {
  id                    String              @id @default(uuid())
  workspaceId           String              @unique
  polarId               String              @unique

  plan                  PlanType
  status                SubscriptionStatus

  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  canceledAt            DateTime?

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  workspace             Organization        @relation(...)
}

enum PlanType {
  team
  pro
}

enum SubscriptionStatus {
  active
  cancelled
  expired
  trialing
  past_due
}
```

#### Settings
```prisma
model EditorPreferences {
  id                    String       @id @default(uuid())
  workspaceId           String       @unique

  ai                    Json?        // AI settings (readability, suggestions)

  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  workspace             Organization @relation(...)
}
```

### Key Indexes
```prisma
// Performance-critical indexes
@@index([workspaceId, status, publishedAt])  # Post listing/filtering
@@index([workspaceId, createdAt])            # Recent items
@@index([providerId, accountId])             # OAuth lookups
@@index([token])                             # Session/ShareLink lookup
@@index([expiresAt, isActive])               # Cleanup queries
```

---

## API Architecture

### Public Content API (Hono)

**Base URL**: `http://localhost:8000`

#### Endpoint Structure
```
/v1/:workspaceId/posts
/v1/:workspaceId/categories
/v1/:workspaceId/tags
/v1/:workspaceId/authors
```

#### Posts Endpoint
```http
GET /v1/:workspaceId/posts

Query Parameters:
  ?limit=10              # Default 10, "all" for no limit
  &page=1                # For pagination
  &order=asc|desc        # Default desc
  &categories=slug1,slug2       # Filter by category slugs
  &excludeCategories=slug3      # Exclude categories
  &tags=tag1,tag2               # Filter by tags
  &excludeTags=tag3             # Exclude tags
  &query=search                 # Full-text search (title + content)

Response (200 OK):
{
  "data": [
    {
      "id": "uuid",
      "title": "Post Title",
      "slug": "post-title",
      "excerpt": "...",
      "content": "...",
      "contentJson": {...},
      "featuredImage": "https://...",
      "featured": false,
      "status": "published",
      "publishedAt": "2025-11-13T...",
      "category": {
        "id": "uuid",
        "name": "Category Name",
        "slug": "category-name"
      },
      "authors": [
        {
          "id": "uuid",
          "name": "Author Name",
          "avatar": "https://...",
          "bio": "..."
        }
      ],
      "tags": [
        {
          "id": "uuid",
          "name": "Tag Name",
          "slug": "tag-name"
        }
      ],
      "createdAt": "2025-11-13T...",
      "updatedAt": "2025-11-13T..."
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}

Error Response (400 Bad Request):
{
  "error": "Validation failed",
  "details": [
    {
      "field": "limit",
      "message": "Expected number or 'all'"
    }
  ]
}
```

#### Middleware Stack
1. **Cache-Control** (global): `stale-if-error=3600`
2. **Rate Limiting**: 200 requests per 10 seconds (per workspace)
3. **Analytics**: Track requests in Redis
4. **Logging**: Request/response logging

#### Rate Limit Response
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 8

{
  "error": "Rate limit exceeded. Try again in 8 seconds."
}
```

### Internal CMS API (Next.js)

**Base URL**: `http://localhost:3000/api`

#### Key Endpoints
```
POST   /api/posts                 # Create post
GET    /api/posts/:id             # Get post
PATCH  /api/posts/:id             # Update post
DELETE /api/posts/:id             # Delete post

POST   /api/categories            # Create category
GET    /api/categories/:id        # Get category
PATCH  /api/categories/:id        # Update category
DELETE /api/categories/:id        # Delete category

POST   /api/tags                  # Create tag
GET    /api/tags/:id              # Get tag
PATCH  /api/tags/:id              # Update tag
DELETE /api/tags/:id              # Delete tag

POST   /api/authors               # Create author
GET    /api/authors/:id           # Get author
PATCH  /api/authors/:id           # Update author
DELETE /api/authors/:id           # Delete author

POST   /api/media                 # Upload media
DELETE /api/media/:id             # Delete media

POST   /api/webhooks              # Create webhook
GET    /api/webhooks/:id          # Get webhook
PATCH  /api/webhooks/:id          # Update webhook
DELETE /api/webhooks/:id          # Delete webhook

POST   /api/auth/[...all]         # Better Auth handler

GET    /api/billing/usage         # Subscription usage
POST   /api/polar/success         # Billing callback

POST   /api/ai/suggestions        # AI writing suggestions
POST   /api/ai/readability        # Readability analysis
```

---

## Authentication System

### Better Auth Configuration

**Session Strategy**: Database-backed with Redis cache

```typescript
// apps/cms/src/lib/auth/index.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  // Session settings
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 days
    updateAge: 60 * 60 * 24,       // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,              // 5 minutes
    },
  },

  // Secondary storage (Redis)
  secondaryStorage: redis,

  // Email/Password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,  // Handled by middleware
  },

  // OAuth Providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    // github: { ... }  // Commented out, can enable
  },

  // Plugins
  plugins: [
    // Multi-workspace support
    organization({
      async sendInvitationEmail(data) {
        await sendEmail({
          to: data.email,
          subject: "Invitation to join workspace",
          html: `...`,
        })
      },
      schema: {
        organization: {
          fields: {
            timezone: {
              type: "string",
              required: false,
            },
          },
        },
      },
    }),

    // Email OTP
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await sendEmail({
          to: email,
          subject: "Your verification code",
          html: `Your code: ${otp}`,
        })
      },
    }),

    // Billing integration
    polar({
      checkoutURL: async ({ user, productId }) => {
        // Return Polar checkout URL
      },
      portalURL: async ({ user }) => {
        // Return customer portal URL
      },
    }),
  ],

  // Hooks
  hooks: {
    after: [
      {
        matcher: (context) => context.path === "/organization/create",
        handler: async (context) => {
          // Create default author for new workspace
          await db.author.create({
            data: {
              name: context.user.name,
              email: context.user.email,
              userId: context.user.id,
              workspaceId: context.organization.id,
              slug: generateSlug(context.user.name),
            },
          })
        },
      },
    ],
  },
})
```

### Client-side Usage

```typescript
// apps/cms/src/lib/auth/client.ts
import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    organizationClient(),
    emailOTPClient(),
    polarClient(),
  ],
})

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  emailOtp,
  checkout,
} = authClient

// Usage in components
"use client"
import { useSession } from "@/lib/auth/client"

export function UserMenu() {
  const { data: session } = useSession()

  if (!session) return <LoginButton />

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <p>Workspace: {session.user.activeOrganization?.name}</p>
    </div>
  )
}
```

### Server-side Usage

```typescript
// apps/cms/src/lib/auth/session.ts
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getServerSession() {
  return await auth.api.getSession({
    headers: await headers(),
  })
}

// Usage in server actions
"use server"
import { getServerSession } from "@/lib/auth/session"

export async function createPost(data: PostInput) {
  const session = await getServerSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const workspaceId = session.user.activeOrganizationId
  if (!workspaceId) {
    throw new Error("No active workspace")
  }

  return await db.post.create({
    data: {
      ...data,
      workspaceId,
      primaryAuthorId: data.authorId,
    },
  })
}
```

### Middleware Protection

```typescript
// apps/cms/src/middleware.ts
import { betterFetch } from "@better-fetch/fetch"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  })

  // Protect /[workspace] routes
  if (request.nextUrl.pathname.startsWith("/workspace-")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (!session.user.emailVerified) {
      return NextResponse.redirect(new URL("/verify-email", request.url))
    }
  }

  return NextResponse.next()
}
```

---

## Common Tasks & File Paths

### Adding a New Resource (e.g., "Series")

**1. Database Schema** (`packages/db/prisma/schema.prisma`)
```prisma
model Series {
  id          String       @id @default(uuid())
  name        String       @db.VarChar(100)
  slug        String       @db.VarChar(100)
  description String?      @db.Text

  workspaceId String

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  workspace   Organization @relation(...)
  posts       Post[]

  @@unique([workspaceId, slug])
  @@index([workspaceId, createdAt])
}

// Update Post model
model Post {
  // ... existing fields
  seriesId    String?
  series      Series?      @relation(...)
}
```

**2. Generate Prisma Client**
```bash
pnpm db:push  # Sync to DB
pnpm db:generate  # Regenerate client
```

**3. Validation Schema** (`apps/cms/src/lib/validations/series.ts`)
```typescript
import { z } from "zod"

export const seriesSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
})

export type SeriesInput = z.infer<typeof seriesSchema>
```

**4. Database Queries** (`apps/cms/src/lib/queries/series.ts`)
```typescript
import { db } from "@astracms/db"

export async function getSeries(workspaceId: string) {
  return await db.series.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSeriesBySlug(workspaceId: string, slug: string) {
  return await db.series.findUnique({
    where: { workspaceId_slug: { workspaceId, slug } },
  })
}
```

**5. Server Actions** (`apps/cms/src/lib/actions/series.ts`)
```typescript
"use server"
import { db } from "@astracms/db"
import { getServerSession } from "@/lib/auth/session"
import { seriesSchema, type SeriesInput } from "@/lib/validations/series"
import { generateSlug } from "@/utils/string"

export async function createSeries(data: SeriesInput) {
  const session = await getServerSession()
  if (!session) throw new Error("Unauthorized")

  const workspaceId = session.user.activeOrganizationId!

  return await db.series.create({
    data: {
      ...data,
      slug: generateSlug(data.name),
      workspaceId,
    },
  })
}

export async function updateSeries(id: string, data: Partial<SeriesInput>) {
  const session = await getServerSession()
  if (!session) throw new Error("Unauthorized")

  return await db.series.update({
    where: { id },
    data,
  })
}

export async function deleteSeries(id: string) {
  const session = await getServerSession()
  if (!session) throw new Error("Unauthorized")

  return await db.series.delete({ where: { id } })
}
```

**6. API Route** (`apps/cms/src/app/api/series/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/session"
import { getSeries } from "@/lib/queries/series"
import { createSeries } from "@/lib/actions/series"
import { seriesSchema } from "@/lib/validations/series"

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaceId = session.user.activeOrganizationId!
  const series = await getSeries(workspaceId)

  return NextResponse.json(series)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json()
  const result = seriesSchema.safeParse(json)

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.errors },
      { status: 400 }
    )
  }

  const series = await createSeries(result.data)
  return NextResponse.json(series, { status: 201 })
}
```

**7. UI Component** (`apps/cms/src/components/series/series-form.tsx`)
```typescript
"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@astracms/ui/components/button"
import { Input } from "@astracms/ui/components/input"
import { Textarea } from "@astracms/ui/components/textarea"
import { toast } from "@astracms/ui/components/sonner"
import { seriesSchema, type SeriesInput } from "@/lib/validations/series"
import { createSeries } from "@/lib/actions/series"

export function SeriesForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm<SeriesInput>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const onSubmit = async (data: SeriesInput) => {
    setLoading(true)

    try {
      await createSeries(data)
      toast.success("Series created!")
      form.reset()
    } catch (error) {
      toast.error("Failed to create series")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        {...form.register("name")}
        placeholder="Series name"
      />

      <Textarea
        {...form.register("description")}
        placeholder="Description (optional)"
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Series"}
      </Button>
    </form>
  )
}
```

**8. Page** (`apps/cms/src/app/(main)/[workspace]/(dashboard)/series/page.tsx`)
```typescript
import { getSeries } from "@/lib/queries/series"
import { getServerSession } from "@/lib/auth/session"
import { SeriesForm } from "@/components/series/series-form"
import { SeriesList } from "@/components/series/series-list"

export default async function SeriesPage() {
  const session = await getServerSession()
  const workspaceId = session!.user.activeOrganizationId!

  const series = await getSeries(workspaceId)

  return (
    <div>
      <h1>Series</h1>
      <SeriesForm />
      <SeriesList series={series} />
    </div>
  )
}
```

**9. Public API** (`apps/api/src/routes/series.ts`)
```typescript
import { Hono } from "hono"
import { db } from "@astracms/db"

const app = new Hono()

app.get("/v1/:workspaceId/series", async (c) => {
  const workspaceId = c.req.param("workspaceId")

  const series = await db.series.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  })

  return c.json(series)
})

export default app
```

**10. Register Route** (`apps/api/src/index.ts`)
```typescript
import series from "./routes/series"

app.route("/", series)
```

### Common File Paths Reference

**CMS (apps/cms)**
```
Server Actions:        src/lib/actions/{resource}.ts
Database Queries:      src/lib/queries/{resource}.ts
Validation Schemas:    src/lib/validations/{resource}.ts
API Routes:            src/app/api/{resource}/route.ts
Pages:                 src/app/(main)/[workspace]/(dashboard)/{resource}/page.tsx
Components:            src/components/{resource}/{component-name}.tsx
Hooks:                 src/hooks/use-{hook-name}.ts
Utils:                 src/utils/{util-name}.ts
Types:                 src/types/{type-name}.ts
```

**API (apps/api)**
```
Routes:                src/routes/{resource}.ts
Middleware:            src/middleware/{middleware-name}.ts
Validations:           src/validations/{resource}.ts
Types:                 src/types/{type-name}.ts
```

**Database (packages/db)**
```
Schema:                prisma/schema.prisma
Client:                src/client.ts
Migrations:            prisma/migrations/
```

**UI (packages/ui)**
```
Components:            src/components/{component-name}.tsx
Hooks:                 src/hooks/{hook-name}.ts
Utils:                 src/lib/{util-name}.ts
```

---

## Best Practices for AI Assistants

### Before Making Changes

1. **Understand Workspace Context**
   - All resources are workspace-scoped
   - Always include `workspaceId` in queries
   - Use `session.user.activeOrganizationId` to get current workspace

2. **Check Existing Patterns**
   - Look at similar features (e.g., if adding "Series", check how "Categories" are implemented)
   - Follow the same file structure and naming conventions
   - Use existing utilities (`generateSlug`, `sanitizeHtml`, etc.)

3. **Validate Input**
   - Create Zod schemas for all user input
   - Validate at API boundaries (server actions, API routes)
   - Use `z.infer` for TypeScript types

4. **Optimize Database Queries**
   - Use `select` to fetch only needed fields
   - Add `where` clauses for workspace scoping
   - Consider adding indexes for frequently queried fields
   - Avoid N+1 queries (use `include` or separate queries)

### When Writing Code

1. **Server vs Client Components**
   - Use server components by default (no `"use client"`)
   - Only add `"use client"` when using hooks, event handlers, or browser APIs
   - Server actions must have `"use server"` directive

2. **Error Handling**
   ```typescript
   // Server actions
   try {
     await action()
   } catch (error) {
     if (error instanceof APIError) {
       throw error  // Rethrow Better Auth errors
     }
     throw new Error("Failed to perform action")
   }

   // Client components
   try {
     await action()
     toast.success("Success!")
   } catch (error) {
     toast.error(error instanceof Error ? error.message : "An error occurred")
   }
   ```

3. **Type Safety**
   - Use Zod schemas with `z.infer` for runtime types
   - Avoid `any` types
   - Use Prisma-generated types (`Prisma.PostSelect`, etc.)

4. **Performance**
   - Use React Query for client-side caching
   - Add loading states for async operations
   - Consider pagination for large lists
   - Optimize images with Next.js `<Image>`

5. **Security**
   - Always check authentication in server actions
   - Validate workspace ownership before mutations
   - Sanitize HTML content before rendering
   - Use parameterized queries (Prisma handles this)

### Testing Changes

1. **Local Testing**
   ```bash
   # Start dev server
   pnpm dev

   # Run linter
   pnpm lint

   # Build to check for errors
   pnpm build
   ```

2. **Database Changes**
   ```bash
   # Push schema changes
   pnpm db:push

   # Create migration (for production)
   pnpm db:migrate

   # Open Prisma Studio to verify data
   pnpm db:studio
   ```

3. **Check for Breaking Changes**
   - Does the change affect existing API endpoints?
   - Does it require database migration?
   - Does it affect workspace isolation?
   - Does it break existing components?

### Code Review Checklist

- [ ] Follows file naming conventions
- [ ] Uses existing utilities and patterns
- [ ] Includes TypeScript types (no `any`)
- [ ] Validates user input with Zod
- [ ] Checks authentication and authorization
- [ ] Scoped to workspace where applicable
- [ ] Optimized database queries
- [ ] Error handling in place
- [ ] Loading states for async operations
- [ ] No console.logs (use proper logging)
- [ ] Follows commit message convention
- [ ] Passes linting (`pnpm lint`)
- [ ] Builds successfully (`pnpm build`)

### Common Pitfalls to Avoid

1. **Forgetting Workspace Scoping**
   ```typescript
   // ❌ Bad
   const posts = await db.post.findMany()

   // ✅ Good
   const posts = await db.post.findMany({
     where: { workspaceId },
   })
   ```

2. **Not Checking Authentication**
   ```typescript
   // ❌ Bad
   export async function deletePost(id: string) {
     return await db.post.delete({ where: { id } })
   }

   // ✅ Good
   export async function deletePost(id: string) {
     const session = await getServerSession()
     if (!session) throw new Error("Unauthorized")

     // Also check workspace ownership
     const post = await db.post.findUnique({ where: { id } })
     if (post?.workspaceId !== session.user.activeOrganizationId) {
       throw new Error("Unauthorized")
     }

     return await db.post.delete({ where: { id } })
   }
   ```

3. **Hardcoding Values**
   ```typescript
   // ❌ Bad
   const API_URL = "http://localhost:8000"

   // ✅ Good
   const API_URL = process.env.ASTRACMS_API_URL!
   ```

4. **Not Handling Loading States**
   ```typescript
   // ❌ Bad
   <Button onClick={handleSubmit}>Submit</Button>

   // ✅ Good
   <Button onClick={handleSubmit} disabled={loading}>
     {loading ? "Submitting..." : "Submit"}
   </Button>
   ```

5. **Improper Import Paths**
   ```typescript
   // ❌ Bad
   import { Button } from "../../../ui/components/button"

   // ✅ Good (use package import)
   import { Button } from "@astracms/ui/components/button"

   // ✅ Good (use alias)
   import { Button } from "@/components/ui/button"
   ```

### Quick Reference: Import Patterns

**CMS (apps/cms)**
```typescript
// Database
import { db } from "@astracms/db"

// UI Components
import { Button } from "@astracms/ui/components/button"
import { toast } from "@astracms/ui/components/sonner"

// Auth
import { getServerSession } from "@/lib/auth/session"
import { authClient, useSession } from "@/lib/auth/client"

// Actions & Queries
import { createPost } from "@/lib/actions/posts"
import { getPosts } from "@/lib/queries/posts"

// Validation
import { z } from "zod"
import { postSchema } from "@/lib/validations/post"

// Utils
import { generateSlug } from "@/utils/string"
import { cn } from "@astracms/ui/lib/utils"

// Types
import type { PostWithAuthors } from "@/types/post"
```

**API (apps/api)**
```typescript
// Framework
import { Hono } from "hono"

// Database
import { db } from "@astracms/db"

// Validation
import { z } from "zod"
import { postQuerySchema } from "@/validations/posts"

// Middleware
import { rateLimit } from "@/middleware/ratelimit"
```

---

## Additional Resources

### Documentation Links
- [Contributing Guide](./.github/CONTRIBUTING.md)
- [Prisma Schema](./packages/db/prisma/schema.prisma)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Hono Docs](https://hono.dev/)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Turbo Docs](https://turbo.build/repo/docs)

### Community
- [Discord](https://discord.gg/gU44Pmwqkx)
- [Twitter](https://twitter.com/astracms)
- [GitHub Issues](https://github.com/astracms/astracms/issues)

### Key Dependencies Documentation
- [Tiptap Editor](https://tiptap.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev/)

---

## Changelog

**2025-11-13**: Initial creation
- Comprehensive codebase analysis
- Database schema documentation
- API architecture details
- Authentication system guide
- Development workflows
- Best practices for AI assistants

---

**Note for AI Assistants**: This document should be updated whenever there are significant changes to:
- Repository structure
- Tech stack dependencies
- Database schema
- API endpoints
- Authentication system
- Development workflows
- Key conventions

Always refer to this document before making changes to ensure consistency with existing patterns.

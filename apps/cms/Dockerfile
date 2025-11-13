# Stage 1: Dependencies
FROM --platform=linux/amd64 node:20-alpine AS deps

WORKDIR /app

# Copy pnpm-lock.yaml and package.json files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json apps/cms/
COPY packages/db/package.json packages/db/
COPY packages/parser/package.json packages/parser/
COPY packages/tsconfig/package.json packages/tsconfig/
COPY packages/ui/package.json packages/ui/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --filter=cms

# Stage 2: Builder
FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# Install pnpm in the builder stage
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/apps/cms/package.json apps/cms/package.json
COPY --from=deps /app/packages/db packages/db
COPY --from=deps /app/packages/parser packages/parser
COPY --from=deps /app/packages/tsconfig packages/tsconfig
COPY --from=deps /app/packages/ui packages/ui

# Copy source code
COPY apps/cms apps/cms

# Build the Next.js application
RUN pnpm build --filter=cms

# Stage 3: Runner
FROM --platform=linux/amd64 node:20-alpine AS runner

WORKDIR /app

# Set environment variables for Next.js standalone output
ENV NODE_ENV production

# Copy only the necessary files for standalone Next.js app
COPY --from=builder /app/apps/cms/.next/standalone ./
COPY --from=builder /app/apps/cms/.next/static apps/cms/.next/static
COPY --from=builder /app/apps/cms/public apps/cms/public

# Expose the port the app runs on
EXPOSE 3000

# Set the command to start the application
CMD ["node", "server.js"]

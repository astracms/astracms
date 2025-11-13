# Stage 1: Builder
FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# Copy pnpm-lock.yaml and package.json files
# to leverage Docker cache for dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
COPY packages/parser/package.json packages/parser/
COPY packages/tsconfig/package.json packages/tsconfig/
COPY packages/ui/package.json packages/ui/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
# Use --prod to install only production dependencies
RUN pnpm install --prod --filter=api

# Copy source code
COPY apps/api/src apps/api/src
COPY packages/db/src packages/db/src
COPY packages/parser/src packages/parser/src
COPY packages/tsconfig/src packages/tsconfig/src
COPY packages/ui/src packages/ui/src

# Stage 2: Runner
FROM --platform=linux/amd64 node:20-alpine AS runner

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/parser ./packages/parser
COPY --from=builder /app/packages/tsconfig ./packages/tsconfig
COPY --from=builder /app/packages/ui ./packages/ui
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Expose the port the app runs on
EXPOSE 8000

# Set the command to start the application
CMD ["pnpm", "start", "--filter=api"]

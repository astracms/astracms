# Stage 1: Builder

FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# Copy package.json files for monorepo
COPY package.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
COPY packages/parser/package.json packages/parser/
COPY packages/tsconfig/package.json packages/tsconfig/
COPY packages/ui/package.json packages/ui/
COPY turbo.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY apps/api/src apps/api/src
COPY packages/db/src packages/db/src
COPY packages/db/prisma packages/db/prisma
COPY packages/parser/src packages/parser/src
COPY packages/tsconfig packages/tsconfig
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

# Expose the port the app runs on
EXPOSE 8000

# Run database migrations before starting the application
# The DATABASE_URL environment variable must be available at this point.
RUN npm run --workspace=packages/db prisma:migrate:deploy

# Set the command to start the application
CMD ["npm", "start", "--workspace=apps/api"]

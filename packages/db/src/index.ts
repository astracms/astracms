import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "./generated/client";

export type {
  AiWorkflow,
  AiWorkflowEdge,
  AiWorkflowNode,
  AiWorkflowRun,
  AiWorkflowRunStatus,
  AiWorkflowStatus,
  AiWorkflowTrigger,
} from "./generated/client";
// Re-export Prisma namespace and types for consumers
export { Prisma } from "./generated/client";

neonConfig.webSocketConstructor = ws;

const createClient = (url?: string): PrismaClient => {
  const connectionString = url || process.env.DATABASE_URL;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: PrismaClient | undefined;
}

let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  db = createClient();
} else {
  if (!global.prisma) {
    global.prisma = createClient();
  }
  db = global.prisma;
}

export { createClient, db };

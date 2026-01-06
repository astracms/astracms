-- CreateEnum
CREATE TYPE "AiWorkflowStatus" AS ENUM ('draft', 'active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "AiWorkflowTrigger" AS ENUM ('manual', 'scheduled', 'webhook', 'rss_feed');

-- CreateEnum
CREATE TYPE "AiWorkflowRunStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "ai_workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,
    "status" "AiWorkflowStatus" NOT NULL DEFAULT 'draft',
    "triggerType" "AiWorkflowTrigger" NOT NULL,
    "triggerConfig" JSONB,
    "customPrompt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflow_node" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actionType" TEXT,
    "label" TEXT NOT NULL,
    "config" JSONB,
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_workflow_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflow_edge" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_workflow_edge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflow_run" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "AiWorkflowRunStatus" NOT NULL DEFAULT 'pending',
    "triggeredBy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "logs" JSONB,
    "result" JSONB,

    CONSTRAINT "ai_workflow_run_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_workflow_workspaceId_idx" ON "ai_workflow"("workspaceId");

-- CreateIndex
CREATE INDEX "ai_workflow_workspaceId_isActive_idx" ON "ai_workflow"("workspaceId", "isActive");

-- CreateIndex
CREATE INDEX "ai_workflow_isActive_nextRunAt_idx" ON "ai_workflow"("isActive", "nextRunAt");

-- CreateIndex
CREATE INDEX "ai_workflow_node_workflowId_idx" ON "ai_workflow_node"("workflowId");

-- CreateIndex
CREATE INDEX "ai_workflow_edge_workflowId_idx" ON "ai_workflow_edge"("workflowId");

-- CreateIndex
CREATE INDEX "ai_workflow_run_workflowId_idx" ON "ai_workflow_run"("workflowId");

-- CreateIndex
CREATE INDEX "ai_workflow_run_workflowId_status_idx" ON "ai_workflow_run"("workflowId", "status");

-- CreateIndex
CREATE INDEX "ai_workflow_run_startedAt_idx" ON "ai_workflow_run"("startedAt");

-- AddForeignKey
ALTER TABLE "ai_workflow" ADD CONSTRAINT "ai_workflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_node" ADD CONSTRAINT "ai_workflow_node_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_edge" ADD CONSTRAINT "ai_workflow_edge_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_edge" ADD CONSTRAINT "ai_workflow_edge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "ai_workflow_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_edge" ADD CONSTRAINT "ai_workflow_edge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "ai_workflow_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_run" ADD CONSTRAINT "ai_workflow_run_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

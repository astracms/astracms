-- CreateTable
CREATE TABLE "ai_knowledge_base" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "websiteAnalysis" JSONB,
    "industry" TEXT,
    "niche" TEXT,
    "targetAudience" JSONB,
    "writingTone" TEXT,
    "brandVoice" TEXT,
    "contentGuidelines" TEXT,
    "targetKeywords" TEXT[],
    "keywordThemes" JSONB,
    "competitors" JSONB,
    "customFields" JSONB,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_knowledge_base_workspaceId_key" ON "ai_knowledge_base"("workspaceId");

-- AddForeignKey
ALTER TABLE "ai_knowledge_base" ADD CONSTRAINT "ai_knowledge_base_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

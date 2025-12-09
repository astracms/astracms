-- AlterEnum
ALTER TYPE "PlanType" ADD VALUE 'enterprise';

-- AlterEnum
ALTER TYPE "UsageEventType" ADD VALUE 'ai_generation';

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "aiCreditsLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiCreditsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "usage_event" ADD COLUMN     "metadata" JSONB;

/*
  Warnings:

  - You are about to drop the column `polarId` on the `subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creemId]` on the table `subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creemId` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "subscription_polarId_key";

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "polarId",
ADD COLUMN     "creemId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "subscription_creemId_key" ON "subscription"("creemId");

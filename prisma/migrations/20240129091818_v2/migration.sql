/*
  Warnings:

  - You are about to drop the column `profilePicture` on the `BuilderPlace` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[talentLayerPlatformId]` on the table `BuilderPlace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[talentLayerPlatformName]` on the table `BuilderPlace` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BuilderPlace" DROP COLUMN "profilePicture",
ADD COLUMN     "jobPostingConditions" JSONB,
ADD COLUMN     "talentLayerPlatformId" TEXT,
ADD COLUMN     "talentLayerPlatformName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BuilderPlace_talentLayerPlatformId_key" ON "BuilderPlace"("talentLayerPlatformId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderPlace_talentLayerPlatformName_key" ON "BuilderPlace"("talentLayerPlatformName");

/*
  Warnings:
  - Made the column `talentLayerPlatformId` on table `BuilderPlace` required. This step will fail if there are existing NULL values in that column.

*/

-- AlterTable
ALTER TABLE "BuilderPlace" ALTER COLUMN "talentLayerPlatformId" SET NOT NULL;


/*
  Warnings:

  - Made the column `subdomain` on table `BuilderPlace` required. This step will fail if there are existing NULL values in that column.
  - Made the column `talentLayerPlatformName` on table `BuilderPlace` required. This step will fail if there are existing NULL values in that column.
  - Made the column `talentLayerId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `talentLayerHandle` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BuilderPlace" ALTER COLUMN "subdomain" SET NOT NULL,
ALTER COLUMN "talentLayerPlatformName" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "talentLayerId" SET NOT NULL,
ALTER COLUMN "talentLayerHandle" SET NOT NULL;

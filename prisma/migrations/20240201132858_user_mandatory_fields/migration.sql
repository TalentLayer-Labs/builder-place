/*
  Warnings:

  - A unique constraint covering the columns `[talentLayerHandle]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `address` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "talentLayerHandle" TEXT,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_talentLayerHandle_key" ON "User"("talentLayerHandle");

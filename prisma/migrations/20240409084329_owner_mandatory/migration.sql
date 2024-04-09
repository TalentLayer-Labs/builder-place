/*
  Warnings:

  - Made the column `ownerId` on table `BuilderPlace` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "BuilderPlace" DROP CONSTRAINT "BuilderPlace_ownerId_fkey";

-- AlterTable
ALTER TABLE "BuilderPlace" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "BuilderPlace" ADD CONSTRAINT "BuilderPlace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

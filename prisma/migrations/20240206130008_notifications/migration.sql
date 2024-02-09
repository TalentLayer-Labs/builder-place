-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('NEW_PROPOSAL', 'PROPOSAL_VALIDATED', 'FUND_RELEASE', 'REVIEW', 'PLATFORM_MARKETING', 'PROTOCOL_MARKETING', 'NEW_SERVICE');

-- CreateEnum
CREATE TYPE "EmailSender" AS ENUM ('IEXEC', 'SENDGRID');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailPreferences" JSONB NOT NULL DEFAULT '{"activeOnNewService": false, "activeOnNewProposal": true, "activeOnProposalValidated": true, "activeOnFundRelease": true, "activeOnReview": true, "activeOnPlatformMarketing": false, "activeOnProtocolMarketing": true}';

-- CreateTable
CREATE TABLE "CronProbe" (
    "id" SERIAL NOT NULL,
    "type" "EmailType" NOT NULL,
    "lastRanAt" TIMESTAMP(3) NOT NULL,
    "successCount" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL,

    CONSTRAINT "CronProbe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "type" "EmailType" NOT NULL,
    "sender" "EmailSender" NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CronProbe_type_key" ON "CronProbe"("type");

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- AlterTable: Add plan and stripeCustomerId to User
ALTER TABLE "User" ADD COLUMN "plan" "Plan" NOT NULL DEFAULT 'FREE';
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- AlterTable: Add deletedAt to Prompt (soft delete)
ALTER TABLE "Prompt" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex: Unique space name per user
CREATE UNIQUE INDEX "Space_name_userId_key" ON "Space"("name", "userId");

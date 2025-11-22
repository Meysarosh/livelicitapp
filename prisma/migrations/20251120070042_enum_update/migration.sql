/*
  Warnings:

  - The values [SCHEDULED,LIVE,ENDED] on the enum `AuctionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuctionStatus_new" AS ENUM ('DRAFT', 'ACTIVE', 'CANCELLED');
ALTER TABLE "public"."Auction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Auction" ALTER COLUMN "status" TYPE "AuctionStatus_new" USING ("status"::text::"AuctionStatus_new");
ALTER TYPE "AuctionStatus" RENAME TO "AuctionStatus_old";
ALTER TYPE "AuctionStatus_new" RENAME TO "AuctionStatus";
DROP TYPE "public"."AuctionStatus_old";
ALTER TABLE "Auction" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropIndex
DROP INDEX "Auction_ownerId_status_endAt_idx";

-- CreateIndex
CREATE INDEX "Auction_status_startAt_idx" ON "Auction"("status", "startAt");

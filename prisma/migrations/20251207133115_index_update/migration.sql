-- CreateIndex
CREATE INDEX "Auction_status_currentPriceMinor_idx" ON "Auction"("status", "currentPriceMinor");

-- CreateIndex
CREATE INDEX "Auction_ownerId_status_idx" ON "Auction"("ownerId", "status");

-- CreateIndex
CREATE INDEX "Auction_title_idx" ON "Auction"("title");

-- CreateIndex
CREATE INDEX "AuctionImage_auctionId_position_idx" ON "AuctionImage"("auctionId", "position");

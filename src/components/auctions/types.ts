export type AuctionListItemVM = {
  id: string;
  title: string;
  // href: string;
  imageUrl?: string;

  priceLabel?: string; // e.g. "Current bid", "Starting price", "Final price"
  priceText?: string; // e.g. "1 200 HUF"

  metaLabel?: string; // e.g. "Ends", "Ended"
  metaText?: string; // e.g. "2025-12-13 21:00"
};

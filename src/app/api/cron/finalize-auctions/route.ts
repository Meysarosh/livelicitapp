import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { finalizeAuctionAction } from '@/app/actions/auction/finalizeAuction';
import { getAuctionsListToFinalize } from '@/data-access/auction';

const BATCH_LIMIT = 100;

export async function GET() {
  // Find auctions to finalize: ACTIVE and already past endAt
  const auctionsToFinalize = await getAuctionsListToFinalize(BATCH_LIMIT);

  const results = await Promise.allSettled(
    auctionsToFinalize.map((a) => prisma.$transaction((tx) => finalizeAuctionAction(tx, a.id))),
  );

  const processed = results.filter((r) => r.status === 'fulfilled').length;
  const errors = results
    .filter((r) => r.status === 'rejected')
    .map((r) => (r as PromiseRejectedResult).reason);

  if (errors.length > 0) {
    // TODO: proper logging
    console.error('Errors occurred while finalizing auctions:', errors);
  }

  return NextResponse.json({
    ok: true,
    processed,
  });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { finalizeAuction } from '@/data-access/finalizeAuction';

// Optionally limit how many to process per run to avoid timeouts
const BATCH_LIMIT = 100;

export async function GET() {
  const now = new Date();

  // Find auctions to finalize: ACTIVE and already past endAt
  const auctionsToFinalize = await prisma.auction.findMany({
    where: {
      status: 'ACTIVE',
      endAt: { lte: now },
    },
    select: { id: true },
    take: BATCH_LIMIT,
  });

  let processed = 0;

  for (const a of auctionsToFinalize) {
    await prisma.$transaction((tx) => finalizeAuction(tx, a.id));
    processed++;
  }

  return NextResponse.json({
    ok: true,
    processed,
  });
}

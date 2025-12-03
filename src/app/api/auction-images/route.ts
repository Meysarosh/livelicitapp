import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';
import { createImage } from '@/data-access/auctionImage';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const auctionId = formData.get('auctionId');

  if (!(file instanceof File) || typeof auctionId !== 'string') {
    return new NextResponse('Bad Request', { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return new NextResponse('File too large (max 5MB)', { status: 413 });
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const blob = await put(`auctions/${auctionId}/${crypto.randomUUID()}-${safeFileName}`, file, {
    access: 'public',
  });

  const image = await createImage(auctionId, blob.url, blob.pathname ?? '');

  return NextResponse.json({ image });
}

/* eslint-disable no-console */

export const SEED_IMAGE_URLS: string[] = [
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmit4our90000ky042xwv1wl8/d66d8046-d657-4c59-9bbf-3759e2720b3e-img12.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmibbbvoq0000ty2wzjkwfgvw/489c38df-e2bf-44bb-9f09-423f2befb1c6-119647003-0.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmit4our90000ky042xwv1wl8/956b7111-bc0d-4ff0-9a84-33c3053aff60-113446001-0.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmit4our90000ky042xwv1wl8/7326c627-eb72-41d9-8558-99d01c27fd3c-113419001-0.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmibdevc60007ty2wxxb3czxm/edd1c413-0dbd-407f-8b0b-daf9df88c64f-img11.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmit4our90000ky042xwv1wl8/cb4cf30d-dd9a-4ee9-ae13-f113b98338f5-113419001-1.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmit4our90000ky042xwv1wl8/440cc38b-d169-4b21-a515-f0ca3e7fdcb2-113446001-1.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmit4our90000ky042xwv1wl8/48f1eecf-6a0f-4ee7-a03c-52d3d9583360-113446001-3.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmit4our90000ky042xwv1wl8/d66d8046-d657-4c59-9bbf-3759e2720b3e-img12.jpg',
  'https://pcwajf1ohgxgpqgl.public.blob.vercel-storage.com/auctions/cmibdevc60007ty2wxxb3czxm/edd1c413-0dbd-407f-8b0b-daf9df88c64f-img11.jpg',
];

import { PrismaClient, Role, AuctionStatus, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123!';

async function createUserWithCredential(opts: {
  email: string;
  nickname: string;
  fullName: string;
  role: Role;
}) {
  const { email, nickname, fullName, role } = opts;

  const passHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      nickname,
      fullName,
      role,
      status: UserStatus.OK,
      currency: 'HUF',
    },
  });

  await prisma.password.upsert({
    where: { userId: user.id },
    update: { passHash },
    create: {
      userId: user.id,
      passHash,
    },
  });

  return user;
}

async function main() {
  console.log('Seeding demo data...');

  // 1. Users
  const admin = await createUserWithCredential({
    email: 'admin@example.com',
    nickname: 'admin',
    fullName: 'Admin User',
    role: Role.ADMIN,
  });

  const user1 = await createUserWithCredential({
    email: 'user1@example.com',
    nickname: 'user1',
    fullName: 'User One',
    role: Role.USER,
  });

  const user2 = await createUserWithCredential({
    email: 'user2@example.com',
    nickname: 'user2',
    fullName: 'User Two',
    role: Role.USER,
  });

  console.log('Users created:', { admin: admin.email, user1: user1.email, user2: user2.email });
  console.log('Demo password for all accounts:', DEMO_PASSWORD);

  // 2. (Optional) simple shipping address for each non-admin user
  const buyers = [user1, user2];
  for (const [index, u] of buyers.entries()) {
    await prisma.shippingAddress.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        street: `Teszt utca ${index + 1}.`,
        city: 'Budapest',
        postalCode: '1111',
        country: 'HU',
      },
    });
  }

  // 3. Auctions (10 total, 5 per non-admin user)
  const now = new Date();

  const imageUrls =
    SEED_IMAGE_URLS.length >= 10
      ? SEED_IMAGE_URLS.slice(0, 10)
      : [
          ...SEED_IMAGE_URLS,
          ...Array(10 - SEED_IMAGE_URLS.length).fill('https://placehold.co/600x400'),
        ];

  const auctionOwners = [user1, user2];

  const auctionPromises = imageUrls.map((url, index) => {
    const owner = auctionOwners[index % auctionOwners.length];

    const startPriceMinor = 10_000 + index * 1_000;
    const startAt = new Date(now.getTime() - 60 * 60 * 1000);
    const endAt = new Date(now.getTime() + (index + 1) * 60 * 60 * 1000);

    return prisma.auction.create({
      data: {
        ownerId: owner!.id,
        title: `Demo Auction #${index + 1}`,
        description: `This is a demo auction #${index + 1} created by the seed script for thesis review.`,
        status: AuctionStatus.ACTIVE,
        startAt,
        endAt,
        startPriceMinor,
        minIncrementMinor: 500,
        currentPriceMinor: startPriceMinor,
        currency: 'HUF',
        images: {
          create: [
            {
              url,
              position: 0,
              pathname: null,
            },
          ],
        },
      },
    });
  });

  const auctions = await Promise.all(auctionPromises);

  console.log(`Created ${auctions.length} auctions`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

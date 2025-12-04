import { prisma } from '@/lib/db';

// UPSERT SHIPPING ADDRESS

export async function upsertShippingAddress(
  userId: string,
  street: string,
  city: string,
  state: string | null,
  postalCode: string,
  country: string
) {
  await prisma.shippingAddress.upsert({
    where: { userId },
    update: {
      street,
      city,
      state,
      postalCode,
      country,
    },
    create: {
      userId,
      street,
      city,
      state,
      postalCode,
      country,
    },
  });
}

// GET SHIPPING ADDRESS
export async function getShippingAddress(userId: string) {
  return await prisma.shippingAddress.findUnique({
    where: { userId },
    select: {
      street: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
    },
  });
}

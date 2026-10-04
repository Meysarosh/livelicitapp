import 'server-only';
import { prisma } from '@/lib/db';
import { type ShippingAdress } from '@/types/shippingAddress';

// UPSERT SHIPPING ADDRESS

export async function upsertShippingAddress(
  userId: string,
  street: string,
  city: string,
  state: string | null,
  postalCode: string,
  country: string,
): Promise<void> {
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
export async function getShippingAddress(userId: string): Promise<ShippingAdress | null> {
  return await prisma.shippingAddress.findUnique({
    where: { userId },
  });
}

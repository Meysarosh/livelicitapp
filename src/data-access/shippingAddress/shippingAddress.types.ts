import { Prisma } from '@prisma/client';

export type ShippingAdress = Prisma.ShippingAddressGetPayload<Prisma.ShippingAddressDefaultArgs>;

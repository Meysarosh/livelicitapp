'use client';

import AuctionForm from './AuctionForm';
import { createAuction } from '@/app/actions/auction/createAuction';

export default function CreateAuctionForm() {
  return <AuctionForm mode='create' action={createAuction} />;
}

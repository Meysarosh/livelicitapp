import AuctionForm from '@/components/auctions/AuctionForm';
import { editAuction } from '@/app/actions/auction/editAuction';
import { notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getAuctionDetailsForOwner } from '@/data-access/auctions';
import { ErrorText } from '@/components/ui';

type PageProps = {
  id: string;
};

export default async function AuctionEditPage({ params }: { params: Promise<PageProps> }) {
  const { id } = await params;
  const user = await getAuthUser();

  const auction = await getAuctionDetailsForOwner(id);

  if (!auction || auction.ownerId !== user.id) {
    notFound();
  }

  if (auction.currentPriceMinor > auction.startPriceMinor) {
    return <ErrorText>You cannot edit an auction that has already received bids.</ErrorText>;
  }

  const initialValues = {
    title: auction.title,
    description: auction.description,
    startingPrice: (auction.startPriceMinor / 100).toString(),
    minIncrement: (auction.minIncrementMinor / 100).toString(),
    durationDays: '7' as const,
    currency: auction.currency,
    startMode: 'now' as const,
    startAt: auction.startAt.toISOString(),
  };

  const existingImages =
    auction.images?.map((img) => ({
      id: img.id,
      url: img.url,
    })) ?? [];

  const updateAction = editAuction.bind(null, auction.id);

  return (
    <AuctionForm
      mode='edit'
      action={updateAction}
      initialValues={initialValues}
      existingImages={existingImages}
      submitLabel='Save changes'
    />
  );
}

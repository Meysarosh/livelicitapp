'use client';

import { useActionState } from 'react';
import { placeBid } from '@/app/actions/placeBid';
import type { PlaceBidFormState } from '@/services/zodValidation-service';
import { Form, FormField } from '@/components/forms/form.styles';
import { Button, Input, Note } from '@/components/ui';
import { getEffectiveAuctionStatus } from '@/services/auctionStatus-service';
import { AuctionWithOwnerAndImages } from '@/data-access/auctions';

interface BidActionsProps {
  auction: AuctionWithOwnerAndImages;
  currentUserId?: string;
}

export function BidActions({ auction, currentUserId }: BidActionsProps) {
  const [state, action, pending] = useActionState<PlaceBidFormState, FormData>(placeBid, undefined);

  const { id: auctionId, currency, currentPriceMinor, minIncrementMinor, owner } = auction;

  const effectiveStatus = getEffectiveAuctionStatus(auction);
  const isOwner = currentUserId === owner.id;

  // Decide if current user can bid
  let canBid = false;
  let reasonIfCannotBid: string | undefined;

  if (!currentUserId) {
    canBid = false;
    reasonIfCannotBid = 'Please log in to place a bid.';
  } else if (isOwner) {
    canBid = false;
    reasonIfCannotBid = 'You cannot bid on your own auction.';
  } else if (effectiveStatus !== 'LIVE') {
    canBid = false;
    reasonIfCannotBid = `Bidding is not available. Auction is ${effectiveStatus.toLowerCase()}.`;
  } else {
    canBid = true;
  }

  if (!canBid) {
    return <Note role='status'>{reasonIfCannotBid || 'Bidding is not available for this auction.'}</Note>;
  }

  const minNextPrice = (currentPriceMinor + minIncrementMinor) / 100;

  const amountInputId = 'bid-amount';

  return (
    <>
      {state?.message && (
        <Note role='alert' aria-live='polite'>
          {state.message}
        </Note>
      )}

      <Form action={action}>
        <Input type='hidden' name='auctionId' value={auctionId} />

        <FormField>
          <Input
            label={`Your bid (${currency})`}
            id={amountInputId}
            name='amount'
            type='number'
            min={minNextPrice}
            step={minIncrementMinor / 100}
            required
            defaultValue={state?.values?.amount ?? minNextPrice}
            error={state?.errors?.amount?.[0]}
          />
        </FormField>

        <Button type='submit' disabled={pending}>
          {pending ? 'Placing bid…' : 'Place bid'}
        </Button>
      </Form>
    </>
  );
}

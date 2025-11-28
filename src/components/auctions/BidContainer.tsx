'use client';

import { useActionState } from 'react';
import { placeBid } from '@/app/actions/placeBid';
import type { PlaceBidFormState } from '@/services/zodValidation-service';
import { Form } from '@/components/forms/form.styles';
import { Button, Input, Note } from '@/components/ui';
import { getEffectiveAuctionStatus } from '@/services/auctionStatus-service';
import { AuctionWithOwnerAndImages } from '@/data-access/auctions';
import { FormFieldWrapper } from '../forms/FormFiieldWrapper';
import { useAuctionRealtime } from './AuctionRealtimeProvider';

interface BidActionsProps {
  auction: AuctionWithOwnerAndImages;
  userId?: string;
}

export function BidContainer({ auction, userId }: BidActionsProps) {
  const { currentPriceMinor, highestBidderId } = useAuctionRealtime();
  const [state, action, pending] = useActionState<PlaceBidFormState, FormData>(placeBid, undefined);

  const { id: auctionId, currency, minIncrementMinor, owner } = auction;

  const effectiveStatus = getEffectiveAuctionStatus(auction);
  const isOwner = owner.id === userId;

  // Decide if current user can bid
  let canBid = false;
  let reasonIfCannotBid: string | undefined;

  if (!userId) {
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

  return (
    <>
      {state?.message && (
        <Note role='alert' aria-live='polite'>
          {state.message}
        </Note>
      )}

      <Form action={action}>
        <Input type='hidden' name='auctionId' value={auctionId} />

        <FormFieldWrapper label={`Your bid (${currency})`} required error={state?.errors?.amount?.[0]}>
          <Input
            name='amount'
            type='number'
            min={minNextPrice}
            step={minIncrementMinor / 100}
            defaultValue={state?.values?.amount ?? minNextPrice}
          />
        </FormFieldWrapper>

        {highestBidderId === userId && (
          <Note role='status' aria-live='polite'>
            You are currently the highest bidder.
          </Note>
        )}

        <Button type='submit' disabled={pending}>
          {pending ? 'Placing bid…' : 'Place bid'}
        </Button>
      </Form>
    </>
  );
}

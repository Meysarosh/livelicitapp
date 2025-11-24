'use client';

import { useActionState } from 'react';
import { placeBid } from '@/app/actions/placeBid';
import type { PlaceBidFormState } from '@/lib/formValidation/validation';
import { Form, FormField, Label, Input, Btn, ErrorText, Note } from '@/components/forms/form.styles';
import { getEffectiveAuctionStatus } from '@/lib/auctionStatus';
import { AuctionWithOwnerAndImages } from '@/lib/data/auctions';

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

  const amountIds = {
    inputId: 'bid-amount',
    labelId: 'bid-amount-label',
    errorId: 'bid-amount-error',
  } as const;

  return (
    <>
      {state?.message && (
        <Note role='alert' aria-live='polite'>
          {state.message}
        </Note>
      )}

      <Form action={action}>
        <input type='hidden' name='auctionId' value={auctionId} />

        <FormField>
          <Label id={amountIds.labelId} htmlFor={amountIds.inputId}>
            Your bid ({currency})
          </Label>
          <Input
            id={amountIds.inputId}
            name='amount'
            type='number'
            min={minNextPrice}
            step={minIncrementMinor / 100}
            required
            defaultValue={state?.values?.amount ?? minNextPrice}
            aria-labelledby={amountIds.labelId}
            aria-invalid={!!state?.errors?.amount}
          />
          {state?.errors?.amount && <ErrorText id={amountIds.errorId}>{state.errors.amount[0]}</ErrorText>}
        </FormField>

        <Btn type='submit' disabled={pending}>
          {pending ? 'Placing bid…' : 'Place bid'}
        </Btn>
      </Form>
    </>
  );
}

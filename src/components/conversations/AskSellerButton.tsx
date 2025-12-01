// src/components/conversations/AskSellerButton.tsx
'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useActionState } from 'react';
import { startConversation } from '@/app/actions/startConversation';
import { Button, TextArea, Muted } from '@/components/ui';
import { Form } from '../forms/form.styles';
import { FormFieldWrapper } from '../forms/FormFieldWrapper';

type StartConversationFormState =
  | {
      message?: string;
      errors?: { body?: string[] };
      values?: { body?: string };
    }
  | undefined;

type Props = {
  auctionId: string;
  disabled?: boolean;
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const Dialog = styled.div`
  background: ${({ theme }) => theme.colors.bgElevated};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing(3)};
  max-width: 480px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: grid;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const DialogTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.h2Size};
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export function AskSellerButton({ auctionId, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<StartConversationFormState, FormData>(startConversation, undefined);

  const handleSubbmit = () => {
    //TODO close only on success after short delay with success message shown
    setOpen(false);
  };
  return (
    <>
      <Button type='button' disabled={disabled} onClick={() => setOpen(true)}>
        Ask seller a question
      </Button>

      {open && (
        <Overlay>
          <Dialog>
            <DialogTitle>Ask the seller</DialogTitle>
            <Form action={action} onSubmit={handleSubbmit}>
              <input type='hidden' name='auctionId' value={auctionId} />

              <FormFieldWrapper required error={state?.errors?.body}>
                <TextArea name='body' placeholder='Write your question…' defaultValue={state?.values?.body ?? ''} />
              </FormFieldWrapper>
              {state?.message && <Muted>{state.message}</Muted>}

              <ActionsRow>
                <Button type='button' onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type='submit' disabled={pending}>
                  {pending ? 'Sending…' : 'Send'}
                </Button>
              </ActionsRow>
            </Form>
          </Dialog>
        </Overlay>
      )}
    </>
  );
}

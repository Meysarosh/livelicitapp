'use client';

import type { Conversation, Message, User, Auction } from '@prisma/client';
import { useActionState, useRef, useEffect } from 'react';
import { sendMessage } from '@/app/actions/sendMessage';
import { Button, TextArea, Paragraph, Muted } from '@/components/ui';
import { formatDateTime } from '@/services/format-service';
import { Form } from '../forms/form.styles';
import { FormFieldWrapper } from '../forms/FormFieldWrapper';
import { MessagesBox, MessageRow, Bubble, MetaLine } from './ConversationsView.styles';

type ConversationWithRelations = Conversation & {
  auction: Auction;
  userA: User;
  userB: User;
  messages: (Message & { sender: User | null })[];
};

type Props = {
  conversation: ConversationWithRelations;
  currentUserId: string;
};

type SendMessageFormState =
  | {
      message?: string;
      errors?: { body?: string[] };
      values?: { body?: string };
    }
  | undefined;

export function ConversationView({ conversation, currentUserId }: Props) {
  const [state, action, pending] = useActionState<SendMessageFormState, FormData>(sendMessage, undefined);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [conversation.messages.length, state]);

  return (
    <>
      <MessagesBox ref={boxRef}>
        {conversation.messages.length === 0 && <Muted>No messages yet.</Muted>}

        {conversation.messages.map((m) => {
          const own = m.senderId === currentUserId;
          const senderLabel = own ? 'You' : m.sender?.nickname ?? 'System';
          return (
            <MessageRow key={m.id} $own={own}>
              <Bubble $own={own}>
                <Paragraph as='div'>{m.body}</Paragraph>
              </Bubble>
              <MetaLine>
                {senderLabel} • {formatDateTime(m.createdAt)}
              </MetaLine>
            </MessageRow>
          );
        })}
      </MessagesBox>

      <Form action={action}>
        <input type='hidden' name='conversationId' value={conversation.id} />
        <FormFieldWrapper required error={state?.errors?.body}>
          <TextArea name='body' placeholder='Write a message…' defaultValue={state?.values?.body ?? ''} />
        </FormFieldWrapper>

        <Button type='submit' disabled={pending}>
          {pending ? 'Sending…' : 'Send'}
        </Button>
        {state?.message && <Muted>{state.message}</Muted>}
      </Form>
    </>
  );
}

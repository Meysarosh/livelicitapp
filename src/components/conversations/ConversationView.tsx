'use client';

import type { Conversation, Message, User, Auction, MessageKind } from '@prisma/client';
import { useActionState, useRef, useEffect, useState, useMemo } from 'react';
import { sendMessage } from '@/app/actions/conversation/sendMessage';
import { Button, TextArea, Paragraph, Muted } from '@/components/ui';
import { formatDateTime } from '@/services/format-service';
import { Form } from '../forms/form.styles';
import { FormFieldWrapper } from '../forms/FormFieldWrapper';
import { MessagesBox, MessageRow, Bubble, MetaLine } from './ConversationView.styles';
import { getPusherClient } from '@/lib/realtime/pusher-client';
import { markConversationRead } from '@/app/actions/conversation/markConversationRead';

type ConversationWithRelations = Conversation & {
  auction: Auction;
  userA: User;
  userB: User;
  messages: Message[];
};

type Props = {
  conversation: ConversationWithRelations;
  currentUserId: string;
  counterpart: User;
};

type SendMessageFormState =
  | {
      message?: string;
      errors?: { body?: string[] };
      values?: { body?: string };
    }
  | undefined;

export function ConversationView({ conversation, currentUserId, counterpart }: Props) {
  const [state, action, pending] = useActionState<SendMessageFormState, FormData>(sendMessage, undefined);
  const [messages, setMessages] = useState(conversation.messages);

  const isUserA = conversation.userAId === currentUserId;
  const initialUnreadForOther = isUserA ? conversation.unreadCountB : conversation.unreadCountA;

  const [unreadForOther, setUnreadForOther] = useState<number>(initialUnreadForOther);

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    // Mark as read when new messages arrive from the other user and conversation is opened
    if (!messages.length) return;

    const last = messages[messages.length - 1];

    if (!last.senderId || last.senderId === currentUserId) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

    void markConversationRead(conversation.id);
  }, [messages.length, messages, currentUserId, conversation.id]);

  useEffect(() => {
    // Subscribe to real-time updates for this conversation
    const pusher = getPusherClient();
    const channelName = `private-conversation-${conversation.id}`;
    const channel = pusher.subscribe(channelName);

    const handleNewMessage = (payload: {
      id: string;
      conversationId: string;
      body: string;
      kind: string;
      senderId: string | null;
      createdAt: string;
    }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;

        const next = [
          ...prev,
          {
            id: payload.id,
            conversationId: payload.conversationId,
            body: payload.body,
            kind: payload.kind as MessageKind,
            senderId: payload.senderId,
            createdAt: new Date(payload.createdAt),
            meta: null,
          },
        ];

        return next;
      });

      if (payload.senderId === currentUserId) {
        setUnreadForOther((prev) => prev + 1);
      }
    };

    const handleRead = (payload: { conversationId: string; readerId: string; readAt: string }) => {
      if (payload.readerId !== currentUserId) {
        setUnreadForOther(0);
      }
    };

    channel.bind('message:new', handleNewMessage);
    channel.bind('conversation:read', handleRead);

    return () => {
      channel.unbind('message:new', handleNewMessage);
      channel.unbind('conversation:read', handleRead);
      pusher.unsubscribe(channelName);
    };
  }, [conversation.id, currentUserId]);

  const seenOutgoingIds = useMemo(() => {
    // collects Ids of messages sent by current user that have been seen by the counterpart
    const outgoing = messages.filter((m) => m.senderId === currentUserId);

    if (unreadForOther <= 0) {
      return new Set(outgoing.map((m) => m.id));
    }

    const boundaryIndex = outgoing.length - unreadForOther;
    if (boundaryIndex <= 0) {
      return new Set<string>();
    }

    const seen = outgoing.slice(0, boundaryIndex).map((m) => m.id);
    return new Set(seen);
  }, [messages, currentUserId, unreadForOther]);

  return (
    <>
      <MessagesBox ref={boxRef}>
        {messages.length === 0 && <Muted>No messages yet.</Muted>}

        {messages.map((m) => {
          const own = m.senderId === currentUserId;
          const senderLabel = m.senderId ? (own ? 'You' : counterpart.nickname ?? counterpart.email) : 'System';

          const isSeenHere = own && seenOutgoingIds.has(m.id);

          return (
            <MessageRow key={m.id} $own={own}>
              <Bubble $own={own}>
                <Paragraph as='div'>{m.body}</Paragraph>
              </Bubble>
              <MetaLine>
                {senderLabel} • {formatDateTime(m.createdAt)}
                {isSeenHere && ' • Seen'}
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

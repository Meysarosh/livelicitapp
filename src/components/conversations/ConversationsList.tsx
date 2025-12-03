'use client';

import { ImageWithSkeleton } from '@/components/ui/ImageWithSkeleton';
import { Muted, Paragraph, MonospaceText } from '@/components/ui';
import {
  List,
  Item,
  ItemLink,
  ThumbWrapper,
  Content,
  TitleRow,
  AuctionTitle,
  LastLine,
  Badge,
} from './ConversationsList.styles';
import type { ConversationWithRelations } from '@/data-access/conversations';
import { formatDateTime } from '@/services/format-service';
import { useEffect } from 'react';
import { getPusherClient } from '@/lib/realtime/pusher-client';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

type Props = {
  conversations: ConversationWithRelations[];
  currentUserId: string;
};

export function ConversationsList({ conversations, currentUserId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const pusher = getPusherClient();
    const channelName = `private-user-${currentUserId}`;
    const channel = pusher.subscribe(channelName);

    const handleUpdate = () => {
      router.refresh();
    };

    channel.bind('conversation:updated', handleUpdate);

    return () => {
      channel.unbind('conversation:updated', handleUpdate);
    };
  }, [currentUserId, router]);

  return (
    <List>
      {conversations.map((c) => {
        const isA = c.userAId === currentUserId;
        const counterpart = isA ? c.userB : c.userA;
        const unreadCount = isA ? c.unreadCountA : c.unreadCountB;

        const lastMsg = c.messages[0];
        const lastSnippet = lastMsg?.body ?? '(no messages yet)';
        const lastSenderLabel = lastMsg
          ? lastMsg.senderId === currentUserId
            ? 'You'
            : lastMsg.sender?.nickname ?? 'System'
          : '';
        const firstImage = c.auction.images?.[0];

        return (
          <Item key={c.id}>
            <ItemLink href={`/account/conversations/${c.id}` as Route}>
              <ThumbWrapper>
                <ImageWithSkeleton src={firstImage?.url ?? null} alt={c.auction.title} contain={false} />
              </ThumbWrapper>

              <Content>
                <TitleRow>
                  <AuctionTitle>{c.auction.title}</AuctionTitle>
                  {unreadCount > 0 && <Badge>{unreadCount} new</Badge>}
                </TitleRow>

                <Paragraph>
                  {lastMsg ? (
                    <>
                      <strong>{lastSenderLabel}:</strong> {lastSnippet}
                    </>
                  ) : (
                    <Muted>(no messages yet)</Muted>
                  )}
                </Paragraph>

                <LastLine>
                  <Muted>With {counterpart.nickname ?? counterpart.email}</Muted>
                  <MonospaceText>{formatDateTime(c.lastMessageAt)}</MonospaceText>
                </LastLine>
              </Content>
            </ItemLink>
          </Item>
        );
      })}
      {/* {isPending && (
        <li>
          <Muted>Updating…</Muted>
        </li>
      )} */}
    </List>
  );
}

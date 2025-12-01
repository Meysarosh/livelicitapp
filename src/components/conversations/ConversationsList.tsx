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
import { ConversationWithRelations } from '@/data-access/conversations';
import { formatDateTime } from '@/services/format-service';

type Props = {
  conversations: ConversationWithRelations[];
  currentUserId: string;
};

export function ConversationsList({ conversations, currentUserId }: Props) {
  return (
    <List>
      {conversations.map((c) => {
        const isA = c.userAId === currentUserId;
        const counterpart = isA ? c.userB : c.userA;
        const unreadCount = isA ? c.unreadCountA : c.unreadCountB;

        const lastMsg = c.messages[0];
        const lastSnippet = lastMsg?.body ?? '(no messages yet)';
        const lastSenderLabel = lastMsg?.senderId === currentUserId ? 'You' : lastMsg?.sender?.nickname ?? 'System';

        const firstImage = c.auction.images[0];

        return (
          <Item key={c.id}>
            <ItemLink href={`/account/conversations/${c.id}`}>
              <ThumbWrapper>
                <ImageWithSkeleton src={firstImage?.url ?? null} alt={c.auction.title} contain={false} />
              </ThumbWrapper>

              <Content>
                <TitleRow>
                  <AuctionTitle>{c.auction.title}</AuctionTitle>
                  {unreadCount > 0 && <Badge>{unreadCount} new</Badge>}
                </TitleRow>

                <Paragraph>
                  <strong>{lastSenderLabel}:</strong> {lastSnippet}
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
    </List>
  );
}

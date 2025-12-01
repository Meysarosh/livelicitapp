import { notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getConversationForUser } from '@/data-access/conversations';
import { Title, Note } from '@/components/ui';
import { PageSection } from '@/components/layout';
import { ConversationView } from '@/components/conversations/ConverstionView';

interface PageProps {
  id: string;
}

export default async function ConversationPage({ params }: { params: Promise<PageProps> }) {
  const user = await getAuthUser();
  const pageParams = await params;
  const conversation = await getConversationForUser(pageParams.id, user.id);

  if (!conversation) {
    notFound();
  }

  const isA = conversation.userAId === user.id;
  const counterpart = isA ? conversation.userB : conversation.userA;

  return (
    <PageSection>
      <Title>Conversation</Title>
      <Note>
        Auction: <a href={`/auctions/${conversation.auctionId}`}>{conversation.auction.title}</a> <br />
        With: <strong>{counterpart.nickname ?? counterpart.email}</strong>
      </Note>

      <ConversationView conversation={conversation} currentUserId={user.id} />
    </PageSection>
  );
}

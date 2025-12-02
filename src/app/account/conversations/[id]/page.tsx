import { notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getConversationForUser } from '@/data-access/conversations';
import { Title, Note } from '@/components/ui';
import { PageSection } from '@/components/layout';
import { ConversationView } from '@/components/conversations/ConversationView';
import { markConversationRead } from '@/app/actions/markConversationRead';
import Link from 'next/link';

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

  await markConversationRead(conversation.id);

  const isA = conversation.userAId === user.id;
  const counterpart = isA ? conversation.userB : conversation.userA;

  return (
    <PageSection>
      <Title>Conversation</Title>
      <Note>
        Auction: <Link href={`/auctions/${conversation.auctionId}`}>{conversation.auction.title}</Link> <br />
        With: {counterpart.nickname ?? counterpart.email}
      </Note>

      <ConversationView conversation={conversation} currentUserId={user.id} counterpart={counterpart} />
    </PageSection>
  );
}

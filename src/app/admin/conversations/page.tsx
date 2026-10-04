import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getUserConversations } from '@/data-access/conversation';
import { Title, Note } from '@/components/ui';
import { PageSection } from '@/components/layout';
import { ConversationsList } from '@/components/conversations/ConversationsList';

export default async function AdminConversationsPage() {
  const user = await getAuthUser();
  const conversations = await getUserConversations(user.id);

  return (
    <PageSection>
      <Title>Conversations</Title>

      {conversations.length === 0 ? (
        <Note>You don’t have any conversations yet.</Note>
      ) : (
        <ConversationsList
          conversations={conversations}
          currentUserId={user.id}
          isAdminView={true}
        />
      )}
    </PageSection>
  );
}

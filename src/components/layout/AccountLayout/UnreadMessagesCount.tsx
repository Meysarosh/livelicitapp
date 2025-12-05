'use client';

import { useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/realtime/pusher-client';
import { getUnreadMessagesCount } from '@/app/actions/conversation/getUnreadMessagesCount';

import styled from 'styled-components';

const UnreadMessagesPill = styled.span`
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  border-radius: 12px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
`;

type Props = {
  userId: string;
};

export default function UnreadMessagesCount({ userId }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    void getUnreadMessagesCount().then((count) => {
      if (typeof count === 'number') {
        setUnreadCount(count);
      }
    });
  }, []);

  useEffect(() => {
    const pusher = getPusherClient();
    const channelName = `private-user-${userId}`;
    const channel = pusher.subscribe(channelName);

    const handleConversationUpdated = () => {
      void getUnreadMessagesCount().then((count) => {
        if (typeof count === 'number') {
          setUnreadCount(count);
        }
      });
    };

    channel.bind('conversation:updated', handleConversationUpdated);

    return () => {
      channel.unbind('conversation:updated', handleConversationUpdated);
      pusher.unsubscribe(channelName);
    };
  }, [userId]);

  return (
    <>
      {unreadCount > 0 && (
        <UnreadMessagesPill aria-label={`${unreadCount} unread messages`}>{unreadCount}</UnreadMessagesPill>
      )}
    </>
  );
}

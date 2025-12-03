'use client';

import { useEffect, useState, useTransition } from 'react';
import { getPusherClient } from '@/lib/realtime/pusher-client';
import { getUnreadMessagesCount } from '@/app/actions/getUnreadMessagesCount';

import styled from 'styled-components';

const UnreadMessagesPill = styled.span`
  background-color: red;
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
  const [, startTransition] = useTransition();

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
      startTransition(() => {
        void getUnreadMessagesCount().then((count) => {
          if (typeof count === 'number') {
            setUnreadCount(count);
          }
        });
      });
    };

    channel.bind('conversation:updated', handleConversationUpdated);

    return () => {
      channel.unbind('conversation:updated', handleConversationUpdated);
      pusher.unsubscribe(channelName);
    };
  }, [userId]);

  return <>{unreadCount > 0 && <UnreadMessagesPill>{unreadCount}</UnreadMessagesPill>}</>;
}

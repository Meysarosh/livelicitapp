'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { getPusherClient } from '@/lib/realtime/pusher-client';

type Props = {
  userId: string;
};

export default function SuspensionWatcher({ userId }: Props) {
  useEffect(() => {
    const pusher = getPusherClient();
    const channelName = `private-user-${userId}`;
    const channel = pusher.subscribe(channelName);

    const handleSuspended = () => {
      alert('Your account has been suspended.');
      void signOut({ callbackUrl: '/login?error=Suspended' });
    };

    channel.bind('user:suspended', handleSuspended);

    return () => {
      channel.unbind('user:suspended', handleSuspended);
      pusher.unsubscribe(channelName);
    };
  }, [userId]);

  return null;
}

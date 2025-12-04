'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { getPusherClient } from '@/lib/realtime/pusher-client';

type Props = {
  userId: string;
};

export default function SuspensionWatcher({ userId }: Props) {
  useEffect(() => {
    let pusher: ReturnType<typeof getPusherClient> | undefined;
    let channel: any;
    const channelName = `private-user-${userId}`;

    const handleSuspended = () => {
      alert('Your account has been suspended.');
      void signOut({ callbackUrl: '/login?error=Suspended' });
    };

    try {
      pusher = getPusherClient();
      channel = pusher.subscribe(channelName);
      channel.bind('user:suspended', handleSuspended);
    } catch (error) {
      console.error('Failed to initialize Pusher or subscribe:', error);
      // Optionally, notify the user or handle gracefully here
    }

    return () => {
      if (channel && pusher) {
        channel.unbind('user:suspended', handleSuspended);
        pusher.unsubscribe(channelName);
      }
    };
  }, [userId]);

  return null;
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPusherServer } from '@/lib/realtime/pusher-server';
import { getConversationById } from '@/data-access/conversations';

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const formData = await req.formData();
  const socketId = formData.get('socket_id');
  const channelName = formData.get('channel_name');

  if (typeof socketId !== 'string' || typeof channelName !== 'string') {
    return new NextResponse('Invalid auth payload', { status: 400 });
  }

  if (channelName.startsWith('private-user-')) {
    const channelUserId = channelName.substring('private-user-'.length);

    if (channelUserId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  } else if (channelName.startsWith('private-conversation-')) {
    const conversationId = channelName.substring('private-conversation-'.length);

    const convo = await getConversationById(conversationId);
    if (!convo) {
      return new NextResponse('Not found', { status: 404 });
    }

    const isParticipant = convo.userAId === user.id || convo.userBId === user.id;
    if (!isParticipant) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const pusherServer = getPusherServer();
  const authResponse = pusherServer.authorizeChannel(socketId, channelName);

  return NextResponse.json(authResponse);
}

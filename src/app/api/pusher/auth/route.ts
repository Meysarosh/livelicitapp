// src/app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPusherServer } from '@/lib/realtime/pusher-server';

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

  const pusherServer = getPusherServer();
  const authResponse = pusherServer.authorizeChannel(socketId, channelName);

  return NextResponse.json(authResponse);
}

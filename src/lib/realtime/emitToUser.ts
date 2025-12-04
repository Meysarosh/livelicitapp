import { getPusherServer } from './pusher-server';

export async function emitToUser(userId: string, event: string, payload: unknown) {
  const pusher = getPusherServer();
  await pusher.trigger(`private-user-${userId}`, event, payload);
}

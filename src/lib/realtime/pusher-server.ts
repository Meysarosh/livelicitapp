import Pusher from 'pusher';

const appId = process.env.PUSHER_APP_ID!;
const key = process.env.PUSHER_KEY!;
const secret = process.env.PUSHER_SECRET!;
const cluster = process.env.PUSHER_CLUSTER!;

if (!appId || !key || !secret || !cluster) {
  console.warn('Pusher server credentials are not fully set. Realtime features will not work.');
}

export const pusherServer =
  globalThis.pusher ??
  new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.pusher = pusherServer;
}

declare global {
  var pusher: Pusher | undefined;
}

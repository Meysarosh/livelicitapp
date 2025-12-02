import Pusher from 'pusher';

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER;

export function getPusherServer() {
  if (!appId || !key || !secret || !cluster) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Pusher server credentials are not fully set. Realtime features will not work.');
    }
    throw new Error('Pusher server credentials are not fully set.');
  }
  if (!globalThis.pusher) {
    globalThis.pusher = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }
  return globalThis.pusher;
}

declare global {
  var pusher: Pusher | undefined;
}

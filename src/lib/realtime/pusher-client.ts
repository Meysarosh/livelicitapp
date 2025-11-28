'use client';

import PusherClient from 'pusher-js';

const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

let _client: PusherClient | null = null;

export function getPusherClient() {
  if (!_client) {
    _client = new PusherClient(key, {
      cluster,
    });
  }
  return _client;
}

// This is an example of wrong implementation that creates a new Pusher client on every import
//
// import Pusher from 'pusher-js';
//
// // Create the client instance once, outside of any component
// export const pusherClient = new Pusher(key, {
//   cluster,
// });

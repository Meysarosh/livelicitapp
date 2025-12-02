'use client';

import PusherClient from 'pusher-js';

const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

let _client: PusherClient | null = null;

export function getPusherClient() {
  if (!key || !cluster) {
    console.warn('Pusher client credentials are not fully set. Realtime features will not work.');
    throw new Error('Pusher client credentials are not fully set.');
  }
  if (!_client) {
    _client = new PusherClient(key, {
      cluster,
      authEndpoint: '/api/pusher/auth',
    });
  }
  return _client;
}

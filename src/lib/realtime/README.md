# Realtime layer (Pusher) – Live Licit App

This folder contains all **realtime** integration logic for the Live Licit auction app.
We use [Pusher Channels](https://pusher.com/channels) to deliver realtime updates to clients.

## Files

- `pusher-client.ts` – Client-side singleton for Pusher JS SDK.
- `pusher-server.ts` – Server-side singleton for Pusher (used in server actions, cron, etc.).
- `auctions-events.ts` – Helper functions to emit auction/bidding related events.
- `conversations-events.ts` – Helper functions to emit conversation/messaging related events.

> All `*-events.ts` files are **server-only** and marked with `"use server"`.

---

## Channel naming

### Auctions

- **Channel:** `auction-{auctionId}`
- **Scope:** Public-ish for users viewing that auction (no auth required unless we decide otherwise).
- **Used for:**
  - Realtime bid updates (current price, highest bidder, end time, bids count).

### Users

- **Channel:** `private-user-{userId}`
- **Scope:** Private, requires Pusher auth via `/api/pusher/auth`.
- **Used for:**
  - Per-user notifications such as:
    - `conversation:updated` – for updating the conversations list (last message, unread counts, new conversations).

### Conversations

- **Channel:** `private-conversation-{conversationId}`
- **Scope:** Private, requires Pusher auth.
- **Used for:**
  - Realtime messaging between 2 users:
    - `message:new` – new message in an open conversation.
    - `conversation:read` – read receipts (who read, when).

---

## Event contracts

### `auction-{auctionId}`

#### Event: `bid-placed`

Payload:

```jsonc
{
  "pusherCurrentPriceMinor": 12345, // updated current price
  "pusherHighestBidderId": "user_cuid",
  "pusherEndAt": "2025-11-25T10:15:00.000Z", // ISO string
  "pusherBidsCount": 7 // total bids for this auction
}
```

### `private-user-{userId}`

#### Event: `conversation:updated`

Payload:

```jsonc
{
  "conversationId": "conv_cuid", // ID of the updated conversation
  "lastMessage": {
    "id": "msg_cuid",
    "text": "Hey, are you available?",
    "sentAt": "2025-11-25T10:15:00.000Z", // ISO string
    "senderId": "user_cuid"
  },
  "unreadCount": 2, // number of unread messages for this user
  "participants": [
    {
      "id": "user_cuid",
      "name": "Alice"
    },
    {
      "id": "user_cuid",
      "name": "Bob"
    }
  ]
}
```

### `private-conversation-{conversationId}`

#### Event: `message:new`

Payload:

```jsonc
{
  "id": "msg_cuid", // message ID
  "text": "Hello, how are you?",
  "sentAt": "2025-11-25T10:15:00.000Z", // ISO string
  "senderId": "user_cuid",
  "conversationId": "conv_cuid"
}
```

#### Event: `conversation:read`

Payload:

```jsonc
{
  "conversationId": "conv_cuid",
  "readerId": "user_cuid", // user who read the conversation
  "readAt": "2025-11-25T10:16:00.000Z" // ISO string
}
```

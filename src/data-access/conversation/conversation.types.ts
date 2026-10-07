import { Prisma } from '@prisma/client';

export type Conversation = Prisma.ConversationGetPayload<Prisma.ConversationDefaultArgs>;

export const conversationSummaryArgs = Prisma.validator<Prisma.ConversationDefaultArgs>()({
  select: {
    id: true,
    userAId: true,
    userBId: true,
    unreadCountA: true,
    unreadCountB: true,
  },
});

export type ConversationSummary = Prisma.ConversationGetPayload<typeof conversationSummaryArgs>;

export const conversationForListArgs = Prisma.validator<Prisma.ConversationDefaultArgs>()({
  include: {
    auction: {
      select: {
        title: true,
        images: {
          orderBy: { position: 'asc' },
          take: 1,
          select: {
            url: true,
          },
        },
      },
    },
    userA: {
      select: {
        id: true,
        nickname: true,
        email: true,
      },
    },
    userB: {
      select: {
        id: true,
        nickname: true,
        email: true,
      },
    },
    messages: {
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: {
        body: true,
        senderId: true,
        sender: { select: { nickname: true } },
      },
    },
  },
});

export type ConversationForList = Prisma.ConversationGetPayload<typeof conversationForListArgs>;

export const conversationDetailsArgs = Prisma.validator<Prisma.ConversationDefaultArgs>()({
  include: {
    userA: {
      select: {
        id: true,
        nickname: true,
        email: true,
      },
    },
    userB: {
      select: {
        id: true,
        nickname: true,
        email: true,
      },
    },
    auction: {
      select: {
        id: true,
        title: true,
        deal: {
          select: {
            id: true,
          },
        },
      },
    },
    messages: {
      orderBy: { createdAt: 'asc' },
    },
  },
});

export type ConversationDetails = Prisma.ConversationGetPayload<typeof conversationDetailsArgs>;

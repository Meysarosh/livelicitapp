import type { DealStatus } from '@prisma/client';
import type { StatusTone } from '@/components/ui/StatusChip';

export function getDealStatusChip(status: DealStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case 'CREATED':
    case 'AWAITING_PAYMENT':
      return { label: 'Awaiting payment', tone: 'warning' };

    case 'PAID':
      return { label: 'Paid', tone: 'info' };

    case 'SHIPPED':
      return { label: 'Shipped', tone: 'info' };

    case 'RECEIVED':
    case 'CLOSED':
      return { label: 'Completed', tone: 'success' };

    case 'DISPUTED':
      return { label: 'In dispute', tone: 'danger' };

    case 'REFUNDED':
      return { label: 'Refunded', tone: 'danger' };

    case 'CANCELLED':
      return { label: 'Cancelled', tone: 'danger' };

    default:
      return { label: status, tone: 'default' };
  }
}

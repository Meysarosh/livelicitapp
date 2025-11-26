// Converts an ISO string (UTC) back to "YYYY-MM-DDTHH:mm" (Local)
export function isoToLocalForInput(isoStr: string | undefined | null) {
  if (!isoStr) return '';
  try {
    const date = new Date(isoStr);
    if (Number.isNaN(date.getTime())) return '';

    const offsetMs = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offsetMs);

    return localDate.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export function formatPrice(minor: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(minor / 100);
}

export function formatDateTime(d: Date) {
  return d.toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

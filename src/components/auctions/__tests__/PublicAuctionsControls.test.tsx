import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { PublicAuctionsControls } from '@/components/auctions/PublicAuctionsControls';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('PublicAuctionsControls', () => {
  beforeEach(() => {
    pushMock.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not push q param for <3 characters', async () => {
    render(<PublicAuctionsControls initialQuery='' initialSort='end-asc' currentPage={1} totalPages={3} />);

    const input = screen.getByPlaceholderText(/search by title/i);

    fireEvent.change(input, { target: { value: 'ab' } });

    await vi.advanceTimersByTimeAsync(350);

    const lastCallArg = pushMock.mock.calls.at(-1)?.[0] as string;
    expect(lastCallArg).toBe('/auctions');
  });

  it('pushes q param for >=3 characters', async () => {
    render(<PublicAuctionsControls initialQuery='' initialSort='end-asc' currentPage={1} totalPages={3} />);

    const input = screen.getByPlaceholderText(/search by title/i);

    fireEvent.change(input, { target: { value: 'black' } });

    await vi.advanceTimersByTimeAsync(350);

    const lastCallArg = pushMock.mock.calls.at(-1)?.[0] as string;
    expect(lastCallArg).toContain('q=black');
  });
});

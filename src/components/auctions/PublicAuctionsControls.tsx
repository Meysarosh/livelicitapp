'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Input, Select, Button } from '@/components/ui';
import type { PublicAuctionsSort } from '@/data-access/auctions';
import { Toolbar, ToolbarGroup, Label, Pagination, PageInfo } from './PublicAuctionsControl.styles';
import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_TIME } from '@/lib/constants';

type Props = {
  initialQuery: string;
  initialSort: PublicAuctionsSort;
  currentPage: number;
  totalPages: number;
};

export function PublicAuctionsControls({ initialQuery, initialSort, currentPage, totalPages }: Props) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<PublicAuctionsSort>(initialSort);

  const buildUrl = useCallback(
    (page: number): Route => {
      const params = new URLSearchParams();
      const trimmed = query.trim();

      if (trimmed.length >= MIN_SEARCH_LENGTH) {
        params.set('q', trimmed);
      }
      if (sort !== 'end-asc') {
        params.set('sort', sort);
      }
      if (page > 1) {
        params.set('page', String(page));
      }

      const qs = params.toString();
      const href = qs ? `/auctions?${qs}` : '/auctions';

      return href as Route;
    },
    [query, sort]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      router.push(buildUrl(1), { scroll: false });
    }, SEARCH_DEBOUNCE_TIME);

    return () => clearTimeout(handle);
  }, [query, sort, router, buildUrl]);

  const handleClear = () => {
    setQuery('');
    setSort('end-asc');
    router.push('/auctions' as Route, { scroll: false });
  };

  const goToPage = (page: number) => {
    router.push(buildUrl(page), { scroll: false });
  };

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <Toolbar>
      <ToolbarGroup style={{ flex: 1, minWidth: '220px' }}>
        <Label>Search</Label>
        <Input placeholder='Search by title or description…' value={query} onChange={(e) => setQuery(e.target.value)} />
      </ToolbarGroup>

      <ToolbarGroup>
        <Label>Sort by</Label>
        <Select
          name='sort'
          value={sort}
          onChange={(e) => setSort(e.target.value as PublicAuctionsSort)}
          options={[
            { value: 'end-asc', label: 'Ending soonest' },
            { value: 'end-desc', label: 'Ending latest' },
            { value: 'price-asc', label: 'Price: low → high' },
            { value: 'price-desc', label: 'Price: high → low' },
          ]}
        />
      </ToolbarGroup>

      <ToolbarGroup>
        <Button type='button' onClick={handleClear}>
          Clear
        </Button>
      </ToolbarGroup>

      <Pagination>
        <Button type='button' disabled={!canPrev} onClick={() => goToPage(currentPage - 1)}>
          Previous
        </Button>
        <PageInfo>
          Page {currentPage} of {totalPages}
        </PageInfo>
        <Button type='button' disabled={!canNext} onClick={() => goToPage(currentPage + 1)}>
          Next
        </Button>
      </Pagination>
    </Toolbar>
  );
}

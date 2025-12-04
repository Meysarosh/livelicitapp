import { AuctionsList } from '@/components/auctions/AuctionsList';
import { getPublicAuctions, type PublicAuctionsSort } from '@/data-access/auctions';
import { PublicAuctionsControls } from '@/components/auctions/PublicAuctionsControls';
import { PAGE_SIZE } from '@/lib/constants';

type SearchParams = {
  q?: string;
  sort?: string;
  page?: string;
};

export default async function PublicAuctionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const rawQuery = typeof params?.q === 'string' ? params.q : '';
  const rawSort = typeof params?.sort === 'string' ? params.sort : 'end-asc';
  const rawPage = typeof params?.page === 'string' ? Number(params.page) : 1;

  const sort: PublicAuctionsSort =
    rawSort === 'end-desc' || rawSort === 'price-asc' || rawSort === 'price-desc'
      ? (rawSort as PublicAuctionsSort)
      : 'end-asc';

  const page = !Number.isFinite(rawPage) || rawPage < 1 ? 1 : rawPage;

  const { auctions, total } = await getPublicAuctions({
    page,
    pageSize: PAGE_SIZE,
    search: rawQuery,
    sort,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PublicAuctionsControls initialQuery={rawQuery} initialSort={sort} currentPage={page} totalPages={totalPages} />
      <AuctionsList auctions={auctions} page='public' />
    </>
  );
}

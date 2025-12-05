import { getAdminUser } from '@/lib/auth/getAdminUser';
import { adminCancelAuction, getAuctionsDataForAdmin } from '@/app/actions/admin/adminAuction';
import { Title, Note, Input, Button, Select } from '@/components/ui';
import { Table, ActionsCell } from '../styles';
import { ADMIN_TABLE_SIZE } from '@/lib/constants';

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

export default async function AdminAuctionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await getAdminUser();
  const params = await searchParams;
  const getFirst = (v?: string | string[]) => (typeof v === 'string' ? v : Array.isArray(v) ? v[0] : '');

  const rawQuery = getFirst(params.q);
  const rawStatus = getFirst(params.status) || 'ALL';
  const rawPage = getFirst(params.page);
  const rawPageNum = rawPage ? Number(rawPage) : 1;
  const page = !Number.isFinite(rawPageNum) || rawPageNum < 1 ? 1 : rawPageNum;

  const { auctions, total } = await getAuctionsDataForAdmin({
    page,
    pageSize: ADMIN_TABLE_SIZE,
    search: rawQuery,
    status: rawStatus,
  });

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_SIZE));

  return (
    <div>
      <Title as='h1'>Auctions</Title>
      <Note>Search and manage auctions. You can cancel problematic ones.</Note>

      <form
        method='get'
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          margin: '16px 0',
        }}
      >
        <Input
          name='q'
          placeholder='Search by title, description, owner email/nickname…'
          defaultValue={rawQuery}
          style={{ maxWidth: 320 }}
        />

        <Select
          name='status'
          defaultValue={rawStatus}
          options={[
            { value: 'ALL', label: 'All statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'ENDED', label: 'Ended' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
        />

        <Button type='submit'>Search</Button>
      </form>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
        Showing {auctions.length} of {total} auctions
        {rawQuery ? ` for “${rawQuery}”` : ''}
        {rawStatus !== 'ALL' ? ` with status ${rawStatus}` : ''}.
      </p>

      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Current price</th>
            <th>Owner</th>
            <th>Bids</th>
            <th>Start</th>
            <th>End</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {auctions.length === 0 ? (
            <tr>
              <td colSpan={9}>No auctions found.</td>
            </tr>
          ) : (
            auctions.map((a) => {
              const canCancel = a.status === 'ACTIVE' || a.status === 'SCHEDULED'; // ⚠️ adjust if needed
              return (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.status}</td>
                  <td>
                    {a.currentPriceMinor / 100} {a.currency}
                  </td>
                  <td>
                    {a.ownerNickname ?? '(no nickname)'}
                    <br />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{a.ownerEmail}</span>
                  </td>
                  <td>{a.bidsCount}</td>
                  <td>{a.startAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                  <td>{a.endAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                  <td>{a.createdAt.toISOString().slice(0, 10)}</td>
                  <ActionsCell>
                    <form action={adminCancelAuction}>
                      <input type='hidden' name='auctionId' value={a.id} />
                      <Button
                        type='submit'
                        disabled={!canCancel}
                        title={!canCancel ? 'Only active/scheduled auctions can be cancelled.' : ''}
                      >
                        Cancel
                      </Button>
                    </form>
                  </ActionsCell>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, fontSize: 13 }}>
          <span>
            Page {page} of {totalPages}
          </span>
          {page > 1 && (
            <a
              href={`/admin/auctions?page=${page - 1}${rawQuery ? `&q=${encodeURIComponent(rawQuery)}` : ''}${
                rawStatus && rawStatus !== 'ALL' ? `&status=${encodeURIComponent(rawStatus)}` : ''
              }`}
            >
              Previous
            </a>
          )}
          {page < totalPages && (
            <a
              href={`/admin/auctions?page=${page + 1}${rawQuery ? `&q=${encodeURIComponent(rawQuery)}` : ''}${
                rawStatus && rawStatus !== 'ALL' ? `&status=${encodeURIComponent(rawStatus)}` : ''
              }`}
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}

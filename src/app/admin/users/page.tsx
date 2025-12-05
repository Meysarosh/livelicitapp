import { getAdminUser } from '@/lib/auth/getAdminUser';
import { adminUpdateUserStatus, getUsersDataForAdmin } from '@/app/actions/admin/adminUserStatus';
import { Title, Note, Input, Button } from '@/components/ui';
import { Table, ActionsCell } from '../styles';
import { ADMIN_TABLE_SIZE } from '@/lib/constants';

type SearchParams = {
  q?: string | string[];
  page?: string | string[];
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await getAdminUser();

  const params = await searchParams;
  const getFirst = (v?: string | string[]) => (typeof v === 'string' ? v : Array.isArray(v) ? v[0] : '');

  const rawQuery = getFirst(params.q);
  const rawPage = getFirst(params.page);
  const rawPageNum = rawPage ? Number(rawPage) : 1;
  const page = !Number.isFinite(rawPageNum) || rawPageNum < 1 ? 1 : rawPageNum;

  const { users, total } = await getUsersDataForAdmin({
    page,
    pageSize: ADMIN_TABLE_SIZE,
    search: rawQuery,
  });

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_SIZE));

  return (
    <div>
      <Title as='h1'>Users</Title>
      <Note>Search users and suspend/unsuspend accounts.</Note>

      <form method='get' style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '16px 0' }}>
        <Input name='q' placeholder='Search by email or nickname…' defaultValue={rawQuery} style={{ maxWidth: 280 }} />
        <Button type='submit'>Search</Button>
      </form>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
        Showing {users.length} of {total} users{rawQuery ? ` for “${rawQuery}”` : ''}.
      </p>

      <Table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Nickname</th>
            <th>Role</th>
            <th>Status</th>
            <th>Session ver.</th>
            <th>Auctions</th>
            <th>Deals (B / S)</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={9}>No users found.</td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.nickname}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>{u.sessionVersion}</td>
                <td>{u.auctionsCount}</td>
                <td>
                  {u.dealsAsBuyerCount} / {u.dealsAsSellerCount}
                </td>
                <td>{u.createdAt.toISOString().slice(0, 10)}</td>
                <ActionsCell>
                  <form action={adminUpdateUserStatus}>
                    <input type='hidden' name='userId' value={u.id} />
                    <input type='hidden' name='action' value={u.status === 'OK' ? 'suspend' : 'unsuspend'} />
                    <Button type='submit'>{u.status === 'OK' ? 'Suspend' : 'Unsuspend'}</Button>
                  </form>
                </ActionsCell>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, fontSize: 13 }}>
          <span>
            Page {page} of {totalPages}
          </span>

          {page > 1 && (
            <a href={`/admin/users?page=${page - 1}${rawQuery ? `&q=${encodeURIComponent(rawQuery)}` : ''}`}>
              Previous
            </a>
          )}
          {page < totalPages && (
            <a href={`/admin/users?page=${page + 1}${rawQuery ? `&q=${encodeURIComponent(rawQuery)}` : ''}`}>Next</a>
          )}
        </div>
      )}
    </div>
  );
}

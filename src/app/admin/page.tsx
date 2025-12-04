import { getAdminUser } from '@/lib/auth/getAdminUser';
import { Title, Note } from '@/components/ui';

export default async function AdminHomePage() {
  const admin = await getAdminUser();

  return (
    <>
      <Title>Admin dashboard</Title>
      <Note>
        Signed in as {admin.nickname} ({admin.role})
      </Note>
      <Note>Use the menu on the left to manage users, auctions and deals.</Note>
    </>
  );
}

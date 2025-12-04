import { getAuthUser } from '@/lib/auth/getAuthUser';
import { redirect } from 'next/navigation';
import PasswordForm from '@/components/account/PasswordForm';
import { getUserWithCredentials } from '@/data-access/user';

export default async function PasswordPage() {
  const authUser = await getAuthUser();

  const user = await getUserWithCredentials(authUser.id);

  if (!user) {
    redirect('/login');
  }

  const hasLocalPassword = !!user.credentials;

  return <PasswordForm hasLocalPassword={hasLocalPassword} />;
}

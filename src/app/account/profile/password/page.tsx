'use server';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import PasswordForm from '@/components/account/PasswordForm';
import { hasUserPassword } from '@/data-access/user/user';

export default async function PasswordPage() {
  const authUser = await getAuthUser();
  const hasLocalPassword = await hasUserPassword(authUser.id);

  return <PasswordForm hasLocalPassword={hasLocalPassword} />;
}

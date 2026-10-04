'use server';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import PasswordForm from '@/components/account/PasswordForm';
import { hasUserCredential } from '@/data-access/user';

export default async function PasswordPage() {
  const authUser = await getAuthUser();
  const hasLocalPassword = await hasUserCredential(authUser.id);

  return <PasswordForm hasLocalPassword={hasLocalPassword} />;
}

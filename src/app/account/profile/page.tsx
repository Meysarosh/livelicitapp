import { getAuthUser } from '@/lib/auth/getAuthUser';
import ProfileForm from '@/components/account/ProfileForm';
import { getUserById } from '@/data-access/user/user';

export default async function ProfilePage() {
  const authUser = await getAuthUser();
  const user = await getUserById(authUser.id);

  if (!user) {
    return <div>User profile not found.</div>;
  }

  return <ProfileForm user={user} />;
}

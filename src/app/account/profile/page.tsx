import { getAuthUser } from '@/lib/auth/getAuthUser';
import ProfileForm from '@/components/account/ProfileForm';
import { getUserProfile } from '@/data-access/user';

export default async function ProfilePage() {
  const authUser = await getAuthUser();
  const user = await getUserProfile(authUser.id);

  if (!user) {
    return <div>User profile not found.</div>;
  }

  return <ProfileForm user={user} />;
}

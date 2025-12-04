import { getAuthUser } from '@/lib/auth/getAuthUser';
import ShippingAddressForm from '@/components/account/ShippingAddressForm';
import { getShippingAddress } from '@/data-access/shippingAddress';

export default async function ShippingAddressPage() {
  const authUser = await getAuthUser();
  const address = await getShippingAddress(authUser.id);

  return <ShippingAddressForm address={address} />;
}

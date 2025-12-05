import { getAdminUser } from '@/lib/auth/getAdminUser';
import {
  Content,
  LayoutWrapper,
  MenuItem,
  MenuList,
  Sidebar,
  SidebarTitle,
} from '@/components/layout/AccountLayout/styles';
import AccountMenuLink from '@/components/account/AccountMenuLink';
import UnreadMessagesCount from '@/components/layout/AccountLayout/UnreadMessagesCount';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();

  return (
    <LayoutWrapper>
      <Sidebar>
        <SidebarTitle>Admin</SidebarTitle>
        <MenuList>
          <MenuItem>
            <AccountMenuLink href='/admin'>Overview</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/admin/users'>Users</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/admin/auctions'>Auctions</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/admin/conversations'>
              Conversations <UnreadMessagesCount userId={admin.id} />
            </AccountMenuLink>
          </MenuItem>
        </MenuList>
      </Sidebar>

      <Content>{children}</Content>
    </LayoutWrapper>
  );
}

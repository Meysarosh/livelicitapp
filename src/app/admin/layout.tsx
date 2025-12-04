import { getAdminUser } from '@/lib/auth/getAdminUser';
import {
  Content,
  LayoutWrapper,
  MenuItem,
  MenuLink,
  MenuList,
  Sidebar,
  SidebarTitle,
} from '@/components/layout/AccountLayout/styles';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await getAdminUser();

  return (
    <LayoutWrapper>
      <Sidebar>
        <SidebarTitle>Admin</SidebarTitle>
        <MenuList>
          <MenuItem>
            <MenuLink href='/admin'>Overview</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink href='/admin/users'>Users</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink href='/admin/auctions'>Auctions</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink href='/admin/deals'>Deals</MenuLink>
          </MenuItem>
          {/* You can add /admin/conversations later */}
        </MenuList>
      </Sidebar>

      <Content>{children}</Content>
    </LayoutWrapper>
  );
}

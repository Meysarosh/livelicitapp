import { getAuthUser } from '@/lib/auth/getAuthUser';
import {
  Content,
  LayoutWrapper,
  MenuItem,
  MenuLink,
  MenuList,
  Sidebar,
  SidebarTitle,
  SidebarUserInfo,
} from '@/components/layout/AccountLayout/styles';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  return (
    <LayoutWrapper>
      <Sidebar>
        <SidebarTitle>My account</SidebarTitle>
        <SidebarUserInfo>
          Logged in as <strong>{user.nickname ?? user.email}</strong>
        </SidebarUserInfo>

        <MenuList>
          <MenuItem>
            <MenuLink href='/account/auctions'>My auctions</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink href='/account/auctions/create'>Create auction</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink href='/account/auctions/sold'>Sold auctions</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink href='/account/auctions/won'>Won auctions</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink href='/account/watchlist'>Watchlist</MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink href='/account/conversations'>Conversations</MenuLink>
          </MenuItem>
        </MenuList>
      </Sidebar>

      <Content>{children}</Content>
    </LayoutWrapper>
  );
}

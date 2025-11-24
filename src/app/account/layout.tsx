import { requireUser } from '@/lib/auth/requireUser';
import {
  Content,
  LayoutWrapper,
  MenuItem,
  MenuLink,
  MenuList,
  Sidebar,
  SidebarTitle,
} from '@/components/layouts/AccountLayout/styles';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <LayoutWrapper>
      <Sidebar>
        <SidebarTitle>My account</SidebarTitle>
        <p style={{ fontSize: 13, marginTop: 0, marginBottom: 12 }}>
          Logged in as <strong>{user.nickname ?? user.email}</strong>
        </p>
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

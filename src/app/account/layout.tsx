import { getAuthUser } from '@/lib/auth/getAuthUser';
import {
  Content,
  LayoutWrapper,
  MenuItem,
  MenuList,
  Sidebar,
  SidebarTitle,
  SidebarUserInfo,
} from '@/components/layout/AccountLayout/styles';
import AccountMenuLink from '@/components/account/AccountMenuLink';
import UnreadMessagesCount from '@/components/layout/AccountLayout/UnreadMessagesCount';

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
            <AccountMenuLink href='/account/auctions'>My auctions</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/account/auctions/create'>Create auction</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/account/auctions/sold'>Sold auctions</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/account/auctions/won'>Won auctions</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/account/watchlist'>Watchlist</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/account/conversations'>
              Conversations <UnreadMessagesCount userId={user.id} />
            </AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/account/profile'>Profile</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/account/profile/address'>Shipping address</AccountMenuLink>
          </MenuItem>
          <MenuItem>
            <AccountMenuLink href='/account/profile/password'>Password &amp; security</AccountMenuLink>
          </MenuItem>
        </MenuList>
      </Sidebar>

      <Content>{children}</Content>
    </LayoutWrapper>
  );
}

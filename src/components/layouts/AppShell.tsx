'use client';

import Link from 'next/link';
import styled from 'styled-components';
import type { ReactNode } from 'react';

const ShellWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.headerBg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Logo = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandTitle = styled.span`
  font-weight: 600;
  font-size: 18px;
`;

const BrandSubtitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
`;

const NavLink = styled(Link)`
  font-size: 14px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.bgElevated};
    text-decoration: none;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(2)};
`;

const ContentContainer = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const Footer = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.footerBg};
`;

const FooterInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

type AppShellProps = {
  children: ReactNode;
  // later we can pass user info, theme toggle, etc.
};

export function AppShell({ children }: AppShellProps) {
  return (
    <ShellWrapper>
      <Header>
        <HeaderInner>
          <Brand>
            <Logo />
            <BrandText>
              <BrandTitle>Live Licit</BrandTitle>
              <BrandSubtitle>Real-time auctions & deals</BrandSubtitle>
            </BrandText>
          </Brand>
          <Nav>
            <NavLink href='/auctions'>Auctions</NavLink>
            <NavLink href='/account/auctions'>My auctions</NavLink>
            <NavLink href='/account/watchlist'>Watchlist</NavLink>
            <NavLink href='/account/conversations'>Messages</NavLink>
            {/* later: conditionally show Login / Logout based on session */}
          </Nav>
        </HeaderInner>
      </Header>

      <Main>
        <ContentContainer>{children}</ContentContainer>
      </Main>

      <Footer>
        <FooterInner>
          <span>© {new Date().getFullYear()} Live Licit</span>
          <span>Built with Next.js & Prisma</span>
        </FooterInner>
      </Footer>
    </ShellWrapper>
  );
}

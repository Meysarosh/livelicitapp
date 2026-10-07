import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import StyledComponentsRegistry from '@/styles/styled-registry';
import ClientThemeProvider from '@/styles/themeProvider';
import AppHeader from '@/components/header/AppHeader';
import {
  ShellWrapper,
  Main,
  ContentContainer,
  Footer,
  FooterInner,
} from '@/components/layout/RootLayout/styles';
import { getUserById } from '@/data-access/user/user';
import Watcher from '@/components/auth/Watcher';

export const metadata: Metadata = {
  title: 'Live Licit App',
  description: 'Real-time auctions',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const dbUser = session?.user ? await getUserById(session.user.id) : null;
  const userDataForHeader = dbUser
    ? {
        email: dbUser.email,
        nickname: dbUser.nickname,
        fullName: dbUser.fullName,
        phone: dbUser.phone,
        avatarUrl: dbUser.avatarUrl,
      }
    : null;

  const cookieStore = await cookies();
  const stored = cookieStore.get('ll-theme')?.value;
  const initialMode = stored === 'dark' || stored === 'light' ? stored : 'light';

  return (
    <html lang='en'>
      <body>
        <StyledComponentsRegistry>
          <ClientThemeProvider initialMode={initialMode}>
            <ShellWrapper>
              {session?.user && <Watcher userId={session.user.id} />}
              <AppHeader user={userDataForHeader} />
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
          </ClientThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

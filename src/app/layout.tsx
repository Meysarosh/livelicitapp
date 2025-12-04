import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import StyledComponentsRegistry from '@/styles/styled-registry';
import ClientThemeProvider from '@/styles/themeProvider';
import { auth } from '@/lib/auth';
import AppHeader from '@/components/header/AppHeader';
import { ShellWrapper, Main, ContentContainer, Footer, FooterInner } from '@/components/layout/RootLayout/styles';
import { getUserProfile } from '@/data-access/user';

export const metadata: Metadata = { title: 'Live Licit App', description: 'Real-time auctions' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const sessionUser = session?.user ? await getUserProfile(session.user.id) : null;

  const cookieStore = await cookies();
  const stored = cookieStore.get('ll-theme')?.value;
  const initialMode = stored === 'dark' || stored === 'light' ? stored : 'light';

  return (
    <html lang='en'>
      <body>
        <StyledComponentsRegistry>
          <ClientThemeProvider initialMode={initialMode}>
            <ShellWrapper>
              <AppHeader user={sessionUser} />
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

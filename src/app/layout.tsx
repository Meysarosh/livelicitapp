import type { Metadata } from 'next';
import StyledComponentsRegistry from '@/lib/styled-registry';
import ClientThemeProvider from '@/lib/themeProvider';
import { auth } from '@/lib/auth';
import Header from '@/components/header/Header';

export const metadata: Metadata = { title: 'Live Licit App', description: 'Real-time auctions' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const sessionUser = session?.user
    ? { id: session.user.id, nickname: session.user.nickname, role: session.user.role }
    : null;

  return (
    <html lang='en'>
      <body>
        <StyledComponentsRegistry>
          <ClientThemeProvider>
            <Header user={sessionUser} />
            {children}
          </ClientThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

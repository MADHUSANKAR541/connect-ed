import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';
import './globals.scss';
import '../styles/loading.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ConnectED - Connect with Your Academic Community',
  description: 'A comprehensive college alumni-student networking platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <RoleBasedRedirect>
            <div className="app-container">
              {children}
            </div>
          </RoleBasedRedirect>
        </Providers>
      </body>
    </html>
  );
}

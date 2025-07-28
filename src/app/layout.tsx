import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import SideHeaderWrapper from '@/components/SideHeaderWrapper';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';
import './globals.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CampusConnect - Connect with Your Academic Community',
  description: 'A modern campus networking platform connecting students, alumni, and professors.',
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
              <SideHeaderWrapper />
              {children}
            </div>
          </RoleBasedRedirect>
        </Providers>
      </body>
    </html>
  );
}

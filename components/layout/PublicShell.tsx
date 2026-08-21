'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PublicMain from '@/components/layout/PublicMain';

/**
 * Public marketing chrome. Auth routes render without Header/Footer so
 * full-page auth loaders are not stacked under the site shell.
 */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth') ?? false;

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <PublicMain>{children}</PublicMain>
      <Footer />
    </>
  );
}

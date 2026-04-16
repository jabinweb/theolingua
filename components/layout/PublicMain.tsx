'use client';

import { usePathname } from 'next/navigation';

export default function PublicMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <main className={`flex-1 ${!isHomePage ? 'pt-20' : ''}`}>
      {children}
    </main>
  );
}

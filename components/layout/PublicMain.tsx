'use client';

import { usePathname } from 'next/navigation';

export default function PublicMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <main className={`min-w-0 flex-1 overflow-x-hidden ${!isHomePage ? 'pt-20' : ''}`}>
      {children}
    </main>
  );
}

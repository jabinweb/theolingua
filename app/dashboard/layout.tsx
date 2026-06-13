'use client';

import { useSession } from 'next-auth/react';
import { HeaderSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShellHeader } from '@/components/layout/AppShellHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [status, router]);

  if (loading || !user) {
    return <HeaderSkeleton />;
  }

  return (
    <div className="min-h-screen bg-theo-white text-theo-black">
      <AppShellHeader backHref="/" backLabel="Home" />
      <main>{children}</main>
    </div>
  );
}

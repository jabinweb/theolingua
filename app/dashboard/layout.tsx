'use client';

import { useSession } from 'next-auth/react';
import { HeaderSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserDropdown } from '@/components/UserDropdown';

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
      // Redirect to login page with dashboard redirect
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [status, router]);

  if (loading) {
    return <HeaderSkeleton />;
  }

  if (!user) {
    return <HeaderSkeleton />; // Show loading while redirecting
  }

  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push('/')}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>

            {/* Right side - User dropdown */}
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
}

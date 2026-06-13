'use client';

import { useSession } from 'next-auth/react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AlertCircle, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/admin');
    } else if (user && userRole && userRole !== 'ADMIN' && userRole !== 'TEACHER' && userRole !== 'MODERATOR') {
      router.push('/');
    }
  }, [status, router, user, userRole]);

  if (loading || (user && !userRole)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />;
  }

  if (userRole !== 'ADMIN' && userRole !== 'TEACHER' && userRole !== 'MODERATOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access the admin area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <aside className="hidden md:flex h-full border-r bg-white overflow-y-auto w-72 shrink-0">
        <AdminSidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
          <div className="flex items-center gap-2">
            <AdminMobileNav />
            <span className="font-bold text-slate-800">Admin Panel</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function AdminMobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <AdminSidebar isMobile />
      </SheetContent>
    </Sheet>
  );
}

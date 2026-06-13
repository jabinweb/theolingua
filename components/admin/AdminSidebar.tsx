'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  MessageSquare,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  School,
  DollarSign,
  AlertTriangle,
  Bell,
  Megaphone,
  Activity,
  LogOut,
  Tag,
  Layers,
  ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'MODERATOR'] },
  { name: 'Batches', href: '/admin/batches', icon: Layers, roles: ['ADMIN', 'TEACHER', 'MODERATOR'] },
  { name: 'Colleges', href: '/admin/colleges', icon: School, roles: ['ADMIN'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['ADMIN', 'MODERATOR'] },
  { name: 'Programs', href: '/admin/programs', icon: GraduationCap, roles: ['ADMIN', 'MODERATOR', 'TEACHER'] },
  { name: 'Pricing', href: '/admin/pricing', icon: Tag, roles: ['ADMIN'] },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard, roles: ['ADMIN'] },
  { name: 'Payments', href: '/admin/payments', icon: DollarSign, roles: ['ADMIN'] },
  { name: 'Activities', href: '/admin/activities', icon: Activity, roles: ['ADMIN'] },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, roles: ['ADMIN'] },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone, roles: ['ADMIN'] },
  { name: 'Error Logs', href: '/admin/error-logs', icon: AlertTriangle, roles: ['ADMIN'] },
  { name: 'Responses', href: '/admin/responses', icon: MessageSquare, roles: ['ADMIN'] },
  { name: 'Analytics', href: '/admin/analytics', icon: BookOpen, roles: ['ADMIN', 'TEACHER', 'MODERATOR'] },
  { name: 'Role Management', href: '/admin/roles', icon: ShieldCheck, roles: ['ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
];

interface AdminSidebarProps {
  isMobile?: boolean;
}

export function AdminSidebar({ isMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'STUDENT';
  const [programPlural, setProgramPlural] = useState('Programs');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.programPlural) setProgramPlural(data.programPlural);
      })
      .catch(() => undefined);
  }, []);

  const filteredNavigation = navigation
    .map((item) => (item.name === 'Programs' ? { ...item, name: programPlural } : item))
    .filter((item) => item.roles.includes(userRole));

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-5">
        <Link href="/" className="relative mb-4 block h-9 w-28">
          <Image src="/logo.png" alt="TheoLingua" fill className="object-contain object-left" />
        </Link>
        <p className="text-xs font-medium text-gray-500">
          {userRole === 'TEACHER' ? 'Teacher panel' : 'Admin panel'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 h-9 w-full justify-start px-0 text-sm font-semibold text-gray-600 hover:text-theo-black"
          onClick={() => router.push('/')}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to site
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-theo-yellow/20 text-theo-black'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-theo-black'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-theo-black' : 'text-gray-400')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full justify-start text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  if (isMobile) return sidebarContent;

  return <div className="flex h-full w-full flex-col">{sidebarContent}</div>;
}

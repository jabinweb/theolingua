'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <div className="flex flex-col flex-grow bg-white border-r border-theo-black/5 h-full overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-6 py-8 mb-2 bg-theo-black">
        <div className="w-11 h-11 bg-theo-yellow rounded-2xl flex items-center justify-center shadow-xl">
          <BookOpen className="h-6 w-6 text-theo-black" />
        </div>
        <span className="ml-3 text-lg font-black tracking-tight text-white">
          {userRole === 'TEACHER' ? 'Teacher Panel' : 'THEO'}
          <span className="text-theo-yellow">{userRole === 'TEACHER' ? '' : 'LINGUA'}</span>
        </span>
      </div>

      <div className="px-4 mb-4 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 w-full justify-start rounded-xl h-10 text-gray-500 hover:bg-theo-yellow/10 hover:text-theo-black font-bold text-xs uppercase tracking-wider"
          onClick={() => router.push('/')}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <nav className="flex-1 px-3 space-y-1 pb-4">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-widest',
                isActive
                  ? 'bg-theo-black text-theo-yellow shadow-lg'
                  : 'text-gray-500 hover:bg-theo-yellow/10 hover:text-theo-black'
              )}
            >
              <item.icon
                className={cn('mr-3 h-5 w-5 shrink-0', isActive ? 'text-theo-yellow' : 'text-gray-400')}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-theo-black/5">
        <Button
          variant="ghost"
          className="flex items-center gap-2 w-full justify-start text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-11 font-bold text-xs uppercase tracking-wider"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  if (isMobile) return sidebarContent;

  return <div className="flex h-full w-full flex-col">{sidebarContent}</div>;
}

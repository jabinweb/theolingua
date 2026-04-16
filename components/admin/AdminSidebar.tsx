'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
  Tag
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Colleges', href: '/admin/colleges', icon: School },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Programs', href: '/admin/programs', icon: GraduationCap },
  { name: 'Pricing', href: '/admin/pricing', icon: Tag },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Payments', href: '/admin/payments', icon: DollarSign },
  { name: 'Activities', href: '/admin/activities', icon: Activity },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Error Logs', href: '/admin/error-logs', icon: AlertTriangle },
  { name: 'Responses', href: '/admin/responses', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BookOpen },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="hidden md:flex md:w-72 md:flex-col h-full">
      <div className="flex flex-col flex-grow bg-white border-r border-theo-black/5 overflow-hidden">
        <div className="flex items-center flex-shrink-0 px-8 py-10 mb-4 bg-theo-black">
          <div className="w-12 h-12 bg-theo-yellow rounded-2xl flex items-center justify-center shadow-xl transform -rotate-3 hover:rotate-0 transition-all duration-300">
            <BookOpen className="h-7 w-7 text-theo-black" />
          </div>
          <span className="ml-4 text-2xl font-black tracking-tight text-white font-brand">THEO<span className="text-theo-yellow">LINGUA</span></span>
        </div>
        
        <div className="px-6 mb-8 mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-3 w-full justify-start rounded-2xl h-11 text-gray-500 hover:bg-theo-yellow/10 hover:text-theo-black font-bold uppercase tracking-wider text-[10px]"
            onClick={() => router.push('/')}
          >
            <ChevronLeft className="h-4 w-4" />
            Vist Main Site
          </Button>
        </div>
        
        <div className="flex-grow flex flex-col overflow-y-auto px-4 custom-scrollbar">
          <nav className="flex-1 space-y-1.5 pb-20">
            <div className="px-4 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Main Menu</p>
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-5 py-3.5 text-xs font-bold rounded-2xl transition-all duration-300',
                    isActive
                      ? 'bg-theo-black text-theo-yellow shadow-xl shadow-theo-black/20 translate-x-1'
                      : 'text-gray-500 hover:bg-theo-yellow/10 hover:text-theo-black'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5 transition-all duration-300',
                      isActive ? 'text-theo-yellow scale-110' : 'text-gray-400 group-hover:text-theo-black'
                    )}
                  />
                  <span className="uppercase tracking-widest">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-6 mt-auto border-t border-theo-black/5 bg-gray-50/50">
          <Button
            variant="ghost"
            className="flex items-center gap-3 w-full justify-start text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl h-12 font-bold uppercase tracking-wider text-[10px] transition-all"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <div className="h-8 w-8 rounded-xl bg-white border border-theo-black/5 flex items-center justify-center">
              <LogOut className="h-4 w-4" />
            </div>
            Logout Session
          </Button>
        </div>
      </div>
    </div>
  );
}

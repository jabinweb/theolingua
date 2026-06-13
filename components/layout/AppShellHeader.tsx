'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/UserDropdown';

interface AppShellHeaderProps {
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function AppShellHeader({
  showBack = true,
  backHref = '/',
  backLabel = 'Home',
}: AppShellHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white shadow-sm">
      <div className="container mx-auto flex min-h-[4rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="relative h-9 w-28 shrink-0 sm:h-10 sm:w-32">
            <Image src="/logo.png" alt="TheoLingua" fill className="object-contain object-left" priority />
          </Link>
          {showBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden text-sm font-semibold text-gray-600 hover:text-theo-black sm:inline-flex"
              onClick={() => router.push(backHref)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {backLabel}
            </Button>
          )}
        </div>
        <UserDropdown />
      </div>
    </header>
  );
}

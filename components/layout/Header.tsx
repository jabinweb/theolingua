'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { openCalendlyPopup } from '@/lib/calendly';
import { UserDropdown } from '@/components/UserDropdown';
import { Menu, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { data: session } = useSession();

  // Prevent scroll when side panel is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'About', href: '#about' },
    { name: 'The Program', href: '#program' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'For Institutions', href: '#institutions' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 w-full max-w-full transition-colors duration-300 ${isScrolled || !isHomePage
          ? 'bg-white shadow-sm'
          : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex min-h-[4.5rem] sm:min-h-20 h-full min-w-0 max-w-full items-center justify-between gap-3 px-4 sm:px-6 py-2 sm:py-0">

          {/* Left: Logo + Nav */}
          <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-8 lg:gap-10 h-full pr-2">
            {/* Logo */}
            <Link href="/" className="flex min-w-0 shrink items-center">
              <div className={`relative shrink-0 transition-all ${isScrolled || !isHomePage ? 'h-9 w-28 sm:h-10 sm:w-32' : 'h-10 w-36 sm:h-12 sm:w-40'
                }`}>
                <Image
                  src="/logo.png"
                  alt="TheoLingua Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-[15px] font-semibold tracking-wide">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={isHomePage ? item.href : `/${item.href}`}
                  className={`whitespace-nowrap transition-colors ${!isScrolled && isHomePage
                      ? 'text-white/90 hover:text-theo-yellow'
                      : 'text-gray-700 hover:text-theo-yellow'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: CTAs */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-5 h-full">
            <div className="hidden md:flex items-center gap-5 lg:gap-7">
              {!session ? (
                <Link
                  href="/auth/login"
                  className={`text-[15px] font-semibold transition-colors ${!isScrolled && isHomePage
                      ? 'text-white hover:text-theo-yellow'
                      : 'text-gray-700 hover:text-theo-yellow'
                    }`}
                >
                  Sign In
                </Link>
              ) : (
                <UserDropdown />
              )}

              <Button
                type="button"
                className="bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full px-7 py-5 text-[15px] font-bold shadow-none h-11 sm:h-12"
                onClick={() => void openCalendlyPopup()}
              >
                Book a Demo
              </Button>
            </div>

            {/* Mobile menu button — min 44px touch target */}
            <button
              type="button"
              className={cn(
                'lg:hidden flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors sm:h-11 sm:w-11',
                !isScrolled && isHomePage
                  ? 'border-white/25 bg-white/10 hover:bg-white/15 active:bg-white/20'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
              )}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu
                className={`h-8 w-8 sm:h-7 sm:w-7 transition-colors ${!isScrolled && isHomePage ? 'text-white' : 'text-theo-black'}`}
                strokeWidth={2.25}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Side Panel (Mobile Menu) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-[101] flex w-[min(100vw-1rem,22rem)] min-w-[18rem] flex-col bg-white shadow-2xl sm:w-[24rem] lg:hidden"
            >
              <div className="flex h-full flex-col px-5 py-6 sm:px-7 sm:py-8">
                <div className="mb-8 flex items-center justify-between gap-3">
                  <div className="relative h-11 w-36 shrink-0 sm:h-12 sm:w-40">
                    <Image
                      src="/logo.png"
                      alt="TheoLingua Logo"
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                    aria-label="Close menu"
                  >
                    <X className="h-7 w-7 text-theo-black" strokeWidth={2} />
                  </button>
                </div>

                <nav className="flex flex-col gap-0.5">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={isHomePage ? item.href : `/${item.href}`}
                      className="rounded-xl px-1 py-4 text-xl font-bold leading-snug text-theo-black transition-colors hover:bg-theo-yellow/10 hover:text-theo-black border-b border-gray-100 last:border-b-0 sm:text-[1.35rem] sm:py-[1.125rem]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-4 pt-8">
                  {!session ? (
                    <Link href="/auth/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="h-14 w-full justify-center rounded-full text-lg font-bold">
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <div className="px-1 pb-2">
                      <UserDropdown />
                    </div>
                  )}
                  <Button
                    type="button"
                    className="h-14 w-full rounded-full bg-theo-yellow text-lg font-bold text-theo-black shadow-lg shadow-theo-yellow/25 hover:bg-[#b0bd2a]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      void openCalendlyPopup();
                    }}
                  >
                    Book a Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

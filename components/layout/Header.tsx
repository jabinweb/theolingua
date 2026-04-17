'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
      <header className={`fixed top-0 left-0 right-0 z-50 w-full max-w-full transition-colors duration-300 h-20 ${isScrolled || !isHomePage
          ? 'bg-white shadow-sm'
          : 'bg-transparent'
        }`}>
        <div className="container mx-auto flex h-full min-w-0 max-w-full items-center justify-between gap-3 px-4 sm:px-6">

          {/* Left: Logo + Nav */}
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8 h-full pr-2">
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
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold tracking-wide">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={isHomePage ? item.href : `/${item.href}`}
                  className={`transition-colors ${!isScrolled && isHomePage
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
          <div className="flex shrink-0 items-center gap-3 sm:gap-6 h-full">
            <div className="hidden md:flex items-center gap-6">
              {!session ? (
                <Link
                  href="/auth/login"
                  className={`text-sm font-semibold transition-colors ${!isScrolled && isHomePage
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
                className="bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full px-6 font-bold shadow-none"
                onClick={() => void openCalendlyPopup()}
              >
                Book a Demo
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-black/5"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className={`w-7 h-7 transition-colors ${!isScrolled && isHomePage ? 'text-white' : 'text-theo-black'
                }`} />
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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white z-[101] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="relative w-32 h-10">
                    <Image
                      src="/logo.png"
                      alt="TheoLingua Logo"
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6 text-theo-black" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={isHomePage ? item.href : `/${item.href}`}
                      className="text-lg font-bold text-theo-black hover:text-theo-yellow py-3 border-b border-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-6 flex flex-col gap-4">
                  {!session ? (
                    <Link href="/auth/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center rounded-full font-bold h-12 text-base">
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <div className="px-2 pb-4">
                      <UserDropdown />
                    </div>
                  )}
                  <Button
                    type="button"
                    className="w-full bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full h-12 text-base font-bold shadow-lg shadow-theo-yellow/20"
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

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import BookDemo from '@/components/BookDemo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-theo-black text-white pt-24 pb-8 font-sans">
      <div className="container mx-auto px-6 max-w-7xl border-b border-white/10 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-12 lg:gap-8">

          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-5 pr-8">
            <Link href="/" className="inline-flex items-center mb-6">
              <div className="relative w-40 h-12">
                <Image
                  src="/logo.png"
                  alt="TheoLingua Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xl font-bold mb-4 text-white/90">Learn English to study Theology.</p>
            <p className="text-white/60 mb-8 leading-relaxed font-medium">An ESP program by ScioLabs &middot; CEFR-aligned &middot; Designed for theological students in India</p>
            <BookDemo>
              <Button className="bg-theo-yellow hover:bg-[#b0bd2a] text-theo-black rounded-full px-8 py-6 font-bold">
                Book a Free Demo
              </Button>
            </BookDemo>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-bold tracking-[0.15em] uppercase text-white/40 mb-6">Quick Links</h4>
            <ul className="space-y-4 font-medium text-white/80">
              <li><Link href="#about" className="hover:text-theo-yellow transition-colors">What is TheoLingua</Link></li>
              <li><Link href="#program" className="hover:text-theo-yellow transition-colors">The Program</Link></li>
              <li><Link href="#how-it-works" className="hover:text-theo-yellow transition-colors">How It Works</Link></li>
              <li><Link href="#institutions" className="hover:text-theo-yellow transition-colors">For Institutions</Link></li>
              <li><Link href="#testimonials" className="hover:text-theo-yellow transition-colors">Testimonials</Link></li>
              <li><Link href="#faq" className="hover:text-theo-yellow transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Resources + Legal */}
          <div className="md:col-span-4">
            <h4 className="text-sm font-bold tracking-[0.15em] uppercase text-white/40 mb-6">Resources & Legal</h4>
            <ul className="space-y-4 font-medium text-white/80">
              <li><Link href="#" className="hover:text-theo-yellow transition-colors">Download Brochure</Link></li>
              <li><Link href="/auth/login" className="hover:text-theo-yellow transition-colors">Student Portal (Sign In)</Link></li>
              <li><BookDemo><span className="hover:text-theo-yellow transition-colors cursor-pointer">Book a Demo</span></BookDemo></li>
              <li><Link href="mailto:info@sciolabs.in" className="hover:text-theo-yellow transition-colors">Contact Us</Link></li>
              <li className="pt-4"><Link href="/privacy" className="hover:text-theo-yellow transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-theo-yellow transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/refunds" className="hover:text-theo-yellow transition-colors text-sm">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/40 uppercase tracking-widest text-center md:text-left">
        <div>&copy; {currentYear} TheoLingua. All rights reserved. | Bible-based English Learning</div>
        <div>Powered by ScioLabs | Built by <a target='_blank' href='https://web.jabin.org'>Jabin Web</a></div>
      </div>
    </footer>
  );
}
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import BookDemo from '@/components/BookDemo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const policies = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Refund Policy', href: '/refund-policy' }
  ];

  const quickLinks = [
    { name: 'What is TheoLingua', href: '#hero' },
    { name: 'Features', href: '#features' },
    { name: 'Games', href: '#games' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  // const socialLinks = [
  //   { name: 'Facebook', icon: 'fab fa-facebook-f', href: '#' },
  //   { name: 'Twitter', icon: 'fab fa-twitter', href: '#' },
  //   { name: 'LinkedIn', icon: 'fab fa-linkedin-in', href: '#' },
  //   { name: 'Instagram', icon: 'fab fa-instagram', href: '#' }
  // ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-32 h-8 relative">
                <Image
                  src="/logo.png"
                  alt="TheoLingua Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bible-based English Learning for Theological Students. Integrating biblical texts and theological literature to enhance language skills and deepen understanding of the Bible.
            </p>
            
            {/* CTA Button */}
            <div className="pt-4">
              <BookDemo>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 w-full sm:w-auto">
                  Schedule Free Demo
                </Button>
              </BookDemo>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-base">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors block py-1">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-base">Legal & Policies</h3>
            <ul className="space-y-2 text-sm">
              {policies.map((policy) => (
                <li key={policy.name}>
                  <Link href={policy.href} className="text-gray-300 hover:text-white transition-colors block py-1">
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-base">Contact</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3 text-gray-300">
                <i className="fas fa-map-marker-alt w-4 h-4 mt-1 flex-shrink-0"></i>
                <div className="leading-relaxed">
                  <div>N-304, Ashiyana Sector – N</div>
                  <div>Lucknow – 226012, India</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <i className="fas fa-phone w-4 h-4 flex-shrink-0"></i>
                <span className="break-all">+91 9495212484</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <i className="fas fa-envelope w-4 h-4 flex-shrink-0"></i>
                <span className="break-all">info@sciolabs.in</span>
              </div>
            </div>

            {/* Social Links */}
            {/* <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
                    aria-label={social.name}
                  >
                    <i className={`${social.icon} w-5 h-5`}></i>
                  </Link>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
            <div className="text-gray-400 text-xs md:text-sm">
              © {currentYear} TheoLingua. All rights reserved. | Bible-Based English Learning
            </div>
            <div className="flex space-x-4 text-xs md:text-sm">
              <span className="text-gray-500">Powered by <Link href="https://sciolabs.in" target='_blank' className="text-gray-400 hover:text-white transition-colors">ScioLabs</Link> | Made with ❤️ by <Link href="https://web.jabin.org" target='_blank' className="text-gray-400 hover:text-white transition-colors">Jabin Web</Link></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
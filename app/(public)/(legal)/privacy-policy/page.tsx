import { Shield } from 'lucide-react';
import type { Metadata } from 'next';
import LegalPageHero from '@/components/legal/LegalPageHero';
import ContactSection from '@/components/legal/ContactSection';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for TheoLingua Bible-Based English Learning',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalPageHero
        title="Privacy Policy"
        description="Your privacy and data security are our top priorities at TheoLingua"
        icon={Shield}
        lastUpdated={new Date().toLocaleDateString()}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <ContactSection />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, such as when you create an account,
              enroll in our programs, or contact us for support.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Personal information (name, email address, phone number)</li>
              <li>Educational background and professional information</li>
              <li>Program enrollment and progress data</li>
              <li>Payment and billing information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide and improve our educational services</li>
              <li>Process enrollments and payments</li>
              <li>Send you important updates about your programs</li>
              <li>Respond to your questions and provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
           
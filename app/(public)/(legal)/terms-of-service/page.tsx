import { FileText } from 'lucide-react';
import type { Metadata } from 'next';
import LegalPageHero from '@/components/legal/LegalPageHero';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for TheoLingua Bible-Based English Learning',
};

export default function TermsOfServicePage() {
  return (
    <>
      <LegalPageHero
        title="Terms of Service"
        description="Please read these terms carefully before using our services"
        icon={FileText}
        lastUpdated={new Date().toLocaleDateString()}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using TheoLingua&apos;s services, you accept and agree to be bound by the
              terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily access and use our educational materials for
              personal, non-commercial transitory viewing only.
            </p>
            <p className="text-gray-700 mb-4">This license shall automatically terminate if you violate any of these restrictions.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Program Enrollment</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Students must provide accurate information during enrollment</li>
              <li>Program fees must be paid as per the agreed schedule</li>
              <li>Students are expected to actively participate in program activities</li>
              <li>Completion certificates are awarded based on program requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All course materials, including but not limited to text, graphics, logos, and software,
              are the property of TheoLingua and are protected by copyright laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              TheoLingua shall not be liable for any damages arising from the use or inability to use
              our services, even if we have been advised of the possibility of such damages.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
            
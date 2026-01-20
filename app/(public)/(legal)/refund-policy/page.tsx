import { DollarSign } from 'lucide-react';
import type { Metadata } from 'next';
import LegalPageHero from '@/components/legal/LegalPageHero';
import ContactSection from '@/components/legal/ContactSection';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund Policy for TheoLingua Bible-Based English Learning',
};

export default function RefundPolicyPage() {
  return (
    <>
      <LegalPageHero
        title="Refund Policy"
        description="Clear and fair refund terms for all our programs and services"
        icon={DollarSign}
        lastUpdated={new Date().toLocaleDateString()}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <ContactSection />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Eligibility</h2>
            <p className="text-gray-700 mb-4">
              We want you to be satisfied with our programs. Refunds may be available under the following conditions:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Request made within 7 days of program enrollment</li>
              <li>No more than 20% of program content has been accessed</li>
              <li>Valid reason for withdrawal is provided</li>
              <li>All program materials are returned in original condition</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Refundable Items</h2>
            <p className="text-gray-700 mb-4">The following are not eligible for refunds:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Programs completed beyond 20% of total duration</li>
              <li>Certification fees once certificates are issued</li>
              <li>Administrative and processing fees</li>
              <li>Downloadable materials that have been accessed</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Process</h2>
            <p className="text-gray-700 mb-4">To request a refund:</p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Contact us at info@sciolabs.in with your refund request</li>
              <li>Provide your enrollment details and reason for refund</li>
              <li>Our team will review your request within 5-7 business days</li>
              <li>If approved, refunds will be processed within 10-15 business days</li>
              <li>Refunds will be credited to the original payment method</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Program Transfers</h2>
            <p className="text-gray-700 mb-4">
              Instead of a refund, you may be eligible to transfer your enrollment to a different
              program or future batch, subject to availability and program compatibility.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Force Majeure</h2>
            <p className="text-gray-700 mb-4">
              In case of program cancellation due to circumstances beyond our control
              (natural disasters, pandemics, etc.), we will offer full refunds or program transfers.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
          
'use client';

import { use } from 'react';
import PaymentTroubleshoot from '@/components/payment/PaymentTroubleshoot';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentTroubleshootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/payments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to payments
          </Link>
        </Button>
      </div>
      <PaymentTroubleshoot paymentId={id} />
    </div>
  );
}

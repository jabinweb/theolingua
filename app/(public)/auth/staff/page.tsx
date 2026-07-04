'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { SignIn } from '@/components/auth/sign-in';
import { useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function StaffLoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(redirect);
    }
  }, [status, router, redirect]);

  if (status === 'loading' || status === 'authenticated') {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theo-white/50 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-theo-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-theo-black/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-theo-black rounded-[24px] flex items-center justify-center shadow-xl">
              <Image src="/logo.png" alt="TheoLingua" width={50} height={50} className="rounded-lg object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-theo-black tracking-tight mb-2">Staff Sign In</h1>
          <p className="text-gray-500 font-medium text-sm">
            For teachers, moderators, and admins — use your email and password
          </p>
        </div>

        <SignIn
          callbackUrl={redirect}
          title="Staff Sign In"
          showGoogleAuth={false}
          showEmailAuth={true}
          allowRegistration={false}
          defaultMode="signin"
        />

        <div className="text-center space-y-2 pt-2">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-theo-black hover:text-theo-yellow transition-colors"
          >
            Student login (Google)
          </Link>
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-theo-black transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StaffLoginForm />
    </Suspense>
  );
}

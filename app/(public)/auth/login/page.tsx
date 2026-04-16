'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { SignIn } from '@/components/auth/sign-in';
import { useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(redirect);
    }
  }, [status, router, redirect]);

  // Show loading while checking auth state
  if (status === 'loading') {
    return <LoadingScreen />;
  }

  // Don't render login form if user is already authenticated
  if (status === 'authenticated') {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theo-white/50 p-4 relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-theo-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-theo-black/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-theo-black rounded-[24px] flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image
                src="/logo.png"
                alt="TheoLingua"
                width={50}
                height={50}
                className="rounded-lg object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-theo-black tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-medium">
            Continue your language excellence journey
          </p>
        </div>

        {/* Sign In Component */}
        <SignIn 
          callbackUrl={redirect} 
          title="Sign In"
          showGoogleAuth={true}
          showEmailAuth={true}
        />

        {/* Back to Home */}
        <div className="text-center pt-2">
          <Link 
            href="/"
            className="text-sm font-bold text-theo-black hover:text-theo-yellow transition-colors inline-flex items-center gap-2"
          >
            <span className="text-lg">←</span> Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginForm />
    </Suspense>
  );
}
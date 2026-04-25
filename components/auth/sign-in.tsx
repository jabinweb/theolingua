'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SignInProps {
  callbackUrl?: string;
  title?: string;
  showGoogleAuth?: boolean;
  showEmailAuth?: boolean;
  allowRegistration?: boolean;
  defaultMode?: 'signin' | 'signup';
}

export function SignIn({ 
  callbackUrl = "/dashboard", 
  title = "Sign In",
  showGoogleAuth = true,
  showEmailAuth = true,
  allowRegistration = true,
  defaultMode = 'signin',
}: SignInProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { callbackUrl });
    } catch (error: unknown) {
      console.error('Google Sign-in Error:', error);
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle Sign Up
    if (isSignUp) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create account
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Failed to create account');
          return;
        }
        
        // Auto sign in after registration
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl,
          redirect: false
        });

        if (result?.error) {
          setError('Account created but sign-in failed. Please try signing in manually.');
        } else {
          window.location.href = callbackUrl;
        }
      } catch (error: unknown) {
        console.error('Registration Error:', error);
        setError('Failed to create account. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Handle Sign In
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // successful sign in will redirect client-side if redirect is true
        window.location.href = callbackUrl;
      }
    } catch (error: unknown) {
      console.error('Credentials Sign-in Error:', error);
      setError('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">{isSignUp ? 'Create Account' : title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showGoogleAuth && (
          <>
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full border-gray-200 hover:bg-gray-50 h-11"
            >
              <div className="relative w-5 h-5 mr-2">
                <Image 
                  src="/google.svg" 
                  alt="Google"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-semibold">{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </Button>
            
            {showEmailAuth && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                  <span className="px-4 bg-white text-gray-400">Or continue with email</span>
                </div>
              </div>
            )}
          </>
        )}

        {showEmailAuth && (
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-gray-50/50 border-gray-100"
                />
              </div>
            )}
            
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-gray-50/50 border-gray-100"
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Create a password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 6 : undefined}
                className="h-11 rounded-xl bg-gray-50/50 border-gray-100 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm font-bold text-theo-black hover:text-theo-yellow transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

            <Button type="submit" variant="theo" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isSignUp ? 'Create Account' : 'Sign in'}
            </Button>

            {allowRegistration && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            )}

            <p className="text-xs text-gray-600 text-center">
              {isSignUp 
                ? 'Or sign up with Google for instant access' 
                : 'New user? Sign up with Google to create an account automatically'}
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default SignIn;
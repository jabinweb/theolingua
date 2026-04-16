'use client';

// Type declarations for Cashfree SDK
declare module '@cashfreepayments/cashfree-js' {
  export function load(config: {
    mode: 'sandbox' | 'production';
  }): Promise<{
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget: string;
    }) => Promise<{
      error?: { message: string };
      paymentDetails?: {
        paymentId?: string;
        orderId?: string;
        status?: string;
        amount?: number;
        currency?: string;
      };
      redirect?: boolean;
    }>;
  }>;
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, BookOpen, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loadRazorpay } from '@/lib/razorpay';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentError {
  message?: string;
  code?: string;
  description?: string;
}

declare global {
  interface Window {
    Cashfree: {
      checkout: (options: { paymentSessionId: string; redirectTarget: string }) => Promise<{
        error?: { message: string };
        paymentDetails?: {
          paymentId?: string;
          orderId?: string;
          status?: string;
          amount?: number;
          currency?: string;
        };
        redirect?: boolean;
      }>;
    };
  }
}

interface Unit {
  id: string;
  name: string;
  icon: string;
  color: string;
  price?: number; // Price in paisa
  currency?: string; // Currency (INR, USD, etc.)
  isSubscribed?: boolean; // Whether user already has this subject
  subscriptionType?: 'school' | 'class_subscription' | 'subject_subscription'; // How they have access
  chapters: Array<{
    id: string;
    name: string;
    topics: Array<{ id: string; name: string; }>;
  }>;
}

interface ClassData {
  id: number;
  name: string;
  slug?: string;
  description: string;
  price: number;
  currency?: string; // Currency (INR, USD, etc.)
  subjects: Unit[];
}

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  classData: ClassData;
  onSubscribe: (type: 'program', options: { classId?: number; amount: number }) => void;
  disableAutoRedirect?: boolean; // Optional prop to disable automatic redirection
}

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  open,
  onClose,
  classData,
  onSubscribe,
  disableAutoRedirect = false
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    show: boolean;
    type: 'program';
    details?: {
      classId?: string;
      subjectId?: string;
      amount?: number;
      subscriptionName?: string;
    };
  }>({ show: false, type: 'program' });
  
  // Check if user has program subscription (all subjects subscribed via class_subscription)
  const hasProgramSubscription = classData.subjects.length > 0 && classData.subjects.every(subject => 
    subject.isSubscribed && subject.subscriptionType === 'class_subscription'
  );
  
  // Pricing plans from database
  interface PricingPlan {
    id: string;
    name: string;
    durationMonths: number;
    price: number;
    originalPrice: number | null;
    discount: number | null;
    isPopular: boolean;
    features: string[];
    workbookPrice: number | null;
    workbookNote: string | null;
  }
  
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  
  // Check if this program has custom pricing plans
  const hasCustomPricing = pricingPlans.length > 0;
  
  // Duration selection for programs with custom pricing
  const [selectedDuration, setSelectedDuration] = useState<number>(6); // Default to 6 months
  
  // Workbook selection
  const [includeWorkbook, setIncludeWorkbook] = useState(false);
  
  // Fetch pricing plans from database
  useEffect(() => {
    const fetchPricing = async () => {
      if (!classData.id) return;
      
      try {
        setIsPricingLoading(true);
        const res = await fetch(`/api/programs/pricing?classId=${classData.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hasCustomPricing && data.plans.length > 0) {
            setPricingPlans(data.plans);
            // Set default to popular plan or middle option
            const popularPlan = data.plans.find((p: PricingPlan) => p.isPopular);
            if (popularPlan) {
              setSelectedDuration(popularPlan.durationMonths);
            } else if (data.plans.length > 0) {
              // Default to middle plan if exists
              const middleIndex = Math.floor(data.plans.length / 2);
              setSelectedDuration(data.plans[middleIndex].durationMonths);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setIsPricingLoading(false);
      }
    };
    
    if (open) {
      fetchPricing();
    }
  }, [classData.id, open]);
  
  // Get price for selected duration from database plans
  const getSelectedPlanPrice = () => {
    if (!hasCustomPricing) {
      return classData.price; // Return default class price
    }
    const plan = pricingPlans.find(p => p.durationMonths === selectedDuration);
    return plan?.price || classData.price;
  };
  
  // Get workbook price for selected plan
  const getWorkbookPrice = () => {
    if (!hasCustomPricing || !includeWorkbook) {
      return 0;
    }
    const plan = pricingPlans.find(p => p.durationMonths === selectedDuration);
    return plan?.workbookPrice || 0;
  };
  
  // Get total price including workbook
  const getTotalPrice = () => {
    return getSelectedPlanPrice() + getWorkbookPrice();
  };
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  
  // Auto-close dialog after successful payment
  useEffect(() => {
    if (paymentSuccess.show) {
      const timer = setTimeout(() => {
        setPaymentSuccess({ show: false, type: 'program' });
        // Only auto-close if not handled by parent (dashboard will handle its own closing)
        if (disableAutoRedirect) {
          // Let parent handle closing timing
        } else {
          onClose();
        }
      }, 3000); // Close after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess.show, onClose, disableAutoRedirect]);

  // Handle login redirect
  const handleLoginRequired = () => {
    // Store subscription intent for after login
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingSubscription', JSON.stringify({
        timestamp: Date.now(),
        classId: classData.id,
        returnUrl: window.location.href
      }));
    }
    
    // Close the dialog and redirect to login
    onClose();
    signIn('google', { 
      callbackUrl: window.location.href // Return to current page after login
    });
  };

  // Calculate price based on whether we have custom pricing plans
  const classPrice = hasCustomPricing 
    ? getSelectedPlanPrice() / 100 
    : classData.price / 100; // Convert from paisa to rupees

  // Helper function to handle payment errors gracefully
  const handlePaymentError = (error: PaymentError | Error | unknown, context: string) => {
    console.log(`Payment ${context}:`, error);
    setIsProcessingPayment(false);
    setIsProcessing(false);
    
    let message = 'Payment failed. Please try again.';
    
    // Handle error message extraction with proper type checking
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('user dropped') || errorMsg.includes('user closed') || errorMsg.includes('cancelled') || errorMsg.includes('aborted')) {
          message = 'Payment was cancelled. You can try again whenever you\'re ready.';
        } else if (errorMsg.includes('failed') || errorMsg.includes('declined') || errorMsg.includes('insufficient')) {
          message = 'Payment was declined. Please check your payment details and try again.';
        } else if (errorMsg.includes('timeout') || errorMsg.includes('network')) {
          message = 'Payment timed out due to network issues. Please check your connection and try again.';
        } else if (errorMsg.includes('flagged')) {
          message = 'Payment was flagged for security review. Please contact support if this persists.';
        }
      }
      
      // Handle Razorpay error states
      if ('code' in error && typeof error.code === 'string') {
        switch (error.code) {
          case 'PAYMENT_CANCELLED':
            message = 'Payment was cancelled. You can try again whenever you\'re ready.';
            break;
          case 'PAYMENT_FAILED':
            message = 'Payment failed. Please try a different payment method.';
            break;
          case 'NETWORK_ERROR':
            message = 'Network error occurred. Please check your connection and try again.';
            break;
          default:
            if ('description' in error && typeof error.description === 'string') {
              message = error.description;
            }
        }
      }
    }
    
    // Show error message in console for debugging
    console.error(`Payment Error (${context}): ${message}`);
    
    // Could add toast notification here instead of state management
    // For now, the error is logged and UI state is reset
  };

  const handleClassSubscribe = async () => {
    // Check if user is logged in first
    if (!user) {
      handleLoginRequired();
      return;
    }
    
    setIsProcessing(true);
    
    // Price is calculated in the API based on duration
    
    try {
      // Call the existing class payment API with duration for custom pricing
      const requestBody: Record<string, unknown> = {
        classId: classData.id,
        userId: user.id
      };
      
      // Add duration for programs with custom pricing plans
      if (hasCustomPricing) {
        requestBody.durationMonths = selectedDuration;
        requestBody.planName = `${classData.name} - ${selectedDuration} Month Access`;
        requestBody.amount = getTotalPrice(); // Pass total price including workbook
        requestBody.includeWorkbook = includeWorkbook;
      }
      
      const response = await fetch('/api/payment/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const orderData = await response.json();
      if (!response.ok) {
        // Handle already-subscribed case gracefully (avoid throwing and console error)
        if (orderData && typeof orderData.error === 'string' && orderData.error.toLowerCase().includes('already subscribed')) {
          const message = `You already have an active subscription to this class! 
          
If you're still seeing limited access, please:
1. Refresh the page to update your access status
2. Log out and log back in
3. Contact support if the issue persists

Would you like to refresh the page now?`;

          if (confirm(message)) {
            window.location.reload();
          }
          onClose();
          return; // Return early instead of throwing
        }

        throw new Error(orderData.error);
      }
      
      // Handle different payment gateways
      if (orderData.gateway === 'CASHFREE') {
        // Handle Cashfree payment using JS SDK
        if (!window.Cashfree) {
          // Initialize Cashfree SDK if not loaded
          const { load } = await import('@cashfreepayments/cashfree-js');
          window.Cashfree = await load({
            mode: orderData.environment === 'production' ? 'production' : 'sandbox'
          });
        }
        
        console.log('[info] Cashfree class payment checkout with:', {
          environment: orderData.environment,
          hasPaymentSessionId: !!orderData.payment_session_id,
          paymentSessionIdLength: orderData.payment_session_id?.length
        });
        
        const checkoutOptions = {
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: "_modal",
        };
        
        const result = await window.Cashfree.checkout(checkoutOptions);
        
        if (result.error) {
          handlePaymentError(result.error, 'Cashfree checkout error or user cancelled');
          return; // Exit gracefully instead of throwing
        }
        
        if (result.paymentDetails) {
          setIsProcessingPayment(true);
          
          // Verify Cashfree payment using unified verification
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderData.orderId,
              orderId: orderData.orderId,
              gateway: 'CASHFREE',
              paymentDetails: result.paymentDetails,
              metadata: {
                type: 'class_subscription',
                classId: classData.id,
                userId: user.id
              }
            })
          });
          
          if (verifyResponse.ok) {
            // Clear processing state first
            setIsProcessingPayment(false);
            
            // Show success message instead of immediate redirect
            setPaymentSuccess({
              show: true,
              type: 'program',
              details: {
                classId: classData.id.toString(),
                amount: classData.price,
                subscriptionName: `${classData.name} - Full Access`
              }
            });
            
            // Call onSubscribe immediately to update parent state
            onSubscribe('program', { classId: classData.id, amount: getTotalPrice() });
            
            // Handle redirect after success message is shown (if not disabled)
            if (!disableAutoRedirect) {
              setTimeout(() => {
                router.push(`/dashboard/class/${classData.id}`);
              }, 3500); // Wait for dialog to close first
            }
          } else {
            setIsProcessingPayment(false);
            throw new Error('Payment verification failed');
          }
        }
        
      } else {
        // Handle Razorpay payment (default)
        if (!window.Razorpay) {
          // Load Razorpay script dynamically
          const loaded = await loadRazorpay();
          if (!loaded || !window.Razorpay) {
            throw new Error('Payment system not available. Please refresh the page and try again.');
          }
        }
        
        // Initialize Razorpay payment
        const workbookPrice = getWorkbookPrice();
        const subscriptionDescription = hasCustomPricing 
          ? `${classData.name} - ${selectedDuration} Month Access`
          : `${classData.name} - Full Access`;
        const fullDescription = workbookPrice > 0
          ? `${subscriptionDescription} + Workbook`
          : subscriptionDescription;
        
        const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Scio Labs',
        description: fullDescription,
        order_id: orderData.orderId,
        handler: async (paymentResponse: RazorpayResponse) => {
          setIsProcessingPayment(true);
          
          // Verify payment using unified verification
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderData.orderId,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              metadata: {
                type: 'class_subscription',
                classId: classData.id,
                userId: user.id,
                ...(hasCustomPricing && {
                  durationMonths: selectedDuration,
                  planName: `${classData.name} - ${selectedDuration} Month Access`
                })
              }
            })
          });
          
          if (verifyResponse.ok) {
            // Clear processing state first
            setIsProcessingPayment(false);
            
            // Show success message instead of immediate redirect
            setPaymentSuccess({
              show: true,
              type: 'program',
              details: {
                classId: classData.id.toString(),
                amount: getSelectedPlanPrice(),
                subscriptionName: hasCustomPricing 
                  ? `${classData.name} - ${selectedDuration} Month Access`
                  : `${classData.name} - Full Access`
              }
            });
            
            onSubscribe('program', { classId: classData.id, amount: getTotalPrice() });
            
            // Delayed redirect with success message
            if (!disableAutoRedirect) {
              setTimeout(() => {
                router.push(`/dashboard/class/${classData.id}`);
              }, 3000); // Increased to 3 seconds to show success message
            }
          } else {
            setIsProcessingPayment(false);
            setIsRazorpayOpen(false);
          }
        },
        prefill: {
          name: user.name || user.email?.split('@')[0] || '',
          email: user.email || ''
        },
        theme: { color: '#3B82F6' },
        modal: {
          ondismiss: () => {
            setIsRazorpayOpen(false);
            setIsProcessing(false);
          }
        }
      });
      
      setIsRazorpayOpen(true);
      razorpay.open();
      } // Close else block for Razorpay payment
    } catch (error) {
      setIsRazorpayOpen(false);
      console.error('Payment error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Already subscribed')) {
          // Show a more helpful message to the user
          const message = `You already have an active subscription to this class! 
          
If you're still seeing limited access, please:
1. Refresh the page to update your access status
2. Log out and log back in
3. Contact support if the issue persists

Would you like to refresh the page now?`;
          
          if (confirm(message)) {
            window.location.reload();
          }
          onClose();
        } else {
          // Provide more helpful error messages based on error type
          let context = 'class subscription';
          
          if (error.message.includes('Network error') || error.message.includes('fetch failed')) {
            context = 'Network connection issue. Please check your internet connection and try again.';
          } else if (error.message.includes('timeout')) {
            context = 'Request timed out. Please check your connection and try again.';
          } else if (error.message.includes('credentials not configured')) {
            context = 'Payment gateway configuration issue. Please contact support.';
          } else if (error.message.includes('DNS resolution')) {
            context = 'Unable to connect to payment service. Please check your internet connection.';
          } else if (error.message.includes('Invalid Cashfree')) {
            context = 'Payment gateway configuration error. Please contact support.';
          }
          
          handlePaymentError(error, context);
        }
      } else {
        handlePaymentError(error, 'class subscription - unknown error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const totalTopics = classData.subjects.reduce((acc, subject) => 
    acc + subject.chapters.reduce((chAcc, chapter) => chAcc + chapter.topics.length, 0), 0
  );

  // Completely unmount dialog when Razorpay modal is open
  if (isRazorpayOpen) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!fixed !inset-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-screen !m-0 !rounded-none overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-6 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-theo-black">
            <div className="p-2 bg-theo-yellow rounded-xl shadow-[0_0_15px_rgba(200,216,50,0.3)]">
              <BookOpen className="h-6 w-6 text-theo-black" />
            </div>
            Subscribe to {classData.name}
          </DialogTitle>
        </DialogHeader>

        <div className="max-w-4xl mx-auto w-full py-4">

        {/* Payment Success Message */}
        {paymentSuccess.show && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">Payment Successful!</h3>
                <p className="text-sm text-green-700">
                  Your subscription has been activated successfully.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPaymentSuccess({ show: false, type: 'program' });
                  onClose();
                }}
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                ✕
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h4 className="font-medium text-gray-900 mb-2">Subscription Details:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Service:</span> {paymentSuccess.details?.subscriptionName}</p>
                <p><span className="font-medium">Amount:</span> ₹{((paymentSuccess.details?.amount || 0) / 100).toFixed(2)}</p>
                <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Active</span></p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
              <span>Closing this dialog in a few seconds...</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Login Notice for Guest Users */}
        {!user && !paymentSuccess.show && (
          <div className="bg-theo-yellow/10 border border-theo-yellow/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <div className="p-2 bg-theo-yellow rounded-xl">
              <LogIn className="h-5 w-5 text-theo-black" />
            </div>
            <div>
              <h4 className="font-bold text-theo-black">Login Required</h4>
              <p className="text-sm text-theo-black/70">
                Please login to subscribe and access premium content. We&apos;ll bring you back here after login.
              </p>
            </div>
          </div>
        )}

        {/* Main subscription content - hide when showing success message */}
        {!paymentSuccess.show && (
        <>
        <div className="space-y-4">
            {hasProgramSubscription ? (
              // User already has program subscription
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Program Access Active
                    </span>
                    <Badge className="bg-green-600 text-white">Subscribed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">You have full access!</div>
                    <div className="text-sm text-green-600">Enjoy all content in this program</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Access to all {classData.subjects.length} subjects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{totalTopics} interactive topics and exercises</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Unlimited access and progress tracking</span>
                    </div>
                  </div>

                  <Button 
                    onClick={onClose}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // User doesn't have program subscription - show subscription option
              <Card className="border-theo-black bg-theo-black text-white rounded-[32px] overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-theo-yellow" />
                      Complete Program Access
                    </span>
                    <Badge className="bg-theo-yellow text-theo-black hover:bg-theo-yellow border-0 font-bold uppercase tracking-widest text-[10px]">Best Value</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Duration Selection for programs with custom pricing */}
                  {hasCustomPricing && !isPricingLoading && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">Choose your plan duration:</div>
                    <div className="grid grid-cols-3 gap-3">
                        {pricingPlans.map((plan) => {
                          const price = plan.price / 100;
                          const isSelected = selectedDuration === plan.durationMonths;
                          const monthlyPrice = Math.round(price / plan.durationMonths);
                          return (
                            <button
                              key={plan.id}
                              onClick={() => setSelectedDuration(plan.durationMonths)}
                              className={`p-4 rounded-2xl border-2 transition-all group ${
                                isSelected 
                                  ? 'border-theo-yellow bg-theo-yellow/10 shadow-[0_0_20px_rgba(200,216,50,0.15)]' 
                                  : 'border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className={`text-sm font-bold uppercase tracking-wider ${isSelected ? 'text-theo-yellow' : 'text-white/40'}`}>
                                {plan.durationMonths} Months
                              </div>
                              <div className={`text-3xl font-bold mt-1 ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                ₹{price}
                              </div>
                              <div className="text-[10px] text-white/40 mt-1">
                                ₹{monthlyPrice}/mo
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Price display for programs without custom pricing */}
                  {!hasCustomPricing && !isPricingLoading && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-700">₹{classPrice}</div>
                      <div className="text-sm text-blue-600">One-time payment</div>
                    </div>
                  )}
                  
                  {/* Selected plan summary for programs with custom pricing */}
                  {hasCustomPricing && !isPricingLoading && (
                    <>
                      <div className="text-center p-3 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">₹{classPrice}</div>
                        <div className="text-sm text-blue-600">{selectedDuration} month access</div>
                      </div>
                      
                      {/* Optional Workbook */}
                      {pricingPlans.find(p => p.durationMonths === selectedDuration)?.workbookPrice && (
                        <div className="border-t border-gray-200 pt-3">
                          <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            Optional Workbook
                          </h4>
                          <Button
                            variant={includeWorkbook ? 'default' : 'outline'}
                            onClick={() => setIncludeWorkbook(!includeWorkbook)}
                            className={`w-full justify-between py-3 px-4 h-auto ${includeWorkbook ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90' : 'hover:bg-gray-50'}`}
                          >
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              <div className="text-left">
                                <div className={`text-sm font-medium ${includeWorkbook ? 'text-white' : 'text-gray-900'}`}>
                                  Physical Workbook
                                </div>
                                <div className={`text-xs ${includeWorkbook ? 'text-white/90' : 'text-gray-600'}`}>
                                  {pricingPlans.find(p => p.durationMonths === selectedDuration)?.workbookNote || 'Printing + Shipping'}
                                </div>
                              </div>
                            </span>
                            <span className={`text-lg font-bold ${includeWorkbook ? 'text-white' : 'text-orange-600'}`}>
                              {includeWorkbook ? '✓ ' : ''}₹{((pricingPlans.find(p => p.durationMonths === selectedDuration)?.workbookPrice || 0) / 100).toFixed(0)}
                            </span>
                          </Button>
                        </div>
                      )}
                      
                      {/* Total price display when workbook is included */}
                      {hasCustomPricing && includeWorkbook && getWorkbookPrice() > 0 && (
                        <div className="border-t-2 border-gray-300 pt-3 mt-2">
                          <div className="flex items-center justify-between text-lg font-bold">
                            <span className="text-gray-900">Total Amount:</span>
                            <span className="text-blue-700">₹{(getTotalPrice() / 100).toFixed(0)}</span>
                          </div>
                          <div className="text-xs text-gray-500 text-right mt-1">
                            Subscription (₹{classPrice}) + Workbook (₹{(getWorkbookPrice() / 100).toFixed(0)})
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Loading state */}
                  {isPricingLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading pricing...</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Access to all {classData.subjects.length} subjects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{totalTopics} interactive topics and exercises</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Unlimited access and progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Future content updates included</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-gray-600 mb-2">What you get:</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{classData.subjects.length}</div>
                        <div className="text-xs text-gray-500">Units</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{classData.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}</div>
                        <div className="text-xs text-gray-500">Chapters</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{totalTopics}</div>
                        <div className="text-xs text-gray-500">Activities</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleClassSubscribe}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                  >
                    {!user ? (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login to Subscribe - ₹{(getTotalPrice() / 100).toFixed(0)}
                      </span>
                    ) : isProcessing ? (
                      'Processing...'
                    ) : (
                      `Subscribe for ₹${(getTotalPrice() / 100).toFixed(0)}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          
          {!user ? (
            <Button onClick={handleLoginRequired} className="bg-green-600 hover:bg-green-700">
              <LogIn className="h-4 w-4 mr-2" />
              Login to Subscribe
            </Button>
          ) : null}
        </div>
        </>
        )}
        </div>
        
        {/* Processing overlay */}
        {isProcessingPayment && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment...</h3>
              <p className="text-gray-600">Please wait while we process your payment and redirect you.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;

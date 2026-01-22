'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Package, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loadRazorpay } from '@/lib/razorpay';

interface ComboPricingPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  workbookPrice: number;
  workbookNote?: string;
  comboDiscount: number;
}

interface ComboSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  basicsProgram: {
    id: number;
    name: string;
    plans: ComboPricingPlan[];
  };
  advancedProgram: {
    id: number;
    name: string;
    plans: ComboPricingPlan[];
  };
  selectedDuration?: number;
}

export default function ComboSubscriptionDialog({
  isOpen,
  onClose,
  basicsProgram,
  advancedProgram,
  selectedDuration = 3,
}: ComboSubscriptionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(selectedDuration);
  const [includeWorkbooks, setIncludeWorkbooks] = useState(false);

  // Sync duration with selectedDuration prop when dialog opens with different duration
  useEffect(() => {
    if (isOpen) {
      setDuration(selectedDuration);
    }
  }, [isOpen, selectedDuration]);

  // Use useMemo to ensure calculations update when duration or workbook selection changes
  const { basicsPlan, advancedPlan, prices } = useMemo(() => {
    const basics = basicsProgram.plans.find(p => p.durationMonths === duration);
    const advanced = advancedProgram.plans.find(p => p.durationMonths === duration);

    if (!basics || !advanced) {
      return { basicsPlan: null, advancedPlan: null, prices: null };
    }

    const basicsWorkbook = includeWorkbooks ? (basics.workbookPrice || 0) : 0;
    const advancedWorkbook = includeWorkbooks ? (advanced.workbookPrice || 0) : 0;
    const basicsTotal = basics.price + basicsWorkbook;
    const advancedTotal = advanced.price + advancedWorkbook;
    const originalTotal = basicsTotal + advancedTotal;
    const comboDiscount = basics.comboDiscount || 0;
    const discountAmount = Math.round(originalTotal * (comboDiscount / 100));
    const finalTotal = originalTotal - discountAmount;

    return {
      basicsPlan: basics,
      advancedPlan: advanced,
      prices: {
        basicsTotal,
        advancedTotal,
        originalTotal,
        comboDiscount,
        discountAmount,
        finalTotal,
        basicsWorkbook,
        advancedWorkbook,
      },
    };
  }, [duration, includeWorkbooks, basicsProgram.plans, advancedProgram.plans]);

  if (!basicsPlan || !advancedPlan || !prices) {
    return null;
  }

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // Create combo payment order
      const response = await fetch('/api/payment/combo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basicsClassId: basicsProgram.id,
          advancedClassId: advancedProgram.id,
          durationMonths: duration,
          gateway: 'RAZORPAY',
          includeWorkbooks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const data = await response.json();
      const { order } = data;

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const loaded = await loadRazorpay();
        if (!loaded || !window.Razorpay) {
          throw new Error('Payment system not available. Please refresh the page and try again.');
        }
      }

      // Initialize Razorpay payment
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'TheoLingua',
        description: `${basicsProgram.name} + ${advancedProgram.name} - ${duration} Months`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                metadata: order.metadata,
              }),
            });

            if (verifyResponse.ok) {
              alert('Payment successful! Your subscriptions are now active.');
              onClose();
              router.refresh();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: order.metadata?.userName || '',
          email: order.metadata?.userEmail || '',
        },
        theme: {
          color: '#f97316',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" key={duration}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            <div className="flex items-center gap-2">
              <span>Complete CareBridge Package</span>
              <Badge className="bg-orange-600 text-white">Save {prices.comboDiscount}%</Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Get both Basics and Advanced programs with exclusive discount
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Duration Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {basicsProgram.plans.map((plan) => (
                <Button
                  key={plan.durationMonths}
                  variant={duration === plan.durationMonths ? 'default' : 'outline'}
                  onClick={() => setDuration(plan.durationMonths)}
                  className={duration === plan.durationMonths ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  {plan.name}
                </Button>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Check className="text-green-600" size={20} />
              What's Included
            </h3>
            <div className="space-y-4">
              {/* Basics Program */}
              <div className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="flex items-start gap-3">
                  <BookOpen className="text-orange-600 mt-1" size={20} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{basicsProgram.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Complete access for {duration} months
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Subscription</span>
                      <span className="font-medium">₹{(basicsPlan.price / 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Program */}
              <div className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="flex items-start gap-3">
                  <BookOpen className="text-red-600 mt-1" size={20} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{advancedProgram.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Complete access for {duration} months
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Subscription</span>
                      <span className="font-medium">₹{(advancedPlan.price / 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Workbooks */}
          {(basicsPlan.workbookPrice > 0 || advancedPlan.workbookPrice > 0) && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
                Optional Workbooks
              </h4>
              <Button
                variant={includeWorkbooks ? 'default' : 'outline'}
                onClick={() => setIncludeWorkbooks(!includeWorkbooks)}
                className={`w-full justify-between py-4 px-4 h-auto ${includeWorkbooks ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90' : 'hover:bg-gray-50'}`}
              >
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <div className="text-left">
                    <div className={`text-sm font-medium ${includeWorkbooks ? 'text-white' : 'text-gray-900'}`}>
                      Physical Workbooks (Both Programs)
                    </div>
                    <div className={`text-xs ${includeWorkbooks ? 'text-white/90' : 'text-gray-600'}`}>
                      {basicsPlan.workbookNote || 'Printing + Shipping'}
                    </div>
                  </div>
                </span>
                <span className={`text-lg font-bold ${includeWorkbooks ? 'text-white' : 'text-orange-600'}`}>
                  {includeWorkbooks ? '✓ ' : ''}₹{(((basicsPlan.workbookPrice || 0) + (advancedPlan.workbookPrice || 0)) / 100).toFixed(0)}
                </span>
              </Button>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subscriptions Total</span>
              <span>₹{((basicsPlan.price + advancedPlan.price) / 100).toFixed(0)}</span>
            </div>
            {includeWorkbooks && (prices.basicsWorkbook > 0 || prices.advancedWorkbook > 0) && (
              <div className="flex justify-between text-gray-600">
                <span>Workbooks (2)</span>
                <span>₹{((prices.basicsWorkbook + prices.advancedWorkbook) / 100).toFixed(0)}</span>
              </div>
            )}
            {prices.comboDiscount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Combo Discount ({prices.comboDiscount}%)</span>
                <span>-₹{(prices.discountAmount / 100).toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-2 border-t-2">
              <span>Final Amount</span>
              <span className="text-orange-600">₹{(prices.finalTotal / 100).toFixed(0)}</span>
            </div>
            <p className="text-xs text-gray-500 text-right">All prices inclusive of GST</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ₹{(prices.finalTotal / 100).toFixed(0)}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

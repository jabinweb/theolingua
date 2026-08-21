'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Lock, Star, ArrowRight, Zap, Gift, Calendar, CreditCard, Info, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { SubscriptionDialog } from './SubscriptionDialog';

interface UnitAccess {
  id: string;
  name: string;
  hasAccess: boolean;
  accessType: 'school' | 'class_subscription' | 'subject_subscription' | 'free_trial' | 'none';
  price?: number;
  currency?: string;
  canUpgrade?: boolean;
  accessibleChapters?: string[];
}

interface ProgramAccessData {
  classId: number;
  className: string;
  classPrice: number;
  hasFullAccess: boolean;
  accessType: string;
  subjectAccess: UnitAccess[];
  canUpgradeToProgram: boolean;
  upgradeOptions?: {
    currentUnits: string[];
    classPrice: number;
    potentialSavings: number;
  };
  subscriptionDetails?: {
    id: string;
    planType: string;
    startDate: string;
    endDate: string;
    status: string;
    durationMonths?: number;
  };
}

interface PricingPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  isPopular: boolean;
  features: string[];
}

interface SubscribeOptions {
  subjectId?: string; // Database field name
  unitId?: string; // Alias for subjectId (UI terminology)
  classId?: number;
  fromUnits?: string[];
  toProgramId?: number;
  savings?: number;
}

interface ProgramSubscriptionManagerProps {
  classId: number;
  open: boolean;
  onClose: () => void;
  onSubscribe?: (type: 'subject' | 'unit' | 'class' | 'upgrade', options?: SubscribeOptions) => void;
}

export const ProgramSubscriptionManager: React.FC<ProgramSubscriptionManagerProps> = ({
  classId,
  open,
  onClose,
  onSubscribe
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [accessData, setAccessData] = useState<ProgramAccessData | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPlanAction, setSelectedPlanAction] = useState<'extend' | 'upgrade' | 'downgrade' | 'new'>('new');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Fetch pricing plans
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        const response = await fetch(`/api/programs/pricing?classId=${classId}`);
        const data = await response.json();
        if (response.ok && data.plans) {
          setPricingPlans(data.plans);
        }
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
      }
    };
    
    if (open) {
      fetchPricingPlans();
    }
  }, [classId, open]);

  useEffect(() => {
    const fetchAccessData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        // Use programs API which supports both numeric IDs and slugs
        const response = await fetch(`/api/programs/${classId}/access?userId=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch access data');
        }

        // Transform API response to match expected format
        // API returns unitAccess, we need subjectAccess
        setAccessData({
          classId: data.classId,
          className: data.className,
          classPrice: data.classPrice,
          hasFullAccess: data.hasFullAccess,
          accessType: data.accessType,
          subjectAccess: data.unitAccess || [], // Map unitAccess to subjectAccess
          canUpgradeToProgram: data.canUpgradeToClass,
          upgradeOptions: data.upgradeOptions ? {
            currentUnits: data.upgradeOptions.currentSubjects || [],
            classPrice: data.upgradeOptions.classPrice,
            potentialSavings: data.upgradeOptions.potentialSavings
          } : undefined,
          subscriptionDetails: data.subscriptionDetails || undefined
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessData();
  }, [user?.id, classId]);

  const handleUnitSubscribe = (subjectId: string) => {
    setSelectedUnitId(subjectId);
    setSelectedPlanAction('new');
    setShowSubscriptionDialog(true);
  };

  const handleProgramSubscribe = () => {
    setSelectedUnitId(null);
    setSelectedPlanAction('new');
    setShowSubscriptionDialog(true);
  };

  const handleUpgradeToProgram = () => {
    setSelectedUnitId(null);
    setSelectedPlanAction('upgrade');
    setShowSubscriptionDialog(true);
  };

  const handleExtendSubscription = () => {
    setSelectedUnitId(null);
    setSelectedPlanAction('extend');
    setShowSubscriptionDialog(true);
  };

  const handleChangePlan = (action: 'upgrade' | 'downgrade') => {
    setSelectedUnitId(null);
    setSelectedPlanAction(action);
    setShowSubscriptionDialog(true);
  };

  // Get current plan duration from subscription
  const getCurrentPlanDuration = (): number | null => {
    if (!accessData?.subscriptionDetails) return null;
    
    // Try to extract duration from planType or calculate from dates
    const planType = accessData.subscriptionDetails.planType?.toLowerCase() || '';
    if (planType.includes('3') || planType.includes('three')) return 3;
    if (planType.includes('6') || planType.includes('six')) return 6;
    if (planType.includes('12') || planType.includes('twelve') || planType.includes('annual') || planType.includes('year')) return 12;
    
    // Calculate from start and end dates
    if (accessData.subscriptionDetails.startDate && accessData.subscriptionDetails.endDate) {
      const start = new Date(accessData.subscriptionDetails.startDate);
      const end = new Date(accessData.subscriptionDetails.endDate);
      const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      if (months <= 4) return 3;
      if (months <= 8) return 6;
      return 12;
    }
    
    return null;
  };

  // Transform access data to SubscriptionDialog format
  const getProgramDataForDialog = () => {
    if (!accessData) return null;
    
    return {
      id: classId,
      name: accessData.className,
      description: `Complete access to ${accessData.className} with all subjects`,
      price: accessData.classPrice, // Already in paisa
      subjects: accessData.subjectAccess.map(subject => ({
        id: subject.id,
        name: subject.name,
        icon: '📚', // Default icon
        color: 'from-blue-500 to-indigo-600', // Default color
        price: subject.price || 7500, // Use actual subject price in paisa, default to 7500 if not set
        isSubscribed: subject.hasAccess && subject.accessType !== 'free_trial', // Don't count free trial as subscribed
        subscriptionType: subject.hasAccess && subject.accessType !== 'none' && subject.accessType !== 'free_trial' ? subject.accessType : undefined,
        chapters: [] // We don't need chapter details for subscription
      }))
    };
  };

  const handleSubscriptionDialogClose = () => {
    setShowSubscriptionDialog(false);
    setSelectedUnitId(null);
  };

  const handleSubscriptionDialogSubscribe = (type: 'program', options: { classId?: number; amount: number }) => {
    // Close the dialog
    setShowSubscriptionDialog(false);
    
    // Call the original onSubscribe callback with appropriate options
    onSubscribe?.('class', { classId: options.classId || classId });
    
    // Reset state
    setSelectedUnitId(null);
  };

  const subjectsWithAccess = accessData?.subjectAccess.filter(s => s.hasAccess && s.accessType !== 'free_trial') || [];
  const subjectsWithoutAccess = accessData?.subjectAccess.filter(s => !s.hasAccess || s.accessType === 'free_trial') || [];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    if (error || !accessData) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load access information'}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      );
    }

    const isSchoolAccess = accessData.accessType === 'school';
    const subscriptionDetails = accessData.subscriptionDetails;

    return (
      <div className="space-y-4 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        {/* Current Access Status Card */}
        {accessData.hasFullAccess ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Full Access Active
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  {isSchoolAccess ? '🏫 School Access' : '✨ Subscription'}
                </Badge>
              </div>
              
              <p className="text-green-700">
                You have {isSchoolAccess ? 'school-based' : 'subscription-based'} access to all {accessData.subjectAccess.length} units in this program.
              </p>

              {/* Subscription Details */}
              {!isSchoolAccess && subscriptionDetails && (
                <div className="bg-white rounded-lg p-4 border border-green-200 space-y-3">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Subscription Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Plan:</span>
                      <p className="font-medium capitalize">{subscriptionDetails.planType?.replace('_', ' ') || 'Standard'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium text-green-600">{subscriptionDetails.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Start Date:
                      </span>
                      <p className="font-medium">{new Date(subscriptionDetails.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Valid Until:
                      </span>
                      <p className="font-medium">{new Date(subscriptionDetails.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* School Access Info */}
              {isSchoolAccess && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">School-Provided Access</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Your school has provided access to this program. Contact your school administrator for any changes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Units Overview */}
              <div className="pt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Included Units:</h4>
                <div className="flex flex-wrap gap-2">
                  {accessData.subjectAccess.map(unit => (
                    <Badge key={unit.id} variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {unit.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Plan Management for subscription users */}
              {!isSchoolAccess && subscriptionDetails && (
                <div className="pt-4 border-t border-green-200 space-y-4">
                  <h4 className="font-medium text-gray-800">Manage Your Plan</h4>
                  
                  {/* Available Plans */}
                  {pricingPlans.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {pricingPlans.map((plan) => {
                        const currentDuration = getCurrentPlanDuration();
                        const isCurrentPlan = currentDuration === plan.durationMonths;
                        const isUpgrade = currentDuration && plan.durationMonths > currentDuration;
                        const isDowngrade = currentDuration && plan.durationMonths < currentDuration;
                        
                        return (
                          <Card 
                            key={plan.id} 
                            className={`relative ${isCurrentPlan ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'} ${plan.isPopular && !isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
                          >
                            {plan.isPopular && !isCurrentPlan && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                <Badge className="bg-blue-600 text-white text-xs">Best Value</Badge>
                              </div>
                            )}
                            {isCurrentPlan && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                <Badge className="bg-green-600 text-white text-xs">Current Plan</Badge>
                              </div>
                            )}
                            <CardContent className="p-4">
                              <div className="text-center space-y-2">
                                <h5 className="font-semibold text-gray-900">{plan.name}</h5>
                                <div className="flex items-center justify-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">{plan.durationMonths} months</span>
                                </div>
                                <div>
                                  <span className="text-2xl font-bold">₹{plan.price / 100}</span>
                                  {plan.originalPrice && plan.originalPrice > plan.price && (
                                    <span className="text-sm text-gray-400 line-through ml-2">₹{plan.originalPrice / 100}</span>
                                  )}
                                </div>
                                {plan.discount && plan.discount > 0 && (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                    {plan.discount}% OFF
                                  </Badge>
                                )}
                                
                                {isCurrentPlan ? (
                                  <Button disabled variant="outline" className="w-full mt-2">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Active
                                  </Button>
                                ) : isUpgrade ? (
                                  <Button 
                                    onClick={() => handleChangePlan('upgrade')}
                                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                                  >
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Upgrade
                                  </Button>
                                ) : isDowngrade ? (
                                  <Button 
                                    onClick={() => handleChangePlan('downgrade')}
                                    variant="outline"
                                    className="w-full mt-2"
                                  >
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                    Downgrade
                                  </Button>
                                ) : (
                                  <Button 
                                    onClick={handleExtendSubscription}
                                    variant="outline"
                                    className="w-full mt-2"
                                  >
                                    Select
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Extend button if no plans available */}
                  {pricingPlans.length === 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-300 text-green-700 hover:bg-green-100"
                      onClick={handleExtendSubscription}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Extend Subscription
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Upgrade to Full Program Option */}
            {accessData.canUpgradeToProgram && accessData.upgradeOptions && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Zap className="h-5 w-5" />
                    Upgrade to Full Program Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 font-medium">
                        Get access to ALL subjects in {accessData.className}
                      </p>
                      <p className="text-sm text-purple-600">
                        You currently have {accessData.upgradeOptions.currentUnits.length} subject subscriptions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-purple-600" />
                        <span className="text-lg font-bold text-purple-800">
                          Save ₹{Math.abs(accessData.upgradeOptions.potentialSavings / 100)}
                        </span>
                      </div>
                      <p className="text-sm text-purple-600">vs individual subjects</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpgradeToProgram}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Upgrade to Full Access - ₹{accessData.classPrice / 100}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Full Program Subscription Option */}
            {!accessData.canUpgradeToProgram && subjectsWithoutAccess.length > 0 && (
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Star className="h-5 w-5 fill-blue-600 text-blue-600" />
                    Full Program Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-blue-900 font-semibold text-lg">
                        Access all {accessData.subjectAccess.length} units
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Try first chapter of each unit for free, then subscribe for complete access
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-blue-900">
                          ₹{accessData.classPrice / 100}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">One-time payment</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleProgramSubscribe}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Subscribe to Full Program
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Units Overview */}
            {subjectsWithoutAccess.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">What You'll Get</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accessData.subjectAccess.map(subject => (
                      <div 
                        key={subject.id} 
                        className="relative flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-200 transition-colors"
                      >
                        <div className="shrink-0 mt-0.5">
                          {subject.accessType === 'free_trial' ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <Gift className="w-3 h-3 text-white" />
                            </div>
                          ) : subject.hasAccess ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm leading-snug">
                            {subject.name}
                          </p>
                          {subject.accessType === 'free_trial' && (
                            <Badge variant="secondary" className="bg-green-500 text-white text-xs mt-1.5 px-2 py-0.5">
                              Free Trial
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Info className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Free Trial:</span> First chapter of each unit unlocked. Subscribe for full access to all chapters and content.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Access Status */}
            {subjectsWithAccess.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">Your Current Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subjectsWithAccess.map(subject => (
                      <div key={subject.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">{subject.name}</span>
                        <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                          {subject.accessType.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
            <DialogTitle className="text-xl font-bold">
              Manage Access - {accessData?.className || 'Loading...'}
            </DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      {showSubscriptionDialog && getProgramDataForDialog() && (
        <SubscriptionDialog
          open={showSubscriptionDialog}
          onClose={handleSubscriptionDialogClose}
          classData={getProgramDataForDialog()!}
          onSubscribe={handleSubscriptionDialogSubscribe}
        />
      )}
    </>
  );
};

export default ProgramSubscriptionManager;

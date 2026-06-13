
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useProgramData } from '@/hooks/useProgramData';
import { SubscriptionDialog } from '@/components/dashboard/SubscriptionDialog';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { ProgramCard } from '@/components/dashboard/ProgramCard';
import type { DbProgram } from '@/hooks/useProgramData';

interface ProgramWithSubjects {
  id: number;
  name: string;
  slug?: string; // Add slug field
  description?: string;
  price?: number;
  accessType?: string;
  schoolAccess?: boolean;
  subscriptionAccess?: boolean;
  subjectAccess?: Record<string, {
    hasAccess: boolean;
    accessType: 'school' | 'class_subscription' | 'subject_subscription' | 'none';
  }>;
  hasPartialAccess?: boolean;
  subjects: Array<{
    id: string;
    name: string;
    icon?: string;
    color?: string;
    price?: number;
    chapters: Array<{
      id: string;
      name: string;
      topics: Array<{
        id: string;
        name: string;
      }>;
    }>;
  }>;
}



export function DashboardContent() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const { programs, userProgress, loading, error, accessMessage, accessType, userProfile } = useProgramData();
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithSubjects | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // The userProfile is now fetched via useProgramData hook from the dashboard API
  // No need for a separate effect here since the data comes from the same API call

  const handleProgramClick = (programData: ProgramWithSubjects) => {
    // Always allow navigation to program page since first unit is free trial
    // The program page will handle showing which units are locked/unlocked
    const identifier = programData.slug || programData.id;
    router.push(`/dashboard/program/${identifier}`);
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    setSelectedProgram(null);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading programs</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No programs Available</h2>
          <p className="text-muted-foreground">programs will appear here once they&apos;re added.</p>
        </div>
      </div>
    );
  }

  const calculateProgramProgress = (programData: ProgramWithSubjects) => {
    if (!programData.subjects || !Array.isArray(programData.subjects)) return 0;
    
    const allTopics = programData.subjects.flatMap((s) => 
      s.chapters?.flatMap((ch) => ch.topics || []) || []
    );
    
    if (allTopics.length === 0) return 0;
    
    const completedCount = allTopics.filter((topic) => userProgress.get(topic.id)).length;
    return Math.round((completedCount / allTopics.length) * 100);
  };

  // Helper to convert DbProgram to ProgramWithSubjects
  const toProgramWithSubjects = (cls: DbProgram): ProgramWithSubjects => ({
    ...cls,
    price: cls.price,
    accessType: cls.accessType,
    schoolAccess: cls.schoolAccess,
    subscriptionAccess: cls.subscriptionAccess,
    subjects: cls.subjects || [],
  });

  return (
    <>
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto min-w-0 max-w-6xl px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tighter text-theo-black md:text-3xl">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'Student'}
          </h1>
          <p className="mt-1 text-gray-600">Continue your learning journey</p>

          {userProfile?.grade && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                Grade {userProfile.grade}
              </span>
              {userProfile.school && (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    userProfile.school.isActive
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {userProfile.school.name}
                </span>
              )}
            </div>
          )}

          {accessMessage && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                accessType === 'school'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : accessType === 'subscription'
                    ? 'border-theo-yellow/40 bg-theo-yellow/10 text-theo-black'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              {accessMessage}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500">Available programs</p>
              <p className="mt-1 text-2xl font-bold text-theo-black">{programs.length}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500">Total units</p>
              <p className="mt-1 text-2xl font-bold text-theo-black">
                {programs.reduce((acc, cls) => acc + (cls.subjects?.length || 0), 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500">Average progress</p>
              <p className="mt-1 text-2xl font-bold text-theo-black">
                {programs.length > 0
                  ? Math.round(
                      programs.reduce((acc, cls) => acc + calculateProgramProgress(toProgramWithSubjects(cls)), 0) /
                        programs.length
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto min-w-0 max-w-6xl px-4 py-5 sm:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tighter text-theo-black md:text-2xl">
            Your programs {userProfile?.grade && `(Grade ${userProfile.grade})`}
          </h2>
          <p className="mt-1 text-gray-600">
            {accessType === 'school'
              ? 'Access content through your school enrollment and subscriptions'
              : 'Select a program to start or continue learning'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((cls) => {
              const safeCls = toProgramWithSubjects(cls);
              const progress = calculateProgramProgress(safeCls);

              return (
                <ProgramCard
                  key={safeCls.id}
                  variant="dashboard"
                  programData={{
                    id: safeCls.id,
                    name: safeCls.name,
                    description: safeCls.description || '',
                    price: safeCls.price,
                    schoolAccess: cls.schoolAccess,
                    subscriptionAccess: cls.subscriptionAccess,
                    hasPartialAccess: safeCls.hasPartialAccess,
                    subjects: safeCls.subjects
                  }}
                  progress={progress}
                  onClick={() => handleProgramClick(safeCls)}
                />
              );
            })}
          </div>

          {/* Empty State for No Access */}
          {programs.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No programs Available</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {userProfile?.school ? 
                  (userProfile.school.isActive ? 
                    `No programs available for your grade level. Contact your school administrator.` :
                    'Your school account is currently inactive. Please contact your school.'
                  ) :
                  'You are not assigned to any school. Please contact an administrator.'
                }
              </p>
            </div>
          )}
      </div>

      {/* Subscription Dialog - only show for programs without access */}
      {selectedProgram && !selectedProgram.schoolAccess && !selectedProgram.subscriptionAccess && (
        <SubscriptionDialog
          open={showPaymentDialog}
          onClose={handlePaymentDialogClose}
          disableAutoRedirect={true}
          classData={{
            id: selectedProgram.id,
            name: selectedProgram.name,
            description: selectedProgram.description || '',
            price: selectedProgram.price || 29900,
            subjects: selectedProgram.subjects?.map(subject => ({
              id: subject.id,
              name: subject.name,
              icon: subject.icon || '📚',
              color: subject.color || 'from-blue-500 to-blue-600',
              chapters: subject.chapters || [],
              price: subject.price || 9900,
            })) || []
          }}
          onSubscribe={(type, options) => {
            console.log('Subscription success:', type, options);
            // Close dialog after success message is shown
            setTimeout(() => {
              handlePaymentDialogClose();
            }, 3000);
            
            // Reload the page to refresh access information after dialog closes
            setTimeout(() => {
              window.location.reload();
            }, 3500);
          }}
        />
      )}
    </>
  );
}


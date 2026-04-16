
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Star, GraduationCap, BookOpen, Users } from "lucide-react";
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
      <div className="min-h-screen bg-theo-white/50">
        {/* Enhanced Header with School Info */}
        <div className="relative overflow-hidden bg-theo-black text-white py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,216,50,0.1),transparent)]" />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center space-x-5">
                <div className="flex items-center justify-center w-20 h-20 bg-theo-yellow rounded-3xl shadow-[0_0_20px_rgba(200,216,50,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <GraduationCap className="w-10 h-10 text-theo-black" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Welcome back, {user?.name || user?.email?.split('@')[0] || 'Student'}!
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <p className="text-theo-white/60 font-medium">Continue your learning journey</p>
                    {userProfile?.grade && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-theo-yellow/20 text-theo-yellow rounded-full text-xs font-bold uppercase tracking-widest border border-theo-yellow/30">
                          Grade {userProfile.grade}
                        </span>
                        {userProfile.school && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                            userProfile.school.isActive 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {userProfile.school.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Access Message */}
            {accessMessage && (
              <div className={`mt-8 p-4 rounded-2xl border backdrop-blur-sm ${
                accessType === 'school' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : accessType === 'subscription'
                  ? 'bg-theo-yellow/10 border-theo-yellow/20 text-theo-yellow'
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
              }`}>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    accessType === 'school' ? 'bg-green-400' : accessType === 'subscription' ? 'bg-theo-yellow' : 'bg-yellow-400'
                  }`} />
                  {accessMessage}
                </p>
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-theo-white/40 text-xs font-bold uppercase tracking-widest mb-1">Available Programs</p>
                    <p className="text-4xl font-bold text-white tracking-tighter">{programs.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-theo-yellow/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-7 h-7 text-theo-yellow" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-theo-white/40 text-xs font-bold uppercase tracking-widest mb-1">Total Units</p>
                    <p className="text-4xl font-bold text-white tracking-tighter">{programs.reduce((acc, cls) => acc + (cls.subjects?.length || 0), 0)}</p>
                  </div>
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 hover:bg-white/10 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-theo-white/40 text-xs font-bold uppercase tracking-widest mb-1">Avg Progress</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold text-white tracking-tighter">
                        {programs.length > 0 
                          ? Math.round(programs.reduce((acc, cls) => acc + calculateProgramProgress(toProgramWithSubjects(cls)), 0) / programs.length)
                          : 0}
                      </p>
                      <span className="text-theo-yellow text-xl font-bold">%</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-7 h-7 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Program Cards Section */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your programs {userProfile?.grade && `(Grade ${userProfile.grade})`}
            </h2>
            <p className="text-gray-600">
              {accessType === 'school' 
                ? 'Access content through your school enrollment and subscriptions'
                : 'Select a class to start or continue learning'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
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


'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { useProgramPageData } from '@/hooks/useProgramPageData';
import type { DbTopic } from '@/hooks/useProgramData';
import { ContentPlayer } from '@/components/learning/ContentPlayer';
import { ProgramSubscriptionManager } from '@/components/dashboard/ProgramSubscriptionManager';
import { ProgramPageSkeleton } from '@/components/dashboard/dashboard-class-skeleton';
import { UnitContent } from '@/components/learning/UnitContent';
import { useSession } from 'next-auth/react';
import { hasStaffProgramPreview } from '@/lib/user-program-access';
import {
  getNextTopic,
  isUnitCompleted,
  isTopicEnabled,
  canNavigateToNext,
  type UnitProgression,
} from '@/lib/topic-progression';

interface UnitData {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  chapters: ChapterData[];
}

interface ChapterData {
  id: string;
  name: string;
  orderIndex: number;
  topics: DbTopic[];
}

function toPlayableTopic(
  topic: DbTopic,
  userProgress: Map<string, boolean>
): DbTopic & { completed: boolean } {
  return {
    ...topic,
    completed: userProgress.get(topic.id) || false,
    content: topic.content
      ? {
          contentType: topic.content.contentType,
          url: topic.content.url,
          videoUrl: topic.content.videoUrl,
          pdfUrl: topic.content.pdfUrl,
          textContent: topic.content.textContent,
          iframeHtml: topic.content.iframeHtml,
          widgetConfig: topic.content.widgetConfig,
        }
      : undefined,
  };
}

export default function ProgramPage() {
  return (
    <Suspense fallback={<ProgramPageSkeleton />}>
      <ProgramPageContent />
    </Suspense>
  );
}

function ProgramPageContent() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const unlockAllTopics = hasStaffProgramPreview(session?.user?.role);
  const slug = params.slug as string;
  const topicParam = searchParams.get('topic');

  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<DbTopic & { completed: boolean } | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  
  // Use unified hook that handles both class data and access verification
  const { 
    currentProgram, 
    userProgress, 
    markTopicComplete, 
    unitAccess, 
    unitAccessTypes,
    unitDaysRemaining,
    chapterAccess,
    accessType, 
    accessMessage, 
    loading, 
    error 
  } = useProgramPageData(slug);

  const setTopicInUrl = useCallback(
    (topicId: string | null, mode: 'push' | 'replace' = 'push') => {
      const next = new URLSearchParams(searchParams.toString());
      if (topicId) next.set('topic', topicId);
      else next.delete('topic');
      const qs = next.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (mode === 'replace') router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const findTopicInProgram = useCallback(
    (topicId: string) => {
      if (!currentProgram) return null;
      for (const unit of currentProgram.units) {
        for (const chapter of unit.chapters) {
          const topic = chapter.topics.find((t) => t.id === topicId);
          if (topic) {
            return { unit, chapter, topic };
          }
        }
      }
      return null;
    },
    [currentProgram]
  );

  useEffect(() => {
    // Auto-select first unlocked unit when nothing is selected yet
    if (selectedUnit || topicParam) return;
    const firstUnlockedUnit = currentProgram?.units.find((s) => !s.isLocked);
    if (firstUnlockedUnit) {
      setSelectedUnit(firstUnlockedUnit.id);
    }
  }, [currentProgram, selectedUnit, topicParam]);

  // Open / sync player from ?topic= URL
  useEffect(() => {
    if (!currentProgram) return;

    if (!topicParam) {
      setIsPlayerOpen(false);
      setSelectedTopic(null);
      return;
    }

    const located = findTopicInProgram(topicParam);
    if (!located) {
      setTopicInUrl(null, 'replace');
      return;
    }

    const { unit, chapter, topic } = located;
    const hasUnitAccess = unitAccess[unit.id] === true;

    if (!hasUnitAccess && currentProgram.price !== 0) {
      setShowSubscriptionManager(true);
      setTopicInUrl(null, 'replace');
      return;
    }

    if (chapterAccess[chapter.id] === false) {
      setTopicInUrl(null, 'replace');
      return;
    }

    setSelectedUnit(unit.id);
    setSelectedTopic(toPlayableTopic(topic, userProgress));
    setIsPlayerOpen(true);
  }, [
    currentProgram,
    topicParam,
    unitAccess,
    chapterAccess,
    findTopicInProgram,
    setTopicInUrl,
    userProgress,
  ]);

  if (loading || !currentProgram) {
    // Use currentProgram data if available, even during loading
    return <ProgramPageSkeleton 
      programLogo={currentProgram?.logo} 
      programName={currentProgram?.name} 
    />;
  }

  if (error || !currentProgram) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Program Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleTopicClick = (topic: DbTopic) => {
    // Check if user has access to this unit
    const hasUnitAccess = unitAccess[selectedUnit] === true;
    
    // For free programs (price === 0), don't show subscription manager
    if (!hasUnitAccess && currentProgram.price !== 0) {
      // Show subscription manager instead of playing content
      setShowSubscriptionManager(true);
      return;
    }

    if (selectedUnitData) {
      const unitProgress: UnitProgression = {
        id: selectedUnitData.id,
        name: selectedUnitData.name,
        chapters: selectedUnitData.chapters.map((ch) => ({
          id: ch.id,
          name: ch.name,
          topics: ch.topics.map((t) => ({
            id: t.id,
            name: t.name,
            completed: userProgress.get(t.id) || false,
          })),
        })),
      };
      const completedTopicsSet = new Set<string>();
      userProgress.forEach((completed, topicId) => {
        if (completed) completedTopicsSet.add(topicId);
      });

      if (
        !unlockAllTopics &&
        !isTopicEnabled({ id: topic.id, name: topic.name }, unitProgress, completedTopicsSet)
      ) {
        toast.message('Complete the previous topic to unlock this one');
        return;
      }
    }

    // Drive player via URL so any topic is deep-linkable / refreshable
    setTopicInUrl(topic.id, 'push');
  };

  const handleTopicComplete = async () => {
    if (selectedTopic) {
      try {
        await markTopicComplete(selectedTopic.id, true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not mark topic complete');
        return;
      }
      
      // Check if unit is completed using shared utility
      if (selectedUnitData) {
        const unitProgress: UnitProgression = {
          id: selectedUnitData.id,
          name: selectedUnitData.name,
          chapters: selectedUnitData.chapters.map(ch => ({
            id: ch.id,
            name: ch.name,
            topics: ch.topics.map(t => ({
              id: t.id,
              name: t.name,
              completed: userProgress.get(t.id) || false
            }))
          }))
        };

        // Create a Set from userProgress for compatibility with shared functions
        const completedTopicsSet = new Set<string>();
        userProgress.forEach((isCompleted, topicId) => {
          if (isCompleted) completedTopicsSet.add(topicId);
        });
        completedTopicsSet.add(selectedTopic.id); // Add the just completed topic

        if (isUnitCompleted(unitProgress, completedTopicsSet)) {
          toast.success(`Unit complete: ${selectedUnitData.name}`);
        }
      }
    }
  };

  const handleTopicIncomplete = async () => {
    if (selectedTopic) {
      console.log(`Dashboard: Marking topic ${selectedTopic.id} as incomplete`);
      await markTopicComplete(selectedTopic.id, false);
    }
  };

  const handlePlayerClose = () => {
    setTopicInUrl(null, 'replace');
  };

  const handleNextTopic = () => {
    if (!selectedUnitData || !selectedTopic) return;
    
    // Create unit progression data for shared utility
    const unitProgress: UnitProgression = {
      id: selectedUnitData.id,
      name: selectedUnitData.name,
      chapters: selectedUnitData.chapters.map(ch => ({
        id: ch.id,
        name: ch.name,
        topics: ch.topics.map(t => ({
          id: t.id,
          name: t.name,
          completed: userProgress.get(t.id) || false
        }))
      }))
    };

    const currentTopicForProgression = {
      id: selectedTopic.id,
      name: selectedTopic.name,
      completed: userProgress.get(selectedTopic.id) || false
    };

    // Create a Set from userProgress for compatibility with shared functions
    const completedTopicsSet = new Set<string>();
    userProgress.forEach((completed, topicId) => {
      if (completed) completedTopicsSet.add(topicId);
    });

    if (
      !unlockAllTopics &&
      !canNavigateToNext(currentTopicForProgression, unitProgress, completedTopicsSet)
    ) {
      toast.message(
        selectedTopic.requiresPass
          ? 'Pass this activity to unlock the next topic'
          : 'Complete this topic before moving on'
      );
      return;
    }

    const nextTopic = getNextTopic(currentTopicForProgression, unitProgress);
    
    if (nextTopic) {
      setTopicInUrl(nextTopic.id, 'replace');
    } else {
      // If no next topic, close the player
      handlePlayerClose();
    }
  };

  const getUnitProgress = (unit: UnitData) => {
    const allTopics = unit.chapters.flatMap((ch: ChapterData) => ch.topics);
    const completedCount = allTopics.filter((topic: DbTopic) => userProgress.get(topic.id)).length;
    return allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
  };

  const selectedUnitData = currentProgram.units.find(s => s.id === selectedUnit);

  return (
    <div className="container mx-auto min-w-0 max-w-6xl px-4 py-5 sm:px-6">
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-start gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {currentProgram.logo && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white sm:h-14 sm:w-14">
                <Image
                  src={currentProgram.logo}
                  alt={currentProgram.name}
                  width={56}
                  height={56}
                  className="object-contain p-1.5"
                />
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold leading-snug sm:text-xl md:text-2xl">{currentProgram.name}</h1>
                {accessType === 'school' && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    School access
                  </span>
                )}
                {accessType === 'subscription' && (
                  <span className="rounded-full bg-theo-yellow/20 px-2 py-0.5 text-xs font-medium text-theo-black">
                    Subscribed
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{currentProgram.description}</p>
              {accessMessage && (
                <p className="mt-1 text-xs text-green-700">{accessMessage}</p>
              )}
            </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
              <div className="text-center">
                <div className="text-lg font-bold text-theo-black">
                  {currentProgram.units.filter(s => !s.isLocked).length}
                </div>
                <div className="text-[11px] text-muted-foreground">Units</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-theo-black">
                  {currentProgram.units.reduce((acc, s) => acc + s.chapters.length, 0)}
                </div>
                <div className="text-[11px] text-muted-foreground">Lessons</div>
              </div>
              {currentProgram.price !== 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubscriptionManager(!showSubscriptionManager)}
                  className="gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Manage access
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Management Dialog */}
        {currentProgram.price !== 0 && (
          <ProgramSubscriptionManager 
            classId={currentProgram.id}
            open={showSubscriptionManager}
            onClose={() => setShowSubscriptionManager(false)}
            onSubscribe={async () => {
              setShowSubscriptionManager(false);
              toast.success('Access updated — continue learning');
              window.location.reload();
            }}
          />
        )}

        <UnitContent
          units={currentProgram.units.map((unit) => {
            const hasUnitAccess = unitAccess[unit.id] === true;
            const accessType = unitAccessTypes[unit.id] || 'none';
            const daysRemaining = unitDaysRemaining[unit.id] ?? 0;
            return {
              id: unit.id,
              name: unit.name,
              icon: unit.icon,
              color: unit.color,
              chapters: unit.chapters.map(chapter => ({
                id: chapter.id,
                name: chapter.name,
                topics: chapter.topics.map(topic => ({
                  ...topic,
                  completed: userProgress.get(topic.id) || false
                })),
                isLocked: !chapterAccess[chapter.id]
              })),
              isLocked: unit.isLocked || !hasUnitAccess,
              isFreeTrialUnit: accessType === 'free_trial',
              daysRemaining,
            };
          })}
          selectedUnit={selectedUnit}
          selectedUnitData={selectedUnitData ? {
            id: selectedUnitData.id,
            name: selectedUnitData.name,
            icon: selectedUnitData.icon,
            color: selectedUnitData.color,
            chapters: selectedUnitData.chapters.map(chapter => ({
              id: chapter.id,
              name: chapter.name,
              topics: chapter.topics.map(topic => ({
                ...topic,
                completed: userProgress.get(topic.id) || false
              })),
              isLocked: !chapterAccess[chapter.id] // Use chapter-level access
            })),
            isLocked: selectedUnitData.isLocked || !unitAccess[selectedUnitData.id],
            isFreeTrialUnit: unitAccessTypes[selectedUnitData.id] === 'free_trial',
            daysRemaining: unitDaysRemaining[selectedUnitData.id] ?? 0,
          } : null}
          completedTopics={new Set(
            Array.from(userProgress.entries())
              .filter(([, completed]) => completed)
              .map(([topicId]) => topicId)
          )}
          useAccordion={true}
          showUpgradeButton={false}
          onUnitSelect={(unitId) => {
            // Always select so drip-locked units can show countdown UI;
            // paywall locks are handled via onLockedClick in UnitContent.
            setSelectedUnit(unitId);
          }}
          onTopicClick={(topic) => {
            const hasUnitAccess = selectedUnitData && unitAccess[selectedUnitData.id] === true;
            if (hasUnitAccess) {
              // Find the actual DbTopic from the selected unit data
              const dbTopic = selectedUnitData.chapters
                .flatMap(ch => ch.topics)
                .find(t => t.id === topic.id);
              if (dbTopic) {
                handleTopicClick(dbTopic);
              }
            }
          }}
          onLockedClick={() => {
            console.log(`Topic is locked - unit access required`);
            setShowSubscriptionManager(true);
          }}
          getUnitProgress={(unitId) => {
            const unit = currentProgram.units.find(s => s.id === unitId);
            return unit ? getUnitProgress(unit) : 0;
          }}
          unlockAllTopics={unlockAllTopics}
        />

      <ContentPlayer
        topic={selectedTopic}
        isOpen={isPlayerOpen}
        onClose={handlePlayerClose}
        onComplete={handleTopicComplete}
        onIncomplete={handleTopicIncomplete}
        onNext={handleNextTopic}
        isCompleted={selectedTopic ? (userProgress.get(selectedTopic.id) || false) : false}
        canGoNext={
          unlockAllTopics && selectedTopic && selectedUnitData
            ? Boolean(
                getNextTopic(
                  {
                    id: selectedTopic.id,
                    name: selectedTopic.name,
                    completed: userProgress.get(selectedTopic.id) || false,
                  },
                  {
                    id: selectedUnitData.id,
                    name: selectedUnitData.name,
                    chapters: selectedUnitData.chapters.map((ch) => ({
                      id: ch.id,
                      name: ch.name,
                      topics: ch.topics.map((t) => ({
                        id: t.id,
                        name: t.name,
                        completed: userProgress.get(t.id) || false,
                      })),
                    })),
                  }
                )
              )
            : selectedTopic && selectedUnitData
              ? canNavigateToNext(
                  {
                    id: selectedTopic.id,
                    name: selectedTopic.name,
                    completed: userProgress.get(selectedTopic.id) || false,
                  },
                  {
                    id: selectedUnitData.id,
                    name: selectedUnitData.name,
                    chapters: selectedUnitData.chapters.map((ch) => ({
                      id: ch.id,
                      name: ch.name,
                      topics: ch.topics.map((t) => ({
                        id: t.id,
                        name: t.name,
                        completed: userProgress.get(t.id) || false,
                      })),
                    })),
                  },
                  new Set(
                    Array.from(userProgress.entries())
                      .filter(([, completed]) => completed)
                      .map(([topicId]) => topicId)
                  )
                )
              : false
        }
      />
    </div>
  );
}

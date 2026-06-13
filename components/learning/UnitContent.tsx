'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TopicItem } from '@/components/learning/TopicItem';
import { type Topic, type TopicContent } from '@/hooks/useProgramData';
import * as LucideIcons from 'lucide-react';
import { 
  BookOpen, 
  Lock, 
  Star, 
  ChevronDown, 
  ChevronRight,
  Clock
} from 'lucide-react';

// Color mapping for gradients
const getColorGradient = (colorName: string = '') => {
  const colors: Record<string, string> = {
    rose: 'from-rose-500 to-pink-600',
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    purple: 'from-purple-500 to-violet-600',
    cyan: 'from-cyan-400 to-blue-500',
    emerald: 'from-emerald-400 to-green-500',
    orange: 'from-orange-400 to-red-500',
    pink: 'from-pink-400 to-rose-500',
    indigo: 'from-indigo-400 to-purple-500',
  };
  return colors[colorName.toLowerCase()] || 'from-gray-500 to-gray-600';
};

// Icon component mapping
const getUnitIcon = (iconName: string = '') => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.BookOpen;
  return <Icon className="h-full w-full" />;
};

// Base interfaces for the component
export interface BaseTopic {
  id: string;
  name: string;
  completed?: boolean;
  [key: string]: unknown; // Allow additional properties for flexibility
}

export interface BaseChapter {
  id: string;
  name: string;
  topics: BaseTopic[];
  isLocked?: boolean;
}

export interface BaseUnit {
  id: string;
  name: string;
  icon: string;
  color: string;
  chapters: BaseChapter[];
  isLocked?: boolean;
  isFreeTrialUnit?: boolean;
  daysRemaining?: number;
}

interface UnitContentProps {
  units: BaseUnit[];
  selectedUnit: string | null;
  selectedUnitData: BaseUnit | null;
  completedTopics?: Set<string>;
  useAccordion?: boolean;
  showUpgradeButton?: boolean;
  showFreeBadge?: boolean;
  onUnitSelect: (unitId: string) => void;
  onTopicClick: (topic: BaseTopic, chapterIndex?: number) => void;
  onLockedClick: () => void;
  onUpgradeClick?: () => void;
  getUnitProgress: (unitId: string) => number;
  convertTopicForItem?: (topic: BaseTopic) => Topic;
}

interface EmptyUnitContentProps {
  title?: string;
  description?: string;
}

export const EmptyUnitContent: React.FC<EmptyUnitContentProps> = ({
  title = "Select a Unit",
  description = "Pick a unit from the list (or swipe the unit bar on your phone) to start exploring"
}) => (
  <Card className="py-0 text-center shadow-sm">
    <CardContent className="px-4 py-8">
    <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
    <h3 className="mb-1 text-base font-medium text-gray-600">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export const UnitContent: React.FC<UnitContentProps> = ({
  units,
  selectedUnit,
  selectedUnitData,
  completedTopics = new Set(),
  useAccordion = false,
  showUpgradeButton = false,
  showFreeBadge = false,
  onUnitSelect,
  onTopicClick,
  onLockedClick,
  onUpgradeClick,
  getUnitProgress,
  convertTopicForItem
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const unitChipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (!selectedUnit) return;
    const el = unitChipRefs.current.get(selectedUnit);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedUnit]);

  const toggleChapter = (chapterId: string) => {
    if (!useAccordion) return;
    
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const getChapterProgress = (chapter: BaseChapter) => {
    if (chapter.topics.length === 0) return 0;
    const completedCount = chapter.topics.filter(topic => 
      topic.completed || completedTopics.has(topic.id)
    ).length;
    return Math.round((completedCount / chapter.topics.length) * 100);
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-5">
      {/* Mobile / tablet: horizontal unit picker until xl sidebar */}
      <div
        className="sticky top-14 z-30 -mx-1 rounded-lg border border-gray-200 bg-white/95 px-2 py-2 shadow-sm backdrop-blur-sm xl:hidden"
        role="region"
        aria-label="Units"
      >
        <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Units · swipe to switch
        </p>
        <div
          className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 pt-0.5 [scrollbar-width:thin] touch-pan-x snap-x snap-mandatory scroll-pl-1 scroll-pr-1"
          role="tablist"
          aria-orientation="horizontal"
        >
          {units.map((unit) => {
            const daysRemaining = unit.daysRemaining ?? 0;
            const isDripLocked = unit.isLocked && daysRemaining > 0;
            const isSelected = selectedUnit === unit.id;
            const progress = getUnitProgress(unit.id);
            const canSelect = !unit.isLocked;
            return (
              <button
                key={unit.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                disabled={!canSelect}
                ref={(el) => {
                  if (el) unitChipRefs.current.set(unit.id, el);
                  else unitChipRefs.current.delete(unit.id);
                }}
                onClick={() => canSelect && onUnitSelect(unit.id)}
                className={`flex min-h-[3.25rem] min-w-[8.25rem] max-w-[11rem] shrink-0 snap-start touch-manipulation flex-col items-stretch rounded-lg border px-2.5 py-2 text-left transition-all ${
                  isSelected
                    ? `border-transparent bg-gradient-to-br ${getColorGradient(unit.color)} text-white shadow-md`
                    : canSelect
                      ? 'border-gray-200 bg-gray-50 active:scale-[0.98] hover:border-gray-300 hover:bg-gray-100'
                      : 'cursor-not-allowed border-gray-100 bg-gray-50/80 opacity-70'
                }`}
              >
                <span className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-4 w-4 shrink-0 opacity-90 [&_svg]:h-full [&_svg]:w-full">
                    {getUnitIcon(unit.icon)}
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">
                    <span className={`line-clamp-2 text-xs font-bold sm:text-[13px] ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {unit.name}
                    </span>
                  </span>
                </span>
                <span
                  className={`mt-1 flex items-center justify-between gap-1 border-t pt-1 text-[10px] font-medium tabular-nums sm:text-[11px] ${
                    isSelected ? 'border-white/25 text-white/90' : 'border-gray-200/80 text-muted-foreground'
                  }`}
                >
                  <span>
                    {unit.isLocked && isDripLocked ? (
                      <span className="flex items-center gap-0.5 text-amber-600">
                        <Clock className="h-3 w-3 shrink-0" />
                        {daysRemaining}d
                      </span>
                    ) : unit.isLocked ? (
                      <span className="flex items-center gap-0.5">
                        <Lock className="h-3 w-3 shrink-0" />
                        Locked
                      </span>
                    ) : (
                      `${unit.chapters.length} ch`
                    )}
                  </span>
                  {!unit.isLocked ? (
                    <span>{progress}%</span>
                  ) : null}
                </span>
                {unit.isFreeTrialUnit && (
                  <Badge
                    variant="secondary"
                    className={`mt-1 h-5 w-fit px-1 py-0 text-[10px] ${
                      isSelected ? 'border-white/30 bg-white/20 text-white hover:bg-white/25' : ''
                    }`}
                  >
                    Trial
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unit sidebar — xl+ only; below that use horizontal picker */}
      <div className="order-1 hidden min-w-0 xl:col-span-4 xl:block 2xl:col-span-3">
        <Card className="gap-0 py-0 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <CardHeader className="border-b border-gray-100 pb-2 pt-4">
            <CardTitle className="text-sm font-semibold">Units</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pb-4">
            {units.map((unit) => {
              const daysRemaining = unit.daysRemaining ?? 0;
              const isDripLocked = unit.isLocked && daysRemaining > 0;
              const isSelected = selectedUnit === unit.id;
              return (
              <div
                key={unit.id}
                className={`cursor-pointer rounded-lg border px-2.5 py-2 transition-colors ${
                  isSelected
                    ? 'border-theo-black bg-theo-black text-white shadow-sm'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                } ${unit.isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                onClick={() => !unit.isLocked && onUnitSelect(unit.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 shrink-0">{getUnitIcon(unit.icon)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug">{unit.name}</span>
                      {unit.isFreeTrialUnit && (
                        <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                          Trial
                        </Badge>
                      )}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {unit.isLocked && isDripLocked ? (
                        <span className="flex items-center gap-1 font-medium text-amber-500">
                          <Clock className="h-3 w-3" />
                          In {daysRemaining}d
                        </span>
                      ) : (
                        `${unit.chapters.length} lessons`
                      )}
                    </div>
                  </div>
                  {unit.isLocked ? (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className={`shrink-0 text-xs font-semibold tabular-nums ${isSelected ? 'text-theo-yellow' : 'text-gray-600'}`}>
                      {getUnitProgress(unit.id)}%
                    </span>
                  )}
                </div>
              </div>
              );
            })}
            
            {/* Upgrade Now Button */}
            {showUpgradeButton && onUpgradeClick && (
              <div className="mt-2 border-t border-gray-200 pt-2">
                <Button onClick={onUpgradeClick} variant="theo" size="sm" className="w-full">
                  <Star className="mr-1.5 h-3.5 w-3.5" />
                  Upgrade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="order-2 min-w-0 xl:col-span-8 2xl:col-span-9">
        {selectedUnitData ? (
          <Card className="overflow-hidden py-0 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-theo-black px-4 py-3 text-white">
              <CardTitle className="flex w-full flex-col gap-2 text-left text-base font-semibold tracking-normal text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-8 w-8 shrink-0 text-theo-yellow">
                    {getUnitIcon(selectedUnitData.icon)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold sm:text-lg">{selectedUnitData.name}</h2>
                    <p className="text-xs text-white/75 sm:text-sm">
                      {selectedUnitData.chapters.length} lessons · {getUnitProgress(selectedUnitData.id)}% complete
                    </p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="space-y-2 p-3 sm:p-4">
                {selectedUnitData.chapters.map((chapter, chapterIndex) => {
                  const chapterProgress = getChapterProgress(chapter);
                  const isExpanded = useAccordion ? expandedChapters.has(chapter.id) : true;
                  
                  return (
                    <div key={chapter.id} className="overflow-hidden rounded-lg border border-gray-200">
                      <div
                        className={`border-b bg-gray-50 px-3 py-2.5 transition-colors ${
                          useAccordion ? 'cursor-pointer hover:bg-gray-100' : ''
                        }`}
                        onClick={() => useAccordion && toggleChapter(chapter.id)}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-theo-black text-xs font-bold text-theo-yellow">
                            {chapterIndex + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <h3 className="text-sm font-semibold leading-snug break-words">{chapter.name}</h3>
                                  {chapter.isLocked && (
                                    <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                                      <Lock className="mr-1 h-3 w-3" />
                                      Locked
                                    </Badge>
                                  )}
                                  {showFreeBadge && chapterIndex === 0 && (
                                    <Badge variant="default" className="h-5 bg-green-600 px-1.5 py-0 text-[10px]">
                                      Free
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {chapter.topics.length} activities · {chapterProgress}%
                                </p>
                              </div>
                              {useAccordion && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-gray-200/80">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-600" />
                                  )}
                                </div>
                              )}
                            </div>
                            <Progress value={chapterProgress} className="mt-2 h-1.5 w-full" />
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2">
                          {[...chapter.topics]
                            .sort((a, b) => {
                              const order = { 'BEGINNER': 0, 'INTERMEDIATE': 1, 'ADVANCED': 2 };
                              type DiffKey = keyof typeof order;
                              const aDiff = typeof a.difficulty === 'string' ? a.difficulty.toUpperCase() as DiffKey : undefined;
                              const bDiff = typeof b.difficulty === 'string' ? b.difficulty.toUpperCase() as DiffKey : undefined;
                              return (aDiff !== undefined ? order[aDiff] : 99) - (bDiff !== undefined ? order[bDiff] : 99);
                            })
                            .filter(
                              (topic, index, arr) =>
                                arr.findIndex((t) => t.id === topic.id) === index
                            )
                            .map((topic: BaseTopic) => {
                              const isCompleted = topic.completed || completedTopics.has(topic.id);
                              const isDisabled = chapter.isLocked || false;
                              // Convert topic for TopicItem - use converter or create default Topic structure
                              const topicForItem: Topic = convertTopicForItem 
                                ? convertTopicForItem(topic)
                                : {
                                    id: topic.id,
                                    name: topic.name,
                                    type: ('type' in topic && typeof topic.type === 'string') ? topic.type : 'INTERACTIVE_WIDGET',
                                    duration: ('duration' in topic && typeof topic.duration === 'string') ? topic.duration : null,
                                    orderIndex: ('orderIndex' in topic && typeof topic.orderIndex === 'number') ? topic.orderIndex : 0,
                                    completed: topic.completed,
                                    difficulty: ('difficulty' in topic && typeof topic.difficulty === 'string') ? topic.difficulty : undefined,
                                    description: ('description' in topic && typeof topic.description === 'string') ? topic.description : undefined,
                                    content: ('content' in topic) ? topic.content as TopicContent : undefined
                                  } as Topic;
                              return (
                                <TopicItem
                                  key={topic.id}
                                  topic={topicForItem}
                                  isCompleted={isCompleted}
                                  isDisabled={isDisabled}
                                  accentColor={getColorGradient(selectedUnitData.color)}
                                  onClick={() => onTopicClick(topic, chapterIndex)}
                                  onLockedClick={onLockedClick}
                                />
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : selectedUnit && units.find(u => u.id === selectedUnit)?.isLocked ? (
          // Drip-locked selected unit — show countdown screen
          (() => {
            const lockedUnit = units.find(u => u.id === selectedUnit)!;
            const daysRemaining = lockedUnit.daysRemaining ?? 0;
            return (
              <Card className="overflow-hidden">
                <div className={`bg-gradient-to-r ${getColorGradient(lockedUnit.color)} p-12 text-white text-center`}>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur mb-6">
                    <Lock className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-black mb-3">{lockedUnit.name}</h2>
                  {daysRemaining > 0 ? (
                    <>
                      <p className="text-white/80 text-lg mb-4 font-medium">This unit unlocks in</p>
                      <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur px-8 py-4 rounded-2xl">
                        <Clock className="h-7 w-7" />
                        <span className="text-4xl font-black">{daysRemaining}</span>
                        <span className="text-xl font-bold text-white/80">{daysRemaining === 1 ? 'day' : 'days'}</span>
                      </div>
                      <p className="text-white/60 text-sm mt-4 font-medium">Keep learning! This content is part of your scheduled drip curriculum.</p>
                    </>
                  ) : (
                    <p className="text-white/80 text-lg font-medium">This unit is locked. Please contact your teacher.</p>
                  )}
                </div>
              </Card>
            );
          })()
        ) : (
          <EmptyUnitContent />
        )}
      </div>
    </div>
  );
};
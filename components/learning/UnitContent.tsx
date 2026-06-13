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
  <Card className="p-8 sm:p-12 text-center">
    <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-muted-foreground">
      {description}
    </p>
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
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
      {/* Mobile / tablet: sticky horizontal unit picker (always reachable while scrolling) */}
      <div
        className="sticky top-16 z-40 -mx-1 rounded-xl border border-gray-200/90 bg-white/95 px-2 py-2 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/85 lg:hidden"
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

      {/* Unit sidebar — desktop only (mobile uses sticky strip above) */}
      <div className="order-1 hidden min-w-0 lg:col-span-1 lg:block">
        <Card className="gap-0 lg:sticky lg:top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Units</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {units.map((unit) => {
              const daysRemaining = unit.daysRemaining ?? 0;
              const isDripLocked = unit.isLocked && daysRemaining > 0;
              return (
              <div
                key={unit.id}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                  selectedUnit === unit.id 
                    ? `bg-gradient-to-r ${getColorGradient(unit.color)} text-white shadow-lg` 
                    : 'bg-gray-50 hover:bg-gray-100'
                } ${unit.isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !unit.isLocked && onUnitSelect(unit.id)}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6">{getUnitIcon(unit.icon)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base sm:text-lg break-words leading-snug flex flex-wrap items-center gap-2">
                      {unit.name}
                      {unit.isFreeTrialUnit && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-green-500 text-white hover:bg-green-600">
                          Free Trial
                        </Badge>
                      )}
                    </div>
                    <div className={`text-sm ${selectedUnit === unit.id ? 'text-white/90 font-medium' : 'text-muted-foreground'}`}>
                      {unit.isLocked && isDripLocked
                        ? <span className="flex items-center gap-1 text-amber-600 font-bold"><Clock className="h-3 w-3" />In {daysRemaining}d</span>
                        : `${unit.chapters.length} chapters`
                      }
                    </div>
                  </div>
                  {unit.isLocked ? (
                    isDripLocked ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <Lock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-amber-500" />
                      </div>
                    ) : (
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    )
                  ) : (
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium">{getUnitProgress(unit.id)}%</div>
                      <div className="w-6 sm:w-8 h-1 bg-white/30 rounded-full mt-1">
                        <div 
                          className="h-full bg-white rounded-full transition-all shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                          style={{ width: `${getUnitProgress(unit.id)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
            
            {/* Upgrade Now Button */}
            {showUpgradeButton && onUpgradeClick && (
              <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
                <Button
                  onClick={onUpgradeClick}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 lg:py-3 px-3 lg:px-4 rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs lg:text-sm"
                >
                  <Star className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  Upgrade Now
                </Button>
                <p className="text-xs text-gray-500 text-center mt-1 lg:mt-2">
                  Unlock all units & chapters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="order-2 min-w-0 lg:col-span-3">
        {selectedUnitData ? (
          <Card className="overflow-hidden p-0 shadow-sm sm:shadow-md">
            <CardHeader className={`bg-gradient-to-r ${getColorGradient(selectedUnitData.color)} px-3 py-2.5 text-white shadow-md sm:px-6 sm:py-4`}>
              <CardTitle className="flex w-full flex-col gap-2 text-left font-semibold tracking-normal text-white sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:items-start sm:gap-4">
                  <div className="h-7 w-7 shrink-0 text-white drop-shadow-md sm:mt-0.5 sm:h-10 sm:w-10">
                    {getUnitIcon(selectedUnitData.icon)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-0.5 sm:block">
                      <h2 className="text-base font-bold leading-snug break-words sm:text-2xl">{selectedUnitData.name}</h2>
                      <div className="flex shrink-0 items-baseline gap-1 sm:hidden">
                        <span className="text-lg font-bold tabular-nums">{getUnitProgress(selectedUnitData.id)}%</span>
                        <span className="text-[10px] font-medium text-white/85">done</span>
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-white/85 sm:mt-1 sm:text-base">{selectedUnitData.chapters.length} chapters to explore</p>
                  </div>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-0 text-right sm:flex">
                  <div className="text-2xl font-bold tabular-nums">{getUnitProgress(selectedUnitData.id)}%</div>
                  <div className="text-sm text-white/80">Complete</div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {/* Chapters */}
              <div className="space-y-2 px-2 py-3 sm:space-y-6 sm:p-6">
                {selectedUnitData.chapters.map((chapter, chapterIndex) => {
                  const chapterProgress = getChapterProgress(chapter);
                  const isExpanded = useAccordion ? expandedChapters.has(chapter.id) : true;
                  
                  return (
                    <div key={chapter.id} className="overflow-hidden rounded-lg border border-gray-200 sm:rounded-xl lg:rounded-2xl">
                      <div 
                        className={`border-b bg-gray-50 px-2 py-2.5 transition-colors sm:px-6 sm:py-4 ${
                          useAccordion ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-100/80' : ''
                        }`}
                        onClick={() => useAccordion && toggleChapter(chapter.id)}
                      >
                        <div className="flex gap-2 sm:items-center sm:gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:rounded-xl sm:text-base ${getColorGradient(selectedUnitData.color)}`}>
                            {chapterIndex + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                  <h3 className="text-sm font-bold leading-snug break-words sm:text-xl">{chapter.name}</h3>
                                  {chapter.isLocked && (
                                    <Badge variant="secondary" className="h-5 gap-0.5 px-1.5 py-0 text-[10px] sm:gap-1 sm:text-xs">
                                      <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                                      Locked
                                    </Badge>
                                  )}
                                  {showFreeBadge && chapterIndex === 0 && (
                                    <Badge variant="default" className="h-5 bg-green-600 px-1.5 py-0 text-[10px] sm:text-xs">
                                      Free
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground sm:hidden">
                                  <span>{chapter.topics.length} activities</span>
                                  <span className="font-semibold tabular-nums text-foreground">{chapterProgress}%</span>
                                </div>
                                <Progress value={chapterProgress} className="h-1.5 w-full sm:hidden" />
                                <p className="hidden text-sm text-muted-foreground sm:block">{chapter.topics.length} activities</p>
                              </div>
                              <div className="flex shrink-0 items-start gap-2 sm:items-center">
                                <div className="hidden text-right sm:block">
                                  <div className="text-sm font-medium tabular-nums">{chapterProgress}%</div>
                                  <Progress value={chapterProgress} className="mt-1 ml-auto h-2 w-20 sm:ml-0" />
                                </div>
                                {useAccordion && (
                                  <div className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full hover:bg-gray-200/90 active:bg-gray-200 sm:h-9 sm:w-9">
                                    {isExpanded ? (
                                      <ChevronDown className="h-5 w-5 text-gray-600 sm:h-4 sm:w-4" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-gray-600 sm:h-4 sm:w-4" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Topics Grid - Show when expanded or when accordion is disabled */}
                      {isExpanded && (
                        <div className="grid grid-cols-1 gap-2 p-2 pt-1.5 sm:grid-cols-2 sm:gap-3 sm:p-4 sm:pt-2">
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
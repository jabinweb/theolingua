/**
 * Shared helpers for sequential topic unlock and scoring gates.
 */

export interface TopicProgression {
  id: string;
  name: string;
  completed?: boolean;
  requiresPass?: boolean;
  masteryScore?: number | null;
}

export interface ChapterProgression {
  id: string;
  name: string;
  topics: TopicProgression[];
}

export interface UnitProgression {
  id: string;
  name: string;
  chapters: ChapterProgression[];
}

export function getOrderedTopics(unitData: UnitProgression): TopicProgression[] {
  return unitData.chapters.flatMap((ch) => ch.topics);
}

/**
 * Check if a topic should be enabled based on sequential unlock logic.
 * Sequential locking is disabled — all topics in an accessible unit are open.
 */
export function isTopicEnabled(
  topic: TopicProgression,
  unitData: UnitProgression,
  _completedTopics: Set<string>
): boolean {
  if (!unitData) return false;
  return getOrderedTopics(unitData).some((t) => t.id === topic.id);
}

export function isTopicCompleted(
  topicId: string,
  completedTopics: Set<string>
): boolean {
  return completedTopics.has(topicId);
}

export function handleTopicCompletion(
  topicId: string,
  completedTopics: Set<string>,
  setCompletedTopics: (topics: Set<string>) => void
): Set<string> {
  const newCompletedTopics = new Set(completedTopics);
  newCompletedTopics.add(topicId);
  setCompletedTopics(newCompletedTopics);
  return newCompletedTopics;
}

export function getNextTopic(
  currentTopic: TopicProgression,
  unitData: UnitProgression
): TopicProgression | null {
  if (!unitData) return null;

  const allTopics = getOrderedTopics(unitData);
  const currentIndex = allTopics.findIndex((topic) => topic.id === currentTopic.id);

  if (currentIndex !== -1 && currentIndex < allTopics.length - 1) {
    return allTopics[currentIndex + 1];
  }

  return null;
}

/**
 * Next is allowed whenever another topic follows (completion not required).
 */
export function canNavigateToNext(
  currentTopic: TopicProgression,
  unitData: UnitProgression,
  _completedTopics: Set<string>
): boolean {
  if (!unitData || !currentTopic) return false;
  return getNextTopic(currentTopic, unitData) !== null;
}

export function isUnitCompleted(
  unitData: UnitProgression,
  completedTopics: Set<string>
): boolean {
  if (!unitData) return false;

  const allTopics = getOrderedTopics(unitData);
  return allTopics.every(
    (topic) => topic.completed || completedTopics.has(topic.id)
  );
}

export function getUnitProgress(
  unitData: UnitProgression,
  completedTopics: Set<string>
): number {
  if (!unitData) return 0;

  const allTopics = getOrderedTopics(unitData);
  if (allTopics.length === 0) return 0;

  const completedCount = allTopics.filter(
    (topic) => topic.completed || completedTopics.has(topic.id)
  ).length;

  return Math.round((completedCount / allTopics.length) * 100);
}

/**
 * Build a completed-id set from progress map / details.
 */
export function toCompletedTopicSet(
  progress: Map<string, boolean> | Record<string, boolean>
): Set<string> {
  const set = new Set<string>();
  if (progress instanceof Map) {
    progress.forEach((completed, topicId) => {
      if (completed) set.add(topicId);
    });
  } else {
    Object.entries(progress).forEach(([topicId, completed]) => {
      if (completed) set.add(topicId);
    });
  }
  return set;
}

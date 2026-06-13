/**
 * Pure drip-access calculation utility.
 * No DB calls — just math. Call this from API routes after fetching data.
 */

export interface DripConfigEntry {
  subjectId: string;
  unlockAfterDays: number;
}

export interface DripAccessResult {
  subjectId: string;
  isUnlocked: boolean;
  /** 0 if already unlocked, otherwise days until unlock */
  daysRemaining: number;
  /** Days that have elapsed since drip start */
  daysElapsed: number;
}

/**
 * Calculate which subjects are unlocked based on the drip schedule.
 */
export function calculateDripAccess(
  dripStartDate: Date,
  dripConfigs: DripConfigEntry[],
  now: Date = new Date()
): DripAccessResult[] {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.floor((now.getTime() - dripStartDate.getTime()) / msPerDay);

  return dripConfigs.map((config) => {
    const isUnlocked = daysElapsed >= config.unlockAfterDays;
    const daysRemaining = isUnlocked ? 0 : config.unlockAfterDays - daysElapsed;

    return {
      subjectId: config.subjectId,
      isUnlocked,
      daysRemaining,
      daysElapsed,
    };
  });
}

/**
 * Build a quick lookup map: subjectId → DripAccessResult
 */
export function buildDripAccessMap(
  dripStartDate: Date,
  dripConfigs: DripConfigEntry[],
  now: Date = new Date()
): Map<string, DripAccessResult> {
  const results = calculateDripAccess(dripStartDate, dripConfigs, now);
  return new Map(results.map((r) => [r.subjectId, r]));
}

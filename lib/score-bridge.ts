/**
 * LMS score bridge protocol for HTML/iframe activities.
 *
 * Content posts to the parent window:
 *   parent.postMessage({
 *     type: 'theo.score',
 *     score: 8,
 *     maxScore: 10,
 *     // or percent: 80
 *     status: 'passed' | 'failed' // optional; LMS computes from mastery if omitted
 *   }, '*')
 */

export const THEO_SCORE_MESSAGE_TYPE = 'theo.score';

export type TheoScoreStatus = 'passed' | 'failed' | 'incomplete';

export interface TheoScoreMessage {
  type: typeof THEO_SCORE_MESSAGE_TYPE;
  score?: number;
  maxScore?: number;
  percent?: number;
  status?: TheoScoreStatus;
}

export interface NormalizedScore {
  score: number | null;
  maxScore: number | null;
  percent: number;
  status: TheoScoreStatus;
}

export function isTheoScoreMessage(data: unknown): data is TheoScoreMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return msg.type === THEO_SCORE_MESSAGE_TYPE;
}

export function normalizeScorePayload(
  data: TheoScoreMessage,
  masteryScore = 80
): NormalizedScore | null {
  let percent: number | null = null;
  let score: number | null =
    typeof data.score === 'number' && Number.isFinite(data.score) ? data.score : null;
  let maxScore: number | null =
    typeof data.maxScore === 'number' && Number.isFinite(data.maxScore) && data.maxScore > 0
      ? data.maxScore
      : null;

  if (typeof data.percent === 'number' && Number.isFinite(data.percent)) {
    percent = Math.max(0, Math.min(100, data.percent));
  } else if (score !== null && maxScore !== null) {
    percent = Math.max(0, Math.min(100, (score / maxScore) * 100));
  } else if (score !== null && score >= 0 && score <= 1) {
    // Treat 0–1 as a fraction when maxScore is omitted
    percent = Math.max(0, Math.min(100, score * 100));
    maxScore = 1;
  } else if (score !== null && score >= 0 && score <= 100 && maxScore === null) {
    percent = Math.max(0, Math.min(100, score));
    maxScore = 100;
  }

  if (percent === null) return null;

  const rounded = Math.round(percent * 100) / 100;
  let status: TheoScoreStatus = 'incomplete';
  if (data.status === 'passed' || data.status === 'failed' || data.status === 'incomplete') {
    status = data.status;
  } else {
    status = rounded >= masteryScore ? 'passed' : 'failed';
  }

  return {
    score,
    maxScore,
    percent: rounded,
    status,
  };
}

export function defaultMasteryScore(masteryScore: number | null | undefined): number {
  if (typeof masteryScore === 'number' && Number.isFinite(masteryScore)) {
    return Math.max(0, Math.min(100, masteryScore));
  }
  return 80;
}

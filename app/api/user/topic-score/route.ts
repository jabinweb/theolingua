import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logTopicCompleted } from '@/lib/activity-logger';
import {
  defaultMasteryScore,
  isTheoScoreMessage,
  normalizeScorePayload,
  type TheoScoreMessage,
} from '@/lib/score-bridge';

/**
 * POST /api/user/topic-score
 * Records an attempt from an HTML/iframe activity score bridge message.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const topicId = body.topicId?.toString();

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        name: true,
        requiresPass: true,
        masteryScore: true,
        maxAttempts: true,
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const mastery = defaultMasteryScore(topic.masteryScore);
    const message: TheoScoreMessage = isTheoScoreMessage(body)
      ? body
      : {
          type: 'theo.score',
          score: body.score,
          maxScore: body.maxScore,
          percent: body.percent,
          status: body.status,
        };

    const normalized = normalizeScorePayload(message, mastery);
    if (!normalized) {
      return NextResponse.json(
        { error: 'Invalid score payload. Send score/maxScore or percent.' },
        { status: 400 }
      );
    }

    const existingProgress = await prisma.userTopicProgress.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });

    const nextAttemptNumber = (existingProgress?.attemptCount ?? 0) + 1;

    if (
      topic.maxAttempts != null &&
      topic.maxAttempts > 0 &&
      nextAttemptNumber > topic.maxAttempts &&
      !existingProgress?.completed
    ) {
      return NextResponse.json(
        {
          error: 'Maximum attempts reached for this topic',
          maxAttempts: topic.maxAttempts,
          attemptCount: existingProgress?.attemptCount ?? 0,
        },
        { status: 403 }
      );
    }

    const passed =
      normalized.status === 'passed' ||
      (topic.requiresPass ? normalized.percent >= mastery : normalized.percent >= mastery);

    const attempt = await prisma.topicAttempt.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        topicId,
        attemptNumber: nextAttemptNumber,
        score: normalized.score,
        maxScore: normalized.maxScore,
        percent: normalized.percent,
        passed,
        status: passed ? 'passed' : normalized.status === 'incomplete' ? 'incomplete' : 'failed',
        rawPayload: body,
      },
    });

    const bestScore = Math.max(existingProgress?.bestScore ?? 0, normalized.percent);

    // requiresPass: complete only on pass. Otherwise auto-complete when mastery is met.
    const completed = Boolean(existingProgress?.completed) || passed;
    const newlyCompleted = completed && !existingProgress?.completed;

    const progress = await prisma.userTopicProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      create: {
        id: crypto.randomUUID(),
        userId,
        topicId,
        completed,
        completedAt: completed ? new Date() : null,
        bestScore: normalized.percent,
        lastScore: normalized.percent,
        attemptCount: 1,
      },
      update: {
        completed,
        completedAt: newlyCompleted
          ? new Date()
          : existingProgress?.completedAt ?? null,
        bestScore,
        lastScore: normalized.percent,
        attemptCount: nextAttemptNumber,
        updatedAt: new Date(),
      },
    });

    if (newlyCompleted) {
      await logTopicCompleted(userId, topicId, topic.name);
    }

    return NextResponse.json({
      success: true,
      passed,
      completed: progress.completed,
      percent: normalized.percent,
      masteryScore: mastery,
      requiresPass: topic.requiresPass,
      attempt: {
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        percent: attempt.percent,
        passed: attempt.passed,
        status: attempt.status,
      },
      progress: {
        topicId: progress.topicId,
        completed: progress.completed,
        bestScore: progress.bestScore,
        lastScore: progress.lastScore,
        attemptCount: progress.attemptCount,
      },
      canRetry:
        !progress.completed &&
        (topic.maxAttempts == null || nextAttemptNumber < topic.maxAttempts),
    });
  } catch (error) {
    console.error('Error recording topic score:', error);
    return NextResponse.json({ error: 'Failed to record score' }, { status: 500 });
  }
}

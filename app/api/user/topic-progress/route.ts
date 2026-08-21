import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logTopicCompleted } from '@/lib/activity-logger';

// GET - Fetch user's topic progress
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    const progress = await prisma.userTopicProgress.findMany({
      where: { userId },
      select: {
        topicId: true,
        completed: true,
        completedAt: true,
        bestScore: true,
        lastScore: true,
        attemptCount: true,
      },
    });

    const progressMap: Record<string, boolean> = {};
    const progressDetails: Record<
      string,
      {
        completed: boolean;
        completedAt: Date | null;
        bestScore: number | null;
        lastScore: number | null;
        attemptCount: number;
      }
    > = {};

    progress.forEach((item) => {
      const key = item.topicId.toString();
      progressMap[key] = item.completed;
      progressDetails[key] = {
        completed: item.completed,
        completedAt: item.completedAt,
        bestScore: item.bestScore,
        lastScore: item.lastScore,
        attemptCount: item.attemptCount,
      };
    });

    return NextResponse.json({
      progress: progressMap,
      progressDetails,
      progressList: progress,
    });
  } catch (error) {
    console.error('Error fetching topic progress:', error);
    return NextResponse.json({ error: 'Failed to fetch topic progress' }, { status: 500 });
  }
}

// POST - Update user's topic progress (manual complete for non-scored topics)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { topicId, completed = true } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    const topicIdString = topicId.toString();

    const topic = await prisma.topic.findUnique({
      where: { id: topicIdString },
      select: { id: true, name: true, requiresPass: true },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (topic.requiresPass && completed) {
      const existingProgress = await prisma.userTopicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId: topicIdString,
          },
        },
      });

      // Idempotent: already completed via score bridge
      if (existingProgress?.completed) {
        return NextResponse.json({
          success: true,
          progress: {
            topicId: existingProgress.topicId,
            completed: existingProgress.completed,
            completedAt: existingProgress.completedAt,
          },
        });
      }

      const passedAttempt = await prisma.topicAttempt.findFirst({
        where: { userId, topicId: topicIdString, passed: true },
        select: { id: true },
      });

      if (!passedAttempt) {
        return NextResponse.json(
          {
            error:
              'This topic requires a passing score from the activity. Complete the activity to unlock progress.',
            requiresPass: true,
          },
          { status: 400 }
        );
      }
    }

    const existingProgress = await prisma.userTopicProgress.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId: topicIdString,
        },
      },
    });

    const result = existingProgress
      ? await prisma.userTopicProgress.update({
          where: {
            userId_topicId: {
              userId,
              topicId: topicIdString,
            },
          },
          data: {
            completed,
            completedAt: completed ? new Date() : null,
            updatedAt: new Date(),
          },
        })
      : await prisma.userTopicProgress.create({
          data: {
            userId,
            topicId: topicIdString,
            completed,
            completedAt: completed ? new Date() : null,
          },
        });

    if (completed && result.completed) {
      await logTopicCompleted(userId, topicIdString, topic.name);
    }

    return NextResponse.json({
      success: true,
      progress: {
        topicId: result.topicId,
        completed: result.completed,
        completedAt: result.completedAt,
      },
    });
  } catch (error) {
    console.error('Error updating topic progress:', error);
    return NextResponse.json({ error: 'Failed to update topic progress' }, { status: 500 });
  }
}

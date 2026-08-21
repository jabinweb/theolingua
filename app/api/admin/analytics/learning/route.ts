import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-utils';
import { startOfDay, addDays } from 'date-fns';

const ALLOWED_PERIODS = new Set([7, 30, 90]);

export async function GET(request: NextRequest) {
  try {
    const [authOk, authVal] = await isAdmin();
    if (!authOk) return authVal;

    const { searchParams } = new URL(request.url);
    const rawPeriod = parseInt(searchParams.get('period') || '30', 10);
    const periodDays = ALLOWED_PERIODS.has(rawPeriod) ? rawPeriod : 30;

    const now = new Date();
    const periodStart = startOfDay(addDays(now, -periodDays));

    const [
      totalStudents,
      activeLearnerGroups,
      topicsCompleted,
      totalProgressRows,
      timeSpentAgg,
      topTopicGroups,
      recentCompletionsRaw,
      classes,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),

      prisma.userTopicProgress.groupBy({
        by: ['userId'],
        where: {
          updatedAt: { gte: periodStart },
        },
      }),

      prisma.userTopicProgress.count({ where: { completed: true } }),

      prisma.userTopicProgress.count(),

      prisma.userTopicProgress.aggregate({
        _sum: { timeSpent: true },
      }),

      prisma.userTopicProgress.groupBy({
        by: ['topicId'],
        where: { completed: true },
        _count: { topicId: true },
        orderBy: { _count: { topicId: 'desc' } },
        take: 10,
      }),

      prisma.userTopicProgress.findMany({
        where: { completed: true, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, email: true, displayName: true } },
          topic: { select: { name: true } },
        },
      }),

      prisma.class.findMany({
        select: {
          id: true,
          name: true,
          subjects: {
            select: {
              chapters: {
                select: {
                  topics: {
                    select: {
                      id: true,
                      progress: {
                        select: {
                          userId: true,
                          completed: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Per-student completion rate among learners with any progress
    const [studentProgress, studentCompleted] = await Promise.all([
      prisma.userTopicProgress.groupBy({
        by: ['userId'],
        _count: true,
      }),
      prisma.userTopicProgress.groupBy({
        by: ['userId'],
        where: { completed: true },
        _count: true,
      }),
    ]);

    const completedByUser = new Map(
      studentCompleted.map((row) => [row.userId, row._count])
    );

    let avgCompletionRate = 0;
    if (studentProgress.length > 0) {
      const rates = studentProgress.map((row) => {
        const completed = completedByUser.get(row.userId) || 0;
        const total = row._count || 1;
        return (completed / total) * 100;
      });
      avgCompletionRate =
        rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    }

    const totalTimeSpentSeconds = timeSpentAgg._sum.timeSpent || 0;
    const totalTimeSpentMinutes = Math.round(totalTimeSpentSeconds / 60);

    const topicIds = topTopicGroups.map((g) => g.topicId);
    const topics = topicIds.length
      ? await prisma.topic.findMany({
          where: { id: { in: topicIds } },
          select: {
            id: true,
            name: true,
            chapter: {
              select: {
                name: true,
                subject: {
                  select: {
                    class: { select: { name: true } },
                  },
                },
              },
            },
          },
        })
      : [];

    const topicMeta = new Map(topics.map((t) => [t.id, t]));

    const topTopics = topTopicGroups.map((g) => {
      const meta = topicMeta.get(g.topicId);
      return {
        topicId: g.topicId,
        topicName: meta?.name ?? 'Unknown topic',
        chapterName: meta?.chapter.name ?? 'Unknown chapter',
        programName: meta?.chapter.subject.class.name ?? 'Unknown program',
        completions: g._count.topicId,
      };
    });

    const programCompletion = classes.map((cls) => {
      const allTopics = cls.subjects.flatMap((s) =>
        s.chapters.flatMap((c) => c.topics)
      );
      const topicCount = allTopics.length;
      let completions = 0;
      const learnerIds = new Set<string>();

      for (const topic of allTopics) {
        for (const progress of topic.progress) {
          learnerIds.add(progress.userId);
          if (progress.completed) completions += 1;
        }
      }

      return {
        id: cls.id,
        name: cls.name,
        topicCount,
        completions,
        uniqueLearners: learnerIds.size,
      };
    });

    const recentCompletions = recentCompletionsRaw.map((row) => ({
      id: row.id,
      userName: row.user.displayName || row.user.name || 'Unknown',
      userEmail: row.user.email,
      topicName: row.topic.name,
      completedAt: row.completedAt,
    }));

    return NextResponse.json({
      overview: {
        totalStudents,
        activeLearners: activeLearnerGroups.length,
        topicsCompleted,
        totalProgressRows,
        avgCompletionRate: Number(avgCompletionRate.toFixed(1)),
        totalTimeSpentMinutes,
        periodDays,
      },
      topTopics,
      programCompletion,
      recentCompletions,
    });
  } catch (error) {
    console.error('Error fetching learning analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning analytics' },
      { status: 500 }
    );
  }
}

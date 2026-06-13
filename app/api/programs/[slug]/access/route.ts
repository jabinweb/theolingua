import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildDripAccessMap } from '@/lib/drip-access';

interface UnitAccess {
  id: string;
  name: string;
  hasAccess: boolean;
  accessType: 'school' | 'class_subscription' | 'subject_subscription' | 'free_trial' | 'none' | 'drip_locked';
  price?: number;
  currency?: string;
  canUpgrade?: boolean;
  accessibleChapters?: string[];
  dripLocked?: boolean;
  daysRemaining?: number;
}

interface DbSubject {
  id: string;
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
  price: number | null;
  currency: string;
  chapters: Array<{
    id: string;
    name: string;
    orderIndex: number;
  }>;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { slug } = await params;

    if (!userId || !slug) {
      return NextResponse.json({ error: 'User ID and Program ID are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        school: true,
        batch: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isNumeric = /^\d+$/.test(slug);

    const programData = await prisma.class.findUnique({
      where: isNumeric ? { id: parseInt(slug), isActive: true } : { slug, isActive: true },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            orderIndex: true,
            price: true,
            currency: true,
            chapters: {
              select: { id: true, name: true, orderIndex: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!programData) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      select: {
        id: true,
        classId: true,
        subjectId: true,
        planType: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    });

    const classSubscription = subscriptions.find((s) => s.classId === programData.id && !s.subjectId);
    const subjectSubscriptions = new Map(
      subscriptions.filter((s) => s.subjectId).map((s) => [s.subjectId, s])
    );

    const gradeToClassMap: Record<string, number[]> = {
      '5': [5],
      '6': [6],
      '7': [7],
      '8': [8],
      '9': [9],
      '10': [10],
    };
    const hasSchoolAccess =
      user.school?.isActive && user.grade && (gradeToClassMap[user.grade] || []).includes(programData.id);

    const hasBatchAccess = user.batch?.classId === programData.id;
    const isFreeProgram = programData.price === 0 || programData.price === null;

    let dripAccessMap = new Map<string, { isUnlocked: boolean; daysRemaining: number }>();
    let isDripActive = false;

    const batch = user.batch;
    if (batch && batch.isDripEnabled && batch.dripStartDate && hasBatchAccess) {
      isDripActive = true;
      const dripConfigs = await prisma.batchDripConfig.findMany({
        where: { batchId: batch.id },
        select: { subjectId: true, unlockAfterDays: true },
      });

      const rawMap = buildDripAccessMap(new Date(batch.dripStartDate), dripConfigs);
      rawMap.forEach((value, key) => {
        dripAccessMap.set(key, {
          isUnlocked: value.isUnlocked,
          daysRemaining: value.daysRemaining,
        });
      });
    }

    const unitAccess: UnitAccess[] = programData.subjects.map((subject: DbSubject) => {
      const hasSubjectSubscription = subjectSubscriptions.has(subject.id);
      const allChapters = subject.chapters.map((ch) => ch.id);

      let accessibleChapters: string[] = [];
      if (isFreeProgram || hasSchoolAccess || !!classSubscription || hasSubjectSubscription || hasBatchAccess) {
        accessibleChapters = allChapters;
      } else if (subject.chapters.length > 0) {
        const firstChapter = [...subject.chapters].sort((a, b) => a.orderIndex - b.orderIndex)[0];
        accessibleChapters = [firstChapter.id];
      }

      let accessType: UnitAccess['accessType'] = 'none';
      if (hasSchoolAccess) accessType = 'school';
      else if (classSubscription || hasBatchAccess) accessType = 'class_subscription';
      else if (hasSubjectSubscription) accessType = 'subject_subscription';
      else if (accessibleChapters.length > 0 && accessibleChapters.length < subject.chapters.length) {
        accessType = 'free_trial';
      }

      if (isDripActive && dripAccessMap.size > 0) {
        const dripResult = dripAccessMap.get(subject.id);
        if (dripResult && !dripResult.isUnlocked) {
          return {
            id: subject.id,
            name: subject.name,
            hasAccess: false,
            accessType: 'drip_locked',
            price: subject.price || undefined,
            currency: subject.currency,
            canUpgrade: false,
            accessibleChapters: [],
            dripLocked: true,
            daysRemaining: dripResult.daysRemaining,
          };
        }
      }

      const hasAccess = accessibleChapters.length > 0;

      return {
        id: subject.id,
        name: subject.name,
        hasAccess,
        accessType,
        price: subject.price || undefined,
        currency: subject.currency,
        canUpgrade: hasSubjectSubscription && !classSubscription && !hasBatchAccess,
        accessibleChapters,
        dripLocked: false,
        daysRemaining: 0,
      };
    });

    return NextResponse.json({
      classId: programData.id,
      className: programData.name,
      classPrice: programData.price,
      hasFullAccess: isFreeProgram || hasSchoolAccess || !!classSubscription || hasBatchAccess,
      accessType: hasSchoolAccess
        ? 'school'
        : classSubscription || hasBatchAccess
          ? 'class_subscription'
          : isDripActive
            ? 'drip'
            : 'partial',
      unitAccess,
      canUpgradeToClass: subjectSubscriptions.size > 0 && !classSubscription && !hasBatchAccess,
      upgradeOptions:
        subjectSubscriptions.size > 0 && !classSubscription && !hasBatchAccess && programData.price
          ? {
              currentSubjects: Array.from(subjectSubscriptions.keys()),
              classPrice: programData.price,
              potentialSavings:
                subjectSubscriptions.size * Math.ceil(programData.price / programData.subjects.length) -
                programData.price,
            }
          : null,
      isDripActive,
      subscriptionDetails: classSubscription
        ? {
            id: classSubscription.id,
            planType: classSubscription.planType,
            startDate: classSubscription.startDate,
            endDate: classSubscription.endDate,
            status: classSubscription.status,
          }
        : null,
    });
  } catch (error) {
    console.error('Error in program access API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

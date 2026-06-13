import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * GET /api/admin/batches/[id]/drip
 * Returns the drip configuration for a batch, including all subjects for the class.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== 'ADMIN' && role !== 'TEACHER' && role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: batchId } = await params;

  try {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        class: {
          include: {
            subjects: {
              orderBy: { orderIndex: 'asc' as const },
              select: { id: true, name: true, icon: true, color: true, orderIndex: true },
            },
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Fetch drip configs separately to avoid Prisma type issues during hot-reload
    const dripConfigs = await prisma.batchDripConfig.findMany({
      where: { batchId },
    });

    const configMap = new Map(dripConfigs.map((c) => [c.subjectId, c.unlockAfterDays]));

    const subjects = batch.class.subjects.map((subject, index) => ({
      id: subject.id,
      name: subject.name,
      icon: subject.icon,
      color: subject.color,
      orderIndex: subject.orderIndex,
      unlockAfterDays: configMap.get(subject.id) ?? index * 7,
    }));

    return NextResponse.json({
      batchId: batch.id,
      batchName: batch.name,
      className: batch.class.name,
      isDripEnabled: batch.isDripEnabled,
      dripStartDate: batch.dripStartDate,
      subjects,
    });
  } catch (error) {
    console.error('Error fetching drip config:', error);
    return NextResponse.json({ error: 'Failed to fetch drip config' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/batches/[id]/drip
 * Saves the drip configuration for a batch.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== 'ADMIN' && role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: batchId } = await params;

  try {
    const body = await request.json();
    const { isDripEnabled, dripStartDate, subjects } = body as {
      isDripEnabled: boolean;
      dripStartDate: string | null;
      subjects: Array<{ id: string; unlockAfterDays: number }>;
    };

    if (!Array.isArray(subjects)) {
      return NextResponse.json({ error: 'subjects must be an array' }, { status: 400 });
    }

    // Update batch drip settings (use any cast while Prisma client propagates)
    await prisma.batch.update({
      where: { id: batchId },
      data: {
        isDripEnabled,
        dripStartDate: dripStartDate ? new Date(dripStartDate) : null,
      },
    });

    await Promise.all(
      subjects.map((subject) =>
        prisma.batchDripConfig.upsert({
          where: { batchId_subjectId: { batchId, subjectId: subject.id } },
          create: {
            batchId,
            subjectId: subject.id,
            unlockAfterDays: subject.unlockAfterDays,
          },
          update: {
            unlockAfterDays: subject.unlockAfterDays,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving drip config:', error);
    return NextResponse.json({ error: 'Failed to save drip config' }, { status: 500 });
  }
}

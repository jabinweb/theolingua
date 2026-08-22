import { prisma } from '@/lib/prisma';

/** Only admins bypass subscription checks and see every program. */
export function hasAllProgramAccess(role?: string | null): boolean {
  return role === 'ADMIN';
}

/** Admins and teachers preview curriculum without sequential topic locks. */
export function hasStaffProgramPreview(role?: string | null): boolean {
  return role === 'ADMIN' || role === 'TEACHER';
}

export async function syncUserProgramSubscriptions(userId: string, classIds: number[]) {
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);
  const now = new Date();

  const existing = await prisma.subscription.findMany({
    where: {
      userId,
      subjectId: null,
      status: 'ACTIVE',
      endDate: { gte: now },
    },
    select: { id: true, classId: true },
  });

  const targetIds = new Set(classIds);
  const existingIds = new Set(
    existing.map((sub) => sub.classId).filter((id): id is number => id != null)
  );

  for (const sub of existing) {
    if (sub.classId != null && !targetIds.has(sub.classId)) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'INACTIVE', updatedAt: now },
      });
    }
  }

  for (const classId of classIds) {
    if (existingIds.has(classId)) continue;

    await prisma.subscription.create({
      data: {
        user: { connect: { id: userId } },
        class: { connect: { id: classId } },
        amount: 0,
        status: 'ACTIVE',
        planType: 'CLASS',
        currency: 'INR',
        startDate: now,
        endDate,
      },
    });
  }
}

export async function getUserProgramClassIds(userId: string): Promise<number[]> {
  const now = new Date();
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      subjectId: null,
      status: 'ACTIVE',
      endDate: { gte: now },
      classId: { not: null },
    },
    select: { classId: true },
  });

  return [...new Set(subscriptions.map((s) => s.classId!).filter(Boolean))];
}

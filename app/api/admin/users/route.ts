import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isAdminOrModerator } from '@/lib/auth-utils';
import { syncUserProgramSubscriptions } from '@/lib/user-program-access';
import { findUserByEmail, normalizeEmail } from '@/lib/normalize-email';

export async function GET() {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const users = await prisma.user.findMany({
      include: {
        subscriptions: { orderBy: { created_at: 'desc' } },
        payments: { orderBy: { created_at: 'desc' } },
        batch: { select: { id: true, name: true } },
        progress: { select: { timeSpent: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const usersWithSubscriptions = users.map((user) => {
      const activeSubscription = user.subscriptions.find((sub) => sub.status === 'ACTIVE');
      const completedPayments = user.payments.filter((payment) => payment.status === 'COMPLETED');
      const totalSecondsSpent = user.progress.reduce((acc, p) => acc + (p.timeSpent || 0), 0);
      const totalTimeSpent = Math.floor(totalSecondsSpent / 60);

      return {
        uid: user.id,
        email: user.email || '',
        displayName: user.name || user.displayName || user.email?.split('@')[0] || 'User',
        photoUrl: user.image || null,
        collegeName: user.collegeName || null,
        phone: user.phone || null,
        creationTime: user.created_at,
        lastSignInTime: user.updatedAt,
        role: user.role || 'STUDENT',
        isActive: user.isActive !== undefined ? user.isActive : true,
        subscription: activeSubscription
          ? {
              id: activeSubscription.id,
              status: activeSubscription.status,
              amount: activeSubscription.amount,
              planType: activeSubscription.planType,
              startDate: activeSubscription.startDate,
              endDate: activeSubscription.endDate,
              created_at: activeSubscription.created_at,
            }
          : null,
        hasActiveSubscription: !!activeSubscription,
        totalPayments: user.payments.length,
        totalAmountPaid: completedPayments.reduce((sum, payment) => sum + payment.amount, 0),
        totalTimeSpent,
        batchId: user.batchId,
        batch: user.batch,
        programAccessIds: user.subscriptions
          .filter((sub) => sub.status === 'ACTIVE' && sub.classId && !sub.subjectId)
          .map((sub) => sub.classId as number),
      };
    });

    return NextResponse.json(usersWithSubscriptions.filter((u) => u && u.uid && u.email));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'ADMIN' && authVal.role === 'MODERATOR') {
      return NextResponse.json({ error: 'Moderators cannot delete administrator users' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const { email: rawEmail, displayName, password, role, isActive, collegeName, phone, batchId, programClassIds } =
      await request.json();

    if (!rawEmail || !displayName || !password) {
      return NextResponse.json({ error: 'Email, display name, and password are required' }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);

    const userRole = role || 'STUDENT';
    const classIds: number[] = Array.isArray(programClassIds)
      ? programClassIds.map((id: number) => Number(id)).filter((id: number) => !Number.isNaN(id))
      : [];

    if (userRole === 'TEACHER' && classIds.length === 0) {
      return NextResponse.json(
        { error: 'Select at least one program level for teachers' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    if (role === 'ADMIN' && authVal.role === 'MODERATOR') {
      return NextResponse.json({ error: 'Moderators cannot create administrator users' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: displayName,
        password: hashedPassword,
        role: userRole,
        isActive: isActive !== undefined ? isActive : true,
        collegeName: collegeName || null,
        phone: phone || null,
        batchId: batchId || null,
        emailVerified: new Date(),
      },
    });

    if (userRole === 'TEACHER' && classIds.length > 0) {
      await syncUserProgramSubscriptions(user.id, classIds);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const { userId, displayName, role, isActive, collegeName, phone, batchId, programClassIds } =
      await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: {
      name?: string;
      role?: 'STUDENT' | 'ADMIN' | 'TEACHER' | 'MODERATOR';
      isActive?: boolean;
      collegeName?: string;
      phone?: string;
      batchId?: string | null;
    } = {};

    if (displayName !== undefined) updateData.name = displayName;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (collegeName !== undefined) updateData.collegeName = collegeName;
    if (phone !== undefined) updateData.phone = phone;
    if (batchId !== undefined) updateData.batchId = batchId || null;

    if (role === 'ADMIN' && authVal.role === 'MODERATOR') {
      return NextResponse.json({ error: 'Moderators cannot promote users to administrator' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'ADMIN' && authVal.role === 'MODERATOR') {
      return NextResponse.json({ error: 'Moderators cannot modify administrator users' }, { status: 403 });
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });

    if (Array.isArray(programClassIds)) {
      const targetRole = role ?? targetUser.role;
      if (targetRole === 'TEACHER') {
        const classIds = programClassIds
          .map((id: number) => Number(id))
          .filter((id: number) => !Number.isNaN(id));
        if (classIds.length === 0) {
          return NextResponse.json(
            { error: 'Teachers must have at least one program level selected' },
            { status: 400 }
          );
        }
        await syncUserProgramSubscriptions(userId, classIds);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

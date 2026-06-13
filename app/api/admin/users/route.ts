import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isAdminOrModerator } from '@/lib/auth-utils';

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

    if (targetUser?.role === 'ADMIN' && authVal.role === 'MODERATOR') {
      return NextResponse.json({ error: 'Moderators cannot delete administrator users' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const { email, displayName, password, role, isActive, collegeName, phone, batchId } = await request.json();

    if (!email || !displayName || !password) {
      return NextResponse.json({ error: 'Email, display name, and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
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
        role: role || 'STUDENT',
        isActive: isActive !== undefined ? isActive : true,
        collegeName: collegeName || null,
        phone: phone || null,
        batchId: batchId || null,
        emailVerified: new Date(),
      },
    });

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
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const { userId, displayName, role, isActive, collegeName, phone, batchId } = await request.json();

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

    if (targetUser?.role === 'ADMIN' && authVal.role === 'MODERATOR') {
      return NextResponse.json({ error: 'Moderators cannot modify administrator users' }, { status: 403 });
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

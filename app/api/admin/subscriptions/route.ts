import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const distinct = searchParams.get('distinct');

    if (distinct === 'planType') {
      const planTypes = await prisma.subscription.findMany({
        distinct: ['planType'],
        select: { planType: true },
      });
      return NextResponse.json(planTypes);
    }

    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const transformedSubscriptions = subscriptions.map((sub: typeof subscriptions[number]) => ({
      ...sub,
      amount: sub.amount || 0,
      paymentId: sub.id,
      created_at: sub.created_at,
      user: {
        email: sub.user?.email,
        display_name: sub.user?.name
      }
    }));

    return NextResponse.json(transformedSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const [authOk, authVal] = await isAdmin();
    if (!authOk) return authVal;

    const { subscriptionId, status } = await request.json();
    
    if (!subscriptionId || !status) {
      return NextResponse.json({ error: 'Subscription ID and status are required' }, { status: 400 });
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const [authOk, authVal] = await isAdmin();
    if (!authOk) return authVal;

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    await prisma.subscription.delete({
      where: { id: subscriptionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const [authOk, authVal] = await isAdmin();
    if (!authOk) return authVal;

    const body = await request.json();
    const {
      userId,
      classId,
      classIds,
      batchId,
      amount = 0,
      status = 'ACTIVE',
      planType = 'CLASS',
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const programIds: number[] = Array.isArray(classIds) && classIds.length > 0
      ? classIds.map((id: number) => Number(id)).filter((id: number) => !Number.isNaN(id))
      : classId
        ? [Number(classId)]
        : [];

    if (!batchId && programIds.length === 0) {
      return NextResponse.json(
        { error: 'Select at least one program or assign a batch' },
        { status: 400 }
      );
    }

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    const startDate = new Date();

    const result = await prisma.$transaction(async (tx) => {
      if (batchId) {
        await tx.user.update({
          where: { id: userId },
          data: { batchId },
        });
      }

      const created: string[] = [];
      const skipped: number[] = [];

      for (const cid of programIds) {
        const existing = await tx.subscription.findFirst({
          where: {
            userId,
            classId: cid,
            subjectId: null,
            status: 'ACTIVE',
            endDate: { gte: new Date() },
          },
        });

        if (existing) {
          skipped.push(cid);
          continue;
        }

        const subscription = await tx.subscription.create({
          data: {
            user: { connect: { id: userId } },
            class: { connect: { id: cid } },
            amount: Number(amount) || 0,
            status,
            planType,
            currency: 'INR',
            startDate,
            endDate,
          },
        });
        created.push(subscription.id);
      }

      return { created, skipped };
    });

    return NextResponse.json({
      success: true,
      createdCount: result.created.length,
      skippedCount: result.skipped.length,
      batchAssigned: Boolean(batchId),
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

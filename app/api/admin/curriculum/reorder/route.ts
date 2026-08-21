import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

type ReorderType = 'unit' | 'chapter' | 'topic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const type = body?.type as ReorderType | undefined;
    const orderedIds = body?.orderedIds as string[] | undefined;

    if (!type || !['unit', 'chapter', 'topic'].includes(type)) {
      return NextResponse.json(
        { error: "type must be 'unit', 'chapter', or 'topic'" },
        { status: 400 }
      );
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds must be a non-empty array' }, { status: 400 });
    }

    if (!orderedIds.every((id) => typeof id === 'string' && id.length > 0)) {
      return NextResponse.json({ error: 'orderedIds must be an array of string ids' }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) => {
        if (type === 'unit') {
          return prisma.subject.update({
            where: { id },
            data: { orderIndex: index },
          });
        }
        if (type === 'chapter') {
          return prisma.chapter.update({
            where: { id },
            data: { orderIndex: index },
          });
        }
        return prisma.topic.update({
          where: { id },
          data: { orderIndex: index },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering curriculum:', error);
    return NextResponse.json({ error: 'Failed to reorder curriculum' }, { status: 500 });
  }
}

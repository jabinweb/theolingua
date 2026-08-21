import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const programs = await prisma.class.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        subjects: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            name: true,
            orderIndex: true,
            icon: true,
            color: true,
            chapters: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                name: true,
                orderIndex: true,
                topics: {
                  orderBy: { orderIndex: 'asc' },
                  select: {
                    id: true,
                    name: true,
                    orderIndex: true,
                    type: true,
                    content: {
                      select: {
                        contentType: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const tree = programs.map((program) => ({
      id: program.id,
      name: program.name,
      slug: program.slug,
      isActive: program.isActive,
      units: program.subjects.map((unit) => ({
        id: unit.id,
        name: unit.name,
        orderIndex: unit.orderIndex,
        icon: unit.icon,
        color: unit.color,
        chapters: unit.chapters.map((chapter) => ({
          id: chapter.id,
          name: chapter.name,
          orderIndex: chapter.orderIndex,
          topics: chapter.topics.map((topic) => ({
            id: topic.id,
            name: topic.name,
            orderIndex: topic.orderIndex,
            type: topic.type,
            contentType: topic.content?.contentType ?? null,
          })),
        })),
      })),
    }));

    return NextResponse.json({ programs: tree });
  } catch (error) {
    console.error('Error fetching curriculum tree:', error);
    return NextResponse.json({ error: 'Failed to fetch curriculum tree' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Next.js 15: params is a Promise and must be awaited
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Support both numeric IDs and slugs
    const isNumeric = /^\d+$/.test(slug);
    
    // Return structure without actual content data
    const classData = await prisma.class.findUnique({
      where: isNumeric 
        ? { id: parseInt(slug) }
        : { slug: slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        isActive: true,
        currency: true,
        price: true,
        subjects: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            isLocked: true,
            orderIndex: true,
            currency: true,
            price: true,
            chapters: {
              select: {
                id: true,
                name: true,
                orderIndex: true,
                topics: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    duration: true,
                    orderIndex: true,
                    description: true,
                    difficulty: true,
                    requiresPass: true,
                    masteryScore: true,
                    maxAttempts: true,
                    // Exclude content - this protects the data
                  },
                  orderBy: { orderIndex: 'asc' },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Transform response to include both 'subjects' and 'units' for compatibility
    const responseData = {
      ...classData,
      units: classData.subjects, // Add units alias for frontend
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching program data:', error);
    return NextResponse.json({ error: 'Failed to fetch program data' }, { status: 500 });
  }
}

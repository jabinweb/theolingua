import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logTopicStarted } from '@/lib/activity-logger';

// Server-side function to verify topic access
async function verifyTopicAccess(userId: string, topicId: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        chapter: {
          include: {
            subject: {
              include: {
                class: true,
                chapters: {
                  orderBy: { orderIndex: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!topic) return { hasAccess: false, topic: null };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true, batch: true }
    });

    if (!user) return { hasAccess: false, topic };

    if (user.role === 'ADMIN') {
      return { hasAccess: true, topic };
    }

    const classId = topic.chapter.subject.classId;
    const subjectId = topic.chapter.subjectId;
    const classPrice = topic.chapter.subject.class.price;
    const chapterId = topic.chapter.id;

    const isFreeProgram = classPrice === 0 || classPrice === null;
    if (isFreeProgram) {
      return { hasAccess: true, topic };
    }

    if (user.batch?.classId === classId) {
      return { hasAccess: true, topic };
    }

    const gradeToClassMap: Record<string, number[]> = {
      '5': [5],
      '6': [6],
      '7': [7],
      '8': [8],
      '9': [9],
      '10': [10],
    };
    const hasSchoolAccess =
      user.school?.isActive &&
      user.grade &&
      (gradeToClassMap[user.grade] || []).includes(classId);
    if (hasSchoolAccess) {
      return { hasAccess: true, topic };
    }

    const firstChapter =
      topic.chapter.subject.chapters.find((ch) => ch.orderIndex === 0) ||
      topic.chapter.subject.chapters.sort((a, b) => a.orderIndex - b.orderIndex)[0];

    if (firstChapter && firstChapter.id === chapterId) {
      return { hasAccess: true, topic, isFreeTrialAccess: true };
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
        OR: [{ classId }, { subjectId }],
      },
    });

    if (subscription) {
      return { hasAccess: true, topic };
    }

    return { hasAccess: false, topic };
  } catch (error) {
    console.error('Error verifying topic access:', error);
    return { hasAccess: false, topic: null };
  }
}

function normalizePlayerContent(content: {
  contentType: string;
  url: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  textContent: string | null;
  iframeHtml: string | null;
  widgetConfig: unknown;
}) {
  const fileUrl = content.pdfUrl || content.url || '';
  const looksLikePdf = /\.pdf(\?|#|$)/i.test(fileUrl);
  const contentType =
    content.contentType === 'PDF' || looksLikePdf ? 'PDF' : content.contentType;
  const pdfUrl =
    contentType === 'PDF' ? content.pdfUrl || content.url : content.pdfUrl;

  return {
    contentType,
    url: content.url,
    videoUrl: content.videoUrl,
    pdfUrl,
    textContent: content.textContent,
    iframeHtml: content.iframeHtml,
    widgetConfig: content.widgetConfig,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify access
    const { hasAccess, topic } = await verifyTopicAccess(session.user.id, topicId);

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Access denied. You need an active subscription to view this content.' 
      }, { status: 403 });
    }

    // Get topic content only if user has access
    const topicWithContent = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        content: true
      }
    });

    if (!topicWithContent?.content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Log topic access activity
    await logTopicStarted(session.user.id, topicId, topic.name);

    // Return only the content data that the ContentPlayer needs
    const content = topicWithContent.content;

    return NextResponse.json({
      id: topicWithContent.id,
      name: topicWithContent.name,
      description: topicWithContent.description,
      type: topicWithContent.type,
      duration: topicWithContent.duration,
      content: normalizePlayerContent(content),
    });

  } catch (error) {
    console.error('Error fetching topic content:', error);
    return NextResponse.json({ error: 'Failed to fetch topic content' }, { status: 500 });
  }
}
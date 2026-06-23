import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logTopicStarted } from '@/lib/activity-logger';

// Server-side function to verify topic access
async function verifyTopicAccess(userId: string, topicId: string) {
  try {
    // Get topic with subject and class info
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

    // Get user with school info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true }
    });

    if (!user) return { hasAccess: false, topic };

    const classId = topic.chapter.subject.classId;
    const subjectId = topic.chapter.subjectId;
    const classPrice = topic.chapter.subject.class.price;
    const chapterId = topic.chapter.id;

    // Check if program is free (price = 0)
    const isFreeProgram = classPrice === 0 || classPrice === null;
    if (isFreeProgram) {
      return { hasAccess: true, topic };
    }

    // Check if this chapter is the first chapter of its subject (free trial access)
    const firstChapter = topic.chapter.subject.chapters.find(ch => ch.orderIndex === 0) || 
                        topic.chapter.subject.chapters.sort((a, b) => a.orderIndex - b.orderIndex)[0];
    
    if (firstChapter && firstChapter.id === chapterId) {
      console.log('Free trial access granted for first chapter:', chapterId);
      return { hasAccess: true, topic, isFreeTrialAccess: true };
    }

    // Check individual subscriptions
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
        OR: [
          { classId: classId },
          { subjectId: subjectId }
        ]
      }
    });

    return { hasAccess: !!subscription, topic };
  } catch (error) {
    console.error('Error verifying topic access:', error);
    return { hasAccess: false, topic: null };
  }
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
    const pdfUrl =
      content.contentType === 'PDF'
        ? content.pdfUrl || content.url
        : content.pdfUrl;

    return NextResponse.json({
      id: topicWithContent.id,
      name: topicWithContent.name,
      description: topicWithContent.description,
      type: topicWithContent.type,
      duration: topicWithContent.duration,
      content: {
        contentType: content.contentType,
        url: content.url,
        videoUrl: content.videoUrl,
        pdfUrl,
        textContent: content.textContent,
        iframeHtml: content.iframeHtml,
        widgetConfig: content.widgetConfig
      }
    });

  } catch (error) {
    console.error('Error fetching topic content:', error);
    return NextResponse.json({ error: 'Failed to fetch topic content' }, { status: 500 });
  }
}
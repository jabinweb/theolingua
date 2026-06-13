import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { checkRole, isAdminTeacherOrModerator, isAdminOrModerator } from '@/lib/auth-utils';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const [authOk, authVal] = await isAdminTeacherOrModerator();
  if (!authOk) return authVal;
  const session = { user: authVal }; // Bridge for existing code using session

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    if (id) {
      const batch = await prisma.batch.findUnique({
        where: { id },
        include: {
          class: true,
          teacher: {
            select: { id: true, name: true, email: true }
          },
          teachers: {
            select: { id: true, name: true, email: true }
          },
          students: {
            select: { id: true, name: true, email: true, phone: true },
            orderBy: { name: 'asc' }
          },
          _count: {
            select: { students: true }
          }
        }
      });
      return NextResponse.json(batch);
    }

    const batches = await prisma.batch.findMany({
      where: {
        ...(classId ? { classId: parseInt(classId) } : {}),
        ...(teacherId ? { 
          OR: [
            { teacherId },
            { teachers: { some: { id: teacherId } } }
          ] 
        } : {}),
        ...(session.user?.role === 'TEACHER' ? { 
          OR: [
            { teacherId: session.user.id },
            { teachers: { some: { id: session.user.id } } }
          ]
        } : {}),
      },
      include: {
        class: {
          select: { id: true, name: true }
        },
        teacher: {
          select: { id: true, name: true, email: true }
        },
        teachers: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const { name, classId, teacherIds, endDate } = await request.json();
    
    if (!name || !classId) {
      return NextResponse.json({ error: 'Name and Class ID are required' }, { status: 400 });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        classId: parseInt(classId),
        endDate: endDate ? new Date(endDate) : null,
        teachers: teacherIds && teacherIds.length > 0 ? {
          connect: teacherIds.map((id: string) => ({ id }))
        } : undefined,
      },
      include: {
        class: true,
        teachers: true
      }
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const { id, name, classId, teacherIds, studentIds, endDate } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (classId !== undefined) updateData.classId = parseInt(classId);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    
    if (teacherIds !== undefined) {
      updateData.teachers = {
        set: teacherIds.map((tid: string) => ({ id: tid }))
      };
    }
    
    // Handle student assignment if studentIds are provided
    if (studentIds !== undefined) {
      updateData.students = {
        set: studentIds.map((sid: string) => ({ id: sid }))
      };
    }

    const batch = await prisma.batch.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        teachers: true,
        students: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const [authOk, authVal] = await isAdminOrModerator();
  if (!authOk) return authVal;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    await prisma.batch.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
  }
}

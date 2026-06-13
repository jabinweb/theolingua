import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_RBAC_CONFIG } from './rbac-config';

/**
 * Fetches the current RBAC configuration from the database.
 */
export async function getRolesConfig(): Promise<Record<string, string[]>> {
  try {
    const setting = await prisma.adminSettings.findUnique({
      where: { key: 'RBAC_CONFIG' },
    });

    if (setting?.value) {
      return JSON.parse(setting.value);
    }
  } catch (error) {
    console.error('Error fetching RBAC config:', error);
  }
  return DEFAULT_RBAC_CONFIG;
}

/**
 * Checks if the current session user has one of the required roles.
 * Returns a tuple: [isAuthorized, userOrResponse]
 */
export async function checkRole(roles: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    return [false, NextResponse.json({ error: 'Unauthorized' }, { status: 401 })] as const;
  }

  const userRole = session.user.role as UserRole;

  if (!roles.includes(userRole)) {
    return [false, NextResponse.json({ error: 'Access denied: insufficient permissions' }, { status: 403 })] as const;
  }

  return [true, session.user] as const;
}

/**
 * Checks if the current user has a specific capability based on dynamic RBAC settings.
 */
export async function checkCapability(capability: string) {
  const session = await auth();

  if (!session?.user) {
    return [false, NextResponse.json({ error: 'Unauthorized' }, { status: 401 })] as const;
  }

  const userRole = session.user.role as string;
  const config = await getRolesConfig();
  const capabilities = config[userRole] || [];

  if (!capabilities.includes(capability)) {
    return [false, NextResponse.json({ error: `Missing required capability: ${capability}` }, { status: 403 })] as const;
  }

  return [true, session.user] as const;
}

export async function isAdmin() {
  return checkRole([UserRole.ADMIN]);
}

export async function isAdminOrTeacher() {
  return checkRole([UserRole.ADMIN, UserRole.TEACHER, UserRole.MODERATOR]);
}

export async function isAdminOrModerator() {
  return checkRole([UserRole.ADMIN, UserRole.MODERATOR]);
}

export async function isAdminTeacherOrModerator() {
  return checkRole([UserRole.ADMIN, UserRole.TEACHER, UserRole.MODERATOR]);
}

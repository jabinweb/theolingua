import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  displayName?: string;
  role?: string;
  collegeName?: string;
  phone?: string;
  isActive?: boolean;
}

/**
 * Create a new user with hashed password
 */
export async function createUserWithPassword(input: CreateUserInput) {
  const { email, password, name, displayName, role, collegeName, phone, isActive } = input;

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      password: hashedPassword as any,
      name: name || email.split('@')[0],
      displayName: displayName || name || email.split('@')[0],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: (role as any) || 'STUDENT',
      collegeName: collegeName || null,
      phone: phone || null,
      isActive: isActive !== undefined ? isActive : true,
    },
  });

  return user;
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      password: hashedPassword as any,
    },
  });

  return true;
}

/**
 * Verify user password
 */
export async function verifyUserPassword(email: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userPassword = (user as any)?.password as string | undefined;

  if (!userPassword) {
    return false;
  }

  return bcrypt.compare(password, userPassword);
}

/**
 * Generate a password reset token
 */
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  // Store token in database (using Account model as temporary storage)
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: 'password-reset',
        providerAccountId: user.id,
      },
    },
    create: {
      userId: user.id,
      type: 'credentials',
      provider: 'password-reset',
      providerAccountId: user.id,
      access_token: token,
      expires_at: Math.floor(expires.getTime() / 1000),
    },
    update: {
      access_token: token,
      expires_at: Math.floor(expires.getTime() / 1000),
    },
  });

  return token;
}

/**
 * Verify password reset token and get user email
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      provider: 'password-reset',
      access_token: token,
    },
    include: {
      user: true,
    },
  });

  if (!account) {
    return null;
  }

  // Check if token has expired
  const expiresAt = account.expires_at ? account.expires_at * 1000 : 0;
  if (Date.now() > expiresAt) {
    // Delete expired token
    await prisma.account.delete({
      where: {
        provider_providerAccountId: {
          provider: 'password-reset',
          providerAccountId: account.providerAccountId,
        },
      },
    });
    return null;
  }

  return account.user.email;
}

/**
 * Reset password using token
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const email = await verifyPasswordResetToken(token);

  if (!email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return false;
  }

  // Update password
  await updateUserPassword(user.id, newPassword);

  // Delete the reset token
  await prisma.account.deleteMany({
    where: {
      userId: user.id,
      provider: 'password-reset',
    },
  });

  return true;
}

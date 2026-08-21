import { prisma } from '@/lib/prisma';

/** Canonical email form for storage and lookups. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Find a user by email, ignoring case differences in the DB. */
export async function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const exact = await prisma.user.findUnique({ where: { email: normalized } });
  if (exact) return exact;

  return prisma.user.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
  });
}

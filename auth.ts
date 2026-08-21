import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./authConfig"
import { logLogin } from "@/lib/activity-logger"
import { findUserByEmail, normalizeEmail } from "@/lib/normalize-email"
import type { Adapter, AdapterUser } from "next-auth/adapters"

const baseAdapter = PrismaAdapter(prisma) as Adapter

/** Link OAuth to existing users even when email casing differs. */
const adapter: Adapter = {
  ...baseAdapter,
  async getUserByEmail(email) {
    const user = await findUserByEmail(email)
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.image,
    } as AdapterUser
  },
  async createUser(data) {
    const email = data.email ? normalizeEmail(data.email) : data.email

    if (email) {
      const existing = await findUserByEmail(email)
      if (existing) {
        if (existing.email !== email) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { email },
          })
        }
        return {
          id: existing.id,
          email,
          emailVerified: existing.emailVerified,
          name: existing.name,
          image: existing.image,
        } as AdapterUser
      }
    }

    return baseAdapter.createUser!({
      ...data,
      email: email ?? data.email,
    })
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter,
  secret: process.env.AUTH_SECRET,
  experimental: {
    enableWebAuthn: false,
  },
  providers: [
    ...authConfig.providers,
  ],
  session: {
    strategy: "jwt", // Use JWT for consistency with middleware
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, profile }) {
      // Update profile on sign-in; never create a second account or change role
      if (!user.email) return true

      try {
        const email = normalizeEmail(user.email)
        const existingUser = await findUserByEmail(email)

        if (!existingUser) return true

        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            email,
            name: user.name || profile?.name || existingUser.name,
            image: user.image || profile?.picture || existingUser.image,
            lastLoginAt: new Date(),
          },
        })

        // Keep JWT / session aligned with the linked DB user (preserves TEACHER/ADMIN)
        user.id = updatedUser.id
        user.role = updatedUser.role
        user.email = email

        await logLogin(updatedUser.id).catch((err) =>
          console.error('Failed to log login activity:', err)
        )
      } catch (error) {
        console.error('Error updating user on sign-in:', error)
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const email = user.email || (typeof token.email === 'string' ? token.email : null)
        if (email) {
          const dbUser = await findUserByEmail(email)
          if (dbUser) {
            token.sub = dbUser.id
            token.role = dbUser.role
            token.email = dbUser.email
          } else {
            token.role = user.role || 'STUDENT'
          }
        } else if (user.role) {
          token.role = user.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ""
        session.user.role = token.role ? String(token.role) as typeof session.user.role : 'STUDENT'
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})

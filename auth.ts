import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./authConfig"
import { logLogin } from "@/lib/activity-logger"
import type { Adapter } from "next-auth/adapters"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
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
    async signIn({ user, profile }) {
      // Update user information when they sign in
      if (user.email) {
        try {
          const updatedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || profile?.name || user.email.split('@')[0],
              image: user.image || profile?.picture,
              lastLoginAt: new Date(),
            },
            create: {
              email: user.email,
              name: user.name || profile?.name || user.email.split('@')[0],
              image: user.image || profile?.picture,
              role: 'STUDENT',
              isActive: true,
              lastLoginAt: new Date(),
            },
          })
          
          // Log login activity
          if (updatedUser.id) {
            await logLogin(updatedUser.id).catch(err => 
              console.error('Failed to log login activity:', err)
            );
          }
        } catch (error) {
          console.error('Error updating user:', error)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
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
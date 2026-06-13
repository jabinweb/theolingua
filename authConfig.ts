import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export default {
  providers: [
    // Credentials provider for email + password auth
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString() || ''
        const password = credentials?.password?.toString() || ''

        if (!email || !password) return null

  const user = await prisma.user.findUnique({ where: { email } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userPassword = (user as any)?.password as string | undefined
  if (!user || !userPassword) return null

  const valid = await bcrypt.compare(password, userPassword)
        if (!valid) return null

        // return a subset of the user object for the session
        return { id: user.id, name: user.name || undefined, email: user.email || undefined, role: user.role }
      }
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      checks: ["pkce", "state"], // Explicitly enable PKCE checks
    }),
  ],
  trustHost: true, // Trust the host in production environments
  useSecureCookies: process.env.NODE_ENV === "production", // Use secure cookies in production
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 // 15 minutes
      }
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 // 15 minutes
      }
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt", // Use JWT for middleware compatibility
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')

      if (isOnAdmin) {
        if (!isLoggedIn) return false
        if (role === 'ADMIN' || role === 'TEACHER' || role === 'MODERATOR') return true
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
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
} satisfies NextAuthConfig
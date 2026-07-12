// ============================================================================
// FEATURE: Authentication (dashboard users, NOT the public chat API)
//
// - Supports Google OAuth and email/password (Credentials provider)
// - On first sign-in, automatically provisions an Organization for the user
//   and makes them OWNER — every user gets a workspace (org) they can later
//   invite teammates into.
// - Session is JWT-based (not DB sessions) so API routes can read it cheaply
//   without a DB round-trip on every request.
// ============================================================================

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    // Runs on every sign-in (OAuth or credentials) — auto-provision an org
    async signIn({ user }) {
      if (!user.email) return false;

      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        include: { memberships: true },
      });

      // First-time user via OAuth: create the User + a default Organization
      if (!existing) {
        const created = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        });

        await prisma.organization.create({
          data: {
            name: `${user.name ?? "My"}'s Workspace`,
            memberships: {
              create: { userId: created.id, role: "OWNER" },
            },
          },
        });
      } else if (existing.memberships.length === 0) {
        // Edge case: user exists but somehow has no org (e.g. manual DB edit)
        await prisma.organization.create({
          data: {
            name: `${existing.name ?? "My"}'s Workspace`,
            memberships: { create: { userId: existing.id, role: "OWNER" } },
          },
        });
      }

      return true;
    },

    // Attach the user's primary org id to the JWT so API routes can use it
    // without a DB lookup on every request.
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { memberships: true },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.orgId = dbUser.memberships[0]?.orgId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).orgId = token.orgId;
      }
      return session;
    },
  },
};
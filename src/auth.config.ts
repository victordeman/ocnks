import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    // Session strategy: JWT (database sessions unnecessary at this scale).
    // Session maxAge: 24h (86400s).
    // Rolling renewal via session update; idle expiry at 12h (43200s).
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/app");
      if (isOnApp) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "CLIENT";
        token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || session.user.id;
        session.user.role = (token.role as "CLIENT" | "STAFF" | "ADMIN") || "CLIENT";
        session.user.companyName = token.companyName as string | null;
      }
      return session;
    },
  },
  providers: [], // Overridden in auth.ts
} satisfies NextAuthConfig;

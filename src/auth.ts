import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";
import { Resend as ResendClient } from "resend";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { checkAuthRateLimit, recordFailedAuthAttempt, resetAuthRateLimit } from "@/lib/auth/rate-limit";
import { bootstrapAdmin } from "@/lib/auth/bootstrap";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        await bootstrapAdmin();

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        let ip = "127.0.0.1";
        if (req && req.headers) {
          const xForwardedFor = req.headers.get("x-forwarded-for");
          const xRealIp = req.headers.get("x-real-ip");
          ip = xForwardedFor ? xForwardedFor.split(",")[0].trim() : (xRealIp || "127.0.0.1");
        }

        // 1. Auth rate limiting: 5 attempts / 10 minutes per email
        const rateLimitResult = await checkAuthRateLimit(email, ip);
        if (!rateLimitResult.allowed) {
          throw new Error("Too many attempts — try again later or use email sign-in");
        }

        // 2. Fetch user
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          recordFailedAuthAttempt(email, ip);
          return null;
        }

        // 3. Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          recordFailedAuthAttempt(email, ip);
          return null;
        }

        resetAuthRateLimit(email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
        };
      },
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "OCNKS Global <onboarding@resend.dev>",
      async sendVerificationRequest({ identifier: email, url }) {
        await bootstrapAdmin();

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey || apiKey.trim() === "") {
          console.log(`[MAGIC LINK] Email sign-in requested for ${email} but RESEND_API_KEY is unset.`);
          throw new Error("Email sign-in is not configured — use your password");
        }

        const from = process.env.EMAIL_FROM || "OCNKS Global <onboarding@resend.dev>";
        const resendClient = new ResendClient(apiKey);

        const html = `
          <div style="font-family: sans-serif; color: #063d1f; max-width: 600px; margin: 0 auto; border: 1px solid #0d7a3f22; padding: 24px; border-radius: 8px; background-color: #f4f7f5;">
            <h2 style="color: #0d7a3f; margin-top: 0;">Sign in to OCNKS Global</h2>
            <p>Click the button below to sign in to your OCNKS Global Ltd operations console account.</p>

            <div style="margin: 24px 0;">
              <a href="${url}" style="background-color: #0d7a3f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Sign in to Console
              </a>
            </div>

            <p style="font-size: 13px; color: #063d1f99;">If you did not request this sign-in link, you can safely ignore this email.</p>

            <hr style="border: none; border-top: 1px solid #0d7a3f22; margin: 24px 0;" />

            <p style="font-size: 12px; color: #063d1f99;">
              OCNKS GLOBAL LTD<br/>
              Port Harcourt · Abuja · Nigeria<br/>
              Email: ocnksglobal@gmail.com · Phone: +234 810 869 0772
            </p>
          </div>
        `;

        const { error } = await resendClient.emails.send({
          from,
          to: email,
          subject: "Sign in to OCNKS Global",
          html,
        });

        if (error) {
          console.error("[MAGIC LINK ERROR] Failed to send verification email:", error);
          throw new Error("Failed to send sign-in email. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || Role.CLIENT;
        token.companyName = user.companyName;
      } else if (token.email && !token.role) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, companyName: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.companyName = dbUser.companyName;
        }
      }
      return token;
    },
  },
});

"use server";

import "server-only";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { registerSchema, changePasswordSchema } from "@/lib/auth/schema";
import { sendWelcomeEmail } from "@/lib/email/send";
import { requireAuthSession } from "@/lib/auth/session";

export type ActionResponse =
  | { ok: true; message?: string }
  | { ok: false; errors?: Record<string, string[]>; error?: string };

export async function registerUserAction(rawInput: unknown): Promise<ActionResponse> {
  const parseResult = registerSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      ok: false,
      errors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, companyName, password } = parseResult.data;
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check duplicate email
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    return {
      ok: false,
      errors: {
        email: ["An account with this email already exists"],
      },
    };
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // 3. Create CLIENT user
    const newUser = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone || null,
        companyName,
        role: Role.CLIENT, // Strictly CLIENT only
        passwordHash,
      },
    });

    // 4. Link existing RFQs with matching email to new user ID
    await db.rfq.updateMany({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
        clientUserId: null,
      },
      data: { clientUserId: newUser.id },
    });

    // 5. Send welcome email (fire and forget)
    void sendWelcomeEmail(newUser.email, newUser.name).catch((err) => {
      console.error("[REGISTER] Welcome email dispatch failed:", err);
    });

    return { ok: true, message: "Account created successfully" };
  } catch (err) {
    console.error("[REGISTER ERROR] Failed to create user account:", err);
    return {
      ok: false,
      error: "An unexpected error occurred during registration. Please try again.",
    };
  }
}

export async function changePasswordAction(rawInput: unknown): Promise<ActionResponse> {
  const session = await requireAuthSession();
  const userId = session.user.id;

  const parseResult = changePasswordSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      ok: false,
      errors: parseResult.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parseResult.data;

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });

  if (!dbUser) {
    return { ok: false, error: "User not found" };
  }

  if (dbUser.passwordHash) {
    const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      return {
        ok: false,
        errors: {
          currentPassword: ["Current password is incorrect"],
        },
      };
    }
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  try {
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { ok: true, message: "Password updated successfully" };
  } catch (err) {
    console.error("[CHANGE PASSWORD ERROR] Failed to update password:", err);
    return {
      ok: false,
      error: "An unexpected error occurred while updating your password.",
    };
  }
}

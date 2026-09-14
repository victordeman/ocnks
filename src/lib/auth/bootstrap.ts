import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

let bootstrapChecked = false;

export async function bootstrapAdmin(): Promise<void> {
  if (bootstrapChecked) return;
  bootstrapChecked = true;

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();

  if (!email) {
    console.log("[ADMIN BOOTSTRAP] Skipped: ADMIN_BOOTSTRAP_EMAIL environment variable is unset.");
    return;
  }

  try {
    const existingAdminCount = await db.user.count({
      where: { role: Role.ADMIN },
    });

    if (existingAdminCount > 0) {
      console.log(
        `[ADMIN BOOTSTRAP] Skipped: ${existingAdminCount} admin user(s) already exist in database. Email evaluated: ${email}`
      );
      return;
    }

    // Generate random unguessable password (minimum 10 chars)
    const randomPass = `OglAdmin!${crypto.randomBytes(8).toString("hex")}`;
    const passwordHash = await bcrypt.hash(randomPass, 10);

    const adminUser = await db.user.upsert({
      where: { email },
      update: { role: Role.ADMIN },
      create: {
        email,
        name: "System Admin",
        companyName: "OCNKS Global Ltd",
        role: Role.ADMIN,
        passwordHash,
      },
    });

    console.log("========================================================================");
    console.log("[ADMIN BOOTSTRAP SUCCESS] Initial admin user created:");
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Generated Password: ${randomPass}`);
    console.log("  WARNING: Log in and change this password immediately!");
    console.log("========================================================================");
  } catch (error) {
    console.error("[ADMIN BOOTSTRAP ERROR] Failed during execution:", error);
  }
}

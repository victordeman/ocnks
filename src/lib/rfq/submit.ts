"use server";

import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { rfqSchema, type RfqInput } from "@/lib/rfq/schema";
import { sendRfqEmails } from "@/lib/email/send";

export type SubmitRfqResult =
  | { ok: true; publicId: string }
  | { ok: false; errors?: Record<string, string[]>; error?: string };

// In-memory rate limiting store: ip -> { count, resetAt }
// NOTE: On Vercel serverless runtime, in-memory Map is per-instance.
// For distributed rate-limiting across instances, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// In-memory idempotency store: key -> { result, expiresAt }
// NOTE: On Vercel serverless runtime, in-memory Map is per-instance. If a retried submission lands on a different instance,
// it falls through to DB transaction. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for global idempotency.
const idempotencyMap = new Map<string, { publicId: string; expiresAt: number }>();

let hasWarnedInMemory = false;

async function checkRateLimit(ip: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const key = `rfq:ratelimit:${ip}`;
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, 600],
        ]),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const currentCount = data[0]?.result;
        if (typeof currentCount === "number") {
          return currentCount <= 10;
        }
      }
    } catch (e) {
      console.error("Upstash rate limit check failed, falling back to in-memory:", e);
    }
  }

  if (!hasWarnedInMemory) {
    console.warn(
      "UPSTASH_REDIS_REST_URL or TOKEN missing/unreachable. Using in-memory rate limiter for RFQ submissions. Limits reset on redeploy."
    );
    hasWarnedInMemory = true;
  }

  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= 10) {
    return false;
  }

  record.count += 1;
  return true;
}

async function getIdempotentResult(key: string): Promise<string | null> {
  if (!key) return null;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/get/rfq:idempotency:${key}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) return data.result;
      }
    } catch (e) {
      console.error("Upstash idempotency read failed, falling back to in-memory:", e);
    }
  }

  const cached = idempotencyMap.get(key);
  if (cached) {
    if (Date.now() < cached.expiresAt) {
      return cached.publicId;
    } else {
      idempotencyMap.delete(key);
    }
  }

  return null;
}

async function setIdempotentResult(key: string, publicId: string): Promise<void> {
  if (!key) return;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      await fetch(`${url}/set/rfq:idempotency:${key}/${publicId}/EX/86400`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch (e) {
      console.error("Upstash idempotency set failed:", e);
    }
  }

  idempotencyMap.set(key, {
    publicId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
}

export async function submitRfqAction(
  rawInput: unknown,
  idempotencyKey?: string
): Promise<SubmitRfqResult> {
  // 1. Rate limiting by IP (Runs BEFORE Zod validation and DB access)
  let rawIp = "127.0.0.1";
  try {
    const reqHeaders = await headers();
    rawIp = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";
  } catch {
    rawIp = "127.0.0.1";
  }
  const clientIp = rawIp.split(",")[0].trim();

  const allowed = await checkRateLimit(clientIp);
  if (!allowed) {
    return {
      ok: false,
      error: "Too many requests — please try again later or contact us directly",
    };
  }

  // 2. Check Idempotency Cache
  if (idempotencyKey) {
    const existingPublicId = await getIdempotentResult(idempotencyKey);
    if (existingPublicId) {
      return { ok: true, publicId: existingPublicId };
    }
  }

  // 3. Validation with Zod Schema boundary
  const parseResult = rfqSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const formattedErrors = parseResult.error.flatten().fieldErrors;
    return {
      ok: false,
      errors: formattedErrors,
    };
  }

  const input: RfqInput = parseResult.data;

  // 4. Validate active service line from DB
  const serviceLine = await db.serviceLine.findFirst({
    where: {
      slug: input.serviceLineSlug,
      active: true,
    },
  });

  if (!serviceLine) {
    return {
      ok: false,
      errors: {
        serviceLineSlug: ["Please select a valid, active service line"],
      },
    };
  }

  // 5. Database Transaction for counter allocation + insertion + initial RfqEvent
  const currentYear = new Date().getFullYear();

  try {
    const { publicId, contactName, companyName, email, phone, location, scope, desiredStart } =
      await db.$transaction(async (tx) => {
        const counter = await tx.rfqCounter.upsert({
          where: { year: currentYear },
          update: { last: { increment: 1 } },
          create: { year: currentYear, last: 1 },
        });

        const paddedSeq = String(counter.last).padStart(4, "0");
        const generatedPublicId = `OGL-${currentYear}-${paddedSeq}`;

        const existingUser = await tx.user.findUnique({
          where: { email: input.email },
          select: { id: true },
        });

        const parsedStartDate = input.desiredStart ? new Date(input.desiredStart) : null;

        const newRfq = await tx.rfq.create({
          data: {
            publicId: generatedPublicId,
            serviceLineId: serviceLine.id,
            contactName: input.contactName,
            companyName: input.companyName,
            email: input.email,
            phone: input.phone,
            location: input.location,
            scope: input.scope,
            desiredStart: parsedStartDate,
            clientUserId: existingUser ? existingUser.id : null,
          },
        });

        await tx.rfqEvent.create({
          data: {
            rfqId: newRfq.id,
            type: "SUBMITTED",
            message: `RFQ received from ${input.contactName} (${input.companyName})`,
          },
        });

        return {
          publicId: newRfq.publicId,
          contactName: newRfq.contactName,
          companyName: newRfq.companyName,
          email: newRfq.email,
          phone: newRfq.phone,
          location: newRfq.location,
          scope: newRfq.scope,
          desiredStart: input.desiredStart,
        };
      });

    // 6. Cache result for idempotency key
    if (idempotencyKey) {
      await setIdempotentResult(idempotencyKey, publicId);
    }

    // 7. Fire-and-forget email dispatch AFTER transaction commits
    void sendRfqEmails({
      to: email,
      publicId,
      contactName,
      companyName,
      serviceLineName: serviceLine.name,
      phone,
      location,
      scope,
      desiredStart,
    }).catch((err) => {
      console.error(`[RFQ ${publicId}] Unhandled error sending emails:`, err);
    });

    return { ok: true, publicId };
  } catch (err) {
    console.error("RFQ submission transaction failed:", err);
    return {
      ok: false,
      error: "An unexpected error occurred while processing your request. Please try again or contact us.",
    };
  }
}

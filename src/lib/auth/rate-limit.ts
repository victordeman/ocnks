import "server-only";

// Rate limit store for auth attempts: email -> { count, resetAt }
const emailLimitMap = new Map<string, { count: number; resetAt: number }>();
const ipLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function checkAuthRateLimit(
  email: string,
  ip: string
): Promise<{ allowed: boolean; reason?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();

  // IP check (generous limit: 20 per 10 minutes)
  const ipRecord = ipLimitMap.get(ip);
  if (ipRecord && now < ipRecord.resetAt) {
    if (ipRecord.count >= 20) {
      return { allowed: false, reason: "Too many attempts — try again later or use email sign-in" };
    }
  }

  // Email check (strict limit: 5 per 10 minutes)
  const emailRecord = emailLimitMap.get(normalizedEmail);
  if (emailRecord && now < emailRecord.resetAt) {
    if (emailRecord.count >= 5) {
      return { allowed: false, reason: "Too many attempts — try again later or use email sign-in" };
    }
  }

  return { allowed: true };
}

export function recordFailedAuthAttempt(email: string, ip: string): void {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;

  // Record IP attempt
  const ipRecord = ipLimitMap.get(ip);
  if (!ipRecord || now > ipRecord.resetAt) {
    ipLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
  } else {
    ipRecord.count += 1;
  }

  // Record Email attempt
  const emailRecord = emailLimitMap.get(normalizedEmail);
  if (!emailRecord || now > emailRecord.resetAt) {
    emailLimitMap.set(normalizedEmail, { count: 1, resetAt: now + windowMs });
  } else {
    emailRecord.count += 1;
  }
}

export function resetAuthRateLimit(email: string): void {
  emailLimitMap.delete(email.trim().toLowerCase());
}

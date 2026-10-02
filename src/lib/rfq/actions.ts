"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import path from "path";
import { db } from "@/lib/db";
import { getCurrentSession, rfqWhereForRole } from "@/lib/auth/session";
import { canTransition } from "@/lib/rfq/transitions";
import { isStorageConfigured, put } from "@/lib/storage";
import { RfqStatus, Role } from "@prisma/client";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; code?: string; error: string };

function safeRevalidatePath(pathString: string) {
  try {
    revalidatePath(pathString);
  } catch {
    // Ignore when called outside Next.js request context
  }
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

/**
 * 1. ASSIGNMENT: Server action assignRfq(rfqId, assigneeId)
 * STAFF+ only. Validates assignee exists and is STAFF or ADMIN.
 * Transactionally updates rfq.assigneeId + AuditLog(action: "rfq.assign").
 */
export async function assignRfqAction(
  rfqId: string,
  assigneeId: string | null
): Promise<ActionResult> {
  // 1. Session check
  const session = await getCurrentSession();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized — please sign in" };
  }

  // 2. Role check
  if (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN) {
    return { ok: false, error: "Unauthorized — staff or admin role required" };
  }

  // 3. Scope check
  const rfq = await db.rfq.findFirst({
    where: {
      id: rfqId,
      AND: rfqWhereForRole(session),
    },
    select: { id: true, assigneeId: true },
  });

  if (!rfq) {
    return { ok: false, error: "RFQ not found or access denied" };
  }

  // Validate target assignee if provided
  let newAssigneeId: string | null = null;
  if (assigneeId && assigneeId.trim() !== "") {
    const assigneeUser = await db.user.findUnique({
      where: { id: assigneeId.trim() },
      select: { id: true, role: true },
    });

    if (
      !assigneeUser ||
      (assigneeUser.role !== Role.STAFF && assigneeUser.role !== Role.ADMIN)
    ) {
      return { ok: false, error: "Assignee must be a valid Staff or Admin user" };
    }
    newAssigneeId = assigneeUser.id;
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.rfq.update({
        where: { id: rfq.id },
        data: { assigneeId: newAssigneeId },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "rfq.assign",
          entity: "Rfq",
          entityId: rfq.id,
          meta: {
            from: rfq.assigneeId,
            to: newAssigneeId,
          },
        },
      });
    });

    safeRevalidatePath(`/app/rfqs/${rfqId}`);
    safeRevalidatePath("/app/rfqs");
    return { ok: true };
  } catch (err) {
    console.error("Failed to assign RFQ:", err);
    return { ok: false, error: "An unexpected error occurred while assigning the RFQ" };
  }
}

/**
 * 2. STATUS CONTROLS: Server action updateStatusAction(rfqId, targetStatus, reason?)
 * Enforces canTransition pure function. Transactionally updates status + RfqEvent + AuditLog.
 */
export async function updateStatusAction(
  rfqId: string,
  targetStatus: RfqStatus,
  reason?: string
): Promise<ActionResult> {
  // 1. Session check
  const session = await getCurrentSession();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized — please sign in" };
  }

  // 2. Role check
  if (session.user.role !== Role.STAFF && session.user.role !== Role.ADMIN) {
    return { ok: false, error: "Unauthorized — staff or admin role required" };
  }

  // 3. Scope check
  const rfq = await db.rfq.findFirst({
    where: {
      id: rfqId,
      AND: rfqWhereForRole(session),
    },
    select: { id: true, status: true },
  });

  if (!rfq) {
    return { ok: false, error: "RFQ not found or access denied" };
  }

  // 4. Status transition check using pure state machine helper
  const isAllowed = canTransition(rfq.status, targetStatus, session.user.role);
  if (!isAllowed) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      error: `Transition from ${rfq.status} to ${targetStatus} is not permitted`,
    };
  }

  // Reason validation for DECLINED
  let eventMessage = "";
  if (targetStatus === RfqStatus.UNDER_REVIEW) {
    eventMessage = "Under review";
  } else if (targetStatus === RfqStatus.QUOTED) {
    eventMessage = "Quotation issued";
  } else if (targetStatus === RfqStatus.AWARDED) {
    eventMessage = "Contract awarded";
  } else if (targetStatus === RfqStatus.DECLINED) {
    const trimmedReason = reason ? reason.trim() : "";
    if (trimmedReason.length > 500) {
      return { ok: false, error: "Decline reason must not exceed 500 characters" };
    }
    eventMessage = trimmedReason ? `Declined — ${trimmedReason}` : "Declined";
  } else if (targetStatus === RfqStatus.CLOSED) {
    eventMessage = "Closed";
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.rfq.update({
        where: { id: rfq.id },
        data: { status: targetStatus },
      });

      await tx.rfqEvent.create({
        data: {
          rfqId: rfq.id,
          actorUserId: session.user.id,
          type: "STATUS_CHANGED",
          message: eventMessage,
          visibility: "CLIENT_VISIBLE",
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "rfq.status_change",
          entity: "Rfq",
          entityId: rfq.id,
          meta: {
            from: rfq.status,
            to: targetStatus,
          },
        },
      });
    });

    safeRevalidatePath(`/app/rfqs/${rfqId}`);
    safeRevalidatePath("/app/rfqs");
    return { ok: true };
  } catch (err) {
    console.error("Failed to update status:", err);
    return { ok: false, error: "An unexpected error occurred while updating RFQ status" };
  }
}

/**
 * 3. COMMENTS: Server action addCommentAction(rfqId, body, visibility)
 * Enforces strict visibility controls based on role.
 */
export async function addCommentAction(
  rfqId: string,
  body: string,
  requestedVisibility: string
): Promise<ActionResult> {
  // 1. Session check
  const session = await getCurrentSession();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized — please sign in" };
  }

  // 2. Trim and validate body length (1–2000 chars)
  const trimmedBody = (body || "").trim();
  if (trimmedBody.length < 1 || trimmedBody.length > 2000) {
    return { ok: false, error: "Comment body must be between 1 and 2,000 characters" };
  }

  // 3. Role check & Scope check
  const role = session.user.role;
  let finalVisibility = "CLIENT_VISIBLE";

  if (role === Role.CLIENT) {
    // Critical security check: CLIENT calling with INTERNAL visibility is rejected
    if (requestedVisibility === "INTERNAL") {
      return { ok: false, error: "Unauthorized — clients cannot post internal comments" };
    }
    finalVisibility = "CLIENT_VISIBLE";
  } else if (role === Role.STAFF || role === Role.ADMIN) {
    finalVisibility = requestedVisibility === "INTERNAL" ? "INTERNAL" : "CLIENT_VISIBLE";
  } else {
    return { ok: false, error: "Unauthorized role" };
  }

  // Verify RFQ scope authorization
  const rfq = await db.rfq.findFirst({
    where: {
      id: rfqId,
      AND: rfqWhereForRole(session),
    },
    select: { id: true },
  });

  if (!rfq) {
    return { ok: false, error: "RFQ not found or access denied" };
  }

  try {
    await db.rfqEvent.create({
      data: {
        rfqId: rfq.id,
        actorUserId: session.user.id,
        type: "COMMENT",
        message: trimmedBody,
        visibility: finalVisibility,
      },
    });

    safeRevalidatePath(`/app/rfqs/${rfqId}`);
    return { ok: true };
  } catch (err) {
    console.error("Failed to add comment:", err);
    return { ok: false, error: "An unexpected error occurred while adding comment" };
  }
}

/**
 * 4. ATTACHMENTS: Server action uploadAttachmentAction(formData)
 * Validates file size (<= 10MB), content type allowlist, filename sanitization,
 * storage configuration, and terminal status rules.
 */
export async function uploadAttachmentAction(
  formData: FormData
): Promise<ActionResult> {
  // 1. Session check
  const session = await getCurrentSession();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized — please sign in" };
  }

  // 2. Storage configuration check
  if (!isStorageConfigured()) {
    return {
      ok: false,
      error: "File storage is not configured — send files to ocnksglobal@gmail.com instead",
    };
  }

  const rfqId = formData.get("rfqId") as string;
  const file = formData.get("file") as File | null;

  if (!rfqId || !file) {
    return { ok: false, error: "Missing required upload parameters" };
  }

  // 3. Scope check & RFQ details fetch
  const rfq = await db.rfq.findFirst({
    where: {
      id: rfqId,
      AND: rfqWhereForRole(session),
    },
    select: { id: true, publicId: true, status: true },
  });

  if (!rfq) {
    return { ok: false, error: "RFQ not found or access denied" };
  }

  // Terminal states restriction for CLIENT uploads
  const isTerminalState =
    rfq.status === RfqStatus.CLOSED ||
    rfq.status === RfqStatus.DECLINED ||
    rfq.status === RfqStatus.AWARDED;

  if (session.user.role === Role.CLIENT && isTerminalState) {
    return {
      ok: false,
      error: "File uploads are disabled for finalized or closed requests",
    };
  }

  // 4. File validation: Content-Type allowlist
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error:
        "Invalid file type. Allowed formats: PDF, PNG, JPEG, Microsoft Word (.docx), and Excel (.xlsx)",
    };
  }

  // 5. Read buffer and measure byte size
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    return { ok: false, error: "File cannot be empty (0 bytes)" };
  }

  if (buffer.length > 10 * 1024 * 1024) {
    return { ok: false, error: "File size exceeds the 10 MB limit" };
  }

  // 6. Filename sanitization
  const baseName = path.basename(file.name || "attachment");
  const sanitizedName = baseName
    .replace(/[^a-zA-Z0-9_\-\.\s]/g, "_")
    .trim()
    .slice(0, 200);

  const safeFileName = sanitizedName || "attachment";
  const uniqueStorageKey = `rfq/${rfq.publicId}/${crypto.randomUUID()}/${safeFileName}`;

  try {
    const storageResult = await put(uniqueStorageKey, buffer, file.type);

    await db.attachment.create({
      data: {
        rfqId: rfq.id,
        fileName: safeFileName,
        contentType: file.type,
        size: buffer.length,
        storageKey: storageResult.storageKey,
        uploadedById: session.user.id,
      },
    });

    safeRevalidatePath(`/app/rfqs/${rfqId}`);
    return { ok: true };
  } catch (err) {
    console.error("Failed to upload attachment:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while processing attachment upload",
    };
  }
}

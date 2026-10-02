import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentSession, rfqWhereForRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getDownloadInfo } from "@/lib/storage";

interface RouteParams {
  params: Promise<{
    id: string;
    attachmentId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // 1. Session check
  const session = await getCurrentSession();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const resolvedParams = await params;
  const { id: rfqId, attachmentId } = resolvedParams;

  // 2. Scope check via centralized authorization helper
  const rfq = await db.rfq.findFirst({
    where: {
      id: rfqId,
      AND: rfqWhereForRole(session),
    },
    select: { id: true },
  });

  if (!rfq) {
    return new NextResponse("Not Found or Access Denied", { status: 404 });
  }

  // 3. Fetch attachment row linked to this RFQ
  const attachment = await db.attachment.findFirst({
    where: {
      id: attachmentId,
      rfqId: rfq.id,
    },
  });

  if (!attachment) {
    return new NextResponse("Attachment Not Found", { status: 404 });
  }

  // 4. Retrieve file download info from storage provider
  const downloadInfo = await getDownloadInfo(attachment.storageKey);
  if (!downloadInfo) {
    return new NextResponse("File content not available", { status: 404 });
  }

  const contentType = downloadInfo.contentType || attachment.contentType;

  return new NextResponse(downloadInfo.stream as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
      "Content-Length": attachment.size.toString(),
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}

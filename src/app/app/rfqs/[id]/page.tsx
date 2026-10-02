import Link from "next/link";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { Role, Prisma } from "@prisma/client";
import { requireAuthSession, rfqWhereForRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { isStorageConfigured } from "@/lib/storage";
import {
  formatDateLagos,
  formatDateOnlyLagos,
  formatStatusLabel,
  getStatusBadgeClass,
} from "@/lib/utils/format";
import { StatusControls } from "./components/StatusControls";
import { AssignmentControl } from "./components/AssignmentControl";
import { CommentComposer } from "./components/CommentComposer";
import { AttachmentSection } from "./components/AttachmentSection";
import { RfqTimeline } from "./components/RfqTimeline";
import { ActivityPanel } from "./components/ActivityPanel";

interface RfqDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RfqDetailPage({ params }: RfqDetailPageProps) {
  const session = await requireAuthSession();
  const { id: rfqId } = await params;

  const role = session.user.role;
  const isStaffOrAdmin = role === Role.STAFF || role === Role.ADMIN;

  // 1. Fetch RFQ enforcing centralized rfqWhereForRole authorization helper
  const rfqWhere: Prisma.RfqWhereInput = {
    id: rfqId,
    AND: rfqWhereForRole(session),
  };

  const rfq = await db.rfq.findFirst({
    where: rfqWhere,
    include: {
      serviceLine: { select: { id: true, name: true, slug: true } },
      clientUser: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!rfq) {
    notFound();
  }

  // 2. QUERY-LAYER FILTERING FOR EVENTS (Critical Security Requirement):
  // CLIENT role receives ONLY CLIENT_VISIBLE events directly from DB query.
  // STAFF and ADMIN roles receive all events including INTERNAL comments.
  const eventWhere: Prisma.RfqEventWhereInput = {
    rfqId: rfq.id,
    ...(role === Role.CLIENT ? { visibility: "CLIENT_VISIBLE" } : {}),
  };

  // 3. Parallel queries for child data (events, attachments, staff list, audit logs)
  const [events, attachments, staffUsers, auditLogs] = await Promise.all([
    db.rfqEvent.findMany({
      where: eventWhere,
      orderBy: { createdAt: "asc" },
      include: {
        actor: { select: { id: true, name: true, role: true } },
      },
    }),
    db.attachment.findMany({
      where: { rfqId: rfq.id },
      orderBy: { createdAt: "asc" },
      include: {
        uploadedBy: { select: { name: true, role: true } },
      },
    }),
    isStaffOrAdmin
      ? db.user.findMany({
          where: {
            role: { in: [Role.STAFF, Role.ADMIN] },
          },
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true, role: true },
        })
      : Promise.resolve([]),
    isStaffOrAdmin
      ? db.auditLog.findMany({
          where: {
            entity: "Rfq",
            entityId: rfq.id,
          },
          orderBy: { createdAt: "desc" },
          include: {
            actor: { select: { name: true, role: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const storageReady = isStorageConfigured();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Navigation & Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/rfqs"
          className="text-brand-green inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold hover:underline"
        >
          ← Back to RFQ List
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-brand-forest/60 text-xs">Reference:</span>
          <span className="text-brand-forest bg-brand-paper border-brand-green/20 rounded border px-2.5 py-1 font-mono text-sm font-bold">
            {rfq.publicId}
          </span>
        </div>
      </div>

      {/* Primary Header Card */}
      <div className="border-brand-green/20 space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <div className="border-brand-green/10 flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-brand-forest text-2xl font-bold">
                {rfq.companyName}
              </h1>
              <span
                className={`inline-block rounded border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                  rfq.status
                )}`}
              >
                {formatStatusLabel(rfq.status)}
              </span>
            </div>
            <p className="text-brand-forest/70 mt-1 text-xs">
              Service Line:{" "}
              <span className="font-semibold">{rfq.serviceLine.name}</span> ·
              Submitted on {formatDateLagos(rfq.createdAt)}
            </p>
          </div>

          {isStaffOrAdmin && rfq.assignee && (
            <div className="text-right">
              <span className="text-brand-forest/60 block text-xs">
                Assigned Operations Lead
              </span>
              <span className="text-brand-forest text-xs font-bold">
                {rfq.assignee.name} ({rfq.assignee.role})
              </span>
            </div>
          )}
        </div>

        {/* Staff Management Console Bar */}
        {isStaffOrAdmin && (
          <div className="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <StatusControls
                rfqId={rfq.id}
                currentStatus={rfq.status}
                role={role}
              />
            </div>
            <div>
              <AssignmentControl
                rfqId={rfq.id}
                currentAssigneeId={rfq.assigneeId}
                staffUsers={staffUsers}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Scope Details & Attachments */}
        <div className="space-y-6 lg:col-span-2">
          {/* RFQ Specifications & Details */}
          <div className="border-brand-green/20 space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-brand-forest/70 border-brand-green/10 border-b pb-2 text-xs font-bold tracking-wider uppercase">
              Request Specifications & Contact Details
            </h2>

            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <span className="text-brand-forest/60 block font-medium">
                  Contact Person
                </span>
                <span className="text-brand-forest text-sm font-bold">
                  {rfq.contactName}
                </span>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">
                  Company Name
                </span>
                <span className="text-brand-forest text-sm font-bold">
                  {rfq.companyName}
                </span>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">
                  Email Address
                </span>
                <a
                  href={`mailto:${rfq.email}`}
                  className="text-brand-green font-semibold hover:underline"
                >
                  {rfq.email}
                </a>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">
                  Phone Number
                </span>
                <span className="text-brand-forest font-semibold">
                  {rfq.phone}
                </span>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">
                  Project Location
                </span>
                <span className="text-brand-forest font-semibold">
                  {rfq.location}
                </span>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">
                  Desired Start Date
                </span>
                <span className="text-brand-forest font-semibold">
                  {formatDateOnlyLagos(rfq.desiredStart)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-brand-forest/70 mb-1 block text-xs font-bold">
                Detailed Scope of Work
              </span>
              <div className="bg-brand-paper/50 border-brand-green/10 text-brand-forest rounded border p-4 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                {rfq.scope}
              </div>
            </div>
          </div>

          {/* Attachments Panel */}
          <AttachmentSection
            rfqId={rfq.id}
            role={role}
            status={rfq.status}
            attachments={attachments}
            isStorageConfigured={storageReady}
          />

          {/* Activity Log (Staff Console Only) */}
          {isStaffOrAdmin && <ActivityPanel logs={auditLogs} />}
        </div>

        {/* Right Column: Timeline & Comment Composer */}
        <div className="space-y-6">
          <CommentComposer rfqId={rfq.id} role={role} />
          <RfqTimeline events={events} role={role} />
        </div>
      </div>
    </div>
  );
}

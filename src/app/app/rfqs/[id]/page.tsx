import Link from "next/link";
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation & Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/rfqs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-green hover:underline min-h-[44px]"
        >
          ← Back to RFQ List
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-forest/60">Reference:</span>
          <span className="font-mono font-bold text-brand-forest text-sm bg-brand-paper px-2.5 py-1 rounded border border-brand-green/20">
            {rfq.publicId}
          </span>
        </div>
      </div>

      {/* Primary Header Card */}
      <div className="bg-white p-6 rounded-lg border border-brand-green/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-green/10 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-forest">
                {rfq.companyName}
              </h1>
              <span
                className={`inline-block px-3 py-1 rounded text-xs font-semibold border ${getStatusBadgeClass(
                  rfq.status
                )}`}
              >
                {formatStatusLabel(rfq.status)}
              </span>
            </div>
            <p className="text-xs text-brand-forest/70 mt-1">
              Service Line: <span className="font-semibold">{rfq.serviceLine.name}</span> · Submitted on {formatDateLagos(rfq.createdAt)}
            </p>
          </div>

          {isStaffOrAdmin && rfq.assignee && (
            <div className="text-right">
              <span className="text-xs text-brand-forest/60 block">Assigned Operations Lead</span>
              <span className="text-xs font-bold text-brand-forest">
                {rfq.assignee.name} ({rfq.assignee.role})
              </span>
            </div>
          )}
        </div>

        {/* Staff Management Console Bar */}
        {isStaffOrAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope Details & Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ Specifications & Details */}
          <div className="bg-white p-6 rounded-lg border border-brand-green/20 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-forest/70 border-b border-brand-green/10 pb-2">
              Request Specifications & Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-brand-forest/60 block font-medium">Contact Person</span>
                <span className="font-bold text-brand-forest text-sm">{rfq.contactName}</span>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">Company Name</span>
                <span className="font-bold text-brand-forest text-sm">{rfq.companyName}</span>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">Email Address</span>
                <a href={`mailto:${rfq.email}`} className="font-semibold text-brand-green hover:underline">
                  {rfq.email}
                </a>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">Phone Number</span>
                <span className="font-semibold text-brand-forest">{rfq.phone}</span>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">Project Location</span>
                <span className="font-semibold text-brand-forest">{rfq.location}</span>
              </div>
              <div>
                <span className="text-brand-forest/60 block font-medium">Desired Start Date</span>
                <span className="font-semibold text-brand-forest">
                  {formatDateOnlyLagos(rfq.desiredStart)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-brand-forest/70 block mb-1">
                Detailed Scope of Work
              </span>
              <div className="p-4 bg-brand-paper/50 rounded border border-brand-green/10 text-xs text-brand-forest leading-relaxed whitespace-pre-wrap font-sans">
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

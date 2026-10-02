import Link from "next/link";

export const dynamic = "force-dynamic";
import { getCurrentSession, rfqWhereForRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Role, RfqStatus } from "@prisma/client";
import {
  formatDateOnlyLagos,
  getStatusBadgeClass,
  formatStatusLabel,
} from "@/lib/utils/format";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user) return null;

  const role = session.user.role;
  const whereClause = rfqWhereForRole(session);

  // Fetch status counts
  const statusCounts = await db.rfq.groupBy({
    by: ["status"],
    where: whereClause,
    _count: { _all: true },
  });

  const countMap: Record<string, number> = {};
  statusCounts.forEach((sc) => {
    countMap[sc.status] = sc._count._all;
  });

  // Fetch 5 most recent RFQs
  const recentRfqs = await db.rfq.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      serviceLine: { select: { name: true } },
    },
  });

  const isClient = role === Role.CLIENT;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-brand-green/20 flex flex-col justify-between gap-4 rounded-lg border bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-brand-forest text-2xl font-bold">
            Welcome, {session.user.name || session.user.email}
          </h1>
          <p className="text-brand-forest/70 mt-1 text-sm">
            {isClient
              ? `Client Operations Dashboard — ${session.user.companyName || "Organization Account"}`
              : `Operations Console — ${role} Overview`}
          </p>
        </div>

        {isClient ? (
          <Link
            href="/quote"
            className="bg-brand-green hover:bg-brand-forest inline-flex min-h-[44px] items-center justify-center rounded px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            Submit an RFQ
          </Link>
        ) : (
          <Link
            href="/app/rfqs"
            className="bg-brand-green hover:bg-brand-forest inline-flex min-h-[44px] items-center justify-center rounded px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            View all requests
          </Link>
        )}
      </div>

      {/* Status Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isClient ? (
          <>
            <StatusMetricCard
              label="Received"
              count={countMap[RfqStatus.RECEIVED] || 0}
              status="RECEIVED"
            />
            <StatusMetricCard
              label="In review"
              count={countMap[RfqStatus.UNDER_REVIEW] || 0}
              status="UNDER_REVIEW"
            />
            <StatusMetricCard
              label="Quoted"
              count={countMap[RfqStatus.QUOTED] || 0}
              status="QUOTED"
            />
            <StatusMetricCard
              label="Awarded"
              count={countMap[RfqStatus.AWARDED] || 0}
              status="AWARDED"
            />
          </>
        ) : (
          <>
            <StatusMetricCard
              label="Received"
              count={countMap[RfqStatus.RECEIVED] || 0}
              status="RECEIVED"
            />
            <StatusMetricCard
              label="Under review"
              count={countMap[RfqStatus.UNDER_REVIEW] || 0}
              status="UNDER_REVIEW"
            />
            <StatusMetricCard
              label="Quoted"
              count={countMap[RfqStatus.QUOTED] || 0}
              status="QUOTED"
            />
            <StatusMetricCard
              label="Awarded"
              count={countMap[RfqStatus.AWARDED] || 0}
              status="AWARDED"
            />
            <StatusMetricCard
              label="Declined"
              count={countMap[RfqStatus.DECLINED] || 0}
              status="DECLINED"
            />
            <StatusMetricCard
              label="Closed"
              count={countMap[RfqStatus.CLOSED] || 0}
              status="CLOSED"
            />
          </>
        )}
      </div>

      {/* Recent RFQs Section */}
      <div className="border-brand-green/20 overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="border-brand-green/10 flex items-center justify-between border-b p-4 sm:p-6">
          <h2 className="text-brand-forest text-lg font-bold">
            {isClient
              ? "Your Recent Requests"
              : "Recent Requests across Clients"}
          </h2>
          <Link
            href="/app/rfqs"
            className="text-brand-green text-sm font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentRfqs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-brand-forest/70 mb-4 text-base">
              No requests for quotation found.
            </p>
            {isClient && (
              <Link
                href="/quote"
                className="bg-brand-green hover:bg-brand-forest inline-flex min-h-[44px] items-center justify-center rounded px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                Submit an RFQ
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-brand-forest w-full text-left text-sm">
              <thead className="bg-brand-paper/80 border-brand-green/10 text-brand-forest/70 border-b text-xs font-semibold tracking-wider uppercase">
                <tr>
                  <th className="p-4">Reference</th>
                  {!isClient && <th className="p-4">Company</th>}
                  <th className="p-4">Service Line</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Submitted</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-brand-green/10 divide-y">
                {recentRfqs.map((rfq) => (
                  <tr
                    key={rfq.id}
                    className="hover:bg-brand-paper/30 transition-colors"
                  >
                    <td className="text-brand-green p-4 font-mono font-bold">
                      {rfq.publicId}
                    </td>
                    {!isClient && (
                      <td className="p-4 font-medium">{rfq.companyName}</td>
                    )}
                    <td className="p-4">{rfq.serviceLine.name}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block rounded border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                          rfq.status
                        )}`}
                      >
                        {formatStatusLabel(rfq.status)}
                      </span>
                    </td>
                    <td className="text-brand-forest/70 p-4">
                      {formatDateOnlyLagos(rfq.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/app/rfqs/${rfq.id}`}
                        className="bg-brand-green/10 text-brand-green hover:bg-brand-green inline-block min-h-[36px] rounded px-3 py-1.5 text-xs leading-[24px] font-semibold transition-colors hover:text-white"
                      >
                        View request
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusMetricCard({
  label,
  count,
  status,
}: {
  label: string;
  count: number;
  status: string;
}) {
  return (
    <div className="border-brand-green/20 flex flex-col justify-between rounded-lg border bg-white p-4 shadow-sm">
      <span className="text-brand-forest/70 text-xs font-semibold tracking-wider uppercase">
        {label}
      </span>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-brand-forest text-2xl font-bold">{count}</span>
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            status === "RECEIVED"
              ? "bg-blue-500"
              : status === "UNDER_REVIEW"
                ? "bg-amber-500"
                : status === "QUOTED"
                  ? "bg-purple-500"
                  : status === "AWARDED"
                    ? "bg-green-500"
                    : status === "DECLINED"
                      ? "bg-red-500"
                      : "bg-gray-500"
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

import Link from "next/link";
import { getCurrentSession, rfqWhereForRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Role, RfqStatus } from "@prisma/client";
import { formatDateOnlyLagos, getStatusBadgeClass, formatStatusLabel } from "@/lib/utils/format";

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
      <div className="bg-white p-6 rounded-lg border border-brand-green/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-forest">
            Welcome, {session.user.name || session.user.email}
          </h1>
          <p className="text-sm text-brand-forest/70 mt-1">
            {isClient
              ? `Client Operations Dashboard — ${session.user.companyName || "Organization Account"}`
              : `Operations Console — ${role} Overview`}
          </p>
        </div>

        {isClient ? (
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-green text-white font-semibold text-sm rounded hover:bg-brand-forest transition-colors shadow-sm min-h-[44px]"
          >
            Submit an RFQ
          </Link>
        ) : (
          <Link
            href="/app/rfqs"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-green text-white font-semibold text-sm rounded hover:bg-brand-forest transition-colors shadow-sm min-h-[44px]"
          >
            View all requests
          </Link>
        )}
      </div>

      {/* Status Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
      <div className="bg-white rounded-lg border border-brand-green/20 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-brand-green/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-forest">
            {isClient ? "Your Recent Requests" : "Recent Requests across Clients"}
          </h2>
          <Link
            href="/app/rfqs"
            className="text-sm font-semibold text-brand-green hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentRfqs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-brand-forest/70 mb-4 text-base">No requests for quotation found.</p>
            {isClient && (
              <Link
                href="/quote"
                className="inline-flex items-center justify-center px-4 py-2 bg-brand-green text-white font-semibold text-sm rounded hover:bg-brand-forest transition-colors min-h-[44px]"
              >
                Submit an RFQ
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-brand-forest">
              <thead className="bg-brand-paper/80 border-b border-brand-green/10 text-xs uppercase tracking-wider font-semibold text-brand-forest/70">
                <tr>
                  <th className="p-4">Reference</th>
                  {!isClient && <th className="p-4">Company</th>}
                  <th className="p-4">Service Line</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Submitted</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-green/10">
                {recentRfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-brand-paper/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-green">
                      {rfq.publicId}
                    </td>
                    {!isClient && <td className="p-4 font-medium">{rfq.companyName}</td>}
                    <td className="p-4">{rfq.serviceLine.name}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${getStatusBadgeClass(
                          rfq.status
                        )}`}
                      >
                        {formatStatusLabel(rfq.status)}
                      </span>
                    </td>
                    <td className="p-4 text-brand-forest/70">
                      {formatDateOnlyLagos(rfq.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/app/rfqs/${rfq.id}`}
                        className="text-xs font-semibold px-3 py-1.5 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white rounded transition-colors inline-block min-h-[36px] leading-[24px]"
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
    <div className="bg-white p-4 rounded-lg border border-brand-green/20 shadow-sm flex flex-col justify-between">
      <span className="text-xs font-semibold text-brand-forest/70 uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-brand-forest">{count}</span>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
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

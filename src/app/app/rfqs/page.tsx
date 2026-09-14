import Link from "next/link";
import { getCurrentSession, rfqWhereForRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Role, RfqStatus, Prisma } from "@prisma/client";
import { formatDateOnlyLagos, getStatusBadgeClass, formatStatusLabel } from "@/lib/utils/format";

interface RfqListPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    serviceLine?: string;
    q?: string;
  }>;
}

export default async function RfqListPage({ searchParams }: RfqListPageProps) {
  const session = await getCurrentSession();
  if (!session?.user) return null;

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const pageSize = 20;

  const isClient = session.user.role === Role.CLIENT;
  const baseWhere = rfqWhereForRole(session);

  // Fetch active service lines for filter dropdown
  const serviceLines = await db.serviceLine.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true },
  });

  // Construct filters
  const filterConditions: Prisma.RfqWhereInput[] = [baseWhere];

  if (resolvedParams.status && Object.values(RfqStatus).includes(resolvedParams.status as RfqStatus)) {
    filterConditions.push({ status: resolvedParams.status as RfqStatus });
  }

  if (resolvedParams.serviceLine) {
    filterConditions.push({
      serviceLine: { slug: resolvedParams.serviceLine },
    });
  }

  if (resolvedParams.q && resolvedParams.q.trim() !== "") {
    const searchTerm = resolvedParams.q.trim();
    filterConditions.push({
      OR: [
        { publicId: { contains: searchTerm, mode: "insensitive" } },
        { companyName: { contains: searchTerm, mode: "insensitive" } },
        { contactName: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.RfqWhereInput = {
    AND: filterConditions,
  };

  const [totalCount, rfqs] = await Promise.all([
    db.rfq.count({ where }),
    db.rfq.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        serviceLine: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-forest">
            {isClient ? "Your Requests for Quotation" : "All Requests for Quotation"}
          </h1>
          <p className="text-sm text-brand-forest/70 mt-1">
            Total {totalCount} request(s) found
          </p>
        </div>

        {isClient && (
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-green text-white font-semibold text-sm rounded hover:bg-brand-forest transition-colors min-h-[44px]"
          >
            Submit an RFQ
          </Link>
        )}
      </div>

      {/* Filter Toolbar Form */}
      <form
        method="GET"
        className="bg-white p-4 rounded-lg border border-brand-green/20 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div>
          <label htmlFor="filter-q" className="block text-xs font-semibold text-brand-forest/70 mb-1">
            Search Keyword
          </label>
          <input
            id="filter-q"
            name="q"
            type="text"
            defaultValue={resolvedParams.q || ""}
            placeholder="Search reference, company, contact..."
            className="w-full px-3 py-2 border border-brand-green/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-green min-h-[40px]"
          />
        </div>

        <div>
          <label htmlFor="filter-status" className="block text-xs font-semibold text-brand-forest/70 mb-1">
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={resolvedParams.status || ""}
            className="w-full px-3 py-2 border border-brand-green/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-green min-h-[40px]"
          >
            <option value="">All Statuses</option>
            {Object.values(RfqStatus).map((s) => (
              <option key={s} value={s}>
                {formatStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-service" className="block text-xs font-semibold text-brand-forest/70 mb-1">
            Service Line
          </label>
          <select
            id="filter-service"
            name="serviceLine"
            defaultValue={resolvedParams.serviceLine || ""}
            className="w-full px-3 py-2 border border-brand-green/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-green min-h-[40px]"
          >
            <option value="">All Service Lines</option>
            {serviceLines.map((sl) => (
              <option key={sl.id} value={sl.slug}>
                {sl.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-brand-green text-white font-semibold text-sm rounded hover:bg-brand-forest transition-colors min-h-[40px]"
          >
            Apply Filters
          </button>
          {(resolvedParams.q || resolvedParams.status || resolvedParams.serviceLine) && (
            <Link
              href="/app/rfqs"
              className="px-3 py-2 bg-gray-100 text-brand-forest font-medium text-sm rounded hover:bg-gray-200 transition-colors min-h-[40px] flex items-center"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* RFQ Table */}
      <div className="bg-white rounded-lg border border-brand-green/20 shadow-sm overflow-hidden">
        {rfqs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-brand-forest/70 text-base">No requests match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-brand-forest">
              <thead className="bg-brand-paper/80 border-b border-brand-green/10 text-xs uppercase tracking-wider font-semibold text-brand-forest/70">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Service Line</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Submitted</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-green/10">
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-brand-paper/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-green">
                      {rfq.publicId}
                    </td>
                    <td className="p-4 font-medium">{rfq.companyName}</td>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-brand-green/10 flex items-center justify-between">
            <span className="text-xs text-brand-forest/70">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={{
                    pathname: "/app/rfqs",
                    query: { ...resolvedParams, page: page - 1 },
                  }}
                  className="px-3 py-1.5 bg-brand-paper border border-brand-green/30 text-brand-forest rounded text-xs font-semibold hover:bg-brand-green hover:text-white transition-colors"
                >
                  Previous
                </Link>
              ) : (
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-400 rounded text-xs font-semibold cursor-not-allowed">
                  Previous
                </span>
              )}

              {page < totalPages ? (
                <Link
                  href={{
                    pathname: "/app/rfqs",
                    query: { ...resolvedParams, page: page + 1 },
                  }}
                  className="px-3 py-1.5 bg-brand-paper border border-brand-green/30 text-brand-forest rounded text-xs font-semibold hover:bg-brand-green hover:text-white transition-colors"
                >
                  Next
                </Link>
              ) : (
                <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-400 rounded text-xs font-semibold cursor-not-allowed">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

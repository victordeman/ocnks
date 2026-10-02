import Link from "next/link";

export const dynamic = "force-dynamic";
import { getCurrentSession, rfqWhereForRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Role, RfqStatus, Prisma } from "@prisma/client";
import {
  formatDateOnlyLagos,
  getStatusBadgeClass,
  formatStatusLabel,
} from "@/lib/utils/format";

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

  if (
    resolvedParams.status &&
    Object.values(RfqStatus).includes(resolvedParams.status as RfqStatus)
  ) {
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-brand-forest text-2xl font-bold">
            {isClient
              ? "Your Requests for Quotation"
              : "All Requests for Quotation"}
          </h1>
          <p className="text-brand-forest/70 mt-1 text-sm">
            Total {totalCount} request(s) found
          </p>
        </div>

        {isClient && (
          <Link
            href="/quote"
            className="bg-brand-green hover:bg-brand-forest inline-flex min-h-[44px] items-center justify-center rounded px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Submit an RFQ
          </Link>
        )}
      </div>

      {/* Filter Toolbar Form */}
      <form
        method="GET"
        className="border-brand-green/20 grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <label
            htmlFor="filter-q"
            className="text-brand-forest/70 mb-1 block text-xs font-semibold"
          >
            Search Keyword
          </label>
          <input
            id="filter-q"
            name="q"
            type="text"
            defaultValue={resolvedParams.q || ""}
            placeholder="Search reference, company, contact..."
            className="border-brand-green/30 focus:ring-brand-green min-h-[40px] w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="filter-status"
            className="text-brand-forest/70 mb-1 block text-xs font-semibold"
          >
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={resolvedParams.status || ""}
            className="border-brand-green/30 focus:ring-brand-green min-h-[40px] w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
          <label
            htmlFor="filter-service"
            className="text-brand-forest/70 mb-1 block text-xs font-semibold"
          >
            Service Line
          </label>
          <select
            id="filter-service"
            name="serviceLine"
            defaultValue={resolvedParams.serviceLine || ""}
            className="border-brand-green/30 focus:ring-brand-green min-h-[40px] w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
            className="bg-brand-green hover:bg-brand-forest min-h-[40px] flex-1 rounded px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Apply Filters
          </button>
          {(resolvedParams.q ||
            resolvedParams.status ||
            resolvedParams.serviceLine) && (
            <Link
              href="/app/rfqs"
              className="text-brand-forest flex min-h-[40px] items-center rounded bg-gray-100 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-200"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* RFQ Table */}
      <div className="border-brand-green/20 overflow-hidden rounded-lg border bg-white shadow-sm">
        {rfqs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-brand-forest/70 text-base">
              No requests match your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-brand-forest w-full text-left text-sm">
              <thead className="bg-brand-paper/80 border-brand-green/10 text-brand-forest/70 border-b text-xs font-semibold tracking-wider uppercase">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Service Line</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Submitted</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-brand-green/10 divide-y">
                {rfqs.map((rfq) => (
                  <tr
                    key={rfq.id}
                    className="hover:bg-brand-paper/30 transition-colors"
                  >
                    <td className="text-brand-green p-4 font-mono font-bold">
                      {rfq.publicId}
                    </td>
                    <td className="p-4 font-medium">{rfq.companyName}</td>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="border-brand-green/10 flex items-center justify-between border-t p-4">
            <span className="text-brand-forest/70 text-xs">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={{
                    pathname: "/app/rfqs",
                    query: { ...resolvedParams, page: page - 1 },
                  }}
                  className="bg-brand-paper border-brand-green/30 text-brand-forest hover:bg-brand-green rounded border px-3 py-1.5 text-xs font-semibold transition-colors hover:text-white"
                >
                  Previous
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-400">
                  Previous
                </span>
              )}

              {page < totalPages ? (
                <Link
                  href={{
                    pathname: "/app/rfqs",
                    query: { ...resolvedParams, page: page + 1 },
                  }}
                  className="bg-brand-paper border-brand-green/30 text-brand-forest hover:bg-brand-green rounded border px-3 py-1.5 text-xs font-semibold transition-colors hover:text-white"
                >
                  Next
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-400">
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

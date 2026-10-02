import { Role } from "@prisma/client";
import { formatDateLagos } from "@/lib/utils/format";

export interface RfqTimelineEvent {
  id: string;
  type: string;
  message: string;
  visibility: string;
  createdAt: Date | string;
  actor?: {
    name: string;
    role: string;
  } | null;
}

interface RfqTimelineProps {
  events: RfqTimelineEvent[];
  role: Role;
}

export function RfqTimeline({ events, role }: RfqTimelineProps) {
  const isStaffOrAdmin = role === Role.STAFF || role === Role.ADMIN;

  return (
    <div className="border-brand-green/20 space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-brand-forest/70 text-xs font-bold tracking-wider uppercase">
        Request Timeline & Communication Log
      </h3>

      {events.length === 0 ? (
        <p className="text-brand-forest/60 py-2 text-xs italic">
          No events recorded.
        </p>
      ) : (
        <div className="border-brand-green/20 relative ml-3 space-y-6 border-l-2 pl-4">
          {events.map((event) => {
            const isInternal = event.visibility === "INTERNAL";
            const actorName = event.actor
              ? isStaffOrAdmin
                ? `${event.actor.name} (${event.actor.role})`
                : "OCNKS Global Operations"
              : "Client / System";

            let iconBg = "bg-brand-green";
            let eventBadge = "Submitted";

            if (event.type === "STATUS_CHANGED") {
              iconBg = "bg-brand-teal";
              eventBadge = "Status changed";
            } else if (event.type === "COMMENT") {
              if (isInternal) {
                iconBg = "bg-amber-600";
                eventBadge = "Internal comment";
              } else {
                iconBg = "bg-brand-green";
                eventBadge = "Comment";
              }
            }

            return (
              <div key={event.id} className="group relative">
                {/* Timeline dot marker */}
                <div
                  className={`absolute top-1.5 -left-[23px] h-3 w-3 rounded-full ${iconBg} ring-4 ring-white`}
                />

                <div
                  className={`space-y-1.5 rounded-md border p-3 text-xs ${
                    isInternal
                      ? "border-amber-300/80 bg-amber-50/70 text-amber-950"
                      : "bg-brand-paper/40 border-brand-green/15 text-brand-forest"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-forest text-xs font-bold">
                        {actorName}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          isInternal
                            ? "border border-amber-400 bg-amber-200 text-amber-900"
                            : "bg-brand-green/10 text-brand-green"
                        }`}
                      >
                        {isInternal ? "Internal" : eventBadge}
                      </span>
                    </div>

                    <time className="text-brand-forest/60 text-[11px] font-medium">
                      {formatDateLagos(event.createdAt)}
                    </time>
                  </div>

                  <p className="font-sans text-xs leading-relaxed whitespace-pre-wrap">
                    {event.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

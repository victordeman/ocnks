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
    <div className="bg-white p-4 rounded-lg border border-brand-green/20 shadow-sm space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest/70">
        Request Timeline & Communication Log
      </h3>

      {events.length === 0 ? (
        <p className="text-xs text-brand-forest/60 italic py-2">
          No events recorded.
        </p>
      ) : (
        <div className="relative border-l-2 border-brand-green/20 ml-3 pl-4 space-y-6">
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
              <div key={event.id} className="relative group">
                {/* Timeline dot marker */}
                <div
                  className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full ${iconBg} ring-4 ring-white`}
                />

                <div
                  className={`p-3 rounded-md border text-xs space-y-1.5 ${
                    isInternal
                      ? "bg-amber-50/70 border-amber-300/80 text-amber-950"
                      : "bg-brand-paper/40 border-brand-green/15 text-brand-forest"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-forest text-xs">
                        {actorName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isInternal
                            ? "bg-amber-200 text-amber-900 border border-amber-400"
                            : "bg-brand-green/10 text-brand-green"
                        }`}
                      >
                        {isInternal ? "Internal" : eventBadge}
                      </span>
                    </div>

                    <time className="text-[11px] text-brand-forest/60 font-medium">
                      {formatDateLagos(event.createdAt)}
                    </time>
                  </div>

                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
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

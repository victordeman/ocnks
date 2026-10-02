import { formatDateLagos } from "@/lib/utils/format";
import { Prisma } from "@prisma/client";

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Prisma.JsonValue;
  createdAt: Date | string;
  actor?: {
    name: string;
    role: string;
  } | null;
}

interface ActivityPanelProps {
  logs: AuditLogEntry[];
}

export function ActivityPanel({ logs }: ActivityPanelProps) {
  return (
    <div className="border-brand-green/20 space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-brand-forest/70 text-xs font-bold tracking-wider uppercase">
          Activity & Audit Log (Staff Console)
        </h3>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
          {logs.length} Log Entries
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="text-brand-forest/60 py-1 text-xs italic">
          No audit entries recorded yet.
        </p>
      ) : (
        <div className="divide-brand-green/10 border-brand-green/10 divide-y overflow-hidden rounded border">
          {logs.map((log) => {
            const actorText = log.actor
              ? `${log.actor.name} (${log.actor.role})`
              : "System";

            return (
              <div key={log.id} className="space-y-1 bg-white p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-brand-green font-mono font-bold">
                    {log.action}
                  </span>
                  <span className="text-brand-forest/60 text-[11px]">
                    {formatDateLagos(log.createdAt)}
                  </span>
                </div>
                <p className="text-brand-forest/80 font-medium">
                  Actor: <span className="font-semibold">{actorText}</span>
                </p>
                {log.meta && (
                  <pre className="bg-brand-paper/50 border-brand-green/10 text-brand-forest mt-1 overflow-x-auto rounded border p-2 font-mono text-[11px]">
                    {JSON.stringify(log.meta, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

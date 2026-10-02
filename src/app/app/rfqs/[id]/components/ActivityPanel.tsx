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
    <div className="bg-white p-4 rounded-lg border border-brand-green/20 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest/70">
          Activity & Audit Log (Staff Console)
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-700">
          {logs.length} Log Entries
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-brand-forest/60 italic py-1">
          No audit entries recorded yet.
        </p>
      ) : (
        <div className="divide-y divide-brand-green/10 border border-brand-green/10 rounded overflow-hidden">
          {logs.map((log) => {
            const actorText = log.actor
              ? `${log.actor.name} (${log.actor.role})`
              : "System";

            return (
              <div key={log.id} className="p-3 bg-white text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-green font-mono">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-brand-forest/60">
                    {formatDateLagos(log.createdAt)}
                  </span>
                </div>
                <p className="text-brand-forest/80 font-medium">
                  Actor: <span className="font-semibold">{actorText}</span>
                </p>
                {log.meta && (
                  <pre className="mt-1 p-2 bg-brand-paper/50 rounded border border-brand-green/10 text-[11px] font-mono text-brand-forest overflow-x-auto">
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

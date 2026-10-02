"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RfqStatus, Role } from "@prisma/client";
import { canTransition } from "@/lib/rfq/transitions";
import { updateStatusAction } from "@/lib/rfq/actions";
import { formatStatusLabel } from "@/lib/utils/format";

interface StatusControlsProps {
  rfqId: string;
  currentStatus: RfqStatus;
  role: Role;
}

const ALL_STATUSES: RfqStatus[] = [
  RfqStatus.RECEIVED,
  RfqStatus.UNDER_REVIEW,
  RfqStatus.QUOTED,
  RfqStatus.AWARDED,
  RfqStatus.DECLINED,
  RfqStatus.CLOSED,
];

export function StatusControls({ rfqId, currentStatus, role }: StatusControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [confirmTarget, setConfirmTarget] = useState<RfqStatus | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compute allowed target statuses using the locked pure canTransition function
  const allowedTargets = ALL_STATUSES.filter((target) =>
    canTransition(currentStatus, target, role)
  );

  if (allowedTargets.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
          Status Management
        </span>
        <p className="text-sm text-brand-forest/70 font-medium">
          This RFQ is in a terminal state ({formatStatusLabel(currentStatus)}). No further status updates are permitted.
        </p>
      </div>
    );
  }

  const handleStatusClick = (target: RfqStatus) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // AWARDED and DECLINED require explicit confirmation step
    if (target === RfqStatus.AWARDED || target === RfqStatus.DECLINED) {
      setConfirmTarget(target);
      setDeclineReason("");
      return;
    }

    executeTransition(target);
  };

  const executeTransition = (target: RfqStatus, reason?: string) => {
    startTransition(async () => {
      const res = await updateStatusAction(rfqId, target, reason);
      if (res.ok) {
        setConfirmTarget(null);
        setDeclineReason("");
        setSuccessMessage(`Status successfully updated to ${formatStatusLabel(target)}`);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to update status");
      }
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-brand-green/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest/70">
          Status Actions (Staff Console)
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-brand-paper rounded border border-brand-green/20 text-brand-forest">
          Current: {formatStatusLabel(currentStatus)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {allowedTargets.map((target) => {
          let colorClass = "bg-brand-paper text-brand-forest border-brand-green/30 hover:bg-brand-green hover:text-white";
          if (target === RfqStatus.AWARDED) {
            colorClass = "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-700 hover:text-white";
          } else if (target === RfqStatus.DECLINED) {
            colorClass = "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-700 hover:text-white";
          } else if (target === RfqStatus.CLOSED) {
            colorClass = "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-700 hover:text-white";
          }

          return (
            <button
              key={target}
              type="button"
              disabled={isPending}
              onClick={() => handleStatusClick(target)}
              className={`px-3.5 py-2 text-xs font-semibold rounded border transition-colors min-h-[44px] flex items-center justify-center ${colorClass} disabled:opacity-50`}
            >
              Update status to {formatStatusLabel(target)}
            </button>
          );
        })}
      </div>

      {/* Confirmation Step Modal / Box for AWARDED & DECLINED */}
      {confirmTarget && (
        <div className="p-4 bg-amber-50 rounded-md border border-amber-200 text-amber-900 space-y-3" role="dialog" aria-labelledby="confirm-heading">
          <h4 id="confirm-heading" className="text-sm font-bold">
            Confirm Status Change to {formatStatusLabel(confirmTarget)}
          </h4>
          <p className="text-xs leading-relaxed">
            {confirmTarget === RfqStatus.AWARDED
              ? "Are you sure you want to mark this contract as AWARDED? This indicates formal client acceptance."
              : "Are you sure you want to mark this request as DECLINED? You may optionally provide a client-visible reason below."}
          </p>

          {confirmTarget === RfqStatus.DECLINED && (
            <div>
              <label htmlFor="decline-reason" className="block text-xs font-semibold mb-1">
                Decline Reason (Optional, max 500 chars)
              </label>
              <textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                maxLength={500}
                placeholder="e.g. Outside current service coverage area"
                className="w-full p-2 border border-amber-300 rounded text-xs bg-white text-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-green"
                rows={2}
              />
              <span className="text-[10px] text-amber-700 block text-right mt-0.5">
                {declineReason.length}/500
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => executeTransition(confirmTarget, declineReason)}
              className="px-4 py-2 bg-brand-green text-white font-semibold text-xs rounded hover:bg-brand-forest transition-colors min-h-[40px] disabled:opacity-50"
            >
              {isPending ? "Updating..." : `Confirm ${formatStatusLabel(confirmTarget)}`}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirmTarget(null)}
              className="px-4 py-2 bg-white border border-amber-300 text-amber-900 font-semibold text-xs rounded hover:bg-amber-100 transition-colors min-h-[40px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {errorMessage && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded border border-red-200" aria-live="polite">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-200" aria-live="polite">
          {successMessage}
        </p>
      )}
    </div>
  );
}

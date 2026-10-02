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

export function StatusControls({
  rfqId,
  currentStatus,
  role,
}: StatusControlsProps) {
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
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <span className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Status Management
        </span>
        <p className="text-brand-forest/70 text-sm font-medium">
          This RFQ is in a terminal state ({formatStatusLabel(currentStatus)}).
          No further status updates are permitted.
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
        setSuccessMessage(
          `Status successfully updated to ${formatStatusLabel(target)}`
        );
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to update status");
      }
    });
  };

  return (
    <div className="border-brand-green/20 space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-brand-forest/70 text-xs font-bold tracking-wider uppercase">
          Status Actions (Staff Console)
        </h3>
        <span className="bg-brand-paper border-brand-green/20 text-brand-forest rounded border px-2.5 py-1 text-xs font-semibold">
          Current: {formatStatusLabel(currentStatus)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {allowedTargets.map((target) => {
          let colorClass =
            "bg-brand-paper text-brand-forest border-brand-green/30 hover:bg-brand-green hover:text-white";
          if (target === RfqStatus.AWARDED) {
            colorClass =
              "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-700 hover:text-white";
          } else if (target === RfqStatus.DECLINED) {
            colorClass =
              "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-700 hover:text-white";
          } else if (target === RfqStatus.CLOSED) {
            colorClass =
              "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-700 hover:text-white";
          }

          return (
            <button
              key={target}
              type="button"
              disabled={isPending}
              onClick={() => handleStatusClick(target)}
              className={`flex min-h-[44px] items-center justify-center rounded border px-3.5 py-2 text-xs font-semibold transition-colors ${colorClass} disabled:opacity-50`}
            >
              Update status to {formatStatusLabel(target)}
            </button>
          );
        })}
      </div>

      {/* Confirmation Step Modal / Box for AWARDED & DECLINED */}
      {confirmTarget && (
        <div
          className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900"
          role="dialog"
          aria-labelledby="confirm-heading"
        >
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
              <label
                htmlFor="decline-reason"
                className="mb-1 block text-xs font-semibold"
              >
                Decline Reason (Optional, max 500 chars)
              </label>
              <textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                maxLength={500}
                placeholder="e.g. Outside current service coverage area"
                className="text-brand-forest focus:ring-brand-green w-full rounded border border-amber-300 bg-white p-2 text-xs focus:ring-2 focus:outline-none"
                rows={2}
              />
              <span className="mt-0.5 block text-right text-[10px] text-amber-700">
                {declineReason.length}/500
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => executeTransition(confirmTarget, declineReason)}
              className="bg-brand-green hover:bg-brand-forest min-h-[40px] rounded px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {isPending
                ? "Updating..."
                : `Confirm ${formatStatusLabel(confirmTarget)}`}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirmTarget(null)}
              className="min-h-[40px] rounded border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {errorMessage && (
        <p
          className="rounded border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600"
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p
          className="rounded border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700"
          aria-live="polite"
        >
          {successMessage}
        </p>
      )}
    </div>
  );
}

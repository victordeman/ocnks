"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignRfqAction } from "@/lib/rfq/actions";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignmentControlProps {
  rfqId: string;
  currentAssigneeId: string | null;
  staffUsers: StaffUser[];
}

export function AssignmentControl({
  rfqId,
  currentAssigneeId,
  staffUsers,
}: AssignmentControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedAssignee, setSelectedAssignee] = useState<string>(
    currentAssigneeId || ""
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAssignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssigneeId = e.target.value;
    setSelectedAssignee(newAssigneeId);
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await assignRfqAction(rfqId, newAssigneeId || null);
      if (res.ok) {
        setSuccessMessage("Assignee updated successfully");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to update assignment");
      }
    });
  };

  return (
    <div className="border-brand-green/20 space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      <label
        htmlFor="assignee-select"
        className="text-brand-forest/70 block text-xs font-bold tracking-wider uppercase"
      >
        Assign Operations Lead
      </label>

      <div className="flex items-center gap-3">
        <select
          id="assignee-select"
          value={selectedAssignee}
          onChange={handleAssignChange}
          disabled={isPending}
          className="border-brand-green/30 focus:ring-brand-green min-h-[44px] flex-1 rounded border bg-white px-3 py-2 text-sm font-medium focus:ring-2 focus:outline-none"
        >
          <option value="">Unassigned</option>
          {staffUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
        {isPending && (
          <span className="text-brand-forest/70 animate-pulse text-xs font-semibold">
            Assigning...
          </span>
        )}
      </div>

      {errorMessage && (
        <p
          className="rounded border border-red-200 bg-red-50 p-2 text-xs font-semibold text-red-600"
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p
          className="rounded border border-emerald-200 bg-emerald-50 p-2 text-xs font-semibold text-emerald-700"
          aria-live="polite"
        >
          {successMessage}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import { addCommentAction } from "@/lib/rfq/actions";

interface CommentComposerProps {
  rfqId: string;
  role: Role;
}

export function CommentComposer({ rfqId, role }: CommentComposerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isStaffOrAdmin = role === Role.STAFF || role === Role.ADMIN;
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"INTERNAL" | "CLIENT_VISIBLE">(
    isStaffOrAdmin ? "INTERNAL" : "CLIENT_VISIBLE"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = body.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      setErrorMessage("Comment must be between 1 and 2,000 characters.");
      return;
    }

    startTransition(async () => {
      const res = await addCommentAction(rfqId, trimmed, visibility);
      if (res.ok) {
        setBody("");
        setSuccessMessage("Comment posted successfully.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to post comment.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-brand-green/20 space-y-3 rounded-lg border bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor="comment-body"
          className="text-brand-forest/70 text-xs font-bold tracking-wider uppercase"
        >
          Add Comment
        </label>
        {isStaffOrAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-brand-forest/70 text-xs font-semibold">
              Visibility:
            </span>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "INTERNAL" | "CLIENT_VISIBLE")
              }
              className="border-brand-green/30 focus:ring-brand-green min-h-[36px] rounded border bg-white px-2 py-1 text-xs font-medium focus:ring-2 focus:outline-none"
            >
              <option value="INTERNAL">Internal (Staff Only)</option>
              <option value="CLIENT_VISIBLE">Client Visible</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <textarea
          id="comment-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder={
            isStaffOrAdmin
              ? visibility === "INTERNAL"
                ? "Write internal operational notes..."
                : "Write a message visible to the client..."
              : "Write a message to OCNKS Global project staff..."
          }
          className="border-brand-green/30 text-brand-forest focus:ring-brand-green w-full rounded border p-3 font-sans text-sm focus:ring-2 focus:outline-none"
        />
        <div className="text-brand-forest/60 mt-1 flex items-center justify-between text-xs">
          <span>
            {isStaffOrAdmin && visibility === "INTERNAL" ? (
              <span className="font-semibold text-amber-700">
                🔒 Visible only to staff
              </span>
            ) : (
              <span className="text-brand-green font-semibold">
                🌐 Visible to client and staff
              </span>
            )}
          </span>
          <span>{body.trim().length}/2000</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isPending || body.trim().length === 0}
          className="bg-brand-green hover:bg-brand-forest flex min-h-[44px] items-center justify-center rounded px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Add comment"}
        </button>
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
    </form>
  );
}

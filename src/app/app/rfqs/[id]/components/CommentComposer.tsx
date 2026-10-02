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
      className="bg-white p-4 rounded-lg border border-brand-green/20 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor="comment-body"
          className="text-xs font-bold uppercase tracking-wider text-brand-forest/70"
        >
          Add Comment
        </label>
        {isStaffOrAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-forest/70">
              Visibility:
            </span>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "INTERNAL" | "CLIENT_VISIBLE")
              }
              className="px-2 py-1 text-xs border border-brand-green/30 rounded bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-green min-h-[36px]"
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
          className="w-full p-3 border border-brand-green/30 rounded text-sm text-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-green font-sans"
        />
        <div className="flex items-center justify-between mt-1 text-xs text-brand-forest/60">
          <span>
            {isStaffOrAdmin && visibility === "INTERNAL" ? (
              <span className="font-semibold text-amber-700">
                🔒 Visible only to staff
              </span>
            ) : (
              <span className="font-semibold text-brand-green">
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
          className="px-4 py-2 bg-brand-green text-white font-semibold text-xs rounded hover:bg-brand-forest transition-colors min-h-[44px] flex items-center justify-center disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Add comment"}
        </button>
      </div>

      {errorMessage && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded border border-red-200" aria-live="polite">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200" aria-live="polite">
          {successMessage}
        </p>
      )}
    </form>
  );
}

"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Role, RfqStatus } from "@prisma/client";
import { uploadAttachmentAction } from "@/lib/rfq/actions";
import { formatDateLagos } from "@/lib/utils/format";

interface AttachmentItem {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: Date | string;
  uploadedBy?: {
    name: string;
    role: string;
  } | null;
}

interface AttachmentSectionProps {
  rfqId: string;
  role: Role;
  status: RfqStatus;
  attachments: AttachmentItem[];
  isStorageConfigured: boolean;
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ACCEPT_STRING = ".pdf,.png,.jpg,.jpeg,.docx,.xlsx,application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function AttachmentSection({
  rfqId,
  role,
  status,
  attachments,
  isStorageConfigured,
}: AttachmentSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isTerminalState =
    status === RfqStatus.CLOSED ||
    status === RfqStatus.DECLINED ||
    status === RfqStatus.AWARDED;

  const isUploadDisabledForClient = role === Role.CLIENT && isTerminalState;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Client-side validations
    if (file.size === 0) {
      setErrorMessage("Selected file is empty (0 bytes).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Selected file exceeds the maximum allowed size of 10 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage(
        "Invalid file type. Allowed formats: PDF, PNG, JPEG, Microsoft Word (.docx), and Excel (.xlsx)."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Submit upload via server action
    const formData = new FormData();
    formData.append("rfqId", rfqId);
    formData.append("file", file);

    startTransition(async () => {
      const res = await uploadAttachmentAction(formData);
      if (res.ok) {
        setSuccessMessage(`File "${file.name}" uploaded successfully.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to upload attachment.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-brand-green/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest/70">
          Attachments ({attachments.length})
        </h3>
        <span className="text-xs text-brand-forest/60 font-medium">
          Max file size: 10 MB
        </span>
      </div>

      {/* Upload Form or Unconfigured Storage Message */}
      {!isStorageConfigured ? (
        <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 text-xs">
          <p className="font-semibold">
            File storage is not configured — send files to ocnksglobal@gmail.com instead
          </p>
        </div>
      ) : isUploadDisabledForClient ? (
        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-700 text-xs">
          <p className="font-medium">
            File uploads are disabled because this request is in a finalized state ({status}).
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              id="file-upload-input"
              type="file"
              accept={ACCEPT_STRING}
              onChange={handleFileChange}
              disabled={isPending}
              className="hidden"
            />
            <label
              htmlFor="file-upload-input"
              className={`inline-flex items-center justify-center px-4 py-2 bg-brand-paper border border-brand-green/40 text-brand-forest font-semibold text-xs rounded hover:bg-brand-green hover:text-white transition-colors cursor-pointer min-h-[44px] ${
                isPending ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isPending ? "Uploading file..." : "Upload file"}
            </label>
            <span className="text-xs text-brand-forest/60">
              Accepted: PDF, PNG, JPEG, DOCX, XLSX
            </span>
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
        </div>
      )}

      {/* Attachment List */}
      {attachments.length === 0 ? (
        <p className="text-xs text-brand-forest/60 italic py-2">
          No specification documents or attachments uploaded yet.
        </p>
      ) : (
        <div className="divide-y divide-brand-green/10 border border-brand-green/10 rounded overflow-hidden">
          {attachments.map((att) => {
            const uploaderText = att.uploadedBy
              ? `${att.uploadedBy.name} (${att.uploadedBy.role})`
              : "Client";

            return (
              <div
                key={att.id}
                className="p-3 flex items-center justify-between bg-white hover:bg-brand-paper/40 transition-colors text-xs"
              >
                <div className="space-y-0.5 max-w-[70%]">
                  <p className="font-semibold text-brand-forest truncate">
                    {att.fileName}
                  </p>
                  <p className="text-[11px] text-brand-forest/60">
                    {formatBytes(att.size)} · Uploaded by {uploaderText} on{" "}
                    {formatDateLagos(att.createdAt)}
                  </p>
                </div>
                <a
                  href={`/app/rfqs/${rfqId}/attachments/${att.id}`}
                  download={att.fileName}
                  className="px-3 py-1.5 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white font-semibold text-xs rounded transition-colors inline-flex items-center min-h-[36px]"
                >
                  Download
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

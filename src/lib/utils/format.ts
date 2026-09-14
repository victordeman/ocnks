export function formatDateLagos(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDateOnlyLagos(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "RECEIVED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "UNDER_REVIEW":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "QUOTED":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "AWARDED":
      return "bg-green-100 text-green-800 border-green-200";
    case "DECLINED":
      return "bg-red-100 text-red-800 border-red-200";
    case "CLOSED":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function formatStatusLabel(status: string): string {
  switch (status) {
    case "RECEIVED":
      return "Received";
    case "UNDER_REVIEW":
      return "Under review";
    case "QUOTED":
      return "Quoted";
    case "AWARDED":
      return "Awarded";
    case "DECLINED":
      return "Declined";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

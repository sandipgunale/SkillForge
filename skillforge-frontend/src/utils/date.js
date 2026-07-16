import { format } from "date-fns";

export function formatDate(date) {
  if (!date) return "-";

  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date) {
  if (!date) return "-";

  return format(new Date(date), "dd MMM yyyy • hh:mm a");
}
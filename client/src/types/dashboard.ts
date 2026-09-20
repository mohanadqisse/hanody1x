/**
 * Shared TypeScript types for the client dashboard.
 * All types mirror the server schema and API response shapes.
 */

export interface Thumbnail {
  id: number;
  userId: number;
  image: string;
  title: string;
  status: string;
  price: number;
  notes?: string | null;
  downloadUrl?: string | null;
  creatorName?: string | null;
  youtubeUrl?: string | null;
  views?: string | null;
  videoTitle?: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  thumbnailId: number;
  authorName: string;
  isAdmin: boolean;
  content: string;
  createdAt: string;
}

export interface Rating {
  id: number;
  thumbnailId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export type RevisionStatus = "pending" | "in_progress" | "completed" | "rejected";

export interface RevisionRequest {
  id: number;
  thumbnailId: number;
  userId: number;
  message: string;
  status: RevisionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OverviewStats {
  totalThumbnails: number;
  monthlyThumbnails: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  type?: string;
  createdAt: string;
}

/* ─── Status helpers (shared across pages) ───────── */

export function statusLabel(status: string): string {
  if (status.includes("تم التسليم"))                              return "Delivered";
  if (status.includes("تم التنفيذ"))                              return "Completed";
  if (status.includes("قيد التنفيذ") || status.includes("قيد العمل")) return "In Progress";
  if (status.includes("في انتظار") || status.includes("انتظار")) return "Pending";
  if (status === "pending")                                       return "Pending";
  if (status === "in_progress")                                   return "In Progress";
  if (status === "completed")                                     return "Completed";
  if (status === "rejected")                                      return "Rejected";
  return status;
}

export function statusBadgeClass(status: string): string {
  if (status.includes("تم التسليم") || status === "completed")   return "dash-badge dash-badge-green";
  if (status.includes("تم التنفيذ"))                              return "dash-badge dash-badge-blue";
  if (status.includes("قيد") || status === "in_progress")        return "dash-badge dash-badge-amber";
  if (status === "rejected")                                      return "dash-badge dash-badge-red";
  return "dash-badge dash-badge-gray";
}

export function revisionStatusBadgeClass(status: RevisionStatus): string {
  if (status === "completed")  return "dash-badge dash-badge-green";
  if (status === "in_progress") return "dash-badge dash-badge-blue";
  if (status === "rejected")   return "dash-badge dash-badge-red";
  return "dash-badge dash-badge-amber"; // pending
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

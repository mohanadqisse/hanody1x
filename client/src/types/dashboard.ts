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

export type NotificationType = "system" | "thumbnail" | "comment" | "revision" | "message" | "billing";

export interface Conversation {
  id: number;
  userId: number;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageSender = "user" | "admin";

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderType: MessageSender;
  body: string;
  isRead: boolean;
  createdAt: string;
}

/* ─── Status helpers (shared across pages) ───────── */

export function statusLabel(status: string): string {
  if (!status) return "";
  const s = status.toLowerCase().trim();
  if (s.includes("تم التسليم") || s.includes("تسليم") || s === "delivered") return "Delivered";
  if (s.includes("تم التنفيذ") || s === "completed")                         return "Completed";
  if (s.includes("قيد التنفيذ") || s.includes("قيد العمل") || s.includes("قيد") || s === "in_progress" || s === "in progress") return "In Progress";
  if (s.includes("جديد") || s === "new")                                     return "New";
  if (s.includes("في انتظار") || s.includes("انتظار") || s === "pending")     return "Pending";
  if (s.includes("مرفوض") || s === "rejected")                              return "Rejected";
  if (s.includes("مدفوع") || s === "paid")                                  return "Paid";
  if (s.includes("غير مدفوع") || s === "unpaid")                            return "Unpaid";
  if (s === "active")                                                      return "Active";
  if (s === "banned")                                                      return "Banned";
  if (s === "disabled")                                                    return "Disabled";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Normalizes system-generated notification strings from legacy database records to natural English.
 * User-generated messages and comments are preserved as entered.
 */
export function formatNotificationMessage(msg: string): string {
  if (!msg) return "";
  const trimmed = msg.trim();

  // 1. Thumbnail added
  if (trimmed.includes("تمت إضافة ثمنيل جديد")) {
    const quoteMatch = trimmed.match(/["'«]([^"'»]+)["'»]/);
    if (quoteMatch) {
      return `A new thumbnail has been added: "${quoteMatch[1]}"`;
    }
    const colonParts = trimmed.split(/[:\-\–]/);
    if (colonParts.length > 1) {
      const name = colonParts.slice(1).join(":").trim().replace(/^["'\s]+|["'\s]+$/g, "");
      if (name) return `A new thumbnail has been added: "${name}"`;
    }
    return "A new thumbnail has been added.";
  }

  // 2. New message received
  if (trimmed.includes("تمت إضافة رسالة جديدة") || trimmed.includes("رسالة جديدة من") || trimmed.includes("وصلتك رسالة جديدة")) {
    return "A new message has been received.";
  }

  // 3. Revision status changed
  if (trimmed.includes("طلب التعديل") || trimmed.includes("حالة طلب")) {
    return "Your revision request status has been updated.";
  }

  // 4. Payment received
  if (trimmed.includes("استلام دفعة") || trimmed.includes("تم تسجيل دفعة") || trimmed.includes("تم دفع")) {
    return "A payment has been received.";
  }

  // 5. Account created
  if (trimmed.includes("تم إنشاء حسابك") || trimmed.includes("إنشاء حسابك بنجاح")) {
    return "Your account has been created successfully.";
  }

  // 6. Admin / Muhanad reply
  if (trimmed.includes("قام مهند بالرد") || trimmed.includes("رد مهند")) {
    return "Muhanad replied to your message. Tap to view.";
  }

  return msg;
}

export function statusBadgeClass(status: string): string {
  if (!status) return "dash-badge dash-badge-gray";
  const s = status.toLowerCase().trim();
  if (s.includes("تم التسليم") || s === "completed" || s === "delivered" || s === "paid" || s === "active") return "dash-badge dash-badge-green";
  if (s.includes("تم التنفيذ") || s === "new") return "dash-badge dash-badge-blue";
  if (s.includes("قيد") || s === "in_progress" || s === "pending") return "dash-badge dash-badge-amber";
  if (s.includes("مرفوض") || s === "rejected" || s === "banned" || s === "disabled" || s === "unpaid") return "dash-badge dash-badge-red";
  return "dash-badge dash-badge-gray";
}

export function revisionStatusBadgeClass(status: RevisionStatus): string {
  if (status === "completed")   return "dash-badge dash-badge-green";
  if (status === "in_progress") return "dash-badge dash-badge-blue";
  if (status === "rejected")    return "dash-badge dash-badge-red";
  return "dash-badge dash-badge-amber"; // pending
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

/** Returns a single emoji icon for a notification type */
export function notificationTypeIcon(type?: string): string {
  switch (type) {
    case "thumbnail":  return "🖼";
    case "comment":    return "💬";
    case "revision":   return "🔄";
    case "message":    return "✉️";
    case "billing":    return "💳";
    default:           return "🔔";
  }
}

/** Returns the dashboard path to navigate to for a notification type */
export function notificationDestination(type?: string): string | null {
  switch (type) {
    case "thumbnail":  return "/dashboard/thumbnails";
    case "comment":    return "/dashboard/thumbnails";
    case "revision":   return "/dashboard/thumbnails";
    case "message":    return "/dashboard/messages";
    case "billing":    return "/dashboard/billing";
    default:           return null;
  }
}

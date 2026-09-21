/**
 * Notifications — /dashboard/notifications
 *
 * Improved notification experience:
 * - Type-specific icons
 * - Unread/read visual distinction
 * - Individual mark-as-read
 * - Mark all as read
 * - Clickable notifications navigate to relevant page
 * - Skeleton loading, polished empty state
 */
import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { CheckCheck } from "lucide-react";
import {
  Notification, formatDate,
  notificationTypeIcon, notificationDestination,
} from "@/types/dashboard";

const token = () => localStorage.getItem("user_token") ?? "";

/* ─── Skeleton ──────────────────────────────────── */
function NotifSkeleton() {
  return (
    <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 18px", borderBottom: "1px solid var(--dash-border)" }}>
          <div className="dash-skeleton" style={{ width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="dash-skeleton" style={{ height: "12px", width: "75%", marginBottom: "8px" }} />
            <div className="dash-skeleton" style={{ height: "10px", width: "28%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Notification row ──────────────────────────── */
function NotifRow({
  notif,
  onMarkRead,
}: {
  notif: Notification;
  onMarkRead: (id: number) => void;
}) {
  const [, navigate] = useLocation();
  const destination  = notificationDestination(notif.type);
  const clickable    = !!destination;

  const handleClick = () => {
    if (!notif.read) onMarkRead(notif.id);
    if (destination) navigate(destination);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dash-notif-row${notif.read ? "" : " unread"}${clickable ? " clickable" : ""}`}
      onClick={clickable || !notif.read ? handleClick : undefined}
      style={{ position: "relative" }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span style={{
          position: "absolute", top: "14px", left: "6px",
          width: "6px", height: "6px", borderRadius: "50%",
          background: "#dc2626",
        }} />
      )}

      {/* Icon */}
      <div className="dash-notif-icon" style={{ marginLeft: "8px" }}>
        {notificationTypeIcon(notif.type)}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "13.5px",
          color: "var(--dash-ink)",
          lineHeight: 1.5,
          fontWeight: notif.read ? 400 : 600,
        }}>
          {notif.message}
        </p>
        <p style={{ fontSize: "11px", color: "var(--dash-ink-3)", marginTop: "3px" }}>
          {formatDate(notif.createdAt)}
        </p>
      </div>

      {/* Mark read button (only for unread) */}
      {!notif.read && (
        <button
          onClick={e => { e.stopPropagation(); onMarkRead(notif.id); }}
          title="Mark as read"
          style={{
            background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px",
            padding: "4px 8px", cursor: "pointer", fontSize: "11px",
            color: "var(--dash-ink-3)", fontFamily: "inherit", flexShrink: 0,
            transition: "border-color 0.13s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#aaa")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--dash-border)")}
        >
          Read
        </button>
      )}
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────── */
export default function Notifications() {
  const { toast }                     = useToast();
  const [notifs, setNotifs]           = useState<Notification[]>([]);
  const [loading, setLoading]         = useState(true);
  const [markingAll, setMarkingAll]   = useState(false);

  useEffect(() => {
    fetch(API_BASE + "/api/users/dashboard/notifications", {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then((data: Notification[]) => setNotifs(data))
      .catch(() => toast({ title: "Failed to load notifications.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch(API_BASE + `/api/users/dashboard/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
    } catch {
      // Silently fail — optimistic UI already applied
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(API_BASE + "/api/users/dashboard/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
      toast({ title: "All notifications marked as read." });
    } catch {
      toast({ title: "Failed to mark all read.", variant: "destructive" });
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div>
      <DashboardPageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              style={{
                height: "34px", padding: "0 16px",
                background: "none", border: "1px solid var(--dash-border)", borderRadius: "8px",
                fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
                color: "var(--dash-ink-2)", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: "6px",
                opacity: markingAll ? 0.5 : 1, transition: "opacity 0.15s ease",
              }}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <NotifSkeleton />
      ) : notifs.length === 0 ? (
        <div style={{
          padding: "60px 20px", textAlign: "center",
          border: "1px dashed var(--dash-border)", borderRadius: "12px",
          color: "var(--dash-ink-3)",
        }}>
          <p style={{ fontSize: "18px", marginBottom: "8px" }}>🔔</p>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--dash-ink)", marginBottom: "6px" }}>
            No notifications yet
          </p>
          <p style={{ fontSize: "13px" }}>
            We'll let you know when something happens.
          </p>
        </div>
      ) : (
        <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
          {notifs.map(n => (
            <NotifRow key={n.id} notif={n} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}

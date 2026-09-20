import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Bell, MessageSquare, Image as ImageIcon, CheckCircle } from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
interface Notification {
  id: number;
  message: string;
  read: boolean;
  type?: string; // not in schema yet — handled gracefully
  createdAt: string;
}

function getIcon(type?: string) {
  if (type === "comment")   return <MessageSquare size={15} />;
  if (type === "thumbnail") return <ImageIcon size={15} />;
  return <Bell size={15} />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Skeleton ──────────────────────────────────── */
function NotifSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {[0,1,2,3].map(i => (
        <div key={i} className="dash-card" style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px 18px" }}>
          <div className="dash-skeleton" style={{ width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="dash-skeleton" style={{ height: "12px", width: "80%", marginBottom: "8px" }} />
            <div className="dash-skeleton" style={{ height: "10px", width: "30%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Component ─────────────────────────────────── */
export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    fetch(API_BASE + "/api/users/dashboard/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: "680px" }}>
      <DashboardPageHeader
        title="Notifications"
        description={
          unread > 0
            ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}.`
            : "You're all caught up."
        }
      />

      {isLoading ? <NotifSkeleton /> : notifications.length === 0 ? (
        <div
          style={{
            padding: "56px 20px", textAlign: "center",
            border: "1px dashed var(--dash-border)", borderRadius: "12px",
            color: "var(--dash-ink-3)",
          }}
        >
          <CheckCircle size={28} style={{ marginBottom: "12px", opacity: 0.3 }} />
          <p style={{ fontSize: "14px" }}>No notifications yet.</p>
          <p style={{ fontSize: "12.5px", marginTop: "4px" }}>We'll let you know when something needs your attention.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="dash-card"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "14px 18px",
                opacity: n.read ? 0.65 : 1,
                borderLeft: !n.read ? "3px solid var(--dash-ink)" : "3px solid transparent",
                borderRadius: "12px",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: n.read ? "var(--dash-border-2)" : "#111",
                  color: n.read ? "var(--dash-ink-3)" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {getIcon(n.type)}
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13.5px",
                    fontWeight: n.read ? 400 : 600,
                    color: "var(--dash-ink)",
                    lineHeight: 1.5,
                    marginBottom: "4px",
                  }}
                >
                  {n.message}
                </p>
                <span style={{ fontSize: "11px", color: "var(--dash-ink-3)" }}>
                  {formatDate(n.createdAt)}
                </span>
              </div>

              {/* Unread indicator */}
              {!n.read && (
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--dash-ink)",
                    flexShrink: 0,
                    marginTop: "6px",
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

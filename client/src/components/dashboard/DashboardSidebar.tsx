/**
 * DashboardSidebar — left navigation rail for the client portal.
 * Receives the current location from the parent shell.
 * Handles: nav links, unread notification badge, user profile, logout, back-to-site.
 */
import { Link, useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/api";
import {
  LayoutDashboard,
  Image as ImageIcon,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

/* ─── Unread count fetcher ────────────────────────── */
function useUnreadCount() {
  const [count, setCount] = useState(0);

  const fetch_ = useCallback(async () => {
    try {
      const t = localStorage.getItem("user_token");
      if (!t) return;
      const res = await fetch(API_BASE + "/api/users/dashboard/notifications/unread-count", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json() as { count: number };
        setCount(data.count);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetch_();
    // Poll every 60 seconds for new notifications — lightweight, no WebSocket needed
    const interval = setInterval(fetch_, 60_000);
    return () => clearInterval(interval);
  }, [fetch_]);

  return count;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: boolean; // if true, show the unread badge on this item
}

const NAV: NavItem[] = [
  { label: "Overview",       path: "/dashboard",               icon: <LayoutDashboard size={16} /> },
  { label: "My Thumbnails",  path: "/dashboard/thumbnails",    icon: <ImageIcon size={16} />       },
  { label: "Billing",        path: "/dashboard/billing",       icon: <CreditCard size={16} />      },
  { label: "Messages",       path: "/dashboard/messages",      icon: <MessageSquare size={16} />   },
  { label: "Notifications",  path: "/dashboard/notifications", icon: <Bell size={16} />, badge: true },
  { label: "Settings",       path: "/dashboard/settings",      icon: <Settings size={16} />        },
];

interface Props {
  onNav?: () => void; // called after a link click (mobile: close menu)
}

export function DashboardSidebar({ onNav }: Props) {
  const { user, logout } = useUser();
  const [location] = useLocation();
  const unreadCount = useUnreadCount();

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location === "/dashboard"
      : location.startsWith(path);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="dash-sidebar">
      {/* ── Brand ── */}
      <div style={{ padding: "20px 20px 16px" }}>
        <Link href="/">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--dash-ink)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            MUHANAD
          </span>
        </Link>
        <p
          style={{
            fontSize: "10px",
            color: "var(--dash-ink-3)",
            letterSpacing: "0.08em",
            marginTop: "2px",
            textTransform: "uppercase",
          }}
        >
          Client Portal
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="dash-divider" style={{ marginBottom: "8px" }} />

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={`dash-nav-link${isActive(item.path) ? " active" : ""}`}
              onClick={onNav}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span style={{ opacity: isActive(item.path) ? 1 : 0.55, display: "flex" }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {/* Unread badge — only on Notifications item */}
              {item.badge && unreadCount > 0 && (
                <span className="dash-nav-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--dash-border)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {/* Back to site */}
        <Link href="/">
          <div className="dash-nav-link" onClick={onNav}>
            <ExternalLink size={14} style={{ opacity: 0.4 }} />
            Back to site
          </div>
        </Link>
        {/* Logout */}
        <button
          onClick={logout}
          className="dash-nav-link"
          style={{ width: "100%", border: "none", background: "none", textAlign: "left", color: "var(--dash-red)", fontFamily: "inherit", cursor: "pointer" }}
        >
          <LogOut size={14} style={{ opacity: 0.7 }} />
          Sign out
        </button>

        {/* Profile pill */}
        <div
          style={{
            marginTop: "10px",
            padding: "10px 10px",
            background: "var(--dash-border-2)",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "#fff",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {user?.avatar
              ? <img src={user.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              : initials
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--dash-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.fullName}
            </p>
            <p style={{ fontSize: "11px", color: "var(--dash-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.role === "guest" ? "Demo account" : user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

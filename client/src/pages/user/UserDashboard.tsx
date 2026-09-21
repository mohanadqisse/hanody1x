/**
 * UserDashboard — client portal shell.
 *
 * Design: light editorial, LTR, English.
 * Uses a fixed left sidebar (.dash-sidebar) + scrollable main content area.
 * Mobile: collapsible sidebar triggered by hamburger button.
 * Auth guard: redirects to /login if not authenticated.
 * Guest banner: shown for demo accounts.
 */
import { useState, useEffect, useCallback } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

// Sub-pages
import Overview         from "./Overview";
import Thumbnails       from "./Thumbnails";
import ThumbnailDetail  from "./ThumbnailDetail";
import Billing          from "./Billing";
import UserSettings     from "./UserSettings";
import Notifications    from "./Notifications";
import Messages         from "./Messages";

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useUser();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth gate
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Close sidebar on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (isLoading || !isAuthenticated || !user) return null;

  const isGuest = user.role === "guest";

  return (
    <div className="dash" dir="ltr" style={{ display: "flex" }}>

      {/* ── Desktop sidebar ────────────────────────── */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* ── Mobile sidebar overlay ─────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 40,
                backgroundColor: "rgba(0,0,0,0.25)",
                backdropFilter: "blur(2px)",
              }}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              style={{ position: "fixed", inset: 0, zIndex: 50, width: "fit-content" }}
            >
              <DashboardSidebar onNav={closeSidebar} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ───────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: "100dvh",
        }}
      >
        {/* Mobile top bar */}
        <div
          className="md:hidden"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--dash-border)",
            backgroundColor: "var(--dash-surface)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--dash-ink)",
            }}
          >
            MUHANAD
          </span>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--dash-ink)",
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Guest banner */}
        {isGuest && (
          <div
            style={{
              backgroundColor: "#fffbeb",
              borderBottom: "1px solid #fde68a",
              padding: "9px 20px",
              fontSize: "12.5px",
              color: "#92400e",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            ⚠ You're in demo mode — this data is not real.{" "}
            <a href="/register" style={{ fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "2px" }}>
              Create a real account
            </a>
          </div>
        )}

        {/* Page content */}
        <div
          style={{
            flex: 1,
            padding: "32px 24px",
            maxWidth: "1100px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Switch>
            <Route path="/dashboard"                        component={Overview}        />
            <Route path="/dashboard/thumbnails/:id"         component={ThumbnailDetail} />
            <Route path="/dashboard/thumbnails"             component={Thumbnails}      />
            <Route path="/dashboard/billing"                component={Billing}         />
            <Route path="/dashboard/messages"               component={Messages}        />
            <Route path="/dashboard/notifications"          component={Notifications}   />
            <Route path="/dashboard/settings"               component={UserSettings}    />
            <Route component={Overview} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Image as ImageIcon } from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
interface OverviewStats {
  totalThumbnails: number;
  monthlyThumbnails: number;
  paidAmount: number;
  remainingAmount: number;
}

interface RecentWorkItem {
  id: number;
  title: string;
  status: string;
  image?: string;
  createdAt: string;
}

interface OverviewData {
  stats: OverviewStats;
  recentWork: RecentWorkItem[];
}

/* ─── Status helpers ────────────────────────────── */
function statusBadgeClass(status: string) {
  if (status.includes("تم التسليم") || status.includes("Delivered"))  return "dash-badge dash-badge-green";
  if (status.includes("تم التنفيذ") || status.includes("Completed"))  return "dash-badge dash-badge-blue";
  if (status.includes("قيد")        || status.includes("In Progress")) return "dash-badge dash-badge-amber";
  return "dash-badge dash-badge-gray";
}

function statusLabel(status: string) {
  if (status.includes("تم التسليم"))        return "Delivered";
  if (status.includes("تم التنفيذ"))        return "Completed";
  if (status.includes("قيد التنفيذ"))       return "In Progress";
  if (status.includes("في انتظار") || status.includes("انتظار")) return "Pending";
  if (status.includes("قيد العمل"))         return "In Progress";
  return status;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Skeleton ──────────────────────────────────── */
function OverviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", background: "var(--dash-border)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ background: "var(--dash-surface)", padding: "24px 20px" }}>
            <div className="dash-skeleton" style={{ height: "11px", width: "60%", marginBottom: "12px" }} />
            <div className="dash-skeleton" style={{ height: "30px", width: "40%" }} />
          </div>
        ))}
      </div>
      {/* Recent work */}
      <div>
        <div className="dash-skeleton" style={{ height: "13px", width: "120px", marginBottom: "16px" }} />
        {[0,1,2].map(i => (
          <div key={i} className="dash-card" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", marginBottom: "8px" }}>
            <div className="dash-skeleton" style={{ width: "52px", height: "36px", borderRadius: "6px", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="dash-skeleton" style={{ height: "12px", width: "55%", marginBottom: "8px" }} />
              <div className="dash-skeleton" style={{ height: "10px", width: "30%" }} />
            </div>
            <div className="dash-skeleton" style={{ height: "20px", width: "64px", borderRadius: "99px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────── */
export default function Overview() {
  const { user } = useUser();
  const [data, setData]       = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    fetch(API_BASE + "/api/users/dashboard/overview", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const firstName = user?.fullName?.split(" ")[0] ?? "";

  return (
    <div>
      <DashboardPageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}.`}
        description="Here's a summary of your projects and account."
      />

      {isLoading ? <OverviewSkeleton /> : data ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", gap: "28px" }}
        >

          {/* ── Stats grid ───────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "1px",
              background: "var(--dash-border)",
              borderRadius: "13px",
              overflow: "hidden",
              border: "1px solid var(--dash-border)",
            }}
          >
            {[
              { label: "Total thumbnails",  value: String(data.stats.totalThumbnails),       sub: "all time"      },
              { label: "This month",        value: String(data.stats.monthlyThumbnails),      sub: "thumbnails"    },
              { label: "Total paid",        value: `$${data.stats.paidAmount}`,               sub: "confirmed"     },
              { label: "Outstanding",       value: `$${data.stats.remainingAmount}`,          sub: "pending payment" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: "var(--dash-surface)",
                  padding: "24px 22px",
                }}
              >
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--dash-ink-3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "10px" }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.035em", color: "var(--dash-ink)", lineHeight: 1, marginBottom: "6px" }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: "11.5px", color: "var(--dash-ink-3)" }}>
                  {stat.sub}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── Recent work ──────────────────────── */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dash-ink-3)", marginBottom: "14px" }}>
              Recent work
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {data.recentWork.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    border: "1px dashed var(--dash-border)",
                    borderRadius: "12px",
                    color: "var(--dash-ink-3)",
                    fontSize: "14px",
                  }}
                >
                  No work yet — your completed thumbnails will appear here.
                </div>
              ) : (
                data.recentWork.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="dash-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 16px",
                      cursor: "default",
                      transition: "border-color 0.15s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#ccc")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--dash-border)")}
                  >
                    {/* Thumbnail image or placeholder */}
                    <div
                      style={{
                        width: "56px",
                        height: "38px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "var(--dash-border-2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {(item as any).image ? (
                        <img
                          src={(item as any).image}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <ImageIcon size={14} color="var(--dash-ink-3)" />
                      )}
                    </div>

                    {/* Meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--dash-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: "11.5px", color: "var(--dash-ink-3)", marginTop: "2px" }}>
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={statusBadgeClass(item.status)}>
                      {statusLabel(item.status)}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </motion.div>
      ) : (
        <p style={{ color: "var(--dash-ink-3)", fontSize: "14px" }}>Unable to load overview data.</p>
      )}
    </div>
  );
}

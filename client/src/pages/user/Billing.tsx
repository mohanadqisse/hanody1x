import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { FileText, CheckCircle, Clock } from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
interface Transaction {
  id: number;
  description: string;
  amount: number;
  status: "paid" | "pending";
  date?: string;
  createdAt: string;
}

interface ThumbnailRecord {
  id: number;
  title: string;
  status: string;
  price: number;
  createdAt: string;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Skeleton ──────────────────────────────────── */
function BillingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        {[0,1,2].map(i => (
          <div key={i} className="dash-card" style={{ padding: "22px 20px" }}>
            <div className="dash-skeleton" style={{ height: "10px", width: "60%", marginBottom: "12px" }} />
            <div className="dash-skeleton" style={{ height: "28px", width: "45%" }} />
          </div>
        ))}
      </div>
      <div className="dash-card">
        {[0,1,2,3].map(i => (
          <div key={i} style={{ padding: "14px 20px", borderBottom: i < 3 ? "1px solid var(--dash-border)" : "none", display: "flex", gap: "12px" }}>
            <div className="dash-skeleton" style={{ height: "12px", width: "15%", flexShrink: 0 }} />
            <div className="dash-skeleton" style={{ height: "12px", flex: 1 }} />
            <div className="dash-skeleton" style={{ height: "12px", width: "10%", flexShrink: 0 }} />
            <div className="dash-skeleton" style={{ height: "20px", width: "60px", borderRadius: "99px", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────── */
export default function Billing() {
  const { user } = useUser();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [thumbs, setThumbs]             = useState<ThumbnailRecord[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [pdfLoading, setPdfLoading]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    fetch(API_BASE + "/api/users/dashboard/billing", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((d: { transactions?: Transaction[]; thumbnails?: ThumbnailRecord[] } | Transaction[] | null) => {
        if (!d) return;
        if (Array.isArray(d)) {
          setTransactions(d);
        } else {
          setTransactions(d.transactions ?? []);
          setThumbs(d.thumbnails ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const total     = thumbs.reduce((s, t) => s + (t.price ?? 0), 0)
                  + (thumbs.length === 0 ? transactions.reduce((s, t) => s + t.amount, 0) : 0);
  const paid      = transactions.filter(t => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const remaining = total - paid;

  const handlePDF = async () => {
    setPdfLoading(true);
    const el = document.getElementById("billing-invoice-template");
    try {
      if (!el) return;
      el.style.display = "block";
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, "PNG", 0, 0, w, (canvas.height * w) / canvas.width);
      pdf.save(`Invoice_${user?.fullName ?? "Client"}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      toast({ title: "Failed to generate PDF invoice.", variant: "destructive" });
    } finally {
      if (el) el.style.display = "none";
      setPdfLoading(false);
    }
  };

  return (
    <div>
      <DashboardPageHeader
        title="Billing"
        description="Track payments, outstanding balances, and download invoices."
        action={
          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              height: "36px", padding: "0 14px",
              background: "var(--dash-ink)", color: "#fff",
              border: "none", borderRadius: "8px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", opacity: pdfLoading ? 0.5 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            <FileText size={14} />
            {pdfLoading ? "Generating…" : "Download invoice"}
          </button>
        }
      />

      {isLoading ? <BillingSkeleton /> : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* ── Summary cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1px", background: "var(--dash-border)", borderRadius: "13px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
            {[
              { label: "Total",       value: `$${total}`,     sub: "all projects"  },
              { label: "Paid",        value: `$${paid}`,      sub: "confirmed"     },
              { label: "Outstanding", value: `$${remaining}`, sub: "pending"       },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--dash-surface)", padding: "22px 20px" }}>
                <p style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--dash-ink-3)", marginBottom: "10px" }}>
                  {s.label}
                </p>
                <p style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", color: i === 2 && remaining > 0 ? "var(--dash-red)" : "var(--dash-ink)", lineHeight: 1, marginBottom: "5px" }}>
                  {s.value}
                </p>
                <p style={{ fontSize: "11px", color: "var(--dash-ink-3)" }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Transactions table ── */}
          <div className="dash-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--dash-border)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dash-ink-3)" }}>
                Transaction history
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "var(--dash-border-2)" }}>
                    {["Date", "Description", "Amount", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontWeight: 600, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-ink-3)", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "var(--dash-ink-3)", fontSize: "13px" }}>
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t, i) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        style={{ borderBottom: "1px solid var(--dash-border)", transition: "background 0.1s ease" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--dash-border-2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                      >
                        <td style={{ padding: "13px 20px", color: "var(--dash-ink-3)", whiteSpace: "nowrap" }}>
                          {formatDate(t.date ?? t.createdAt)}
                        </td>
                        <td style={{ padding: "13px 20px", fontWeight: 500, color: "var(--dash-ink)" }}>
                          {t.description}
                        </td>
                        <td style={{ padding: "13px 20px", fontWeight: 700, color: "var(--dash-ink)", whiteSpace: "nowrap" }}>
                          ${t.amount}
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          {t.status === "paid" ? (
                            <span className="dash-badge dash-badge-green" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle size={10} /> Paid
                            </span>
                          ) : (
                            <span className="dash-badge dash-badge-amber" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Clock size={10} /> Pending
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hidden invoice template for PDF */}
      <div
        id="billing-invoice-template"
        style={{
          display: "none", position: "absolute", top: 0, left: 0,
          zIndex: -100, width: "800px", padding: "48px",
          backgroundColor: "#ffffff", color: "#111",
          direction: "ltr", fontFamily: "system-ui, -apple-system, sans-serif",
          border: "1px solid #e8e8e5",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1.5px solid #111", paddingBottom: "24px", marginBottom: "36px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>MUHANAD</h1>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#999", letterSpacing: "0.05em", textTransform: "uppercase" }}>Thumbnail Design</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 4px" }}>Invoice</p>
            <p style={{ fontSize: "12px", color: "#777", margin: 0 }}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p style={{ fontSize: "12px", color: "#555", margin: "4px 0 0" }}>Client: {user?.fullName}</p>
          </div>
        </div>

        {/* Thumbnails */}
        {thumbs.length > 0 && (
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: "12px" }}>Work delivered</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e8e8e5" }}>
                  {["Title", "Date", "Status", "Price"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 0", fontWeight: 600, color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {thumbs.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f0f0ed" }}>
                    <td style={{ padding: "10px 0" }}>{t.title}</td>
                    <td style={{ padding: "10px 0", color: "#777" }}>{formatDate(t.createdAt)}</td>
                    <td style={{ padding: "10px 0", color: "#777" }}>{t.status}</td>
                    <td style={{ padding: "10px 0", fontWeight: 700 }}>${t.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div style={{ background: "#f7f7f5", borderRadius: "8px", padding: "20px 24px" }}>
          {[["Total", `$${total}`], ["Paid", `$${paid}`], ["Outstanding", `$${remaining}`]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#555" }}>{k}</span>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

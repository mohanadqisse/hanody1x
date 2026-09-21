import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import {
  Search, Download, MessageSquare, Star, Send, X, ArrowRight
} from "lucide-react";
import {
  Thumbnail, Comment, Rating,
  statusBadgeClass, statusLabel, formatDate,
} from "@/types/dashboard";

/* ─── Skeleton ──────────────────────────────────── */
function ThumbnailsSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className="dash-card" style={{ overflow: "hidden" }}>
          <div className="dash-skeleton" style={{ width: "100%", aspectRatio: "16/9" }} />
          <div style={{ padding: "14px 16px" }}>
            <div className="dash-skeleton" style={{ height: "12px", width: "70%", marginBottom: "8px" }} />
            <div className="dash-skeleton" style={{ height: "10px", width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Modal base ─────────────────────────────────── */
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "14px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
          width: "100%", maxWidth: "480px",
          display: "flex", flexDirection: "column",
          maxHeight: "85vh",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Comment modal ──────────────────────────────── */
function CommentModal({
  thumbId, token, onClose,
}: { thumbId: number; token: string; onClose: () => void }) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [thumbId, token]);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments(prev => [c, ...prev]);
        setText("");
        toast({ title: "Comment posted." });
      }
    } catch {
      toast({ title: "Failed to post comment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--dash-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageSquare size={16} color="var(--dash-ink-2)" />
          <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--dash-ink)" }}>Comments</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dash-ink-3)", display: "flex" }}>
          <X size={18} />
        </button>
      </div>

      {/* Thread */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
            <div className="loader" style={{ width: "20px", height: "20px" }} />
          </div>
        ) : comments.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--dash-ink-3)", fontSize: "13px", padding: "24px 0" }}>
            No comments yet. Be the first to leave one.
          </p>
        ) : (
          comments.map(c => (
            <div
              key={c.id}
              style={{
                padding: "10px 14px",
                borderRadius: "9px",
                background: c.isAdmin ? "#f0f9ff" : "#f7f7f5",
                border: c.isAdmin ? "1px solid #bfdbfe" : "1px solid var(--dash-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: c.isAdmin ? "#1d4ed8" : "var(--dash-ink-2)" }}>
                  {c.isAdmin ? "✦ Muhanad" : c.authorName}
                </span>
                <span style={{ fontSize: "10.5px", color: "var(--dash-ink-3)" }}>{formatDate(c.createdAt)}</span>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--dash-ink)", lineHeight: 1.5 }}>{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--dash-border)", display: "flex", gap: "8px" }}>
        <input
          className="dash-input"
          placeholder="Write a comment…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ flex: 1, height: "36px" }}
        />
        <button
          onClick={submit}
          disabled={submitting || !text.trim()}
          style={{
            height: "36px", width: "36px",
            background: "var(--dash-ink)", color: "#fff",
            border: "none", borderRadius: "7px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: (submitting || !text.trim()) ? 0.4 : 1,
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </Modal>
  );
}

/* ─── Rating modal ───────────────────────────────── */
function RatingModal({
  thumbId, token, onClose,
}: { thumbId: number; token: string; onClose: () => void }) {
  const { toast } = useToast();
  const [selected, setSelected]   = useState(0);
  const [existing, setExisting]   = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbId}/rating`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((d: Rating | null) => { if (d) { setSelected(d.rating); setExisting(d.rating); } })
      .catch(() => {});
  }, [thumbId, token]);

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: selected }),
      });
      if (res.ok) {
        setExisting(selected);
        toast({ title: `Rated ${selected}/5 ⭐` });
        onClose();
      }
    } catch {
      toast({ title: "Failed to submit rating.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--dash-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Star size={16} color="var(--dash-ink-2)" />
          <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--dash-ink)" }}>Rate this work</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dash-ink-3)", display: "flex" }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: "28px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--dash-ink-3)", marginBottom: "24px" }}>
          {existing ? `Your current rating: ${existing}/5 — you can update it.` : "Select a rating from 1 to 5 stars."}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "28px" }}>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, transition: "transform 0.15s ease" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.25)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Star
                size={32}
                style={{
                  fill: n <= selected ? "#f59e0b" : "transparent",
                  color: n <= selected ? "#f59e0b" : "#d1d5db",
                  transition: "fill 0.12s ease, color 0.12s ease",
                }}
              />
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: "38px", background: "none", border: "1px solid var(--dash-border)", borderRadius: "8px", fontSize: "13.5px", cursor: "pointer", color: "var(--dash-ink-2)", fontFamily: "inherit" }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || !selected}
            style={{ flex: 1, height: "38px", background: "var(--dash-ink)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", opacity: (submitting || !selected) ? 0.4 : 1, fontFamily: "inherit" }}
          >
            {submitting ? "Saving…" : "Confirm rating"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Component ─────────────────────────────────── */
export default function Thumbnails() {
  const { toast } = useToast();
  const token = typeof window !== "undefined" ? localStorage.getItem("user_token") ?? "" : "";

  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [commentId, setCommentId]   = useState<number | null>(null);
  const [ratingId, setRatingId]     = useState<number | null>(null);

  useEffect(() => {
    fetch(API_BASE + "/api/users/dashboard/thumbnails", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(setThumbnails)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

  const filtered = thumbnails.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const label = statusLabel(t.status).toLowerCase();
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "delivered"   && (label === "delivered" || t.status.includes("تسليم"))) ||
      (filterStatus === "completed"   && (label === "completed" || (t.status.includes("تنفيذ") && !t.status.includes("قيد")))) ||
      (filterStatus === "in-progress" && (label === "in progress" || t.status.includes("قيد") || t.status.includes("قيد العمل"))) ||
      (filterStatus === "pending"     && (label === "pending" || label === "new" || t.status.includes("انتظار")));
    return matchSearch && matchStatus;
  });

  const handleDownload = (thumb: Thumbnail) => {
    const url = thumb.downloadUrl || thumb.image;
    if (!url) { toast({ title: "Download link not available.", variant: "destructive" }); return; }
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.download = thumb.title || "thumbnail";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div>
      <DashboardPageHeader
        title="My Thumbnails"
        description="Browse, comment, rate, and download your thumbnail deliveries."
      />

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: "180px" }}>
          <Search
            size={14}
            color="var(--dash-ink-3)"
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            className="dash-input"
            placeholder="Search thumbnails…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: "32px" }}
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            height: "38px", border: "1px solid var(--dash-border)", borderRadius: "7px",
            padding: "0 10px", fontSize: "13px", color: "var(--dash-ink)",
            background: "var(--dash-surface)", fontFamily: "inherit", outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">All statuses</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* ── Grid ── */}
      {isLoading ? <ThumbnailsSkeleton /> : (
        <>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "60px 20px", textAlign: "center",
                border: "1px dashed var(--dash-border)", borderRadius: "12px",
                color: "var(--dash-ink-3)", fontSize: "14px",
              }}
            >
              {search ? "No thumbnails match your search." : "No thumbnails yet."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {filtered.map((thumb, i) => (
                <motion.div
                  key={thumb.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="dash-card"
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  {/* Image */}
                  <div
                    style={{
                      position: "relative", aspectRatio: "16/9",
                      background: "var(--dash-border-2)", overflow: "hidden",
                    }}
                    className="group"
                  >
                    <img
                      src={thumb.image}
                      alt={thumb.title}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    {/* Download overlay */}
                    <button
                      onClick={() => handleDownload(thumb)}
                      title="Download"
                      style={{
                        position: "absolute", bottom: "10px", right: "10px",
                        background: "rgba(0,0,0,0.7)", color: "#fff",
                        border: "none", borderRadius: "7px", padding: "6px 10px",
                        fontSize: "11.5px", fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "5px",
                        backdropFilter: "blur(4px)", fontFamily: "inherit",
                        opacity: 0, transition: "opacity 0.2s ease",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    >
                      <Download size={12} /> Download
                    </button>
                    {/* Make the overlay appear on card hover via parent onMouseEnter */}
                  </div>

                  {/* Body */}
                  <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--dash-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>
                          {thumb.title}
                        </h3>
                        <p style={{ fontSize: "11px", color: "var(--dash-ink-3)" }}>
                          {formatDate(thumb.createdAt)}
                        </p>
                      </div>
                      <span className={statusBadgeClass(thumb.status)} style={{ flexShrink: 0, marginTop: "1px" }}>
                        {statusLabel(thumb.status)}
                      </span>
                    </div>

                    {thumb.notes && (
                      <p style={{ fontSize: "12px", color: "var(--dash-ink-2)", background: "var(--dash-border-2)", borderRadius: "6px", padding: "8px 10px", marginBottom: "8px", lineHeight: 1.5 }}>
                        {thumb.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "auto", paddingTop: "10px", borderTop: "1px solid var(--dash-border)" }}>
                      <button
                        onClick={() => handleDownload(thumb)}
                        style={{
                          height: "32px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                          background: "var(--dash-ink)", color: "#fff", border: "none", borderRadius: "6px",
                          fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                          transition: "opacity 0.15s ease", padding: "0 10px",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                      >
                        <Download size={12} /> Download
                      </button>
                      <Link href={`/dashboard/thumbnails/${thumb.id}`}>
                        <div
                          title="View details"
                          style={{
                            height: "32px", display: "flex", alignItems: "center", gap: "5px", padding: "0 10px",
                            background: "var(--dash-border-2)", border: "1px solid var(--dash-border)", borderRadius: "6px",
                            cursor: "pointer", color: "var(--dash-ink-2)", fontSize: "12px", fontWeight: 600,
                            transition: "background 0.13s ease",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--dash-border)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "var(--dash-border-2)")}
                        >
                          <ArrowRight size={12} /> Details
                        </div>
                      </Link>
                      <button
                        onClick={() => setCommentId(thumb.id)}
                        title="Quick comment"
                        style={{
                          width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                          background: "var(--dash-border-2)", border: "1px solid var(--dash-border)", borderRadius: "6px",
                          cursor: "pointer", color: "var(--dash-ink-2)", transition: "background 0.13s ease",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--dash-border)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--dash-border-2)")}
                      >
                        <MessageSquare size={13} />
                      </button>
                      <button
                        onClick={() => setRatingId(thumb.id)}
                        title="Rate"
                        style={{
                          width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                          background: "var(--dash-border-2)", border: "1px solid var(--dash-border)", borderRadius: "6px",
                          cursor: "pointer", color: "#d97706", transition: "background 0.13s ease",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fef9c3")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--dash-border-2)")}
                      >
                        <Star size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {commentId !== null && (
          <CommentModal key="comment" thumbId={commentId} token={token} onClose={() => setCommentId(null)} />
        )}
        {ratingId !== null && (
          <RatingModal key="rating" thumbId={ratingId} token={token} onClose={() => setRatingId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

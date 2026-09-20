/**
 * ThumbnailDetail — /dashboard/thumbnails/:id
 *
 * Premium creative-studio project page for a single delivered thumbnail.
 * Shows: metadata, download, YouTube link, comments thread, star rating,
 * and a revision request form.
 *
 * All data is fetched with ownership-verified APIs.
 */
import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import {
  ArrowLeft, Download, ExternalLink, Star, Send,
  MessageSquare, RotateCcw, CheckCircle, Clock, X
} from "lucide-react";
import {
  Thumbnail, Comment, Rating, RevisionRequest, RevisionStatus,
  statusLabel, statusBadgeClass, revisionStatusBadgeClass, formatDate,
} from "@/types/dashboard";

const token = () => localStorage.getItem("user_token") ?? "";

/* ─── Skeletons ─────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
      <div className="dash-skeleton" style={{ width: "100%", aspectRatio: "16/9", borderRadius: "12px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[80, 50, 40, 60, 30].map((w, i) => (
          <div key={i} className="dash-skeleton" style={{ height: "14px", width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {[0,1].map(i => (
        <div key={i} style={{ padding: "12px 16px", borderRadius: "9px", background: "var(--dash-border-2)" }}>
          <div className="dash-skeleton" style={{ height: "10px", width: "25%", marginBottom: "8px" }} />
          <div className="dash-skeleton" style={{ height: "13px", width: "80%" }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────── */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="dash-card" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 20px", borderBottom: "1px solid var(--dash-border)" }}>
        <span style={{ color: "var(--dash-ink-2)", display: "flex" }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--dash-ink)" }}>{title}</span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Comments section ───────────────────────────── */
function CommentsSection({ thumbnailId }: { thumbnailId: number }) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbnailId}/comments`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [thumbnailId]);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbnailId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ content: trimmed }),
      });
      if (res.ok) {
        const c: Comment = await res.json();
        setComments(prev => [c, ...prev]);
        setText("");
        toast({ title: "Comment posted." });
      } else {
        toast({ title: "Failed to post comment.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error posting comment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section title="Comments & Feedback" icon={<MessageSquare size={15} />}>
      {/* Input row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          className="dash-input"
          placeholder="Leave a comment or feedback…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ flex: 1, height: "38px" }}
        />
        <button
          onClick={submit}
          disabled={submitting || !text.trim()}
          style={{
            height: "38px", width: "38px", background: "var(--dash-ink)", color: "#fff",
            border: "none", borderRadius: "7px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: (submitting || !text.trim()) ? 0.4 : 1, flexShrink: 0,
          }}
        >
          <Send size={14} />
        </button>
      </div>

      {/* Thread */}
      {loading ? <CommentSkeleton /> : comments.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--dash-ink-3)", textAlign: "center", padding: "16px 0" }}>
          No comments yet. Be the first to leave feedback.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {comments.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "10px 14px", borderRadius: "9px",
                background: c.isAdmin ? "#f0f9ff" : "var(--dash-border-2)",
                border: c.isAdmin ? "1px solid #bfdbfe" : "1px solid var(--dash-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: c.isAdmin ? "#1d4ed8" : "var(--dash-ink-2)" }}>
                  {c.isAdmin ? "✦ Muhanad" : c.authorName}
                </span>
                <span style={{ fontSize: "10.5px", color: "var(--dash-ink-3)" }}>{formatDate(c.createdAt)}</span>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--dash-ink)", lineHeight: 1.55 }}>{c.content}</p>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ─── Rating section ─────────────────────────────── */
function RatingSection({ thumbnailId }: { thumbnailId: number }) {
  const { toast } = useToast();
  const [selected, setSelected]   = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [existing, setExisting]   = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]  = useState(false);

  useEffect(() => {
    fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbnailId}/rating`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((d: Rating | null) => {
        if (d) { setSelected(d.rating); setExisting(d.rating); }
      })
      .catch(() => {});
  }, [thumbnailId]);

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbnailId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ rating: selected }),
      });
      if (res.ok) {
        setExisting(selected);
        setSubmitted(true);
        toast({ title: `Rated ${selected} / 5 ⭐` });
      } else {
        toast({ title: "Failed to submit rating.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error submitting rating.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const display = hovered || selected;

  return (
    <Section title="Rate This Work" icon={<Star size={15} />}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(n)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, transition: "transform 0.12s ease" }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.88)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Star
                size={28}
                style={{
                  fill: n <= display ? "#f59e0b" : "transparent",
                  color: n <= display ? "#f59e0b" : "#d1d5db",
                  transition: "fill 0.1s ease, color 0.1s ease",
                }}
              />
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {existing && !submitted && (
            <span style={{ fontSize: "12px", color: "var(--dash-ink-3)" }}>
              Your current rating: {existing}/5
            </span>
          )}
          {submitted && (
            <span style={{ fontSize: "12px", color: "var(--dash-green)", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle size={13} /> Rating saved!
            </span>
          )}
          <button
            onClick={submit}
            disabled={submitting || !selected}
            style={{
              height: "34px", padding: "0 16px",
              background: "var(--dash-ink)", color: "#fff",
              border: "none", borderRadius: "7px",
              fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
              opacity: (submitting || !selected) ? 0.4 : 1,
              fontFamily: "inherit", transition: "opacity 0.15s ease",
            }}
          >
            {submitting ? "Saving…" : existing ? "Update rating" : "Submit rating"}
          </button>
        </div>
      </div>
    </Section>
  );
}

/* ─── Revision section ───────────────────────────── */
function RevisionSection({ thumbnailId }: { thumbnailId: number }) {
  const { toast } = useToast();
  const [revisions, setRevisions] = useState<RevisionRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [message, setMessage]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm]   = useState(false);

  useEffect(() => {
    fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbnailId}/revisions`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(setRevisions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [thumbnailId]);

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbnailId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ message: trimmed }),
      });
      if (res.ok) {
        const rev: RevisionRequest = await res.json();
        setRevisions(prev => [rev, ...prev]);
        setMessage("");
        setShowForm(false);
        toast({ title: "Revision request submitted. We'll review it shortly." });
      } else {
        const d = await res.json();
        toast({ title: d.message || "Failed to submit.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error submitting revision.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (s: RevisionStatus) => {
    if (s === "completed") return <CheckCircle size={12} />;
    if (s === "rejected")  return <X size={12} />;
    return <Clock size={12} />;
  };

  return (
    <Section title="Revision Requests" icon={<RotateCcw size={15} />}>
      {/* Action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm || revisions.length > 0 ? "16px" : "0" }}>
        <p style={{ fontSize: "13px", color: "var(--dash-ink-3)" }}>
          {revisions.length > 0
            ? `${revisions.length} revision request${revisions.length > 1 ? "s" : ""} submitted.`
            : "Need changes? Submit a revision request."}
        </p>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            height: "32px", padding: "0 14px",
            background: showForm ? "var(--dash-border-2)" : "var(--dash-ink)", color: showForm ? "var(--dash-ink)" : "#fff",
            border: showForm ? "1px solid var(--dash-border)" : "none", borderRadius: "7px",
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
        >
          {showForm ? <><X size={12} /> Cancel</> : <><RotateCcw size={12} /> Request revision</>}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden", marginBottom: "16px" }}
          >
            <div style={{ padding: "1px" }}>
              <textarea
                className="dash-textarea"
                placeholder="Describe the changes you need — be as specific as possible…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                maxLength={2000}
                style={{ marginBottom: "10px" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--dash-ink-3)" }}>
                  {message.length}/2000
                </span>
                <button
                  onClick={submit}
                  disabled={submitting || !message.trim()}
                  style={{
                    height: "34px", padding: "0 18px",
                    background: "var(--dash-ink)", color: "#fff",
                    border: "none", borderRadius: "7px",
                    fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    opacity: (submitting || !message.trim()) ? 0.4 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {submitting ? "Submitting…" : "Submit request"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revision list */}
      {loading ? (
        <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
          {[0,1].map(i => <div key={i} className="dash-skeleton" style={{ height: "60px", borderRadius: "8px" }} />)}
        </div>
      ) : revisions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {revisions.map((rev, i) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding: "12px 14px", borderRadius: "9px",
                background: "var(--dash-border-2)",
                border: "1px solid var(--dash-border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: "10.5px", color: "var(--dash-ink-3)" }}>
                  {formatDate(rev.createdAt)}
                </span>
                <span className={`${revisionStatusBadgeClass(rev.status as RevisionStatus)} flex items-center gap-1`}>
                  {statusIcon(rev.status as RevisionStatus)}
                  {rev.status === "in_progress" ? "In Review" : rev.status.charAt(0).toUpperCase() + rev.status.slice(1)}
                </span>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--dash-ink)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                {rev.message}
              </p>
            </motion.div>
          ))}
        </div>
      ) : !showForm ? (
        <p style={{ fontSize: "13px", color: "var(--dash-ink-3)", textAlign: "center", padding: "12px 0" }}>
          No revision requests yet.
        </p>
      ) : null}
    </Section>
  );
}

/* ─── Meta row helper ────────────────────────────── */
function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "8px", padding: "9px 0", borderBottom: "1px solid var(--dash-border)" }}>
      <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--dash-ink-3)", width: "130px", flexShrink: 0, paddingTop: "1px" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", color: "var(--dash-ink)", flex: 1, lineHeight: 1.5 }}>
        {value}
      </span>
    </div>
  );
}

/* ─── Main component ─────────────────────────────── */
export default function ThumbnailDetail() {
  const [, params] = useRoute("/dashboard/thumbnails/:id");
  const { toast }  = useToast();
  const thumbnailId = parseInt(params?.id ?? "0");

  const [thumb, setThumb]       = useState<Thumbnail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound]  = useState(false);

  useEffect(() => {
    if (!thumbnailId) { setNotFound(true); setIsLoading(false); return; }
    fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbnailId}`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) throw new Error("fetch error");
        return r.json();
      })
      .then(d => { if (d) setThumb(d); })
      .catch(() => toast({ title: "Failed to load thumbnail.", variant: "destructive" }))
      .finally(() => setIsLoading(false));
  }, [thumbnailId]);

  const handleDownload = () => {
    if (!thumb) return;
    const url = thumb.downloadUrl || thumb.image;
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.download = thumb.title || "thumbnail";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div>
      {/* Back link */}
      <Link href="/dashboard/thumbnails">
        <button
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "none", cursor: "pointer",
            fontSize: "13px", color: "var(--dash-ink-3)", fontFamily: "inherit",
            padding: 0, marginBottom: "20px",
            transition: "color 0.14s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--dash-ink)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--dash-ink-3)")}
        >
          <ArrowLeft size={14} /> Back to My Thumbnails
        </button>
      </Link>

      {/* Loading */}
      {isLoading ? (
        <DetailSkeleton />

      /* Not found */
      ) : notFound ? (
        <div style={{ textAlign: "center", padding: "64px 20px", border: "1px dashed var(--dash-border)", borderRadius: "12px" }}>
          <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--dash-ink)", marginBottom: "8px" }}>404 — Not found</p>
          <p style={{ fontSize: "14px", color: "var(--dash-ink-3)", marginBottom: "24px" }}>
            This thumbnail doesn't exist or doesn't belong to your account.
          </p>
          <Link href="/dashboard/thumbnails">
            <button style={{ height: "36px", padding: "0 18px", background: "var(--dash-ink)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13.5px", fontWeight: 600, fontFamily: "inherit" }}>
              Back to Thumbnails
            </button>
          </Link>
        </div>

      ) : thumb ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <DashboardPageHeader
            title={thumb.title}
            description={thumb.videoTitle || undefined}
            action={
              <span className={statusBadgeClass(thumb.status)} style={{ fontSize: "12px" }}>
                {statusLabel(thumb.status)}
              </span>
            }
          />

          {/* ── Main layout ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
              gap: "24px",
              marginBottom: "24px",
              alignItems: "start",
            }}
            className="detail-grid"
          >
            {/* Left — image + actions */}
            <div>
              <div
                style={{
                  borderRadius: "12px", overflow: "hidden",
                  border: "1px solid var(--dash-border)",
                  background: "#111",
                  aspectRatio: "16/9",
                  marginBottom: "12px",
                }}
              >
                <img
                  src={thumb.image}
                  alt={thumb.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={handleDownload}
                  style={{
                    flex: 1, height: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                    background: "var(--dash-ink)", color: "#fff", border: "none", borderRadius: "8px",
                    fontSize: "13.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <Download size={15} /> Download
                </button>
                {thumb.youtubeUrl && (
                  <a
                    href={thumb.youtubeUrl} target="_blank" rel="noopener noreferrer"
                    style={{
                      height: "40px", padding: "0 16px", display: "flex", alignItems: "center", gap: "7px",
                      background: "none", border: "1px solid var(--dash-border)", borderRadius: "8px",
                      fontSize: "13.5px", fontWeight: 600, color: "var(--dash-ink)", textDecoration: "none",
                      transition: "border-color 0.14s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#aaa")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--dash-border)")}
                  >
                    <ExternalLink size={14} /> View on YouTube
                  </a>
                )}
              </div>
            </div>

            {/* Right — metadata */}
            <div className="dash-card" style={{ padding: "4px 20px" }}>
              {thumb.creatorName && <MetaRow label="Creator / Channel" value={thumb.creatorName} />}
              {thumb.category    && <MetaRow label="Category"          value={thumb.category}    />}
              {thumb.views       && <MetaRow label="Views"             value={thumb.views}       />}
              {thumb.price > 0   && <MetaRow label="Price"            value={`$${thumb.price}`} />}
              <MetaRow label="Status"   value={<span className={statusBadgeClass(thumb.status)}>{statusLabel(thumb.status)}</span>} />
              <MetaRow label="Created"  value={formatDate(thumb.createdAt)} />
              <MetaRow label="Updated"  value={formatDate(thumb.updatedAt)} />
              {thumb.notes && (
                <div style={{ padding: "10px 0" }}>
                  <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--dash-ink-3)", marginBottom: "6px" }}>Notes</p>
                  <p style={{ fontSize: "13px", color: "var(--dash-ink)", lineHeight: 1.6, background: "var(--dash-border-2)", padding: "10px 12px", borderRadius: "7px" }}>
                    {thumb.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Sections ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <CommentsSection thumbnailId={thumb.id} />
            <RatingSection   thumbnailId={thumb.id} />
            <RevisionSection thumbnailId={thumb.id} />
          </div>
        </motion.div>
      ) : null}

      {/* Responsive grid: single column on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Messages — /dashboard/messages
 *
 * Premium editorial inbox for client ↔ Muhanad conversations.
 * Desktop: list on left, thread on right.
 * Mobile: list view → tap to open thread → back button.
 *
 * Architecture: one conversation per user (simple, no topic selection needed).
 * The POST /conversations endpoint is idempotent — it returns existing or creates new.
 */
import { API_BASE } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Send, MessageSquare, ArrowLeft, Inbox } from "lucide-react";
import { Conversation, ChatMessage, formatDateTime } from "@/types/dashboard";

const token = () => localStorage.getItem("user_token") ?? "";

/* ─── API helpers ─────────────────────────────────── */
async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

/* ─── Skeletons ───────────────────────────────────── */
function ConvSkeleton() {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {[0, 1].map(i => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="dash-skeleton" style={{ height: "12px", width: "60%" }} />
          <div className="dash-skeleton" style={{ height: "10px", width: "40%" }} />
        </div>
      ))}
    </div>
  );
}

function MsgSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
      {[{ w: "55%", align: "flex-end" }, { w: "65%", align: "flex-start" }, { w: "45%", align: "flex-end" }].map(
        (s, i) => (
          <div key={i} style={{ alignSelf: s.align, width: s.w }}>
            <div className="dash-skeleton" style={{ height: "44px", borderRadius: "12px" }} />
          </div>
        )
      )}
    </div>
  );
}

/* ─── Thread view ─────────────────────────────────── */
interface ThreadProps {
  conv: Conversation;
  onBack?: () => void;
}

function Thread({ conv, onBack }: ThreadProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [body, setBody]         = useState("");
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  useEffect(() => {
    setLoading(true);
    apiGet<ChatMessage[]>(`/api/users/dashboard/conversations/${conv.id}/messages`)
      .then(msgs => { setMessages(msgs); scrollToBottom(); })
      .catch(() => toast({ title: "Failed to load messages.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [conv.id]);

  const send = async () => {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const msg = await apiPost<ChatMessage>(
        `/api/users/dashboard/conversations/${conv.id}/messages`,
        { body: trimmed }
      );
      setMessages(prev => [...prev, msg]);
      setBody("");
      scrollToBottom();
    } catch {
      toast({ title: "Failed to send message.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="dash-inbox-thread">
      {/* Thread header */}
      <div style={{
        padding: "13px 18px", borderBottom: "1px solid var(--dash-border)",
        display: "flex", alignItems: "center", gap: "10px",
        background: "var(--dash-surface)",
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              minWidth: "36px", minHeight: "36px", padding: "6px",
              color: "var(--dash-ink-2)", borderRadius: "6px",
            }}
            aria-label="Back to conversations"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--dash-ink)" }}>{conv.subject}</p>
          <p style={{ fontSize: "11px", color: "var(--dash-ink-3)" }}>Direct message with Muhanad</p>
        </div>
      </div>

      {/* Messages */}
      <div className="dash-inbox-thread-messages">
        {loading ? (
          <MsgSkeleton />
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "var(--dash-ink-3)" }}>
              <MessageSquare size={28} style={{ opacity: 0.25, marginBottom: "10px", display: "block", margin: "0 auto 10px" }} />
              <p style={{ fontSize: "13.5px" }}>No messages yet.</p>
              <p style={{ fontSize: "12px", marginTop: "4px" }}>Say hello to start the conversation.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i < 10 ? i * 0.03 : 0 }}
              className={`dash-bubble ${msg.senderType === "user" ? "dash-bubble-user" : "dash-bubble-admin"}`}
            >
              {msg.senderType === "admin" && (
                <span style={{ fontSize: "10.5px", fontWeight: 700, display: "block", marginBottom: "3px", opacity: 0.7 }}>
                  Muhanad
                </span>
              )}
              <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.body}</span>
              <span className="dash-bubble-time">{formatDateTime(msg.createdAt)}</span>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="dash-inbox-compose">
        <textarea
          className="dash-textarea"
          placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          style={{ flex: 1, resize: "none", padding: "10px 12px", fontSize: "13.5px", minHeight: "unset" }}
        />
        <button
          onClick={send}
          disabled={sending || !body.trim()}
          style={{
            width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--dash-ink)", color: "#fff",
            border: "none", borderRadius: "8px", cursor: "pointer",
            opacity: (sending || !body.trim()) ? 0.4 : 1,
            transition: "opacity 0.15s ease", flexShrink: 0, alignSelf: "flex-end",
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Conversation list item ──────────────────────── */
function ConvItem({
  conv, isActive, onClick,
}: { conv: Conversation; isActive: boolean; onClick: () => void }) {
  return (
    <div
      className={`dash-conv-item${isActive ? " active" : ""}`}
      onClick={onClick}
    >
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--dash-ink)", marginBottom: "2px" }}>
        {conv.subject}
      </p>
      <p style={{ fontSize: "11px", color: "var(--dash-ink-3)" }}>
        {formatDateTime(conv.updatedAt)}
      </p>
    </div>
  );
}

/* ─── Empty — no conversations ──────────────────────── */
function EmptyInbox({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "300px", gap: "14px", color: "var(--dash-ink-3)",
    }}>
      <Inbox size={36} style={{ opacity: 0.2 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--dash-ink)", marginBottom: "6px" }}>
          No conversations yet
        </p>
        <p style={{ fontSize: "13px", marginBottom: "18px" }}>
          Start a conversation to reach Muhanad directly.
        </p>
        <button
          onClick={onStart}
          style={{
            height: "38px", padding: "0 22px",
            background: "var(--dash-ink)", color: "#fff",
            border: "none", borderRadius: "8px",
            fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Start a conversation
        </button>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────── */
export default function Messages() {
  const { toast } = useToast();
  const [convs, setConvs]             = useState<Conversation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [starting, setStarting]       = useState(false);
  const [activeConv, setActiveConv]   = useState<Conversation | null>(null);
  // Mobile: show thread when a conversation is selected
  const [mobileView, setMobileView]   = useState<"list" | "thread">("list");

  useEffect(() => {
    apiGet<Conversation[]>("/api/users/dashboard/conversations")
      .then(data => {
        setConvs(data);
        if (data.length > 0) setActiveConv(data[0]);
      })
      .catch(() => toast({ title: "Failed to load conversations.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const startConversation = async () => {
    setStarting(true);
    try {
      const conv = await apiPost<Conversation>("/api/users/dashboard/conversations", { subject: "General" });
      setConvs([conv]);
      setActiveConv(conv);
      setMobileView("thread");
    } catch {
      toast({ title: "Failed to start conversation.", variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  const selectConv = (c: Conversation) => {
    setActiveConv(c);
    setMobileView("thread");
  };

  return (
    <div>
      <DashboardPageHeader
        title="Messages"
        description="Direct communication with Muhanad"
      />

      {loading ? (
        <div className="dash-card" style={{ padding: 0 }}>
          <ConvSkeleton />
        </div>
      ) : convs.length === 0 ? (
        <div className="dash-card">
          <EmptyInbox onStart={startConversation} />
        </div>
      ) : (
        <>
          {/* Desktop inbox */}
          <div className="dash-inbox" style={{ display: undefined } }>
            {/* Conversation list */}
            <div className="dash-inbox-list">
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--dash-border)" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dash-ink-3)" }}>
                  Conversations
                </p>
              </div>
              {convs.map(c => (
                <ConvItem
                  key={c.id}
                  conv={c}
                  isActive={activeConv?.id === c.id}
                  onClick={() => selectConv(c)}
                />
              ))}
            </div>

            {/* Thread */}
            {activeConv ? (
              <Thread key={activeConv.id} conv={activeConv} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--dash-ink-3)", fontSize: "13px" }}>
                Select a conversation
              </div>
            )}
          </div>

          {/* Mobile overlay: separate list/thread views */}
          <div className="dash-inbox-mobile-only" style={{ display: "none" }}>
            <AnimatePresence mode="wait">
              {mobileView === "list" ? (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="dash-card" style={{ padding: 0 }}>
                    {convs.map(c => (
                      <ConvItem key={c.id} conv={c} isActive={false} onClick={() => selectConv(c)} />
                    ))}
                  </div>
                </motion.div>
              ) : activeConv ? (
                <motion.div key="thread" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="dash-card" style={{ padding: 0, height: "calc(100dvh - 220px)", minHeight: "420px", maxHeight: "680px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <Thread conv={activeConv} onBack={() => setMobileView("list")} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </>
      )}

      {!loading && convs.length === 0 && starting && (
        <p style={{ textAlign: "center", color: "var(--dash-ink-3)", fontSize: "13px", marginTop: "12px" }}>Starting…</p>
      )}

      {/* Mobile responsive: swap between desktop grid and mobile stack */}
      <style>{`
        @media (max-width: 640px) {
          .dash-inbox          { display: none !important; }
          .dash-inbox-mobile-only { display: block !important; }
        }
        @media (min-width: 641px) {
          .dash-inbox-mobile-only { display: none !important; }
          .dash-inbox             { display: grid !important; }
        }
      `}</style>
    </div>
  );
}

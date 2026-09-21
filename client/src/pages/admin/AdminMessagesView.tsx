import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";

export interface AdminConversation {
  id: number;
  userId: number;
  subject: string;
  userFullName?: string | null;
  userEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminChatMessage {
  id: number;
  conversationId: number;
  senderType: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface AdminMessagesListProps {
  adminConvs: AdminConversation[];
  adminConvsLoading: boolean;
  activeConvId: number | null;
  onSelectConv: (conv: AdminConversation) => void;
}

function AdminMessagesList({
  adminConvs,
  adminConvsLoading,
  activeConvId,
  onSelectConv,
}: AdminMessagesListProps) {
  return (
    <div className="flex flex-col h-full bg-[#fafaf9] border-r border-[#e8e8e5] overflow-y-auto">
      <div className="p-3.5 border-b border-[#e8e8e5] bg-white">
        <p className="text-[11px] font-bold text-[#55554e] uppercase tracking-wider">
          Open Conversations
        </p>
      </div>
      {adminConvsLoading ? (
        <div className="p-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="dash-skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : adminConvs.length === 0 ? (
        <div className="p-10 text-center text-xs text-[#99998f]">
          No active conversations
        </div>
      ) : (
        adminConvs.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConv(conv)}
            className={`p-3.5 cursor-pointer border-b border-[#f0f0ed] transition-colors ${
              activeConvId === conv.id
                ? "bg-white border-l-3 border-l-[#111110]"
                : "hover:bg-[#f0f0ed]"
            }`}
          >
            <p className="text-xs font-bold text-[#111110] mb-0.5 truncate">
              {conv.userFullName ?? "User"}
            </p>
            <p className="text-[11px] text-[#55554e] truncate">
              {conv.userEmail ?? ""}
            </p>
            <p className="text-[10px] text-[#99998f] mt-1 font-mono">
              {new Date(conv.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

interface AdminMessagesThreadProps {
  activeConv: AdminConversation | null;
  adminMsgs: AdminChatMessage[];
  adminMsgsLoading: boolean;
  token: string;
  onBackMobile: () => void;
  onMessageSent: (msg: AdminChatMessage) => void;
}

function AdminMessagesThread({
  activeConv,
  adminMsgs,
  adminMsgsLoading,
  token,
  onBackMobile,
  onMessageSent,
}: AdminMessagesThreadProps) {
  const { toast } = useToast();
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [adminMsgs, adminMsgsLoading]);

  const handleSend = async () => {
    if (!activeConv || !replyBody.trim() || isSending) return;
    const body = replyBody.trim();
    setIsSending(true);
    try {
      const res = await fetch(
        API_BASE + `/api/dashboard/conversations/${activeConv.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body }),
        }
      );
      if (res.ok) {
        const msg: AdminChatMessage = await res.json();
        onMessageSent(msg);
        setReplyBody("");
      } else {
        toast({ title: "Failed to send message", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Thread Header */}
      <div className="p-3.5 border-b border-[#e8e8e5] flex items-center gap-3 bg-[#fafaf9]">
        <button
          onClick={onBackMobile}
          className="sm:hidden p-1 text-[#55554e] hover:text-[#111110]"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs font-bold text-[#111110]">
            {activeConv?.userFullName ?? "User"}
          </p>
          <p className="text-[11px] text-[#55554e]">{activeConv?.userEmail ?? ""}</p>
        </div>
      </div>

      {/* Messages Flow */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {adminMsgsLoading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className={`dash-skeleton h-12 w-2/3 ${
                i % 2 === 0 ? "self-end" : "self-start"
              }`}
            />
          ))
        ) : adminMsgs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-[#99998f]">
            No messages in this conversation yet.
          </div>
        ) : (
          adminMsgs.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.senderType === "admin"
                  ? "self-end bg-[#111110] text-white rounded-br-xs"
                  : "self-start bg-[#f0f0ed] text-[#111110] border border-[#e8e8e5] rounded-bl-xs"
              }`}
            >
              {msg.senderType === "user" && (
                <span className="text-[10px] font-bold block mb-1 text-[#55554e]">
                  {activeConv?.userFullName ?? "Client"}
                </span>
              )}
              <span className="whitespace-pre-wrap break-words">{msg.body}</span>
              <span
                className={`block text-[9px] mt-1 font-mono ${
                  msg.senderType === "admin" ? "text-white/60" : "text-[#99998f]"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Compose bar */}
      <div className="p-3 border-t border-[#e8e8e5] flex gap-2 bg-[#fafaf9]">
        <textarea
          id="admin-reply-textarea"
          placeholder="Write a reply to the user... (Enter to send, Shift+Enter for new line)"
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          rows={2}
          className="dash-textarea flex-1 text-xs resize-none min-h-[44px] max-h-28"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          id="admin-reply-send-btn"
          onClick={handleSend}
          disabled={isSending || !replyBody.trim()}
          className="dash-btn-primary self-end h-10 w-10 p-0 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export interface AdminMessagesViewProps {
  token: string;
  activeConvId: number | null;
  setActiveConvId: (id: number | null) => void;
  adminConvs: AdminConversation[];
  setAdminConvs: React.Dispatch<React.SetStateAction<AdminConversation[]>>;
  adminConvsLoading: boolean;
  setAdminConvsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  adminMsgs: AdminChatMessage[];
  setAdminMsgs: React.Dispatch<React.SetStateAction<AdminChatMessage[]>>;
  adminMsgsLoading: boolean;
  setAdminMsgsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  adminMsgMobileView: "list" | "thread";
  setAdminMsgMobileView: React.Dispatch<React.SetStateAction<"list" | "thread">>;
}

export function AdminMessagesView({
  token,
  activeConvId,
  setActiveConvId,
  adminConvs,
  setAdminConvs,
  adminConvsLoading,
  setAdminConvsLoading,
  adminMsgs,
  setAdminMsgs,
  adminMsgsLoading,
  setAdminMsgsLoading,
  adminMsgMobileView,
  setAdminMsgMobileView,
}: AdminMessagesViewProps) {
  const activeConv = adminConvs.find((c) => c.id === activeConvId) ?? null;

  const loadMessages = async (convId: number) => {
    setAdminMsgsLoading(true);
    try {
      const res = await fetch(
        API_BASE + `/api/dashboard/conversations/${convId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const msgs: AdminChatMessage[] = await res.json();
        setAdminMsgs(msgs);
        msgs
          .filter((m) => !m.isRead && m.senderType === "user")
          .forEach((m) => {
            fetch(API_BASE + `/api/dashboard/messages/${m.id}/read`, {
              method: "PATCH",
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
          });
      }
    } catch {
      /* non-critical */
    } finally {
      setAdminMsgsLoading(false);
    }
  };

  const selectConv = (conv: AdminConversation) => {
    setActiveConvId(conv.id);
    setAdminMsgMobileView("thread");
    loadMessages(conv.id);
  };

  const handleMessageSent = (msg: AdminChatMessage) => {
    setAdminMsgs((prev) => [...prev, msg]);
    setAdminConvs((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  return (
    <div className="dash-card bg-white border border-[#e8e8e5] rounded-2xl shadow-2xs overflow-hidden h-[calc(100vh-200px)] min-h-[480px]">
      <div className="grid grid-cols-1 sm:grid-cols-12 h-full">
        {/* Desktop Conversation List */}
        <div className="hidden sm:block sm:col-span-4 h-full overflow-hidden">
          <AdminMessagesList
            adminConvs={adminConvs}
            adminConvsLoading={adminConvsLoading}
            activeConvId={activeConvId}
            onSelectConv={selectConv}
          />
        </div>

        {/* Desktop Thread View */}
        <div className="hidden sm:block sm:col-span-8 h-full overflow-hidden">
          {activeConv ? (
            <AdminMessagesThread
              activeConv={activeConv}
              adminMsgs={adminMsgs}
              adminMsgsLoading={adminMsgsLoading}
              token={token}
              onBackMobile={() => {
                setAdminMsgMobileView("list");
                setActiveConvId(null);
              }}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-xs text-[#99998f] gap-2">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <span>Select a conversation from the list to begin.</span>
            </div>
          )}
        </div>

        {/* Mobile Responsive View */}
        <div className="sm:hidden col-span-1 h-full overflow-hidden">
          {adminMsgMobileView === "list" ? (
            <AdminMessagesList
              adminConvs={adminConvs}
              adminConvsLoading={adminConvsLoading}
              activeConvId={activeConvId}
              onSelectConv={selectConv}
            />
          ) : activeConv ? (
            <AdminMessagesThread
              activeConv={activeConv}
              adminMsgs={adminMsgs}
              adminMsgsLoading={adminMsgsLoading}
              token={token}
              onBackMobile={() => {
                setAdminMsgMobileView("list");
                setActiveConvId(null);
              }}
              onMessageSent={handleMessageSent}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

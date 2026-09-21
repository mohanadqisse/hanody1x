import { API_BASE } from "@/lib/api";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut, Save, Upload, Trash2, Settings, Mail, MailOpen,
  ChevronDown, ChevronUp, Package, User, AtSign, Clock,
  Inbox, Shield, ShieldCheck, ShieldX, Globe, Smartphone,
  Monitor, LayoutDashboard, Users, Database, Play, Square, FileText, CheckCircle, Edit, Star, ArrowRight, ArrowLeft, RefreshCw,
  MessageSquare, GitPullRequest, Send, Menu, X, ExternalLink, Sparkles, Plus, Eye, EyeOff
} from "lucide-react";
import UserContentManager from "./UserContentManager";
import { AdminMessagesView, AdminConversation, AdminChatMessage } from "./AdminMessagesView";
import { motion, AnimatePresence } from "framer-motion";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  service: string | null;
  message: string;
  read: boolean;
  createdAt: string | number;
}

interface LoginLog {
  id: number;
  username: string;
  ipAddress: string | null;
  deviceInfo: string | null;
  success: boolean | number;
  attemptedAt: string | number;
}

interface Client {
  id: number;
  name: string;
  status: string;
  balance: number;
  ordersCompleted: number;
  createdAt: string;
  updatedAt: string;
}

interface TimeSession {
  id: number;
  title: string;
  durationSeconds: number;
  createdAt: string;
}

const packageLabels: Record<string, string> = {
  basic: "Basic Package",
  pro: "Professional Package",
  elite: "Elite Package",
  custom: "Custom Request",
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, logout, token } = useAdmin();
  const { toast } = useToast();

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'clients' | 'users' | 'content' | 'codes' | 'creators' | 'public_ratings' | 'revisions' | 'messages'>('home');

  // Existing states
  const [sections, setSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [expandedMsg, setExpandedMsg] = useState<number | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Dashboard states
  const [stats, setStats] = useState({ totalRevenue: 0, totalDues: 0, totalClients: 0, completedOrders: 0 });
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [sessionsData, setSessionsData] = useState<TimeSession[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [codesData, setCodesData] = useState<any[]>([]);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [managingUser, setManagingUser] = useState<any>(null);
  const [publicRatingsData, setPublicRatingsData] = useState<any[]>([]);
  const [expandedVisitors, setExpandedVisitors] = useState<Set<string>>(new Set());

  // ── Revision Requests state ─────────────────────────
  interface AdminRevision {
    id: number;
    thumbnailId: number;
    userId: number;
    message: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    thumbnailTitle: string | null;
    thumbnailImage: string | null;
    userFullName: string | null;
    userEmail: string | null;
  }
  const [revisionsData, setRevisionsData] = useState<AdminRevision[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [revisionUpdating, setRevisionUpdating] = useState<number | null>(null);

  // ── Admin Messaging state ────────────────────────────
  const [adminConvs, setAdminConvs] = useState<AdminConversation[]>([]);
  const [adminConvsLoading, setAdminConvsLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [adminMsgs, setAdminMsgs] = useState<AdminChatMessage[]>([]);
  const [adminMsgsLoading, setAdminMsgsLoading] = useState(false);
  const [adminMsgMobileView, setAdminMsgMobileView] = useState<'list' | 'thread'>('list');

  // Timer State
  const [isTracking, setIsTracking] = useState(false);
  const [trackingSeconds, setTrackingSeconds] = useState(0);
  const [trackingTitle, setTrackingTitle] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Portfolio Creators & Thumbnails State ────────────
  interface AdminPortfolioItem {
    id: number;
    creatorId: number;
    imageUrl: string;
    title: string | null;
    youtubeUrl: string | null;
    views: string | null;
    category: string | null;
    displayOrder: number;
    isActive: boolean;
  }

  interface AdminPortfolioCreator {
    id: number;
    name: string;
    avatarUrl: string | null;
    subscriberCount: string | null;
    youtubeUrl: string | null;
    description: string | null;
    displayOrder: number;
    isActive: boolean;
    items: AdminPortfolioItem[];
  }

  const [portfolioCreatorsList, setPortfolioCreatorsList] = useState<AdminPortfolioCreator[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const [creatorModal, setCreatorModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    creatorId?: number;
    name: string;
    avatarUrl: string;
    subscriberCount: string;
    youtubeUrl: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
  }>({
    isOpen: false,
    mode: 'create',
    name: '',
    avatarUrl: '',
    subscriberCount: '',
    youtubeUrl: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });

  const [thumbnailModal, setThumbnailModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    creatorId: number;
    itemId?: number;
    imageUrl: string;
    title: string;
    youtubeUrl: string;
    views: string;
    category: string;
    displayOrder: number;
    isActive: boolean;
  }>({
    isOpen: false,
    mode: 'create',
    creatorId: 0,
    imageUrl: '',
    title: '',
    youtubeUrl: '',
    views: '',
    category: 'Gaming',
    displayOrder: 0,
    isActive: true,
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'addClient' | 'addWork' | 'editOrder' | 'clearBalance' | 'deleteClient' | 'banUser' | 'deletePlatformUser' | 'addCode' | null;
    title: string;
    description: string;
    placeholder?: string;
    initialValue?: string;
    clientId?: number;
  }>({ isOpen: false, type: null, title: "", description: "" });
  const [modalInputValue, setModalInputValue] = useState("");

  const creatorUsers = useMemo(() => usersData.filter(u => u.role === 'user'), [usersData]);
  const unreadMessagesCount = useMemo(() => messages.filter(m => !m.read).length, [messages]);
  const pendingRevisionsCount = useMemo(() => revisionsData.filter(r => r.status === 'pending').length, [revisionsData]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchSections();
    fetchPortfolioCreators();
    fetchImages();
    fetchMessages();
    fetchLoginLogs();
    fetchDashboardData();
    fetchPublicRatings();
  }, [isAuthenticated]);

  // Handle timer
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setTrackingSeconds(s => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartStopTimer = async () => {
    if (isTracking) {
      setIsTracking(false);
      try {
        const res = await fetch(API_BASE + "/api/dashboard/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: trackingTitle, durationSeconds: trackingSeconds })
        });
        if (res.ok) {
          fetchDashboardData();
          setTrackingSeconds(0);
          setTrackingTitle("");
          toast({ title: "Session saved successfully" });
        }
      } catch (err) {
        toast({ title: "Failed to save session", variant: "destructive" });
      }
    } else {
      setIsTracking(true);
    }
  };

  async function fetchDashboardData() {
    try {
      const pStats = fetch(API_BASE + "/api/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      const pClients = fetch(API_BASE + "/api/dashboard/clients", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      const pSessions = fetch(API_BASE + "/api/dashboard/sessions", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      const pUsers = fetch(API_BASE + "/api/dashboard/users", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      const pCodes = fetch(API_BASE + "/api/dashboard/codes", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

      const [s, c, sess, u, codes] = await Promise.all([pStats, pClients, pSessions, pUsers, pCodes]);
      setStats(s);
      setClientsData(c);
      setSessionsData(sess);
      setUsersData(u);
      setCodesData(codes);
    } catch(err) {
      console.error(err);
    }
  }

  // --- FETCHERS ---
  async function fetchSections() {
    const res = await fetch(API_BASE + "/api/content/all", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setSections(await res.json());
  }

  async function fetchImages() {
    const res = await fetch(API_BASE + "/api/content/images");
    if (res.ok) setImages(await res.json());
  }

  async function fetchMessages() {
    setMessagesLoading(true);
    try {
      const res = await fetch(API_BASE + "/api/messages", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); } finally { setMessagesLoading(false); }
  }

  async function fetchLoginLogs() {
    setLogsLoading(true);
    try {
      const res = await fetch(API_BASE + "/api/auth/logs", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLoginLogs(await res.json());
    } catch (err) { console.error(err); } finally { setLogsLoading(false); }
  }

  async function fetchPublicRatings() {
    try {
      const res = await fetch(API_BASE + "/api/public-ratings", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPublicRatingsData(await res.json());
    } catch (err) { console.error(err); }
  }

  // --- ACTIONS ---
  async function deletePublicRating(id: number) {
    if (!confirm("Are you sure you want to delete this rating?")) return;
    try {
      const res = await fetch(API_BASE + `/api/public-ratings/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast({ title: "Rating deleted" }); fetchPublicRatings(); }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  }

  async function deleteVisitorRatings(vName: string) {
    if (!confirm(`Are you sure you want to delete all ratings from "${vName}"?`)) return;
    try {
      const res = await fetch(API_BASE + `/api/public-ratings/visitor/${encodeURIComponent(vName)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast({ title: "All ratings deleted" }); fetchPublicRatings(); }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  }

  function toggleVisitorExpand(name: string) {
    setExpandedVisitors(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function deleteLoginLog(id: number) {
    try {
      const res = await fetch(API_BASE + `/api/auth/logs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setLoginLogs(prev => prev.filter(l => l.id !== id));
        toast({ title: "Log deleted" });
      } else toast({ title: "Failed to delete log", variant: "destructive" });
    } catch (err) { toast({ title: "Error", variant: "destructive" }); }
  }

  async function markAsRead(id: number) {
    try {
      await fetch(API_BASE + `/api/messages/${id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (err) { console.error(err); }
  }

  async function deleteMessage(id: number) {
    try {
      const res = await fetch(API_BASE + `/api/messages/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        toast({ title: "Message deleted" });
      }
    } catch (err) { toast({ title: "Failed to delete message", variant: "destructive" }); }
  }

  async function saveSection(section: string) {
    setLoading(true);
    try {
      const contentToSave = sections[section] ?? {};

      const res = await fetch(API_BASE + `/api/content/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: JSON.stringify(contentToSave) }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Changes saved successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } finally { setLoading(false); }
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append("image", file);
    try {
      const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) { await fetchImages(); toast({ title: "Image uploaded successfully" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  }

  async function replaceImage(e: React.ChangeEvent<HTMLInputElement>, oldUrl: string) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const filename = oldUrl.split("/").pop();
      const publicId = filename?.split(".")[0];
      const fd = new FormData(); if (publicId) fd.append("publicId", publicId); fd.append("image", file);
      const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) { await fetchImages(); toast({ title: "Image replaced successfully" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  }

  async function deleteImage(url: string) {
    try {
      const filename = url.split("/").pop();
      const res = await fetch(API_BASE + `/api/upload/${filename}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { await fetchImages(); toast({ title: "Image deleted" }); }
    } catch (err) { toast({ title: "Error", variant: "destructive" }); }
  }

  async function moveImage(index: number, direction: 'left' | 'right') {
    const newImages = [...images];
    if (direction === 'left' && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    } else if (direction === 'right' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else return;
    setImages(newImages);
    try {
      const res = await fetch(API_BASE + "/api/content/library_order", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: JSON.stringify({ urls: newImages }) })
      });
      if (res.ok) toast({ title: "Order updated successfully" });
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  // ── Portfolio Creators & Thumbnails API Handlers (Dual-Sync & Resilient) ─────
  const syncToSiteContent = async (updatedList: AdminPortfolioCreator[]) => {
    try {
      await fetch(API_BASE + "/api/content/portfolio_creators", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: JSON.stringify(updatedList) }),
      });
    } catch (e) {
      console.warn("site_content backup sync failed:", e);
    }
  };

  async function fetchPortfolioCreators() {
    setPortfolioLoading(true);
    let loaded: AdminPortfolioCreator[] | null = null;
    try {
      const res = await fetch(API_BASE + "/api/portfolio/admin/creators", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data) && data.length > 0) {
            loaded = data;
          }
        } catch {}
      }
    } catch (err) {
      console.warn("Relational portfolio fetch failed, checking site_content fallback...", err);
    }

    // Fallback: If relational API returned empty, 404, or non-JSON, load from site_content
    if (!loaded || loaded.length === 0) {
      try {
        const res = await fetch(API_BASE + "/api/content/portfolio_creators");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            loaded = data;
          } else if (data && Array.isArray(data.creators) && data.creators.length > 0) {
            loaded = data.creators;
          }
        }
      } catch (err) {
        console.warn("Content portfolio fetch failed:", err);
      }
    }

    if (loaded) {
      setPortfolioCreatorsList(loaded);
    }
    setPortfolioLoading(false);
  }

  const openAddCreatorModal = () => {
    setCreatorModal({
      isOpen: true,
      mode: 'create',
      name: '',
      avatarUrl: '',
      subscriberCount: '',
      youtubeUrl: '',
      description: '',
      displayOrder: portfolioCreatorsList.length,
      isActive: true,
    });
  };

  const openEditCreatorModal = (creator: AdminPortfolioCreator) => {
    setCreatorModal({
      isOpen: true,
      mode: 'edit',
      creatorId: creator.id,
      name: creator.name,
      avatarUrl: creator.avatarUrl || '',
      subscriberCount: creator.subscriberCount || '',
      youtubeUrl: creator.youtubeUrl || '',
      description: creator.description || '',
      displayOrder: creator.displayOrder,
      isActive: creator.isActive,
    });
  };

  const handleSaveCreator = async () => {
    if (!creatorModal.name.trim()) {
      toast({ title: "Creator name is required", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const isCreate = creatorModal.mode === 'create';
      const url = isCreate
        ? API_BASE + "/api/portfolio/admin/creators"
        : `${API_BASE}/api/portfolio/admin/creators/${creatorModal.creatorId}`;
      const method = isCreate ? "POST" : "PATCH";

      const payload = {
        name: creatorModal.name.trim(),
        avatarUrl: creatorModal.avatarUrl.trim() || null,
        subscriberCount: creatorModal.subscriberCount.trim() || null,
        youtubeUrl: creatorModal.youtubeUrl.trim() || null,
        description: creatorModal.description.trim() || null,
        displayOrder: creatorModal.displayOrder,
        isActive: creatorModal.isActive,
      };

      let relationalSucceeded = false;
      let apiErrorMessage = "";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });

        const contentType = res.headers.get("content-type") || "";
        if (res.ok) {
          relationalSucceeded = true;
        } else if (contentType.includes("application/json")) {
          const errJson = await res.json();
          apiErrorMessage = errJson.message || errJson.error || "";
        } else {
          const errText = await res.text();
          console.warn("Relational endpoint returned non-JSON:", res.status, errText.slice(0, 200));
        }
      } catch (networkErr) {
        console.warn("Relational endpoint network error:", networkErr);
      }

      // If relational save succeeded, refresh from server and sync fallback
      if (relationalSucceeded) {
        toast({ title: isCreate ? "Creator added successfully" : "Creator updated successfully" });
        setCreatorModal(prev => ({ ...prev, isOpen: false }));
        await fetchPortfolioCreators();
        setPortfolioCreatorsList(current => {
          syncToSiteContent(current);
          return current;
        });
        return;
      }

      // If relational API is not available (e.g. 404 HTML on Render), perform resilient fallback
      if (!relationalSucceeded && !apiErrorMessage) {
        let updatedList: AdminPortfolioCreator[];
        if (isCreate) {
          const newCreator: AdminPortfolioCreator = {
            id: Date.now(),
            name: payload.name,
            avatarUrl: payload.avatarUrl,
            subscriberCount: payload.subscriberCount,
            youtubeUrl: payload.youtubeUrl,
            description: payload.description,
            displayOrder: payload.displayOrder ?? portfolioCreatorsList.length,
            isActive: payload.isActive ?? true,
            items: [],
          };
          updatedList = [...portfolioCreatorsList, newCreator];
        } else {
          updatedList = portfolioCreatorsList.map(c =>
            c.id === creatorModal.creatorId
              ? { ...c, ...payload, items: c.items }
              : c
          );
        }

        setPortfolioCreatorsList(updatedList);
        await syncToSiteContent(updatedList);

        toast({ title: isCreate ? "Creator added successfully" : "Creator updated successfully" });
        setCreatorModal(prev => ({ ...prev, isOpen: false }));
        return;
      }

      // If server returned a real validation/auth error
      toast({
        title: apiErrorMessage || "Failed to save creator. Please check input values.",
        variant: "destructive",
      });
    } catch (err: any) {
      console.error("handleSaveCreator error:", err);
      toast({
        title: err?.message || "Failed to save creator. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCreator = async (creatorId: number) => {
    if (!confirm("Are you sure you want to delete this creator and all their thumbnails?")) return;
    try {
      setLoading(true);
      const updatedList = portfolioCreatorsList.filter(c => c.id !== creatorId);
      setPortfolioCreatorsList(updatedList);

      try {
        await fetch(`${API_BASE}/api/portfolio/admin/creators/${creatorId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn("Relational delete error:", err);
      }

      await syncToSiteContent(updatedList);
      toast({ title: "Creator deleted" });
    } catch (err) {
      console.error("handleDeleteCreator error:", err);
      toast({ title: "Failed to delete creator", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveCreator = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === portfolioCreatorsList.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newList = [...portfolioCreatorsList];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    const updatedWithOrder = newList.map((c, i) => ({ ...c, displayOrder: i }));
    setPortfolioCreatorsList(updatedWithOrder);
    await syncToSiteContent(updatedWithOrder);

    const orderPayload = updatedWithOrder.map((c) => ({ id: c.id, displayOrder: c.displayOrder }));
    try {
      await fetch(API_BASE + "/api/portfolio/admin/creators/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order: orderPayload }),
      });
    } catch (err) {
      console.warn("Relational reorder error:", err);
    }
  };

  // Thumbnail Handlers
  const openAddThumbnailModal = (creatorId: number) => {
    const creator = portfolioCreatorsList.find(c => c.id === creatorId);
    setThumbnailModal({
      isOpen: true,
      mode: 'create',
      creatorId,
      imageUrl: '',
      title: '',
      youtubeUrl: '',
      views: '',
      category: 'Gaming',
      displayOrder: creator?.items?.length || 0,
      isActive: true,
    });
  };

  const openEditThumbnailModal = (creatorId: number, item: AdminPortfolioItem) => {
    setThumbnailModal({
      isOpen: true,
      mode: 'edit',
      creatorId,
      itemId: item.id,
      imageUrl: item.imageUrl,
      title: item.title || '',
      youtubeUrl: item.youtubeUrl || '',
      views: item.views || '',
      category: item.category || 'Gaming',
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
  };

  const handleSaveThumbnail = async () => {
    if (!thumbnailModal.imageUrl.trim()) {
      toast({ title: "Thumbnail image is required", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const isCreate = thumbnailModal.mode === 'create';
      const url = isCreate
        ? `${API_BASE}/api/portfolio/admin/creators/${thumbnailModal.creatorId}/items`
        : `${API_BASE}/api/portfolio/admin/items/${thumbnailModal.itemId}`;
      const method = isCreate ? "POST" : "PATCH";

      const payload = {
        imageUrl: thumbnailModal.imageUrl.trim(),
        title: thumbnailModal.title.trim() || null,
        youtubeUrl: thumbnailModal.youtubeUrl.trim() || null,
        views: thumbnailModal.views.trim() || null,
        category: thumbnailModal.category.trim() || null,
        displayOrder: thumbnailModal.displayOrder,
        isActive: thumbnailModal.isActive,
      };

      let relationalSucceeded = false;
      let apiErrorMessage = "";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok) {
          relationalSucceeded = true;
        } else if (contentType.includes("application/json")) {
          const errJson = await res.json();
          apiErrorMessage = errJson.message || errJson.error || "";
        } else {
          const errText = await res.text();
          console.warn("Relational thumbnail returned non-JSON:", res.status, errText.slice(0, 200));
        }
      } catch (err) {
        console.warn("Relational thumbnail save error:", err);
      }

      if (relationalSucceeded) {
        toast({ title: isCreate ? "Thumbnail added successfully" : "Thumbnail updated successfully" });
        setThumbnailModal(prev => ({ ...prev, isOpen: false }));
        await fetchPortfolioCreators();
        setPortfolioCreatorsList(current => {
          syncToSiteContent(current);
          return current;
        });
        return;
      }

      if (!relationalSucceeded && !apiErrorMessage) {
        const updatedList = portfolioCreatorsList.map(c => {
          if (c.id !== thumbnailModal.creatorId) return c;
          let items = [...(c.items || [])];
          if (isCreate) {
            const newItem: AdminPortfolioItem = {
              id: Date.now(),
              creatorId: c.id,
              imageUrl: payload.imageUrl,
              title: payload.title || null,
              youtubeUrl: payload.youtubeUrl || null,
              views: payload.views || null,
              category: payload.category || null,
              displayOrder: payload.displayOrder ?? items.length,
              isActive: payload.isActive ?? true,
            };
            items.push(newItem);
          } else {
            items = items.map(it =>
              it.id === thumbnailModal.itemId
                ? {
                    ...it,
                    ...payload,
                    title: payload.title || null,
                    youtubeUrl: payload.youtubeUrl || null,
                    views: payload.views || null,
                    category: payload.category || null,
                  }
                : it
            );
          }
          return { ...c, items };
        });

        setPortfolioCreatorsList(updatedList);
        await syncToSiteContent(updatedList);

        toast({ title: isCreate ? "Thumbnail added successfully" : "Thumbnail updated successfully" });
        setThumbnailModal(prev => ({ ...prev, isOpen: false }));
        return;
      }

      toast({
        title: apiErrorMessage || "Failed to save thumbnail. Please check input values.",
        variant: "destructive",
      });
    } catch (err: any) {
      console.error("handleSaveThumbnail error:", err);
      toast({
        title: err?.message || "Failed to save thumbnail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThumbnail = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this thumbnail?")) return;
    try {
      const updatedList = portfolioCreatorsList.map(c => ({
        ...c,
        items: (c.items || []).filter(it => it.id !== itemId),
      }));
      setPortfolioCreatorsList(updatedList);

      try {
        await fetch(`${API_BASE}/api/portfolio/admin/items/${itemId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn("Relational delete item error:", err);
      }

      await syncToSiteContent(updatedList);
      toast({ title: "Thumbnail deleted" });
    } catch {
      toast({ title: "Failed to delete thumbnail", variant: "destructive" });
    }
  };

  const handleMoveThumbnail = async (creatorId: number, itemIndex: number, direction: 'left' | 'right') => {
    const creator = portfolioCreatorsList.find(c => c.id === creatorId);
    if (!creator) return;
    const items = [...creator.items];
    if ((direction === 'left' && itemIndex === 0) || (direction === 'right' && itemIndex === items.length - 1)) return;
    const targetIndex = direction === 'left' ? itemIndex - 1 : itemIndex + 1;
    const [moved] = items.splice(itemIndex, 1);
    items.splice(targetIndex, 0, moved);

    const updatedWithOrder = items.map((it, i) => ({ ...it, displayOrder: i }));
    const updatedList = portfolioCreatorsList.map(c => c.id === creatorId ? { ...c, items: updatedWithOrder } : c);
    setPortfolioCreatorsList(updatedList);
    await syncToSiteContent(updatedList);

    const orderPayload = updatedWithOrder.map((it) => ({ id: it.id, displayOrder: it.displayOrder }));
    try {
      await fetch(`${API_BASE}/api/portfolio/admin/creators/${creatorId}/items/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order: orderPayload }),
      });
    } catch (err) {
      console.warn("Relational thumbnail reorder error:", err);
    }
  };

  const editableSection = (section: string, field: string, label: string, multiline = false) => (
    <div key={field} className="mb-4">
      <label className="block text-xs font-semibold text-[#111110] mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={sections[section]?.[field] ?? ""}
          onChange={(e) => setSections((prev) => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }))}
          className="dash-textarea min-h-24"
        />
      ) : (
        <input
          value={sections[section]?.[field] ?? ""}
          onChange={(e) => setSections((prev) => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }))}
          className="dash-input"
        />
      )}
    </div>
  );

  // Dash specific Actions
  const handleAddClient = () => {
    setModalConfig({
      isOpen: true,
      type: 'addClient',
      title: 'Add New Client',
      description: 'Enter the new client name to create a record in the ledger.',
      placeholder: 'Client name'
    });
    setModalInputValue("");
  };

  const handleAddWorkAction = (clientId: number) => {
    setModalConfig({
      isOpen: true,
      type: 'addWork',
      title: 'Record Work / Thumbnails',
      description: 'Enter the number of completed thumbnails (default: 1 = $10).',
      placeholder: 'e.g. 1',
      clientId
    });
    setModalInputValue("1");
  };

  const handleClearBalance = (clientId: number) => {
    setModalConfig({
      isOpen: true,
      type: 'clearBalance',
      title: 'Reset Balance',
      description: 'Are you sure you want to reset the balance for this client?',
      clientId
    });
  };

  const handleEditOrderCount = (clientId: number, currentOrders: number) => {
    setModalConfig({
      isOpen: true,
      type: 'editOrder',
      title: 'Edit Completed Thumbnails',
      description: 'Enter the correct count of completed thumbnails for this client.',
      placeholder: 'e.g. 10',
      initialValue: currentOrders.toString(),
      clientId
    });
    setModalInputValue(currentOrders.toString());
  };

  const handleDeleteClient = (clientId: number) => {
    setModalConfig({
      isOpen: true,
      type: 'deleteClient',
      title: 'Delete Client',
      description: 'Are you sure you want to permanently delete this client? All associated records will be permanently removed.',
      clientId
    });
  };

  const handleBanUser = (userId: number, currentBanStatus: boolean) => {
    setModalConfig({
      isOpen: true,
      type: 'banUser',
      title: currentBanStatus ? 'Unsuspend User' : 'Suspend User',
      description: currentBanStatus ? 'Are you sure you want to lift the suspension for this user?' : 'Enter a suspension reason (optional). This will prevent the user from logging in.',
      placeholder: 'Suspension reason...',
      clientId: userId,
      initialValue: currentBanStatus ? "unban" : ""
    });
    setModalInputValue("");
  };

  const handleDeletePlatformUser = (userId: number) => {
    setModalConfig({
      isOpen: true,
      type: 'deletePlatformUser',
      title: 'Delete Platform Account',
      description: 'Are you sure you want to permanently delete this account? All associated thumbnails, records, and ratings will be erased.',
      clientId: userId
    });
  };

  const handleAddCode = () => {
    setModalConfig({
      isOpen: true,
      type: 'addCode',
      title: 'Create Invite Code',
      description: 'Enter the secret code that content creators will use when registering.',
      placeholder: 'e.g. creator2026'
    });
    setModalInputValue("");
  };

  const handleToggleCode = async (id: number) => {
    try {
      const res = await fetch(API_BASE + `/api/dashboard/codes/${id}/toggle`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchDashboardData();
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  const handleDeleteCode = async (id: number) => {
    if (!confirm("Are you sure you want to delete this code?")) return;
    try {
      const res = await fetch(API_BASE + `/api/dashboard/codes/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast({ title: "Code deleted" }); fetchDashboardData(); }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  const submitModal = async () => {
    if (!modalConfig.type) return;
    const val = modalInputValue.trim();

    try {
      if (modalConfig.type === 'addClient') {
        if (!val) return toast({ title: "Please enter a client name", variant: "destructive" });
        const res = await fetch(API_BASE + "/api/dashboard/clients", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: val })
        });
        if (res.ok) { toast({ title: "Client added successfully" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'addWork' && modalConfig.clientId) {
        const pics = parseInt(val);
        if (isNaN(pics) || pics <= 0) return toast({ title: "Invalid value", variant: "destructive" });
        const res = await fetch(API_BASE + `/api/dashboard/clients/${modalConfig.clientId}/work`, {
          method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: pics, amount: 10 })
        });
        if (res.ok) { toast({ title: "Work recorded for client" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'clearBalance' && modalConfig.clientId) {
        const res = await fetch(API_BASE + `/api/dashboard/clients/${modalConfig.clientId}/clear`, {
          method: "PATCH", headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { toast({ title: "Balance reset successfully" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'editOrder' && modalConfig.clientId) {
        const newCount = parseInt(val);
        if (isNaN(newCount) || newCount < 0) return toast({ title: "Invalid value", variant: "destructive" });
        const res = await fetch(API_BASE + `/api/dashboard/clients/${modalConfig.clientId}/set-orders`, {
          method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ordersCompleted: newCount })
        });
        if (res.ok) { toast({ title: "Updated successfully" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'deleteClient' && modalConfig.clientId) {
        const res = await fetch(API_BASE + `/api/dashboard/clients/${modalConfig.clientId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { toast({ title: "Client deleted" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'banUser' && modalConfig.clientId) {
        const isBanned = modalConfig.initialValue !== "unban";
        const res = await fetch(API_BASE + `/api/dashboard/users/${modalConfig.clientId}/ban`, {
          method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ isBanned, banReason: isBanned ? val : null })
        });
        if (res.ok) { toast({ title: isBanned ? "User suspended" : "User unsuspended" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'deletePlatformUser' && modalConfig.clientId) {
        const res = await fetch(API_BASE + `/api/dashboard/users/${modalConfig.clientId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { toast({ title: "User account deleted" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'addCode') {
        if (!val) return toast({ title: "Please enter an invite code", variant: "destructive" });
        const res = await fetch(API_BASE + "/api/dashboard/codes", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ code: val })
        });
        if (res.ok) { toast({ title: "Invite code created" }); fetchDashboardData(); }
        else { toast({ title: "Failed — code may already be in use", variant: "destructive" }); }
      }
    } catch (e) {
      toast({ title: "An error occurred", variant: "destructive" });
    }

    setModalConfig({ ...modalConfig, isOpen: false });
  };

  interface NavItem {
    id: 'home' | 'clients' | 'users' | 'content' | 'codes' | 'creators' | 'public_ratings' | 'revisions' | 'messages';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Classic Clients', icon: Users, badge: clientsData.length },
    { id: 'users', label: 'Platform Accounts', icon: User, badge: usersData.length },
    { id: 'codes', label: 'Invite Codes', icon: ShieldCheck, badge: codesData.filter(c => c.isActive).length },
    { id: 'content', label: 'Content Manager', icon: Database },
    { id: 'creators', label: 'Content Creators', icon: Package, badge: creatorUsers.length },
    { id: 'public_ratings', label: 'Image Ratings', icon: Star, badge: publicRatingsData.length },
    { id: 'revisions', label: 'Revision Requests', icon: GitPullRequest, badge: pendingRevisionsCount, badgeColor: 'bg-amber-500' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount, badgeColor: 'bg-red-500' },
  ];

  const handleNavClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setSidebarOpen(false);

    if (tabId === 'revisions') {
      setRevisionsLoading(true);
      fetch(API_BASE + "/api/dashboard/revisions", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then((d: AdminRevision[]) => setRevisionsData(d))
        .catch(() => {})
        .finally(() => setRevisionsLoading(false));
    } else if (tabId === 'messages') {
      setAdminConvsLoading(true);
      fetch(API_BASE + "/api/dashboard/conversations", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then((d: AdminConversation[]) => setAdminConvs(d))
        .catch(() => {})
        .finally(() => setAdminConvsLoading(false));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="dash admin-dash min-h-screen bg-[#f7f7f5] text-[#111110] flex flex-col md:flex-row font-sans">

      {/* ── MOBILE HEADER BAR ── */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-[#e8e8e5] shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-[#111110] hover:bg-[#f0f0ed] transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#111110]" />
            <span className="font-bold text-sm tracking-tight text-[#111110]">MUHANAD • ADMIN</span>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55554e] hover:text-[#111110] bg-[#f7f7f5] px-2.5 py-1.5 rounded-lg border border-[#e8e8e5]"
        >
          <span>Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER OVERLAY ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-[#e8e8e5] p-5 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#f0f0ed] mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#111110] text-white flex items-center justify-center font-bold text-base">
                      M
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#111110]">Muhanad</h2>
                      <p className="text-[11px] text-[#99998f]">Admin Studio</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 text-[#55554e] hover:text-[#111110] rounded-lg hover:bg-[#f0f0ed]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#111110] text-white shadow-xs'
                            : 'text-[#55554e] hover:bg-[#f5f5f3] hover:text-[#111110]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-[#f0f0ed] text-[#55554e]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#f0f0ed] space-y-2">
                <button
                  onClick={() => { setSidebarOpen(false); navigate("/"); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#55554e] hover:bg-[#f5f5f3]"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    View Website
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#e8e8e5] flex-col justify-between p-5 h-screen sticky top-0 shrink-0 select-none overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="pb-6 border-b border-[#f0f0ed] mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-[#111110] text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
                {sections.brand?.logoImage ? (
                  <img src={sections.brand?.logoImage} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>M</span>
                )}
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#111110] tracking-tight">Muhanad</h1>
                <p className="text-[11px] text-[#99998f]">Admin Management Panel</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0f9f4] text-[#15803d] text-[11px] font-semibold mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
              <span>System Online & Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#111110] text-white shadow-xs'
                      : 'text-[#55554e] hover:bg-[#f7f7f5] hover:text-[#111110]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#f0f0ed] text-[#55554e]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#f0f0ed] space-y-1.5">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#55554e] hover:bg-[#f7f7f5] hover:text-[#111110] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#99998f]" />
              View Website
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#99998f]" />
          </button>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 overflow-x-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-6 border-b border-[#e8e8e5]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111110] tracking-tight mb-1">
              Welcome back, <span className="underline decoration-1 underline-offset-4">Muhanad</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#55554e]">Here is an overview of your projects, clients, and studio performance today.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchDashboardData()}
              className="dash-btn-outline h-9 text-xs"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="dash-btn-primary h-9 text-xs"
            >
              <span>Visit Website</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            TAB: HOME (OVERVIEW)
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Total Revenue", value: `$${stats.totalRevenue}`, sub: "Completed project earnings", badge: "+100%", badgeColor: "dash-badge-green" },
                { title: "Pending Balance", value: `$${stats.totalDues}`, sub: "Outstanding client invoices", badge: "Due", badgeColor: "dash-badge-amber" },
                { title: "Total Clients", value: stats.totalClients, sub: "Registered client roster", badge: "Active", badgeColor: "dash-badge-gray" },
                { title: "Completed Orders", value: stats.completedOrders, sub: "Delivered thumbnail designs", badge: "Delivered", badgeColor: "dash-badge-blue" }
              ].map((s, i) => (
                <div key={i} className="dash-card bg-white p-5 border border-[#e8e8e5] rounded-2xl shadow-2xs hover:border-[#d0d0cc] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[#55554e]">{s.title}</span>
                    <span className={`dash-badge ${s.badgeColor}`}>{s.badge}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold font-mono text-[#111110] tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-[#99998f] mt-1">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Timer & Quick Clients */}
              <div className="lg:col-span-1 space-y-6">
                {/* Time Tracker Card */}
                <div className="dash-card bg-white p-6 border border-[#e8e8e5] rounded-2xl shadow-2xs">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f0ed]">
                    <Clock className="w-4 h-4 text-[#111110]" />
                    <h2 className="text-sm font-bold text-[#111110]">Work Session Tracker</h2>
                  </div>
                  <div className="text-center my-4">
                    <div className="text-4xl font-bold tabular-nums tracking-widest text-[#111110] font-mono mb-4">
                      {formatTime(trackingSeconds)}
                    </div>
                    <input
                      placeholder="What are you working on? (optional)"
                      value={trackingTitle}
                      onChange={e => setTrackingTitle(e.target.value)}
                      className="dash-input text-center text-xs mb-3"
                      disabled={isTracking}
                    />
                    <button
                      onClick={handleStartStopTimer}
                      className={`w-full h-10 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs text-white ${
                        isTracking ? 'bg-[#dc2626] hover:bg-[#b91c1c]' : 'bg-[#111110] hover:bg-[#262624]'
                      }`}
                    >
                      {isTracking ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop & Save Session</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Work Session</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#f0f0ed]">
                    <div className="text-[11px] font-bold text-[#99998f] uppercase tracking-wider mb-2">Recent Sessions</div>
                    {sessionsData.length === 0 ? (
                      <p className="text-center text-xs text-[#99998f] py-3">No recorded sessions</p>
                    ) : (
                      <div className="space-y-1.5">
                        {sessionsData.slice(0, 4).map(sess => (
                          <div key={sess.id} className="flex justify-between items-center text-xs py-1.5 px-2.5 rounded-lg bg-[#f7f7f5] border border-[#e8e8e5]">
                            <span className="text-[#111110] truncate mr-3">{sess.title || "Design Session"}</span>
                            <span className="text-[#55554e] font-mono shrink-0">{formatTime(sess.durationSeconds)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clients Quick List */}
                <div className="dash-card bg-white p-6 border border-[#e8e8e5] rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                    <div>
                      <h2 className="text-sm font-bold text-[#111110]">Recent Clients</h2>
                      <p className="text-[11px] text-[#99998f]">Recently active client accounts</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('clients')}
                      className="text-xs font-semibold text-[#111110] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {clientsData.slice(0, 4).map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f7f7f5] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#f0f0ed] text-[#111110] font-bold text-xs flex items-center justify-center border border-[#e8e8e5]">
                            {c.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-[#111110]">{c.name}</p>
                            <p className="text-[10px] text-[#99998f]">{c.ordersCompleted} completed</p>
                          </div>
                        </div>
                        <span className="dash-badge dash-badge-green text-[10px]">{c.status}</span>
                      </div>
                    ))}
                    {clientsData.length === 0 && (
                      <p className="text-center text-xs text-[#99998f] py-4">No clients registered yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Analytics & Completion */}
              <div className="lg:col-span-2 space-y-6">
                {/* Revenue Overview Card */}
                <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-4 border-b border-[#f0f0ed] mb-6">
                    <div>
                      <h2 className="text-base font-bold text-[#111110]">Studio Performance Overview</h2>
                      <p className="text-xs text-[#55554e]">Track thumbnail delivery cycles and revenue generation</p>
                    </div>
                    <span className="dash-badge dash-badge-gray">2026 OVERVIEW</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-[#f7f7f5] border border-[#e8e8e5]">
                      <span className="text-[11px] text-[#99998f] block mb-1">Collected Revenue</span>
                      <span className="text-xl font-bold font-mono text-[#111110]">${stats.totalRevenue}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f7f7f5] border border-[#e8e8e5]">
                      <span className="text-[11px] text-[#99998f] block mb-1">Pending Balance</span>
                      <span className="text-xl font-bold font-mono text-[#d97706]">${stats.totalDues}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f7f7f5] border border-[#e8e8e5]">
                      <span className="text-[11px] text-[#99998f] block mb-1">Order Fulfillment Rate</span>
                      <span className="text-xl font-bold font-mono text-[#16a34a]">98.4%</span>
                    </div>
                  </div>

                  {/* Order completion card with circular indicator */}
                  <div className="p-6 rounded-2xl border border-[#e8e8e5] bg-[#fafaf9] flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-[#111110] mb-1">Design Deliveries & Fulfillment</h3>
                      <p className="text-xs text-[#55554e] leading-relaxed max-w-sm">
                        Percentage of completed thumbnail designs delivered successfully to creators compared to total order volume.
                      </p>
                    </div>
                    <div className="relative w-28 h-28 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#e8e8e5" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#111110"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray="251.2"
                          strokeDashoffset={stats.totalClients > 0 ? 251.2 - (251.2 * (stats.completedOrders / (stats.totalClients * 10 || 1))) : 251.2}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold font-mono text-[#111110]">{stats.completedOrders}</span>
                        <span className="text-[9px] text-[#99998f] font-semibold">Delivered</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: CLIENTS (CLASSIC CLIENTS)
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'clients' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pb-5 border-b border-[#f0f0ed]">
                <div>
                  <h2 className="text-lg font-bold text-[#111110]">Classic Clients & Invoicing</h2>
                  <p className="text-xs text-[#55554e]">Manage client records, thumbnail counts, and track dues and balances.</p>
                </div>
                <button
                  onClick={handleAddClient}
                  className="dash-btn-primary text-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add New Client
                </button>
              </div>

              {clientsData.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                  <p className="text-xs text-[#99998f]">No clients found in the roster.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientsData.map(client => (
                    <div
                      key={client.id}
                      className="bg-[#fcfcfb] border border-[#e8e8e5] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#d0d0cc] transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#f0f0ed] text-[#111110] font-bold flex items-center justify-center shrink-0 text-sm border border-[#e8e8e5]">
                          {client.name.substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#111110]">{client.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-[#55554e] mt-0.5">
                            <span className="flex items-center gap-1.5">
                              Completed Designs: <strong className="text-[#111110] font-mono">{client.ordersCompleted}</strong>
                              <button
                                onClick={() => handleEditOrderCount(client.id, client.ordersCompleted)}
                                className="text-xs text-[#111110] underline font-semibold ml-1"
                              >
                                Edit
                              </button>
                            </span>
                            <span>•</span>
                            <span>Balance Due: <strong className="font-mono text-[#d97706]">${client.balance}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        <button
                          onClick={() => handleAddWorkAction(client.id)}
                          className="dash-btn-outline h-8 px-3 text-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Record Work
                        </button>
                        <button
                          onClick={() => handleClearBalance(client.id)}
                          disabled={client.balance === 0}
                          className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                            client.balance === 0
                              ? 'bg-[#f0f0ed] text-[#99998f] border-[#e8e8e5] cursor-not-allowed'
                              : 'bg-white text-[#111110] border-[#e8e8e5] hover:bg-[#f7f7f5]'
                          }`}
                        >
                          {client.balance === 0 ? "Zero Balance" : "Clear Balance"}
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: USERS (PLATFORM ACCOUNTS)
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pb-5 border-b border-[#f0f0ed]">
                <div>
                  <h2 className="text-lg font-bold text-[#111110]">Registered Platform Accounts</h2>
                  <p className="text-xs text-[#55554e]">Manage client portal accounts, access status, and direct messaging.</p>
                </div>
                <span className="dash-badge dash-badge-gray text-xs">{usersData.length} accounts</span>
              </div>

              {usersData.length === 0 ? (
                <div className="text-center py-16">
                  <User className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                  <p className="text-xs text-[#99998f]">No registered users found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usersData.map(user => (
                    <div
                      key={user.id}
                      className="bg-[#fcfcfb] border border-[#e8e8e5] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#d0d0cc] transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#f0f0ed] text-[#111110] font-bold text-sm flex items-center justify-center shrink-0 border border-[#e8e8e5]">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm text-[#111110]">{user.fullName}</h3>
                            {user.isBanned && <span className="dash-badge dash-badge-red text-[10px]">Banned</span>}
                            <span className="dash-badge dash-badge-gray text-[10px]">{user.role === 'guest' ? 'Guest' : 'Creator'}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#55554e]">
                            <span className="flex items-center gap-1 font-mono"><AtSign size={11}/> {user.username || "No username"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Mail size={11}/> {user.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[#99998f]">Joined: {new Date(user.createdAt).toLocaleDateString('en-US')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleBanUser(user.id, user.isBanned)}
                          className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                            user.isBanned
                              ? 'bg-white border-[#e8e8e5] text-[#111110] hover:bg-[#f7f7f5]'
                              : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {user.isBanned ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
                          <span>{user.isBanned ? "Unban" : "Ban"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setAdminConvsLoading(true);
                            setActiveTab('messages');
                            setActiveConvId(null);
                            setAdminMsgMobileView('list');
                            fetch(API_BASE + "/api/dashboard/conversations", { headers: { Authorization: `Bearer ${token}` } })
                              .then(r => r.json())
                              .then((d: AdminConversation[]) => {
                                setAdminConvs(d);
                                const userConv = d.find(c => c.userId === user.id);
                                if (userConv) {
                                  setActiveConvId(userConv.id);
                                  setAdminMsgMobileView('thread');
                                  setAdminMsgsLoading(true);
                                  fetch(API_BASE + `/api/dashboard/conversations/${userConv.id}/messages`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  })
                                    .then(r => r.ok ? r.json() : [])
                                    .then((msgs: AdminChatMessage[]) => setAdminMsgs(msgs))
                                    .catch(() => {})
                                    .finally(() => setAdminMsgsLoading(false));
                                }
                              })
                              .catch(() => {})
                              .finally(() => setAdminConvsLoading(false));
                          }}
                          className="dash-btn-outline h-8 px-3 text-xs"
                          title="Message"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Message
                        </button>
                        <button
                          onClick={() => setModalConfig({ isOpen: true, type: 'deletePlatformUser', title: 'Delete Platform Account', description: 'Are you sure you want to permanently delete this account? All associated thumbnails and records will be erased.', clientId: user.id })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: CREATORS
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'creators' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {managingUser ? (
              <UserContentManager user={managingUser} onBack={() => setManagingUser(null)} token={token || ""} />
            ) : (
              <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-[#f0f0ed] gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#111110]">Content Creators Management</h2>
                    <p className="text-xs text-[#55554e]">Manage creator thumbnail pipelines, revisions, and invoices.</p>
                  </div>
                  <span className="dash-badge dash-badge-gray text-xs">{creatorUsers.length} creators</span>
                </div>

                {creatorUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <User className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                    <p className="text-xs text-[#99998f]">No creators registered yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {creatorUsers.map(user => (
                      <div key={user.id} className="bg-[#fcfcfb] p-4 sm:p-5 rounded-xl border border-[#e8e8e5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#d0d0cc] transition-colors shadow-2xs">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#f0f0ed] text-[#111110] flex items-center justify-center font-bold text-sm border border-[#e8e8e5]">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-sm text-[#111110]">{user.fullName}</h3>
                              {user.isBanned && <span className="dash-badge dash-badge-red text-[10px]">Banned</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#55554e]">
                              <span className="font-mono">@{user.username || "user"}</span>
                              <span>•</span>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setManagingUser(user)}
                          className="dash-btn-primary h-9 text-xs"
                        >
                          <span>Manage Creator Data</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: PUBLIC RATINGS
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'public_ratings' && (() => {
          const groupedByVisitor: Record<string, any[]> = {};
          publicRatingsData.forEach(r => {
            const name = r.visitorName || r.visitorId || 'Visitor';
            if (!groupedByVisitor[name]) groupedByVisitor[name] = [];
            groupedByVisitor[name].push(r);
          });
          const visitorNames = Object.keys(groupedByVisitor);

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-[#f0f0ed] gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#111110]">Visitor Portfolio Ratings</h2>
                    <p className="text-xs text-[#55554e]">Review ratings and feedback given by visitors on portfolio works.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="dash-badge dash-badge-gray text-xs">Total: {publicRatingsData.length}</span>
                    <span className="dash-badge dash-badge-gray text-xs">Visitors: {visitorNames.length}</span>
                  </div>
                </div>

                {publicRatingsData.length === 0 ? (
                  <div className="text-center py-16">
                    <Star className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                    <p className="text-xs text-[#99998f]">No ratings recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visitorNames.map(visitorName => {
                      const ratings = groupedByVisitor[visitorName];
                      const isExpanded = expandedVisitors.has(visitorName);
                      const avgRating = (ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length).toFixed(1);

                      return (
                        <div key={visitorName} className="bg-[#fcfcfb] border border-[#e8e8e5] rounded-xl overflow-hidden transition-colors shadow-2xs">
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#f7f7f5] transition-colors"
                            onClick={() => toggleVisitorExpand(visitorName)}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-[#f0f0ed] text-[#111110] flex items-center justify-center font-bold text-sm shrink-0 border border-[#e8e8e5]">
                                {visitorName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-[#111110] flex items-center gap-2">
                                  <span>{visitorName}</span>
                                </h3>
                                <div className="flex items-center gap-2.5 text-xs text-[#55554e] mt-0.5">
                                  <span>Ratings: <strong className="font-mono text-[#111110]">{ratings.length}</strong></span>
                                  <span>•</span>
                                  <span>Average: <strong className="font-mono text-[#d97706]">{avgRating} / 5</strong></span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteVisitorRatings(visitorName); }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                title="Delete all ratings from this visitor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="p-1 text-[#99998f]">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-[#e8e8e5] px-4 py-3 bg-white overflow-x-auto">
                              <table className="w-full text-left text-xs" dir="ltr">
                                <thead>
                                  <tr className="text-[#99998f] border-b border-[#f0f0ed]">
                                    <th className="pb-2 font-semibold">Portfolio Item</th>
                                    <th className="pb-2 font-semibold">Rating</th>
                                    <th className="pb-2 font-semibold">Date</th>
                                    <th className="pb-2 font-semibold text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ratings.map((rating: any) => (
                                    <tr key={rating.id} className="border-b border-[#f0f0ed] last:border-0 hover:bg-[#fcfcfb]">
                                      <td className="py-2.5 font-medium text-[#111110]">Item #{rating.portfolioItemId}</td>
                                      <td className="py-2.5">
                                        <div className="flex items-center gap-1" dir="ltr">
                                          {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                              key={s}
                                              size={12}
                                              className={s <= rating.rating ? 'text-amber-500 fill-amber-500' : 'text-[#d0d0cc] fill-[#d0d0cc]'}
                                            />
                                          ))}
                                          <span className="text-amber-600 font-bold font-mono text-[11px] ml-1">{rating.rating}/5</span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 text-[#99998f]">{new Date(rating.createdAt).toLocaleDateString('en-US')}</td>
                                      <td className="py-2.5 text-center">
                                        <button
                                          onClick={() => deletePublicRating(rating.id)}
                                          className="p-1 text-red-500 hover:text-red-700 transition"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════
            TAB: REVISIONS
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'revisions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-[#f0f0ed] gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111110]">Design Revision Requests</h2>
                  <p className="text-xs text-[#55554e]">Feedback, adjustments, and revision notes from creators on delivered thumbnails.</p>
                </div>
                <button
                  disabled={revisionsLoading}
                  onClick={() => {
                    setRevisionsLoading(true);
                    fetch(API_BASE + "/api/dashboard/revisions", { headers: { Authorization: `Bearer ${token}` } })
                      .then(r => r.json())
                      .then((d: AdminRevision[]) => setRevisionsData(d))
                      .catch(() => {})
                      .finally(() => setRevisionsLoading(false));
                  }}
                  className="dash-btn-outline h-9 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  {revisionsLoading ? 'Loading...' : 'Refresh List'}
                </button>
              </div>

              {revisionsLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="dash-skeleton h-24 rounded-xl" />
                  ))}
                </div>
              ) : revisionsData.length === 0 ? (
                <div className="text-center py-16">
                  <GitPullRequest className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                  <p className="text-xs text-[#99998f]">No revision requests at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {revisionsData.map(rev => (
                    <div key={rev.id} className="bg-[#fcfcfb] border border-[#e8e8e5] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:border-[#d0d0cc] transition-colors shadow-2xs">
                      {/* Thumbnail preview */}
                      <div className="shrink-0">
                        {rev.thumbnailImage ? (
                          <img
                            src={rev.thumbnailImage}
                            alt={rev.thumbnailTitle ?? ''}
                            className="w-28 h-16 object-cover rounded-lg border border-[#e8e8e5]"
                          />
                        ) : (
                          <div className="w-28 h-16 bg-[#f0f0ed] rounded-lg border border-[#e8e8e5] flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#99998f]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-[#111110]">{rev.thumbnailTitle ?? 'Thumbnail'}</span>
                          <span className={`dash-badge ${
                            rev.status === 'completed' ? 'dash-badge-green'
                            : rev.status === 'in_progress' ? 'dash-badge-blue'
                            : rev.status === 'rejected' ? 'dash-badge-red'
                            : 'dash-badge-amber'
                          }`}>
                            {{
                              pending: 'Pending Review',
                              in_progress: 'In Progress',
                              completed: 'Completed',
                              rejected: 'Rejected',
                            }[rev.status] ?? rev.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#55554e] mb-2">
                          <span className="font-semibold text-[#111110]">{rev.userFullName ?? 'User'}</span>
                          {rev.userEmail && <span> · {rev.userEmail}</span>}
                        </p>
                        <p className="text-xs text-[#111110] bg-white border border-[#e8e8e5] rounded-lg px-3 py-2 leading-relaxed">
                          {rev.message}
                        </p>
                        <p className="text-[11px] text-[#99998f] mt-2 font-mono">{new Date(rev.createdAt).toLocaleDateString('en-US')}</p>
                      </div>

                      {/* Status select */}
                      <div className="shrink-0 flex items-center sm:self-center">
                        <select
                          value={rev.status}
                          disabled={revisionUpdating === rev.id}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            setRevisionUpdating(rev.id);
                            try {
                              const res = await fetch(API_BASE + `/api/dashboard/revisions/${rev.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ status: newStatus }),
                              });
                              if (res.ok) {
                                setRevisionsData(prev => prev.map(r => r.id === rev.id ? { ...r, status: newStatus } : r));
                                toast({ title: 'Status updated successfully' });
                              } else {
                                toast({ title: 'Failed to update status', variant: 'destructive' });
                              }
                            } catch {
                              toast({ title: 'An error occurred', variant: 'destructive' });
                            } finally {
                              setRevisionUpdating(null);
                            }
                          }}
                          className="dash-input h-9 text-xs px-3 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Review</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: MESSAGES
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'messages' && (
          <AdminMessagesView
            token={token || ''}
            activeConvId={activeConvId}
            setActiveConvId={setActiveConvId}
            adminConvs={adminConvs}
            setAdminConvs={setAdminConvs}
            adminConvsLoading={adminConvsLoading}
            setAdminConvsLoading={setAdminConvsLoading}
            adminMsgs={adminMsgs}
            setAdminMsgs={setAdminMsgs}
            adminMsgsLoading={adminMsgsLoading}
            setAdminMsgsLoading={setAdminMsgsLoading}
            adminMsgMobileView={adminMsgMobileView}
            setAdminMsgMobileView={setAdminMsgMobileView}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: CODES
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'codes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-[#f0f0ed] gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111110]">Creator Invitation Codes</h2>
                  <p className="text-xs text-[#55554e]">Exclusive invitation codes required to create creator accounts.</p>
                </div>
                <button
                  onClick={handleAddCode}
                  className="dash-btn-primary text-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Generate New Code
                </button>
              </div>

              {codesData.length === 0 ? (
                <div className="text-center py-16">
                  <ShieldCheck className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                  <p className="text-xs text-[#99998f]">No invitation codes generated yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {codesData.map(code => (
                    <div key={code.id} className="bg-[#fcfcfb] border border-[#e8e8e5] rounded-xl p-4 flex flex-col justify-between gap-4 shadow-2xs">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`dash-badge ${code.isActive ? 'dash-badge-green' : 'dash-badge-red'}`}>
                            {code.isActive ? 'Active' : 'Disabled'}
                          </span>
                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h3 className="text-xl font-mono font-bold text-[#111110] mb-1" dir="ltr">{code.code}</h3>
                        <p className="text-[11px] text-[#99998f]">Created: {new Date(code.createdAt).toLocaleDateString('en-US')}</p>
                      </div>

                      <button
                        onClick={() => handleToggleCode(code.id)}
                        className={`w-full h-8 rounded-lg font-semibold text-xs border transition-colors ${
                          code.isActive
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {code.isActive ? "Deactivate Code" : "Activate Code"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: CONTENT MANAGEMENT
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
            <div className="pb-4 border-b border-[#e8e8e5]">
              <h2 className="text-xl font-bold text-[#111110]">Website Content & Configuration</h2>
              <p className="text-xs text-[#55554e]">Manage copy, images, case studies, and portfolio displayed on the live website.</p>
            </div>

            {/* 1. CONTACT INBOX */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-[#111110]" />
                  <h3 className="text-sm font-bold text-[#111110]">Contact Inquiries</h3>
                  {unreadMessagesCount > 0 && (
                    <span className="dash-badge dash-badge-red">{unreadMessagesCount} new</span>
                  )}
                </div>
                <button
                  onClick={fetchMessages}
                  disabled={messagesLoading}
                  className="dash-btn-outline h-8 px-3 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {messagesLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {messages.length === 0 ? (
                <p className="text-xs text-[#99998f] text-center py-6">No incoming inquiries yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {messages.slice(0, 5).map(msg => (
                    <div key={msg.id} className="bg-[#fcfcfb] rounded-xl p-3.5 border border-[#e8e8e5] flex items-start justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#111110]">
                          {msg.name} <span className="font-normal text-[#99998f] ml-1">[{msg.email}]</span>
                        </p>
                        <p className="text-[#55554e] mt-1 truncate">{msg.message}</p>
                      </div>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 transition shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {messages.length > 5 && (
                    <p className="text-[11px] text-[#99998f] text-center pt-2">Additional inquiries stored in database.</p>
                  )}
                </div>
              )}
            </div>

            {/* 2. BRANDING */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Brand Identity & Social
              </h3>
              {editableSection("brand", "name", "Brand Name")}
              {editableSection("brand", "logoLetter", "Logo Letter")}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#111110] mb-1.5">YouTube Channel URL (Public)</label>
                <input
                  value={sections.brand?.youtubeChannelUrl ?? ""}
                  onChange={(e) => setSections((prev) => ({ ...prev, brand: { ...prev.brand, youtubeChannelUrl: e.target.value } }))}
                  className="dash-input text-xs font-mono"
                  dir="ltr"
                  placeholder="https://youtube.com/@channelname"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#111110] mb-2">Profile Photo / Logo</label>
                <div className="flex items-center gap-4">
                  <label className="dash-btn-outline text-xs cursor-pointer relative overflow-hidden">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload Logo Image
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append("image", file);
                      const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                      if (res.ok) {
                        const data = await res.json();
                        setSections((prev) => ({ ...prev, brand: { ...prev.brand, logoImage: data.url } }));
                        toast({ title: "Logo uploaded successfully" });
                      }
                    }} />
                  </label>
                  {sections.brand?.logoImage ? (
                    <img src={sections.brand.logoImage} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-[#e8e8e5]" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#f0f0ed] border border-[#e8e8e5] flex items-center justify-center text-[10px] text-[#99998f]">None</div>
                  )}
                </div>
              </div>
              <button onClick={() => saveSection("brand")} disabled={loading} className="dash-btn-primary text-xs">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Brand Settings
              </button>
            </div>

            {/* 3. IMAGE LIBRARY */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed] flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Media & Image Library
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {images.map((url, index) => (
                  <div key={url} className="relative group cursor-pointer" onClick={() => { navigator.clipboard?.writeText(url); toast({ title: "URL copied to clipboard" }); }}>
                    <img src={url} alt="" className="w-full aspect-video object-cover rounded-xl border border-[#e8e8e5]" />
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); moveImage(index, 'right'); }} className="p-1 bg-black/70 rounded-md text-white hover:bg-black" title="Shift Right">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveImage(index, 'left'); }} className="p-1 bg-black/70 rounded-md text-white hover:bg-black" title="Shift Left">
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteImage(url); }} className="p-1 bg-red-600 rounded-md text-white hover:bg-red-700" title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2.5 cursor-pointer bg-[#fcfcfb] border border-dashed border-[#e8e8e5] rounded-xl px-4 py-6 hover:border-[#111110] transition-colors">
                <Upload className="w-4 h-4 text-[#55554e]" />
                <span className="text-xs font-semibold text-[#111110]">Click to upload an image to media library</span>
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </label>
            </div>

            {/* 4. LOGIN LOGS */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#111110]" />
                  <h3 className="text-sm font-bold text-[#111110]">Admin Login Activity Logs</h3>
                </div>
                <button onClick={fetchLoginLogs} disabled={logsLoading} className="dash-btn-outline h-8 px-3 text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {logsLoading ? "Loading..." : "Refresh"}
                </button>
              </div>
              {loginLogs.length === 0 ? (
                <p className="text-xs text-[#99998f] text-center py-4">No login records found.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {loginLogs.slice(0, 8).map(log => {
                    const isSuccess = log.success === true || log.success === 1;
                    return (
                      <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg border border-[#e8e8e5] bg-[#fcfcfb] text-xs">
                        <div className="flex items-center gap-2.5">
                          {isSuccess ? <ShieldCheck className="w-4 h-4 text-green-600" /> : <ShieldX className="w-4 h-4 text-red-600" />}
                          <div>
                            <span className="font-bold text-[#111110]">{log.username}</span>
                            <span className="text-[10px] text-[#99998f] font-mono ml-2" dir="ltr">{log.ipAddress}</span>
                          </div>
                        </div>
                        <button onClick={() => deleteLoginLog(log.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. HERO SECTION */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed]">Hero Section Content</h3>
              {editableSection("hero", "badge", "Top Badge")}
              {editableSection("hero", "headline", "Main Headline")}
              {editableSection("hero", "subheadline", "Subheadline", true)}
              {editableSection("hero", "ctaPrimary", "Primary CTA Button")}
              {editableSection("hero", "trustText", "Trust / Assurance Text")}
              <button onClick={() => saveSection("hero")} disabled={loading} className="dash-btn-primary text-xs mt-2">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Hero Content
              </button>
            </div>

            {/* 6. PUBLIC PORTFOLIO: CREATORS & THUMBNAILS */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f0f0ed]">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#111110]" />
                    <h3 className="text-sm font-bold text-[#111110]">Public Portfolio (Creators & Work)</h3>
                  </div>
                  <p className="text-xs text-[#55554e] mt-1">
                    Manage creator channels and their showcased thumbnail work. Grouped by creator across the entire website.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchPortfolioCreators}
                    disabled={portfolioLoading}
                    className="dash-btn-outline h-8 px-3 text-xs"
                    title="Refresh creators"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1.5 ${portfolioLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={() => setCreatorModal({
                      isOpen: true,
                      mode: 'create',
                      name: '',
                      avatarUrl: '',
                      subscriberCount: '',
                      youtubeUrl: '',
                      description: '',
                      displayOrder: portfolioCreatorsList.length,
                      isActive: true
                    })}
                    className="dash-btn-primary h-8 px-3.5 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Creator
                  </button>
                </div>
              </div>

              {portfolioLoading && portfolioCreatorsList.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#99998f]">
                  <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-[#111110]" />
                  Loading creators...
                </div>
              ) : portfolioCreatorsList.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#e8e8e5] rounded-xl bg-[#fcfcfb]">
                  <p className="text-xs font-semibold text-[#111110] mb-1">No creators in the portfolio yet</p>
                  <p className="text-[11px] text-[#99998f] mb-4">Add your first YouTube creator to start building the showcased portfolio.</p>
                  <button
                    onClick={() => setCreatorModal({
                      isOpen: true,
                      mode: 'create',
                      name: '',
                      avatarUrl: '',
                      subscriberCount: '',
                      youtubeUrl: '',
                      description: '',
                      displayOrder: 0,
                      isActive: true
                    })}
                    className="dash-btn-primary h-8 px-3.5 text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Creator
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {portfolioCreatorsList.map((creator, cIdx) => (
                    <div key={creator.id} className="border border-[#e8e8e5] rounded-2xl p-5 bg-[#fcfcfb] space-y-4">
                      {/* Creator Header Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0f0ed]">
                        <div className="flex items-center gap-3">
                          {creator.avatarUrl ? (
                            <img
                              src={creator.avatarUrl}
                              alt={creator.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#e8e8e5] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#111110] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {creator.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-[#111110]">{creator.name}</h4>
                              {creator.subscriberCount && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                  {creator.subscriberCount} Subs
                                </span>
                              )}
                              {!creator.isActive && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  Hidden
                                </span>
                              )}
                            </div>
                            {creator.description && (
                              <p className="text-[11px] text-[#55554e] line-clamp-1">{creator.description}</p>
                            )}
                            {creator.youtubeUrl && (
                              <a
                                href={creator.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 hover:underline font-mono truncate max-w-xs block"
                              >
                                {creator.youtubeUrl}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Creator Controls */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            onClick={() => handleMoveCreator(cIdx, 'up')}
                            disabled={cIdx === 0}
                            className="p-1.5 text-[#55554e] hover:text-[#111110] hover:bg-[#ecece8] rounded-lg disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Up"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                          </button>
                          <button
                            onClick={() => handleMoveCreator(cIdx, 'down')}
                            disabled={cIdx === portfolioCreatorsList.length - 1}
                            className="p-1.5 text-[#55554e] hover:text-[#111110] hover:bg-[#ecece8] rounded-lg disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Down"
                          >
                            <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                          </button>
                          <button
                            onClick={async () => {
                              const updated = portfolioCreatorsList.map(c => c.id === creator.id ? { ...c, isActive: !c.isActive } : c);
                              setPortfolioCreatorsList(updated);
                              await syncToSiteContent(updated);
                              try {
                                await fetch(`${API_BASE}/api/portfolio/admin/creators/${creator.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ isActive: !creator.isActive }),
                                });
                              } catch {}
                              toast({ title: creator.isActive ? "Creator hidden from public portfolio" : "Creator visible on public portfolio" });
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${creator.isActive ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'}`}
                            title={creator.isActive ? "Visible on portfolio (click to hide)" : "Hidden from portfolio (click to show)"}
                          >
                            {creator.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setCreatorModal({
                              isOpen: true,
                              mode: 'edit',
                              creatorId: creator.id,
                              name: creator.name,
                              avatarUrl: creator.avatarUrl || '',
                              subscriberCount: creator.subscriberCount || '',
                              youtubeUrl: creator.youtubeUrl || '',
                              description: creator.description || '',
                              displayOrder: creator.displayOrder,
                              isActive: creator.isActive
                            })}
                            className="p-1.5 text-[#55554e] hover:text-[#111110] hover:bg-[#ecece8] rounded-lg"
                            title="Edit Creator"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCreator(creator.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Delete Creator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setThumbnailModal({
                              isOpen: true,
                              mode: 'create',
                              creatorId: creator.id,
                              imageUrl: '',
                              title: '',
                              youtubeUrl: '',
                              views: '',
                              category: 'Gaming',
                              displayOrder: creator.items ? creator.items.length : 0,
                              isActive: true
                            })}
                            className="dash-btn-primary h-7 px-2.5 text-[11px] ml-1 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Thumbnail
                          </button>
                        </div>
                      </div>

                      {/* Thumbnails Grid */}
                      {(!creator.items || creator.items.length === 0) ? (
                        <div className="py-6 text-center border border-dashed border-[#e8e8e5] rounded-xl bg-white">
                          <p className="text-[11px] text-[#99998f]">No thumbnails yet for {creator.name}. Click "Add Thumbnail" to add one.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {creator.items.map((item, iIdx) => (
                            <div
                              key={item.id}
                              className="group relative bg-white border border-[#e8e8e5] rounded-xl overflow-hidden aspect-video shadow-2xs flex items-center justify-center"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title || "Thumbnail"}
                                className="w-full h-full object-cover"
                              />
                              {/* Info Overlay */}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 pointer-events-none">
                                <p className="text-[11px] font-semibold text-white truncate drop-shadow-xs">
                                  {item.title || "Untitled"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {item.category && (
                                    <span className="text-[9px] font-medium text-white/80 uppercase tracking-wider">
                                      {item.category}
                                    </span>
                                  )}
                                  {item.views && (
                                    <span className="text-[9px] font-bold text-amber-300">
                                      • {item.views}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 z-20">
                                <button
                                  onClick={() => handleMoveThumbnail(creator.id, iIdx, 'left')}
                                  disabled={iIdx === 0}
                                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md disabled:opacity-30"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setThumbnailModal({
                                    isOpen: true,
                                    mode: 'edit',
                                    creatorId: creator.id,
                                    itemId: item.id,
                                    imageUrl: item.imageUrl,
                                    title: item.title || '',
                                    youtubeUrl: item.youtubeUrl || '',
                                    views: item.views || '',
                                    category: item.category || 'Gaming',
                                    displayOrder: item.displayOrder,
                                    isActive: item.isActive
                                  })}
                                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md"
                                  title="Edit Thumbnail"
                                >
                                  <FileText className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={async () => {
                                    const updatedList = portfolioCreatorsList.map(c => {
                                      if (c.id !== creator.id) return c;
                                      const items = (c.items || []).map(it => it.id === item.id ? { ...it, isActive: !it.isActive } : it);
                                      return { ...c, items };
                                    });
                                    setPortfolioCreatorsList(updatedList);
                                    await syncToSiteContent(updatedList);
                                    try {
                                      await fetch(`${API_BASE}/api/portfolio/admin/items/${item.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ isActive: !item.isActive }),
                                      });
                                    } catch {}
                                    toast({ title: item.isActive ? "Thumbnail hidden from portfolio" : "Thumbnail visible on portfolio" });
                                  }}
                                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md"
                                  title={item.isActive ? "Visible (click to hide)" : "Hidden (click to show)"}
                                >
                                  {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-amber-300" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteThumbnail(item.id)}
                                  className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-md"
                                  title="Delete Thumbnail"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleMoveThumbnail(creator.id, iIdx, 'right')}
                                  disabled={iIdx === creator.items.length - 1}
                                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md disabled:opacity-30"
                                  title="Move Right"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. HOMEPAGE STATS BAR */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div>
                  <h3 className="text-sm font-bold text-[#111110]">Homepage Stats Bar</h3>
                  <p className="text-xs text-[#55554e]">The 3 key performance metrics shown across the homepage.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[0, 1, 2].map((idx) => {
                  const currentStats = Array.isArray(sections.stats) && sections.stats.length === 3
                    ? sections.stats
                    : [
                        { value: "500+", label: "Thumbnails Delivered" },
                        { value: "50+", label: "YouTube Creators" },
                        { value: "100M+", label: "Combined Views" },
                      ];
                  const item = currentStats[idx] || { value: "", label: "" };
                  return (
                    <div key={idx} className="border border-[#e8e8e5] rounded-xl p-4 bg-[#fcfcfb] space-y-3">
                      <span className="text-xs font-bold text-[#111110] block">Metric #{idx + 1}</span>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#111110] mb-1">Value (e.g. 500+, 100M+)</label>
                        <input
                          value={item.value || ""}
                          onChange={(e) => {
                            const next = [...currentStats];
                            next[idx] = { ...next[idx], value: e.target.value };
                            setSections(prev => ({ ...prev, stats: next }));
                          }}
                          className="dash-input h-8 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#111110] mb-1">Label</label>
                        <input
                          value={item.label || ""}
                          onChange={(e) => {
                            const next = [...currentStats];
                            next[idx] = { ...next[idx], label: e.target.value };
                            setSections(prev => ({ ...prev, stats: next }));
                          }}
                          className="dash-input h-8 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => saveSection("stats")} disabled={loading} className="dash-btn-primary text-xs">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Stats
              </button>
            </div>

            {/* 8. CREATOR TESTIMONIALS */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div>
                  <h3 className="text-sm font-bold text-[#111110]">Creator Testimonials</h3>
                  <p className="text-xs text-[#55554e]">Quotes and results from creators who grew their channels.</p>
                </div>
                <button
                  onClick={() => {
                    setSections(prev => {
                      const current = Array.isArray(prev.testimonials) ? [...prev.testimonials] : [];
                      current.push({
                        id: `test-${Date.now()}`,
                        name: "New Creator",
                        niche: "Gaming / Tech",
                        quote: "Working with Muhanad took our channel CTR to the next level.",
                        metricValue: "+120%",
                        metricLabel: "CTR Growth"
                      });
                      return { ...prev, testimonials: current };
                    });
                  }}
                  className="dash-btn-outline h-8 px-3 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Testimonial
                </button>
              </div>

              {(Array.isArray(sections.testimonials) ? sections.testimonials : []).length === 0 ? (
                <p className="text-xs text-[#99998f] py-4 text-center">No custom testimonials added yet (using defaults). Click "Add Testimonial" to customize.</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {(sections.testimonials as any[]).map((t, idx) => (
                    <div key={t.id || idx} className="border border-[#e8e8e5] rounded-xl p-4 bg-[#fcfcfb] space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0ed]">
                        <span className="text-xs font-bold text-[#111110]">Testimonial #{idx + 1}</span>
                        <button
                          onClick={() => {
                            setSections(prev => {
                              const current = [...(prev.testimonials || [])];
                              current.splice(idx, 1);
                              return { ...prev, testimonials: current };
                            });
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#111110] mb-1">Creator / Channel Name</label>
                          <input
                            value={t.name || ""}
                            onChange={(e) => {
                              const current = [...(sections.testimonials || [])];
                              current[idx] = { ...current[idx], name: e.target.value };
                              setSections(prev => ({ ...prev, testimonials: current }));
                            }}
                            className="dash-input h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#111110] mb-1">Niche / Category</label>
                          <input
                            value={t.niche || ""}
                            onChange={(e) => {
                              const current = [...(sections.testimonials || [])];
                              current[idx] = { ...current[idx], niche: e.target.value };
                              setSections(prev => ({ ...prev, testimonials: current }));
                            }}
                            className="dash-input h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#111110] mb-1">Quote / Review</label>
                        <textarea
                          value={t.quote || ""}
                          onChange={(e) => {
                            const current = [...(sections.testimonials || [])];
                            current[idx] = { ...current[idx], quote: e.target.value };
                            setSections(prev => ({ ...prev, testimonials: current }));
                          }}
                          className="dash-textarea text-xs min-h-16"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#111110] mb-1">Metric Highlight (e.g. +140%, 2.4M)</label>
                          <input
                            value={t.metricValue || ""}
                            onChange={(e) => {
                              const current = [...(sections.testimonials || [])];
                              current[idx] = { ...current[idx], metricValue: e.target.value };
                              setSections(prev => ({ ...prev, testimonials: current }));
                            }}
                            className="dash-input h-8 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#111110] mb-1">Metric Label (e.g. CTR Increase, Total Views)</label>
                          <input
                            value={t.metricLabel || ""}
                            onChange={(e) => {
                              const current = [...(sections.testimonials || [])];
                              current[idx] = { ...current[idx], metricLabel: e.target.value };
                              setSections(prev => ({ ...prev, testimonials: current }));
                            }}
                            className="dash-input h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => saveSection("testimonials")} disabled={loading} className="dash-btn-primary text-xs">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Testimonials
              </button>
            </div>

            {/* 9. ABOUT ME STANDALONE SECTION */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-2 pb-3 border-b border-[#f0f0ed] flex items-center gap-2">
                <User className="w-4 h-4" />
                About Me — Profile & Studio Info
              </h3>
              <p className="text-xs text-[#55554e] mb-4">Profile details, biography, specialties, and optional stats.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {editableSection("aboutMe", "eyebrow", "Eyebrow Tag")}
                {editableSection("aboutMe", "headline1", "Headline Line 1")}
                {editableSection("aboutMe", "headline2", "Headline Line 2")}
              </div>
              {editableSection("aboutMe", "bio1", "Bio Paragraph 1", true)}
              {editableSection("aboutMe", "bio2", "Bio Paragraph 2 (Optional)", true)}
              {editableSection("aboutMe", "specialties", "Specialties (comma separated, e.g. YouTube Thumbnails, Visual Strategy, CTR Optimization)")}

              {/* Profile Image */}
              <div className="my-4 pt-3 border-t border-[#f0f0ed]">
                <label className="block text-xs font-semibold text-[#111110] mb-2">Profile Photo (3:4 ratio)</label>
                <div className="flex items-center gap-4">
                  <label className="dash-btn-outline text-xs cursor-pointer relative overflow-hidden">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload Profile Photo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append("image", file);
                      try {
                        setLoading(true);
                        const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                        if (res.ok) {
                          const data = await res.json();
                          setSections(prev => ({ ...prev, aboutMe: { ...(prev.aboutMe || {}), profileImage: data.url } }));
                          toast({ title: "Profile photo uploaded successfully" });
                        }
                      } catch { toast({ title: "Upload failed", variant: "destructive" }); }
                      finally { setLoading(false); e.target.value = ""; }
                    }} />
                  </label>
                  {sections.aboutMe?.profileImage && (
                    <div className="flex items-center gap-2">
                      <img src={sections.aboutMe.profileImage} alt="Profile" className="w-12 aspect-[3/4] rounded-lg object-cover border border-[#e8e8e5]" />
                      <button
                        onClick={() => setSections(prev => ({ ...prev, aboutMe: { ...(prev.aboutMe || {}), profileImage: "" } }))}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Stats */}
              <div className="my-4 pt-3 border-t border-[#f0f0ed]">
                <label className="block text-xs font-bold text-[#111110] mb-1">Profile Stats (Optional)</label>
                <p className="text-[11px] text-[#55554e] mb-3">Leave empty if you do not wish to display these specific stats on the about section.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="border border-[#e8e8e5] rounded-xl p-3 bg-[#fcfcfb] space-y-2">
                      <span className="text-[11px] font-bold text-[#111110]">Stat Card #{num}</span>
                      <input
                        placeholder="Number (e.g. 500+)"
                        value={sections.aboutMe?.[`stat${num}Number`] || ""}
                        onChange={(e) => setSections(prev => ({ ...prev, aboutMe: { ...(prev.aboutMe || {}), [`stat${num}Number`]: e.target.value } }))}
                        className="dash-input h-7 text-xs font-bold"
                      />
                      <input
                        placeholder="Title (e.g. Thumbnails Designed)"
                        value={sections.aboutMe?.[`stat${num}Title`] || ""}
                        onChange={(e) => setSections(prev => ({ ...prev, aboutMe: { ...(prev.aboutMe || {}), [`stat${num}Title`]: e.target.value } }))}
                        className="dash-input h-7 text-xs"
                      />
                      <input
                        placeholder="Description"
                        value={sections.aboutMe?.[`stat${num}Desc`] || ""}
                        onChange={(e) => setSections(prev => ({ ...prev, aboutMe: { ...(prev.aboutMe || {}), [`stat${num}Desc`]: e.target.value } }))}
                        className="dash-input h-7 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pt-3 border-t border-[#f0f0ed]">
                {editableSection("aboutMe", "ctaLabel", "CTA Button Label")}
                {editableSection("aboutMe", "ctaLink", "CTA Button Link (e.g. #contact)")}
              </div>

              <button onClick={() => saveSection("aboutMe")} disabled={loading} className="dash-btn-primary text-xs">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save About Me Section
              </button>
            </div>

            {/* 10. FINAL CTA BANNER */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed]">Final Call to Action Banner</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {editableSection("finalCta", "eyebrow", "Eyebrow Tag (e.g. Ready to start?)")}
                {editableSection("finalCta", "heading", "Heading Line 1 (e.g. Let's build thumbnails)")}
                {editableSection("finalCta", "subheading", "Heading Line 2 (e.g. that actually work.)")}
                {editableSection("finalCta", "ctaText", "Button Label (e.g. Get in Touch)")}
              </div>
              {editableSection("finalCta", "description", "Description", true)}
              {editableSection("finalCta", "ctaLink", "Button Link (e.g. #contact)")}
              <button onClick={() => saveSection("finalCta")} disabled={loading} className="dash-btn-primary text-xs mt-2">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Final CTA
              </button>
            </div>

            {/* 11. CONTACT DETAILS */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed]">Contact Section & Social Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {editableSection("contact", "eyebrow", "Eyebrow Tag (e.g. Contact)")}
                {editableSection("contact", "heading", "Heading (e.g. Start a Project)")}
              </div>
              {editableSection("contact", "description", "Intro Description", true)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {editableSection("contact", "instagramHandle", "Instagram Handle (e.g. @hanody1x)")}
                {editableSection("contact", "instagramUrl", "Instagram URL (e.g. https://www.instagram.com/hanody1x)")}
              </div>
              <button onClick={() => saveSection("contact")} disabled={loading} className="dash-btn-primary text-xs mt-2">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Contact Details
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── CREATOR MODAL ── */}
      {creatorModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8e8e5] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4" dir="ltr">
            <div className="flex items-center justify-between border-b border-[#f0f0ed] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#111110]">
                  {creatorModal.mode === 'create' ? 'Add Creator Channel' : 'Edit Creator Channel'}
                </h3>
                <p className="text-xs text-[#55554e]">Creator profile details for public portfolio grouping</p>
              </div>
              <button
                onClick={() => setCreatorModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-[#55554e] hover:text-[#111110] rounded-lg hover:bg-[#f0f0ed]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Creator / Channel Name *</label>
                <input
                  value={creatorModal.name}
                  onChange={e => setCreatorModal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. AboFlah or MrBeast"
                  className="dash-input h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Subscriber Count (Real / Stored Value)</label>
                <input
                  value={creatorModal.subscriberCount}
                  onChange={e => setCreatorModal(prev => ({ ...prev, subscriberCount: e.target.value }))}
                  placeholder="e.g. 2.4M or 850K"
                  className="dash-input h-9 text-xs"
                />
              </div>

              {/* Creator Avatar */}
              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Creator Avatar (Square)</label>
                <div className="flex items-center gap-3">
                  {creatorModal.avatarUrl ? (
                    <img
                      src={creatorModal.avatarUrl}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border border-[#e8e8e5] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#f0f0ed] border border-[#e8e8e5] flex items-center justify-center text-xs font-bold text-[#55554e] shrink-0">
                      {creatorModal.name ? creatorModal.name.slice(0, 2).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <label className="dash-btn-outline h-8 px-3 text-xs cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("image", file);
                          try {
                            setLoading(true);
                            const res = await fetch(API_BASE + "/api/upload", {
                              method: "POST",
                              headers: { Authorization: `Bearer ${token}` },
                              body: fd,
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setCreatorModal(prev => ({ ...prev, avatarUrl: data.url }));
                              toast({ title: "Avatar uploaded" });
                            }
                          } catch {
                            toast({ title: "Avatar upload failed", variant: "destructive" });
                          } finally {
                            setLoading(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                    {creatorModal.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setCreatorModal(prev => ({ ...prev, avatarUrl: '' }))}
                        className="dash-btn-outline h-8 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 inline-flex items-center gap-1 ml-2"
                        title="Remove avatar"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Avatar</span>
                      </button>
                    )}
                    <input
                      value={creatorModal.avatarUrl}
                      onChange={e => setCreatorModal(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="Or paste image URL"
                      className="dash-input h-7 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">YouTube Channel URL</label>
                <input
                  value={creatorModal.youtubeUrl}
                  onChange={e => setCreatorModal(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/@channel"
                  className="dash-input h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Description / Tagline</label>
                <input
                  value={creatorModal.description}
                  onChange={e => setCreatorModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Gaming & challenge creator with over 100M views"
                  className="dash-input h-9 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={creatorModal.isActive}
                  onChange={e => setCreatorModal(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-[#e8e8e5] text-[#111110] focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-[#111110] font-medium">Visible on public portfolio</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f0ed]">
              <button
                onClick={() => setCreatorModal(prev => ({ ...prev, isOpen: false }))}
                className="dash-btn-outline h-9 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCreator}
                disabled={loading}
                className="dash-btn-primary h-9 px-5 text-xs"
              >
                {creatorModal.mode === 'create' ? 'Create Creator' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── THUMBNAIL MODAL ── */}
      {thumbnailModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8e8e5] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4" dir="ltr">
            <div className="flex items-center justify-between border-b border-[#f0f0ed] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#111110]">
                  {thumbnailModal.mode === 'create' ? 'Add Portfolio Thumbnail' : 'Edit Portfolio Thumbnail'}
                </h3>
                <p className="text-xs text-[#55554e]">High-resolution thumbnail for this creator</p>
              </div>
              <button
                onClick={() => setThumbnailModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-[#55554e] hover:text-[#111110] rounded-lg hover:bg-[#f0f0ed]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Thumbnail Image */}
              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Thumbnail Image *</label>
                {thumbnailModal.imageUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#e8e8e5] bg-[#f7f7f5] mb-2">
                    <img src={thumbnailModal.imageUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="dash-btn-outline h-8 px-3 text-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("image", file);
                        try {
                          setLoading(true);
                          const res = await fetch(API_BASE + "/api/upload", {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` },
                            body: fd,
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setThumbnailModal(prev => ({ ...prev, imageUrl: data.url }));
                            toast({ title: "Thumbnail image uploaded" });
                          }
                        } catch {
                          toast({ title: "Upload failed", variant: "destructive" });
                        } finally {
                          setLoading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  <input
                    value={thumbnailModal.imageUrl}
                    onChange={e => setThumbnailModal(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="dash-input h-8 text-xs flex-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Video Title</label>
                <input
                  value={thumbnailModal.title}
                  onChange={e => setThumbnailModal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. $1 vs $1,000,000 Hotel Room!"
                  className="dash-input h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Views (e.g. 12.4M views)</label>
                  <input
                    value={thumbnailModal.views}
                    onChange={e => setThumbnailModal(prev => ({ ...prev, views: e.target.value }))}
                    placeholder="e.g. 4.2M views"
                    className="dash-input h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Category</label>
                  <select
                    value={thumbnailModal.category}
                    onChange={e => setThumbnailModal(prev => ({ ...prev, category: e.target.value }))}
                    className="dash-input h-9 text-xs"
                  >
                    <option value="Gaming">Gaming</option>
                    <option value="Finance">Finance</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Vlogs">Vlogs</option>
                    <option value="Reaction">Reaction</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">YouTube Video URL</label>
                <input
                  value={thumbnailModal.youtubeUrl}
                  onChange={e => setThumbnailModal(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="dash-input h-9 text-xs font-mono"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={thumbnailModal.isActive}
                  onChange={e => setThumbnailModal(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-[#e8e8e5] text-[#111110] focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-[#111110] font-medium">Visible in creator showcase</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f0ed]">
              <button
                onClick={() => setThumbnailModal(prev => ({ ...prev, isOpen: false }))}
                className="dash-btn-outline h-9 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveThumbnail}
                disabled={loading}
                className="dash-btn-primary h-9 px-5 text-xs"
              >
                {thumbnailModal.mode === 'create' ? 'Add Thumbnail' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL CONFIRMATION & ACTION MODAL ── */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#e8e8e5] p-7 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-[#111110] mb-1">{modalConfig.title}</h2>
            <p className="text-xs text-[#55554e] leading-relaxed mb-5">{modalConfig.description}</p>

            {(['addClient', 'addWork', 'editOrder', 'addCode'].includes(modalConfig.type || '') || (modalConfig.type === 'banUser' && modalConfig.initialValue !== "unban")) && (
              <input
                type={modalConfig.type === 'addClient' || modalConfig.type === 'banUser' || modalConfig.type === 'addCode' ? 'text' : 'number'}
                autoFocus
                placeholder={modalConfig.placeholder}
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitModal()}
                className="dash-input h-11 text-xs mb-5"
              />
            )}

            <div className="flex gap-2.5 justify-end mt-2">
              <button
                onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                className="dash-btn-outline h-10 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={submitModal}
                className={`h-10 px-5 rounded-xl font-semibold text-xs text-white transition-all ${
                  ['deleteClient', 'deletePlatformUser', 'clearBalance'].includes(modalConfig.type || '')
                    ? 'bg-[#dc2626] hover:bg-[#b91c1c]'
                    : 'bg-[#111110] hover:bg-[#262624]'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

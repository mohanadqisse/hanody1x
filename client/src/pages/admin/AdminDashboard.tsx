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
  MessageSquare, GitPullRequest, Send, Menu, X, ExternalLink, Sparkles, Plus
} from "lucide-react";
import { caseStudies as defaultCaseStudies } from "@/lib/data";
import UserContentManager from "./UserContentManager";
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
  basic: "الباقة الأساسية",
  pro: "الباقة الاحترافية",
  elite: "باقة النخبة",
  custom: "احتياج مخصص",
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
  interface AdminConversation {
    id: number;
    userId: number;
    subject: string;
    createdAt: string;
    updatedAt: string;
    userFullName: string | null;
    userEmail: string | null;
  }
  interface AdminChatMessage {
    id: number;
    conversationId: number;
    senderType: string;
    body: string;
    isRead: boolean;
    createdAt: string;
  }
  const [adminConvs, setAdminConvs] = useState<AdminConversation[]>([]);
  const [adminConvsLoading, setAdminConvsLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [adminMsgs, setAdminMsgs] = useState<AdminChatMessage[]>([]);
  const [adminMsgsLoading, setAdminMsgsLoading] = useState(false);
  const [adminReplyBody, setAdminReplyBody] = useState("");
  const [adminReplySending, setAdminReplySending] = useState(false);
  const [adminMsgMobileView, setAdminMsgMobileView] = useState<'list' | 'thread'>('list');

  // Timer State
  const [isTracking, setIsTracking] = useState(false);
  const [trackingSeconds, setTrackingSeconds] = useState(0);
  const [trackingTitle, setTrackingTitle] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Portfolio Metadata Editor State
  const [editingMetaIndex, setEditingMetaIndex] = useState<number | null>(null);
  const [metaForm, setMetaForm] = useState<{
    imageUrl: string;
    creatorName: string;
    videoTitle: string;
    youtubeUrl: string;
    views: string;
    category: string;
  }>({
    imageUrl: "",
    creatorName: "",
    videoTitle: "",
    youtubeUrl: "",
    views: "",
    category: "Gaming",
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
          toast({ title: "تم حفظ الجلسة بنجاح" });
        }
      } catch (err) {
        toast({ title: "فشل في حفظ الجلسة", variant: "destructive" });
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
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    try {
      const res = await fetch(API_BASE + `/api/public-ratings/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast({ title: "تم حذف التقييم" }); fetchPublicRatings(); }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  }

  async function deleteVisitorRatings(vName: string) {
    if (!confirm(`هل أنت متأكد من حذف جميع تقييمات "${vName}"؟`)) return;
    try {
      const res = await fetch(API_BASE + `/api/public-ratings/visitor/${encodeURIComponent(vName)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast({ title: "تم حذف جميع التقييمات" }); fetchPublicRatings(); }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
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
        toast({ title: "تم حذف السجل" });
      } else toast({ title: "خطأ في الحذف", variant: "destructive" });
    } catch (err) { toast({ title: "خطأ", variant: "destructive" }); }
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
        toast({ title: "تم حذف الرسالة" });
      }
    } catch (err) { toast({ title: "خطأ في الحذف", variant: "destructive" }); }
  }

  async function saveSection(section: string) {
    setLoading(true);
    try {
      const contentToSave = section === "caseStudies"
        ? (Array.isArray(sections.caseStudies) && sections.caseStudies.length > 0 ? sections.caseStudies : defaultCaseStudies)
        : (sections[section] || {});

      const res = await fetch(API_BASE + `/api/content/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: JSON.stringify(contentToSave) }),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      toast({ title: "تم الحفظ بنجاح" });
    } catch (err) {
      toast({ title: "خطأ", description: "فشل الحفظ", variant: "destructive" });
    } finally { setLoading(false); }
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append("image", file);
    try {
      const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) { await fetchImages(); toast({ title: "تم رفع الصورة" }); }
    } catch { toast({ title: "خطأ", variant: "destructive" }); }
  }

  async function replaceImage(e: React.ChangeEvent<HTMLInputElement>, oldUrl: string) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const filename = oldUrl.split("/").pop();
      const publicId = filename?.split(".")[0];
      const fd = new FormData(); if (publicId) fd.append("publicId", publicId); fd.append("image", file);
      const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) { await fetchImages(); toast({ title: "تم الاستبدال" }); }
    } catch { toast({ title: "خطأ", variant: "destructive" }); }
  }

  async function deleteImage(url: string) {
    try {
      const filename = url.split("/").pop();
      const res = await fetch(API_BASE + `/api/upload/${filename}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { await fetchImages(); toast({ title: "تم الحذف" }); }
    } catch (err) { toast({ title: "خطأ", variant: "destructive" }); }
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
      if (res.ok) toast({ title: "تم تحديث الترتيب" });
    } catch (err) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  }

  const getPortfolioImages = () => {
    const urlsStr = (sections.portfolio as any)?.images || "";
    const urls = urlsStr.split(",").map((s: string) => s.trim());
    const slots = Array(20).fill("");
    for (let i = 0; i < 20; i++) {
      if (urls[i]) slots[i] = urls[i];
    }
    return slots;
  };

  const updatePortfolioImages = async (newSlots: string[]) => {
    const newString = newSlots.join(",");
    setSections(prev => ({
      ...prev,
      portfolio: { ...(prev.portfolio as any), images: newString }
    }));
    try {
      await fetch(API_BASE + "/api/content/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: JSON.stringify({ ...(sections.portfolio as any), images: newString }) })
      });
    } catch {}
  };

  const movePortfolioImage = (index: number, direction: 'left' | 'right') => {
    const slots = getPortfolioImages();
    if (direction === 'left' && index < 19) {
      [slots[index], slots[index + 1]] = [slots[index + 1], slots[index]];
    } else if (direction === 'right' && index > 0) {
      [slots[index], slots[index - 1]] = [slots[index - 1], slots[index]];
    } else return;
    updatePortfolioImages(slots);
  };

  const deletePortfolioImage = (index: number) => {
    const slots = getPortfolioImages();
    slots[index] = "";
    updatePortfolioImages(slots);
  };

  const openEditMeta = (index: number) => {
    const slots = getPortfolioImages();
    const url = slots[index] || "";
    const items: any[] = Array.isArray((sections.portfolio as any)?.items) ? (sections.portfolio as any).items : [];
    const existing = items[index] || items.find((it: any) => it && it.imageUrl === url) || {};
    setMetaForm({
      imageUrl: url,
      creatorName: existing.creatorName || "",
      videoTitle: existing.videoTitle || "",
      youtubeUrl: existing.youtubeUrl || "",
      views: existing.views || "",
      category: existing.category || "Gaming",
    });
    setEditingMetaIndex(index);
  };

  const savePortfolioMetadata = async () => {
    if (editingMetaIndex === null) return;
    const slots = getPortfolioImages();
    const currentItems: any[] = Array.isArray((sections.portfolio as any)?.items)
      ? [...(sections.portfolio as any).items]
      : [];

    while (currentItems.length < 20) {
      currentItems.push({ imageUrl: slots[currentItems.length] || "" });
    }

    currentItems[editingMetaIndex] = {
      ...currentItems[editingMetaIndex],
      imageUrl: slots[editingMetaIndex],
      creatorName: metaForm.creatorName.trim() || undefined,
      videoTitle: metaForm.videoTitle.trim() || undefined,
      youtubeUrl: metaForm.youtubeUrl.trim() || undefined,
      views: metaForm.views.trim() || undefined,
      category: metaForm.category.trim() || undefined,
    };

    const newPortfolio = {
      ...(sections.portfolio as any),
      images: slots.join(","),
      items: currentItems,
    };

    setSections(prev => ({
      ...prev,
      portfolio: newPortfolio,
    }));

    try {
      const res = await fetch(API_BASE + "/api/content/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: JSON.stringify(newPortfolio) })
      });
      if (res.ok) {
        toast({ title: "تم حفظ بيانات العمل بنجاح" });
        setEditingMetaIndex(null);
      } else {
        toast({ title: "خطأ في الحفظ", variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
    }
  };

  const uploadPortfolioImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number, isReplace = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const slots = getPortfolioImages();
    const oldUrl = slots[index];
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("image", file);
      if (isReplace && oldUrl) {
         const filename = oldUrl.split("/").pop();
         const publicId = filename?.split(".")[0];
         if (publicId) fd.append("publicId", publicId);
      }
      const res = await fetch(API_BASE + "/api/upload", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      if (res.ok) {
        const data = await res.json();
        slots[index] = data.url;
        await updatePortfolioImages(slots);
        toast({ title: isReplace ? "تم الاستبدال بنجاح" : "تم الرفع بنجاح" });
      }
    } catch {
      toast({ title: "خطأ في الرفع", variant: "destructive" });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const updateCaseStudy = (index: number, field: string, value: string) => {
    setSections(prev => {
      const current = Array.isArray(prev.caseStudies) && prev.caseStudies.length > 0 ? [...prev.caseStudies] : [...defaultCaseStudies];
      current[index] = { ...current[index], [field]: value };
      return { ...prev, caseStudies: current };
    });
  };

  const updateCaseStudyMetric = (studyIndex: number, metricIndex: number, field: 'label' | 'value', val: string) => {
    setSections(prev => {
      const current = Array.isArray(prev.caseStudies) && prev.caseStudies.length > 0 ? [...prev.caseStudies] : [...defaultCaseStudies];
      const study = { ...current[studyIndex] };
      const metrics = [...(study.metrics || defaultCaseStudies[studyIndex]?.metrics || [])];
      metrics[metricIndex] = { ...metrics[metricIndex], [field]: val };
      study.metrics = metrics;
      current[studyIndex] = study;
      return { ...prev, caseStudies: current };
    });
  };

  const editableSection = (section: string, field: string, label: string, multiline = false) => (
    <div key={field} className="mb-4">
      <label className="block text-xs font-semibold text-[#111110] mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={sections[section]?.[field] ?? ""}
          onChange={(e) => setSections((prev) => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }))}
          className="dash-textarea min-h-24 text-right"
          dir="rtl"
        />
      ) : (
        <input
          value={sections[section]?.[field] ?? ""}
          onChange={(e) => setSections((prev) => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }))}
          className="dash-input text-right"
          dir="rtl"
        />
      )}
    </div>
  );

  // Dash specific Actions
  const handleAddClient = () => {
    setModalConfig({
      isOpen: true,
      type: 'addClient',
      title: 'إضافة عميل جديد',
      description: 'أدخل اسم العميل الجديد لإنشاء سجل له.',
      placeholder: 'اسم العميل'
    });
    setModalInputValue("");
  };

  const handleAddWorkAction = (clientId: number) => {
    setModalConfig({
      isOpen: true,
      type: 'addWork',
      title: 'تسجيل عمل / صور',
      description: 'أدخل عدد الصور المنجزة (الافتراضي: 1 = $10).',
      placeholder: 'مثال: 1',
      clientId
    });
    setModalInputValue("1");
  };

  const handleClearBalance = (clientId: number) => {
    setModalConfig({
      isOpen: true,
      type: 'clearBalance',
      title: 'تصفير الحساب',
      description: 'هل أنت متأكد من تصفير حساب هذا العميل؟',
      clientId
    });
  };

  const handleEditOrderCount = (clientId: number, currentOrders: number) => {
    setModalConfig({
      isOpen: true,
      type: 'editOrder',
      title: 'تعديل الصور المنجزة',
      description: 'أدخل العدد الصحيح للصور المنجزة للعميل.',
      placeholder: 'مثال: 10',
      initialValue: currentOrders.toString(),
      clientId
    });
    setModalInputValue(currentOrders.toString());
  };

  const handleDeleteClient = (clientId: number) => {
    setModalConfig({
      isOpen: true,
      type: 'deleteClient',
      title: 'حذف العميل',
      description: 'هل أنت متأكد من حذف هذا العميل تماماً؟ سيتم مسح كافة سجلاته بشكل نهائي ولا يمكن التراجع عن ذلك.',
      clientId
    });
  };

  const handleBanUser = (userId: number, currentBanStatus: boolean) => {
    setModalConfig({
      isOpen: true,
      type: 'banUser',
      title: currentBanStatus ? 'إلغاء الحظر' : 'حظر مستخدم',
      description: currentBanStatus ? 'هل أنت متأكد من إلغاء الحظر عن هذا المستخدم؟' : 'أدخل سبب الحظر (اختياري). سيمنع هذا المستخدم من تسجيل الدخول.',
      placeholder: 'سبب الحظر...',
      clientId: userId,
      initialValue: currentBanStatus ? "unban" : ""
    });
    setModalInputValue("");
  };

  const handleDeletePlatformUser = (userId: number) => {
    setModalConfig({
      isOpen: true,
      type: 'deletePlatformUser',
      title: 'حذف حساب المنصة',
      description: 'هل أنت متأكد من حذف هذا الحساب نهائياً؟ سيتم مسح كافة صوره، سجلاته وتقييماته المرتبطة.',
      clientId: userId
    });
  };

  const handleAddCode = () => {
    setModalConfig({
      isOpen: true,
      type: 'addCode',
      title: 'إضافة كود جديد',
      description: 'أدخل الكود الذي سيستخدمه صناع المحتوى عند إنشاء حساب جديد.',
      placeholder: 'مثال: hanody2024'
    });
    setModalInputValue("");
  };

  const handleToggleCode = async (id: number) => {
    try {
      const res = await fetch(API_BASE + `/api/dashboard/codes/${id}/toggle`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchDashboardData();
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const handleDeleteCode = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكود؟")) return;
    try {
      const res = await fetch(API_BASE + `/api/dashboard/codes/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast({ title: "تم الحذف" }); fetchDashboardData(); }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const submitModal = async () => {
    if (!modalConfig.type) return;
    const val = modalInputValue.trim();

    try {
      if (modalConfig.type === 'addClient') {
        if (!val) return toast({ title: "يرجى إدخال اسم العميل", variant: "destructive" });
        const res = await fetch(API_BASE + "/api/dashboard/clients", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: val })
        });
        if (res.ok) { toast({ title: "تم إضافة العميل" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'addWork' && modalConfig.clientId) {
        const pics = parseInt(val);
        if (isNaN(pics) || pics <= 0) return toast({ title: "قيمة غير صالحة", variant: "destructive" });
        const res = await fetch(API_BASE + `/api/dashboard/clients/${modalConfig.clientId}/work`, {
          method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: pics, amount: 10 })
        });
        if (res.ok) { toast({ title: "تم إضافة السجل للعميل" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'clearBalance' && modalConfig.clientId) {
        const res = await fetch(API_BASE + `/api/dashboard/clients/${modalConfig.clientId}/clear`, {
          method: "PATCH", headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { toast({ title: "تم تصفير الحساب بنجاح" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'editOrder' && modalConfig.clientId) {
        const newCount = parseInt(val);
        if (isNaN(newCount) || newCount < 0) return toast({ title: "قيمة غير صالحة", variant: "destructive" });
        const res = await fetch(API_BASE + `/api/dashboard/clients/${modalConfig.clientId}/set-orders`, {
          method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ordersCompleted: newCount })
        });
        if (res.ok) { toast({ title: "تم التعديل بنجاح" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'deleteClient' && modalConfig.clientId) {
        const res = await fetch(API_BASE + `/api/dashboard/clients/${modalConfig.clientId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { toast({ title: "تم حذف العميل" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'banUser' && modalConfig.clientId) {
        const isBanned = modalConfig.initialValue !== "unban";
        const res = await fetch(API_BASE + `/api/dashboard/users/${modalConfig.clientId}/ban`, {
          method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ isBanned, banReason: isBanned ? val : null })
        });
        if (res.ok) { toast({ title: isBanned ? "تم حظر المستخدم" : "تم إلغاء الحظر" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'deletePlatformUser' && modalConfig.clientId) {
        const res = await fetch(API_BASE + `/api/dashboard/users/${modalConfig.clientId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { toast({ title: "تم حذف المستخدم" }); fetchDashboardData(); }
      }
      else if (modalConfig.type === 'addCode') {
        if (!val) return toast({ title: "يرجى إدخال الكود", variant: "destructive" });
        const res = await fetch(API_BASE + "/api/dashboard/codes", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ code: val })
        });
        if (res.ok) { toast({ title: "تم إضافة الكود" }); fetchDashboardData(); }
        else { toast({ title: "فشل، ربما الكود مستخدم", variant: "destructive" }); }
      }
    } catch (e) {
      toast({ title: "حدث خطأ", variant: "destructive" });
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
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'clients', label: 'العملاء الكلاسيكيين', icon: Users, badge: clientsData.length },
    { id: 'users', label: 'حسابات المنصة', icon: User, badge: usersData.length },
    { id: 'codes', label: 'أكواد الدعوة', icon: ShieldCheck, badge: codesData.filter(c => c.isActive).length },
    { id: 'content', label: 'إدارة المحتوى', icon: Database },
    { id: 'creators', label: 'صناع المحتوى', icon: Package, badge: creatorUsers.length },
    { id: 'public_ratings', label: 'تقييمات الصور', icon: Star, badge: publicRatingsData.length },
    { id: 'revisions', label: 'طلبات التعديلات', icon: GitPullRequest, badge: pendingRevisionsCount, badgeColor: 'bg-amber-500' },
    { id: 'messages', label: 'الرسائل', icon: MessageSquare, badge: unreadMessagesCount, badgeColor: 'bg-red-500' },
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
    <div className="dash admin-dash min-h-screen bg-[#f7f7f5] text-[#111110] flex flex-col md:flex-row font-sans" dir="rtl">

      {/* ── MOBILE HEADER BAR ── */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-[#e8e8e5] shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-[#111110] hover:bg-[#f0f0ed] transition-colors"
            aria-label="القائمة"
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
          <span>الموقع</span>
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
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white border-l border-[#e8e8e5] p-5 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#f0f0ed] mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#111110] text-white flex items-center justify-center font-bold text-base">
                      M
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#111110]">مهند</h2>
                      <p className="text-[11px] text-[#99998f]">لوحة التحكم</p>
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
                    عرض الموقع
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-64 bg-white border-l border-[#e8e8e5] flex-col justify-between p-5 h-screen sticky top-0 shrink-0 select-none overflow-y-auto">
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
                <h1 className="text-sm font-bold text-[#111110] tracking-tight">مهند</h1>
                <p className="text-[11px] text-[#99998f]">لوحة الإدارة والتحكم</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0f9f4] text-[#15803d] text-[11px] font-semibold mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
              <span>النظام متصل ونشط</span>
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
              عرض الموقع
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#99998f]" />
          </button>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 overflow-x-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-6 border-b border-[#e8e8e5]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111110] tracking-tight mb-1">
              مرحباً بعودتك، <span className="underline decoration-1 underline-offset-4">مهند</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#55554e]">إليك نظرة عامة على أعمالك، عملائك وإحصائيات الاستوديو اليوم.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchDashboardData()}
              className="dash-btn-outline h-9 text-xs"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="dash-btn-primary h-9 text-xs"
            >
              <span>زيارة الموقع</span>
              <ArrowLeft className="w-3.5 h-3.5" />
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
                { title: "إجمالي الإيرادات", value: `$${stats.totalRevenue}`, sub: "عائدات العمل المكتمل", badge: "+100%", badgeColor: "dash-badge-green" },
                { title: "الديون المستحقة", value: `$${stats.totalDues}`, sub: "مبالغ قيد التحصيل", badge: "مستحق", badgeColor: "dash-badge-amber" },
                { title: "إجمالي العملاء", value: stats.totalClients, sub: "عملاء مسجلين في السجل", badge: "نشط", badgeColor: "dash-badge-gray" },
                { title: "الطلبات المكتملة", value: stats.completedOrders, sub: "صور مصغرة منجزة", badge: "منجز", badgeColor: "dash-badge-blue" }
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
                    <h2 className="text-sm font-bold text-[#111110]">تتبع وقت العمل</h2>
                  </div>
                  <div className="text-center my-4">
                    <div className="text-4xl font-bold tabular-nums tracking-widest text-[#111110] font-mono mb-4">
                      {formatTime(trackingSeconds)}
                    </div>
                    <input
                      placeholder="ما الذي تعمل عليه الآن؟ (اختياري)"
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
                          <span>إيقاف وحفظ الجلسة</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>ابدأ جلسة العمل</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#f0f0ed]">
                    <div className="text-[11px] font-bold text-[#99998f] uppercase tracking-wider mb-2">سجل الجلسات الأخيرة</div>
                    {sessionsData.length === 0 ? (
                      <p className="text-center text-xs text-[#99998f] py-3">لا توجد جلسات مسجلة</p>
                    ) : (
                      <div className="space-y-1.5">
                        {sessionsData.slice(0, 4).map(sess => (
                          <div key={sess.id} className="flex justify-between items-center text-xs py-1.5 px-2.5 rounded-lg bg-[#f7f7f5] border border-[#e8e8e5]">
                            <span className="text-[#111110] truncate ml-3">{sess.title || "جلسة تصميم"}</span>
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
                      <h2 className="text-sm font-bold text-[#111110]">أحدث العملاء</h2>
                      <p className="text-[11px] text-[#99998f]">العملاء المسجلين حديثاً</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('clients')}
                      className="text-xs font-semibold text-[#111110] hover:underline"
                    >
                      عرض الكل
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
                            <p className="text-[10px] text-[#99998f]">{c.ordersCompleted} صورة منجزة</p>
                          </div>
                        </div>
                        <span className="dash-badge dash-badge-green text-[10px]">{c.status}</span>
                      </div>
                    ))}
                    {clientsData.length === 0 && (
                      <p className="text-center text-xs text-[#99998f] py-4">لا يوجد عملاء حالياً</p>
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
                      <h2 className="text-base font-bold text-[#111110]">ملخص أداء الاستوديو</h2>
                      <p className="text-xs text-[#55554e]">متابعة دورة تسليم الصور والمردود المالي</p>
                    </div>
                    <span className="dash-badge dash-badge-gray">2026 OVERVIEW</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-[#f7f7f5] border border-[#e8e8e5]">
                      <span className="text-[11px] text-[#99998f] block mb-1">الرصيد المحصل</span>
                      <span className="text-xl font-bold font-mono text-[#111110]">${stats.totalRevenue}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f7f7f5] border border-[#e8e8e5]">
                      <span className="text-[11px] text-[#99998f] block mb-1">المستحقات المعلقة</span>
                      <span className="text-xl font-bold font-mono text-[#d97706]">${stats.totalDues}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f7f7f5] border border-[#e8e8e5]">
                      <span className="text-[11px] text-[#99998f] block mb-1">متوسط إنجاز الطلبات</span>
                      <span className="text-xl font-bold font-mono text-[#16a34a]">98.4%</span>
                    </div>
                  </div>

                  {/* Order completion card with circular indicator */}
                  <div className="p-6 rounded-2xl border border-[#e8e8e5] bg-[#fafaf9] flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-right">
                      <h3 className="text-sm font-bold text-[#111110] mb-1">إنجاز التصاميم والطلبات</h3>
                      <p className="text-xs text-[#55554e] leading-relaxed max-w-sm">
                        نسبة الصور المنجزة بنجاح والمسلمة لصناع المحتوى مقارنة بالطلبات الكلية.
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
                        <span className="text-[9px] text-[#99998f] font-semibold">مكتمل</span>
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
                  <h2 className="text-lg font-bold text-[#111110]">العملاء الكلاسيكيين والطلبات</h2>
                  <p className="text-xs text-[#55554e]">إدارة سجلات العملاء، حساب عدد الصور، ومتابعة الأرصدة والديون.</p>
                </div>
                <button
                  onClick={handleAddClient}
                  className="dash-btn-primary text-xs"
                >
                  <Plus className="w-4 h-4 ml-1.5" />
                  إضافة عميل جديد
                </button>
              </div>

              {clientsData.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                  <p className="text-xs text-[#99998f]">لا يوجد عملاء حالياً في السجل.</p>
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
                              الصور المنجزة: <strong className="text-[#111110] font-mono">{client.ordersCompleted}</strong>
                              <button
                                onClick={() => handleEditOrderCount(client.id, client.ordersCompleted)}
                                className="text-xs text-[#111110] underline font-semibold mr-1"
                              >
                                تعديل
                              </button>
                            </span>
                            <span>•</span>
                            <span>الديون: <strong className="font-mono text-[#d97706]">${client.balance}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        <button
                          onClick={() => handleAddWorkAction(client.id)}
                          className="dash-btn-outline h-8 px-3 text-xs"
                        >
                          <Plus className="w-3.5 h-3.5 ml-1" />
                          تسجيل عمل
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
                          {client.balance === 0 ? "الأرصدة خالصة" : "تصفير الحساب"}
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          title="حذف العميل"
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
                  <h2 className="text-lg font-bold text-[#111110]">حسابات المنصة المسجلة</h2>
                  <p className="text-xs text-[#55554e]">إدارة مستخدمي بوابة العملاء، تفعيل الحظر، ومراسلتهم مباشرة.</p>
                </div>
                <span className="dash-badge dash-badge-gray text-xs">{usersData.length} حساب مسجل</span>
              </div>

              {usersData.length === 0 ? (
                <div className="text-center py-16">
                  <User className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                  <p className="text-xs text-[#99998f]">لا يوجد مستخدمين مسجلين حالياً.</p>
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
                            {user.isBanned && <span className="dash-badge dash-badge-red text-[10px]">محظور</span>}
                            <span className="dash-badge dash-badge-gray text-[10px]">{user.role === 'guest' ? 'ضيف' : 'صانع محتوى'}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#55554e]">
                            <span className="flex items-center gap-1 font-mono"><AtSign size={11}/> {user.username || "بدون يوزر"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Mail size={11}/> {user.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[#99998f]">انضم: {new Date(user.createdAt).toLocaleDateString('ar-JO')}</span>
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
                          <span>{user.isBanned ? "إلغاء الحظر" : "حظر"}</span>
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
                          title="مراسلة"
                        >
                          <MessageSquare className="w-3.5 h-3.5 ml-1" />
                          مراسلة
                        </button>
                        <button
                          onClick={() => setModalConfig({ isOpen: true, type: 'deletePlatformUser', title: 'حذف حساب المنصة', description: 'هل أنت متأكد من حذف هذا الحساب نهائياً؟ سيتم مسح كافة صوره وسجلاته المرتبطة.', clientId: user.id })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          title="حذف الحساب"
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
                    <h2 className="text-lg font-bold text-[#111110]">إدارة صناع المحتوى</h2>
                    <p className="text-xs text-[#55554e]">إدارة ملفات الثمنيلات، الفواتير، وحسابات صناع المحتوى المسجلين.</p>
                  </div>
                  <span className="dash-badge dash-badge-gray text-xs">{creatorUsers.length} صانع محتوى</span>
                </div>

                {creatorUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <User className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                    <p className="text-xs text-[#99998f]">لا يوجد صناع محتوى مسجلين حالياً.</p>
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
                              {user.isBanned && <span className="dash-badge dash-badge-red text-[10px]">محظور</span>}
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
                          <span>إدارة بيانات صانع المحتوى</span>
                          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
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
            const name = r.visitorName || r.visitorId || 'زائر';
            if (!groupedByVisitor[name]) groupedByVisitor[name] = [];
            groupedByVisitor[name].push(r);
          });
          const visitorNames = Object.keys(groupedByVisitor);

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-[#f0f0ed] gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#111110]">تقييمات الزوار للصور</h2>
                    <p className="text-xs text-[#55554e]">مراجعة التقييمات العامة المعطاة للأعمال المختارة في المعرض.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="dash-badge dash-badge-gray text-xs">إجمالي: {publicRatingsData.length}</span>
                    <span className="dash-badge dash-badge-gray text-xs">المقيّمين: {visitorNames.length}</span>
                  </div>
                </div>

                {publicRatingsData.length === 0 ? (
                  <div className="text-center py-16">
                    <Star className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                    <p className="text-xs text-[#99998f]">لا توجد تقييمات مسجلة حتى الآن.</p>
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
                                  <span>التقييمات: <strong className="font-mono text-[#111110]">{ratings.length}</strong></span>
                                  <span>•</span>
                                  <span>المتوسط: <strong className="font-mono text-[#d97706]">{avgRating} / 5</strong></span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteVisitorRatings(visitorName); }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                title="حذف جميع تقييمات هذا الزائر"
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
                              <table className="w-full text-right text-xs" dir="rtl">
                                <thead>
                                  <tr className="text-[#99998f] border-b border-[#f0f0ed]">
                                    <th className="pb-2 font-semibold">الصورة / المعرض</th>
                                    <th className="pb-2 font-semibold">التقييم</th>
                                    <th className="pb-2 font-semibold">التاريخ</th>
                                    <th className="pb-2 font-semibold text-center">إجراء</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ratings.map((rating: any) => (
                                    <tr key={rating.id} className="border-b border-[#f0f0ed] last:border-0 hover:bg-[#fcfcfb]">
                                      <td className="py-2.5 font-medium text-[#111110]">رقم {rating.portfolioItemId}</td>
                                      <td className="py-2.5">
                                        <div className="flex items-center gap-1" dir="ltr">
                                          {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                              key={s}
                                              size={12}
                                              className={s <= rating.rating ? 'text-amber-500 fill-amber-500' : 'text-[#d0d0cc] fill-[#d0d0cc]'}
                                            />
                                          ))}
                                          <span className="text-amber-600 font-bold font-mono text-[11px] mr-1">{rating.rating}/5</span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 text-[#99998f]">{new Date(rating.createdAt).toLocaleDateString('ar-JO')}</td>
                                      <td className="py-2.5 text-center">
                                        <button
                                          onClick={() => deletePublicRating(rating.id)}
                                          className="p-1 text-red-500 hover:text-red-700 transition"
                                          title="حذف"
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
                  <h2 className="text-lg font-bold text-[#111110]">طلبات التعديلات على التصاميم</h2>
                  <p className="text-xs text-[#55554e]">ملاحظات وتعديلات صناع المحتوى على الثمنيلات المسلمة.</p>
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
                  <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
                  {revisionsLoading ? 'جارٍ التحميل...' : 'تحديث القائمة'}
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
                  <p className="text-xs text-[#99998f]">لا توجد طلبات تعديل حالياً.</p>
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
                          <span className="font-bold text-sm text-[#111110]">{rev.thumbnailTitle ?? 'ثمنيل'}</span>
                          <span className={`dash-badge ${
                            rev.status === 'completed' ? 'dash-badge-green'
                            : rev.status === 'in_progress' ? 'dash-badge-blue'
                            : rev.status === 'rejected' ? 'dash-badge-red'
                            : 'dash-badge-amber'
                          }`}>
                            {{
                              pending: 'قيد الانتظار',
                              in_progress: 'قيد المراجعة',
                              completed: 'مكتمل',
                              rejected: 'مرفوض',
                            }[rev.status] ?? rev.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#55554e] mb-2">
                          <span className="font-semibold text-[#111110]">{rev.userFullName ?? 'مستخدم'}</span>
                          {rev.userEmail && <span> · {rev.userEmail}</span>}
                        </p>
                        <p className="text-xs text-[#111110] bg-white border border-[#e8e8e5] rounded-lg px-3 py-2 leading-relaxed">
                          {rev.message}
                        </p>
                        <p className="text-[11px] text-[#99998f] mt-2 font-mono">{new Date(rev.createdAt).toLocaleDateString('ar-JO')}</p>
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
                                toast({ title: 'تم تحديث الحالة' });
                              } else {
                                toast({ title: 'فشل التحديث', variant: 'destructive' });
                              }
                            } catch {
                              toast({ title: 'حدث خطأ', variant: 'destructive' });
                            } finally {
                              setRevisionUpdating(null);
                            }
                          }}
                          className="dash-input h-9 text-xs px-3 cursor-pointer"
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="in_progress">قيد المراجعة</option>
                          <option value="completed">مكتمل</option>
                          <option value="rejected">مرفوض</option>
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
        {activeTab === 'messages' && (() => {
          const activeConv = adminConvs.find(c => c.id === activeConvId) ?? null;

          const loadMessages = async (convId: number) => {
            setAdminMsgsLoading(true);
            try {
              const res = await fetch(API_BASE + `/api/dashboard/conversations/${convId}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                const msgs: AdminChatMessage[] = await res.json();
                setAdminMsgs(msgs);
                msgs.filter(m => !m.isRead && m.senderType === 'user').forEach(m => {
                  fetch(API_BASE + `/api/dashboard/messages/${m.id}/read`, {
                    method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
                  }).catch(() => {});
                });
              }
            } catch { /* non-critical */ } finally {
              setAdminMsgsLoading(false);
            }
          };

          const selectConv = (conv: AdminConversation) => {
            setActiveConvId(conv.id);
            setAdminMsgMobileView('thread');
            loadMessages(conv.id);
          };

          const sendReply = async () => {
            if (!activeConvId || !adminReplyBody.trim() || adminReplySending) return;
            const body = adminReplyBody.trim();
            setAdminReplySending(true);
            try {
              const res = await fetch(API_BASE + `/api/dashboard/conversations/${activeConvId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ body }),
              });
              if (res.ok) {
                const msg: AdminChatMessage = await res.json();
                setAdminMsgs(prev => [...prev, msg]);
                setAdminReplyBody('');
                setAdminConvs(prev => prev.map(c =>
                  c.id === activeConvId ? { ...c, updatedAt: new Date().toISOString() } : c
                ));
              } else {
                toast({ title: 'فشل الإرسال', variant: 'destructive' });
              }
            } catch {
              toast({ title: 'حدث خطأ', variant: 'destructive' });
            } finally {
              setAdminReplySending(false);
            }
          };

          const ConvList = () => (
            <div className="flex flex-col h-full bg-[#fafaf9] border-l border-[#e8e8e5] overflow-y-auto">
              <div className="p-3.5 border-b border-[#e8e8e5] bg-white">
                <p className="text-[11px] font-bold text-[#55554e] uppercase tracking-wider">المحادثات المفتوحة</p>
              </div>
              {adminConvsLoading ? (
                <div className="p-4 space-y-2">
                  {[0, 1, 2].map(i => <div key={i} className="dash-skeleton h-14 rounded-xl" />)}
                </div>
              ) : adminConvs.length === 0 ? (
                <div className="p-10 text-center text-xs text-[#99998f]">
                  لا توجد محادثات نشطة
                </div>
              ) : (
                adminConvs.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => selectConv(conv)}
                    className={`p-3.5 cursor-pointer border-b border-[#f0f0ed] transition-colors ${
                      activeConvId === conv.id
                        ? 'bg-white border-r-3 border-r-[#111110]'
                        : 'hover:bg-[#f0f0ed]'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#111110] mb-0.5 truncate">
                      {conv.userFullName ?? 'مستخدم'}
                    </p>
                    <p className="text-[11px] text-[#55554e] truncate">
                      {conv.userEmail ?? ''}
                    </p>
                    <p className="text-[10px] text-[#99998f] mt-1 font-mono">
                      {new Date(conv.updatedAt).toLocaleDateString('ar-JO')}
                    </p>
                  </div>
                ))
              )}
            </div>
          );

          const ThreadView = () => (
            <div className="flex flex-col h-full bg-white">
              {/* Thread Header */}
              <div className="p-3.5 border-b border-[#e8e8e5] flex items-center gap-3 bg-[#fafaf9]">
                <button
                  onClick={() => { setAdminMsgMobileView('list'); setActiveConvId(null); }}
                  className="sm:hidden p-1 text-[#55554e] hover:text-[#111110]"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-xs font-bold text-[#111110]">{activeConv?.userFullName ?? 'مستخدم'}</p>
                  <p className="text-[11px] text-[#55554e]">{activeConv?.userEmail ?? ''}</p>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {adminMsgsLoading ? (
                  [0, 1, 2].map(i => (
                    <div key={i} className={`dash-skeleton h-12 w-2/3 ${i % 2 === 0 ? 'self-end' : 'self-start'}`} />
                  ))
                ) : adminMsgs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-[#99998f]">
                    لا توجد رسائل في هذه المحادثة بعد
                  </div>
                ) : (
                  adminMsgs.map(msg => (
                    <div
                      key={msg.id}
                      className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.senderType === 'admin'
                          ? 'self-start bg-[#111110] text-white rounded-br-xs'
                          : 'self-end bg-[#f0f0ed] text-[#111110] border border-[#e8e8e5] rounded-bl-xs'
                      }`}
                    >
                      {msg.senderType === 'user' && (
                        <span className="text-[10px] font-bold block mb-1 text-[#55554e]">
                          {activeConv?.userFullName ?? 'العميل'}
                        </span>
                      )}
                      <span className="whitespace-pre-wrap break-words">{msg.body}</span>
                      <span className={`block text-[9px] mt-1 font-mono ${
                        msg.senderType === 'admin' ? 'text-white/60' : 'text-[#99998f]'
                      }`}>
                        {new Date(msg.createdAt).toLocaleString('ar-JO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Compose bar */}
              <div className="p-3 border-t border-[#e8e8e5] flex gap-2 bg-[#fafaf9]">
                <textarea
                  placeholder="اكتب ردك للمستخدم..."
                  value={adminReplyBody}
                  onChange={e => setAdminReplyBody(e.target.value)}
                  rows={2}
                  className="dash-textarea flex-1 text-xs resize-none min-h-[44px] max-h-28"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={adminReplySending || !adminReplyBody.trim()}
                  className="dash-btn-primary self-end h-10 w-10 p-0 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          );

          return (
            <div className="dash-card bg-white border border-[#e8e8e5] rounded-2xl shadow-2xs overflow-hidden h-[calc(100vh-200px)] min-h-[480px]">
              <div className="grid grid-cols-1 sm:grid-cols-12 h-full">
                {/* Desktop Conversation List */}
                <div className="hidden sm:block sm:col-span-4 h-full overflow-hidden">
                  <ConvList />
                </div>
                {/* Desktop Thread View */}
                <div className="hidden sm:block sm:col-span-8 h-full overflow-hidden">
                  {activeConv ? (
                    <ThreadView />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-xs text-[#99998f] gap-2">
                      <MessageSquare className="w-8 h-8 opacity-30" />
                      <span>اختر محادثة من القائمة للبدء</span>
                    </div>
                  )}
                </div>

                {/* Mobile Responsive Toggle */}
                <div className="sm:hidden col-span-1 h-full overflow-hidden">
                  {adminMsgMobileView === 'list' ? (
                    <ConvList />
                  ) : activeConv ? (
                    <ThreadView />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════
            TAB: CODES
            ═══════════════════════════════════════════════════════ */}
        {activeTab === 'codes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-[#f0f0ed] gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111110]">أكواد دعوة صناع المحتوى</h2>
                  <p className="text-xs text-[#55554e]">الأكواد السرية المطلوبة لإنشاء حسابات جديدة على المنصة.</p>
                </div>
                <button
                  onClick={handleAddCode}
                  className="dash-btn-primary text-xs"
                >
                  <Plus className="w-4 h-4 ml-1.5" />
                  إضافة كود جديد
                </button>
              </div>

              {codesData.length === 0 ? (
                <div className="text-center py-16">
                  <ShieldCheck className="w-12 h-12 text-[#99998f] mx-auto mb-3 opacity-40" />
                  <p className="text-xs text-[#99998f]">لا توجد أكواد مسجلة حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {codesData.map(code => (
                    <div key={code.id} className="bg-[#fcfcfb] border border-[#e8e8e5] rounded-xl p-4 flex flex-col justify-between gap-4 shadow-2xs">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`dash-badge ${code.isActive ? 'dash-badge-green' : 'dash-badge-red'}`}>
                            {code.isActive ? 'مُفعّل' : 'مُعطّل'}
                          </span>
                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h3 className="text-xl font-mono font-bold text-[#111110] mb-1" dir="ltr">{code.code}</h3>
                        <p className="text-[11px] text-[#99998f]">تم الإنشاء: {new Date(code.createdAt).toLocaleDateString('ar-JO')}</p>
                      </div>

                      <button
                        onClick={() => handleToggleCode(code.id)}
                        className={`w-full h-8 rounded-lg font-semibold text-xs border transition-colors ${
                          code.isActive
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {code.isActive ? "إيقاف الكود" : "تفعيل الكود"}
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
              <h2 className="text-xl font-bold text-[#111110]">إدارة محتوى وتكوين الموقع</h2>
              <p className="text-xs text-[#55554e]">تعديل النصوص، الصور، قصص النجاح، والمعرض المنشور على الصفحة الرئيسية.</p>
            </div>

            {/* 1. CONTACT INBOX */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-[#111110]" />
                  <h3 className="text-sm font-bold text-[#111110]">رسائل التواصل من الموقع</h3>
                  {unreadMessagesCount > 0 && (
                    <span className="dash-badge dash-badge-red">{unreadMessagesCount} جديد</span>
                  )}
                </div>
                <button
                  onClick={fetchMessages}
                  disabled={messagesLoading}
                  className="dash-btn-outline h-8 px-3 text-xs"
                >
                  <RefreshCw className="w-3 h-3 ml-1" />
                  {messagesLoading ? "جارٍ..." : "تحديث"}
                </button>
              </div>

              {messages.length === 0 ? (
                <p className="text-xs text-[#99998f] text-center py-6">لا توجد رسائل واردة حتى الآن.</p>
              ) : (
                <div className="space-y-2.5">
                  {messages.slice(0, 5).map(msg => (
                    <div key={msg.id} className="bg-[#fcfcfb] rounded-xl p-3.5 border border-[#e8e8e5] flex items-start justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#111110]">
                          {msg.name} <span className="font-normal text-[#99998f] mr-1">[{msg.email}]</span>
                        </p>
                        <p className="text-[#55554e] mt-1 truncate">{msg.message}</p>
                      </div>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 transition shrink-0"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {messages.length > 5 && (
                    <p className="text-[11px] text-[#99998f] text-center pt-2">يوجد المزيد من الرسائل في قاعدة البيانات.</p>
                  )}
                </div>
              )}
            </div>

            {/* 2. BRANDING */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                هوية العلامة التجارية
              </h3>
              {editableSection("brand", "name", "اسم العلامة")}
              {editableSection("brand", "logoLetter", "حرف الشعار")}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#111110] mb-1.5">رابط قناة اليوتيوب (عام)</label>
                <input
                  value={sections.brand?.youtubeChannelUrl ?? ""}
                  onChange={(e) => setSections((prev) => ({ ...prev, brand: { ...prev.brand, youtubeChannelUrl: e.target.value } }))}
                  className="dash-input text-xs font-mono"
                  dir="ltr"
                  placeholder="https://youtube.com/@channelname"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#111110] mb-2">الصورة الشخصية / الشعار</label>
                <div className="flex items-center gap-4">
                  <label className="dash-btn-outline text-xs cursor-pointer relative overflow-hidden">
                    <Upload className="w-3.5 h-3.5 ml-1" />
                    رفع صورة الشعار
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append("image", file);
                      const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                      if (res.ok) {
                        const data = await res.json();
                        setSections((prev) => ({ ...prev, brand: { ...prev.brand, logoImage: data.url } }));
                        toast({ title: "تم الرفع بنجاح!" });
                      }
                    }} />
                  </label>
                  {sections.brand?.logoImage ? (
                    <img src={sections.brand.logoImage} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-[#e8e8e5]" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#f0f0ed] border border-[#e8e8e5] flex items-center justify-center text-[10px] text-[#99998f]">لا يوجد</div>
                  )}
                </div>
              </div>
              <button onClick={() => saveSection("brand")} disabled={loading} className="dash-btn-primary text-xs">
                <Save className="w-3.5 h-3.5 ml-1.5" />
                حفظ بيانات الهوية
              </button>
            </div>

            {/* 3. IMAGE LIBRARY */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed] flex items-center gap-2">
                <Upload className="w-4 h-4" />
                مكتبة الصور العامة
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {images.map((url, index) => (
                  <div key={url} className="relative group cursor-pointer" onClick={() => { navigator.clipboard?.writeText(url); toast({ title: "تم نسخ الرابط" }); }}>
                    <img src={url} alt="" className="w-full aspect-video object-cover rounded-xl border border-[#e8e8e5]" />
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); moveImage(index, 'right'); }} className="p-1 bg-black/70 rounded-md text-white hover:bg-black" title="تحريك">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveImage(index, 'left'); }} className="p-1 bg-black/70 rounded-md text-white hover:bg-black" title="تحريك">
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteImage(url); }} className="p-1 bg-red-600 rounded-md text-white hover:bg-red-700" title="حذف">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2.5 cursor-pointer bg-[#fcfcfb] border border-dashed border-[#e8e8e5] rounded-xl px-4 py-6 hover:border-[#111110] transition-colors">
                <Upload className="w-4 h-4 text-[#55554e]" />
                <span className="text-xs font-semibold text-[#111110]">اضغط لرفع صورة جديدة للمكتبة</span>
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </label>
            </div>

            {/* 4. LOGIN LOGS */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#111110]" />
                  <h3 className="text-sm font-bold text-[#111110]">سجل محاولات تسجيل الدخول</h3>
                </div>
                <button onClick={fetchLoginLogs} disabled={logsLoading} className="dash-btn-outline h-8 px-3 text-xs">
                  <RefreshCw className="w-3 h-3 ml-1" />
                  {logsLoading ? "جارٍ..." : "تحديث"}
                </button>
              </div>
              {loginLogs.length === 0 ? (
                <p className="text-xs text-[#99998f] text-center py-4">لا توجد سجلات</p>
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
                            <span className="text-[10px] text-[#99998f] font-mono mr-2" dir="ltr">{log.ipAddress}</span>
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
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed]">محتوى القسم الرئيسي (Hero)</h3>
              {editableSection("hero", "badge", "الشارة العلوية")}
              {editableSection("hero", "headline", "العنوان الرئيسي")}
              {editableSection("hero", "subheadline", "العنوان الفرعي", true)}
              {editableSection("hero", "ctaPrimary", "زر الإجراء الرئيسي (CTA)")}
              {editableSection("hero", "trustText", "نص الثقة والضمان")}
              <button onClick={() => saveSection("hero")} disabled={loading} className="dash-btn-primary text-xs mt-2">
                <Save className="w-3.5 h-3.5 ml-1.5" />
                حفظ محتوى Hero
              </button>
            </div>

            {/* 6. HERO CARDS (IMAGES) */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed]">صور بطاقات القسم الرئيسي (Hero Cards)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {(["heroCard1", "heroCard2"] as const).map((cardKey, idx) => {
                  const currentUrl = (sections.hero as any)?.[cardKey] || "";
                  return (
                    <div key={cardKey} className="border border-[#e8e8e5] rounded-xl p-3 bg-[#fcfcfb]">
                      <span className="text-xs font-bold text-[#111110] block mb-2">البطاقة {idx + 1}</span>
                      <div className="relative w-full aspect-[4/3] bg-[#f0f0ed] rounded-lg overflow-hidden border border-[#e8e8e5] flex items-center justify-center">
                        {currentUrl ? (
                          <img src={currentUrl} alt={`Hero Card ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-[#99998f]">لا توجد صورة</span>
                        )}
                      </div>
                      <label className="dash-btn-outline w-full h-8 text-xs mt-2 cursor-pointer justify-center">
                        <Upload className="w-3 h-3 ml-1" />
                        <span>استبدال الصورة</span>
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          try {
                            setLoading(true);
                            const fd = new FormData(); fd.append("image", file);
                            const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                            if (res.ok) {
                              const data = await res.json();
                              setSections(prev => ({ ...prev, hero: { ...(prev.hero as any), [cardKey]: data.url } }));
                              await fetch(API_BASE + "/api/content/hero", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ content: JSON.stringify({ ...(sections.hero as any), [cardKey]: data.url }) })
                              });
                              toast({ title: "تم التحديث بنجاح" });
                            }
                          } catch { toast({ title: "خطأ", variant: "destructive" }); }
                          finally { setLoading(false); e.target.value = ""; }
                        }} />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7. ABOUT ME STANDALONE SECTION */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-2 pb-3 border-b border-[#f0f0ed] flex items-center gap-2">
                <User className="w-4 h-4" />
                About Me — قسم التعريف الشخصي (أسفل الموقع)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {editableSection("aboutMe", "eyebrow", "نص Eyebrow")}
                {editableSection("aboutMe", "headline1", "السطر الأول")}
                {editableSection("aboutMe", "headline2", "السطر الثاني")}
              </div>
              {editableSection("aboutMe", "bio1", "الفقرة الأولى", true)}
              {editableSection("aboutMe", "bio2", "الفقرة الثانية (اختيارية)", true)}
              {editableSection("aboutMe", "specialties", "التخصصات (مفصولة بفاصلة)")}

              <div className="my-4 pt-3 border-t border-[#f0f0ed]">
                <label className="block text-xs font-semibold text-[#111110] mb-2">الصورة الشخصية للقسم (3:4)</label>
                <div className="flex items-center gap-4">
                  <label className="dash-btn-outline text-xs cursor-pointer relative overflow-hidden">
                    <Upload className="w-3.5 h-3.5 ml-1" />
                    رفع صورة الملف
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append("image", file);
                      const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                      if (res.ok) {
                        const data = await res.json();
                        setSections(prev => ({ ...prev, aboutMe: { ...prev.aboutMe, profileImage: data.url } }));
                        toast({ title: "تم رفع الصورة بنجاح!" });
                      }
                    }} />
                  </label>
                  {sections.aboutMe?.profileImage && (
                    <img src={sections.aboutMe.profileImage} alt="Profile" className="w-12 aspect-[3/4] rounded-lg object-cover border border-[#e8e8e5]" />
                  )}
                </div>
              </div>
              <button onClick={() => saveSection("aboutMe")} disabled={loading} className="dash-btn-primary text-xs">
                <Save className="w-3.5 h-3.5 ml-1.5" />
                حفظ قسم About Me
              </button>
            </div>

            {/* 8. PRICING */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <h3 className="text-sm font-bold text-[#111110] mb-4 pb-3 border-b border-[#f0f0ed]">أسعار الباقات والخدمات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {editableSection("pricing", "basicPrice", "سعر الباقة الأساسية")}
                {editableSection("pricing", "basicFeatures", "ميزات الباقة الأساسية (كل ميزة في سطر)", true)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {editableSection("pricing", "proPrice", "سعر الباقة الاحترافية")}
                {editableSection("pricing", "proFeatures", "ميزات الباقة الاحترافية", true)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {editableSection("pricing", "elitePrice", "سعر باقة النخبة")}
                {editableSection("pricing", "eliteFeatures", "ميزات باقة النخبة", true)}
              </div>
              <button onClick={() => saveSection("pricing")} disabled={loading} className="dash-btn-primary text-xs">
                <Save className="w-3.5 h-3.5 ml-1.5" />
                حفظ الأسعار
              </button>
            </div>

            {/* 9. PORTFOLIO 20 SLOTS */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div>
                  <h3 className="text-sm font-bold text-[#111110]">معرض الأعمال (Portfolio Slots - 20 صورة)</h3>
                  <p className="text-xs text-[#55554e]">إدارة صور المعرض وبيانات كل صورة (القناة، المشاهدات، الرابط).</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getPortfolioImages().map((url, index) => {
                  const items: any[] = Array.isArray((sections.portfolio as any)?.items) ? (sections.portfolio as any).items : [];
                  const meta = items[index] || items.find((it: any) => it && it.imageUrl === url);

                  return (
                    <div key={`portfolio-${index}`} className="relative group bg-[#f7f7f5] border border-[#e8e8e5] rounded-xl aspect-video overflow-hidden flex items-center justify-center">
                      {url ? (
                        <>
                          <img src={url} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                          {meta && (meta.creatorName || meta.views) && (
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pointer-events-none z-10">
                              <span className="text-[10px] text-white font-semibold truncate block">{meta.creatorName || meta.category}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 z-20">
                            <button onClick={() => movePortfolioImage(index, 'right')} className="p-1.5 bg-white/20 text-white rounded-md hover:bg-white/40" title="تحريك لليمين">
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <label className="p-1.5 bg-white/20 text-white rounded-md hover:bg-white/40 cursor-pointer" title="استبدال">
                              <RefreshCw className="w-3 h-3" />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadPortfolioImage(e, index, true)} />
                            </label>
                            <button onClick={() => openEditMeta(index)} className="p-1.5 bg-white/20 text-white rounded-md hover:bg-white/40" title="تعديل البيانات">
                              <FileText className="w-3 h-3" />
                            </button>
                            <button onClick={() => deletePortfolioImage(index)} className="p-1.5 bg-red-600/80 text-white rounded-md hover:bg-red-600" title="حذف">
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => movePortfolioImage(index, 'left')} className="p-1.5 bg-white/20 text-white rounded-md hover:bg-white/40" title="تحريك لليسار">
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-[#f0f0ed] transition-colors p-2 text-center">
                          <Upload className="w-4 h-4 text-[#99998f] mb-1" />
                          <span className="text-[10px] font-semibold text-[#99998f]">خانة {index + 1}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadPortfolioImage(e, index, false)} />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 10. CASE STUDIES */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div>
                  <h3 className="text-sm font-bold text-[#111110]">قصص نجاح صناع المحتوى (Case Studies)</h3>
                  <p className="text-xs text-[#55554e]">عرض تجارب النجاح والنتائج المحققة للقنوات.</p>
                </div>
                <button
                  onClick={() => {
                    setSections(prev => {
                      const current = Array.isArray(prev.caseStudies) && prev.caseStudies.length > 0 ? [...prev.caseStudies] : [...defaultCaseStudies];
                      current.push({
                        id: `case-${Date.now()}`,
                        name: "اسم صانع المحتوى",
                        niche: "المجال",
                        avatarInitials: "JD",
                        shortBio: "وصف مختصر للنجاح",
                        youtubeUrl: "",
                        story: "القصة الكاملة...",
                        metrics: [
                          { label: "إحصائية 1", value: "+100%" },
                          { label: "إحصائية 2", value: "2x" },
                          { label: "إحصائية 3", value: "50k" }
                        ]
                      });
                      return { ...prev, caseStudies: current };
                    });
                    toast({ title: "تمت إضافة قصة جديدة" });
                  }}
                  className="dash-btn-outline h-8 px-3 text-xs"
                >
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة قصة
                </button>
              </div>

              {((Array.isArray(sections.caseStudies) && sections.caseStudies.length > 0) ? sections.caseStudies : defaultCaseStudies).map((study: any, idx: number) => (
                <div key={study.id || idx} className="mb-4 border border-[#e8e8e5] rounded-xl p-4 bg-[#fcfcfb] space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#f0f0ed]">
                    <span className="text-xs font-bold text-[#111110]">قصة نجاح #{idx + 1}</span>
                    <button
                      onClick={() => {
                        if (!confirm("هل تريد حذف قصة النجاح هذه؟")) return;
                        setSections(prev => {
                          const current = [...(Array.isArray(prev.caseStudies) && prev.caseStudies.length > 0 ? prev.caseStudies : defaultCaseStudies)];
                          current.splice(idx, 1);
                          return { ...prev, caseStudies: current };
                        });
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#111110] mb-1">اسم القناة / اليوتيوبر</label>
                      <input value={study.name || ""} onChange={(e) => updateCaseStudy(idx, 'name', e.target.value)} className="dash-input h-8 text-xs" dir="rtl" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#111110] mb-1">المجال (Niche)</label>
                      <input value={study.niche || ""} onChange={(e) => updateCaseStudy(idx, 'niche', e.target.value)} className="dash-input h-8 text-xs" dir="rtl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#111110] mb-1">رابط قناة اليوتيوب</label>
                    <input value={study.youtubeUrl || ""} onChange={(e) => updateCaseStudy(idx, 'youtubeUrl', e.target.value)} className="dash-input h-8 text-xs font-mono" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#111110] mb-1">القصة (Story)</label>
                    <textarea value={study.story || ""} onChange={(e) => updateCaseStudy(idx, 'story', e.target.value)} className="dash-textarea text-xs min-h-16" dir="rtl" />
                  </div>
                </div>
              ))}
              <button onClick={() => saveSection("caseStudies")} disabled={loading} className="dash-btn-primary text-xs mt-2">
                <Save className="w-3.5 h-3.5 ml-1.5" />
                حفظ قصص النجاح
              </button>
            </div>

            {/* 11. BEFORE / AFTER COMPARISONS */}
            <div className="dash-card bg-white p-6 sm:p-8 border border-[#e8e8e5] rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f0ed]">
                <div>
                  <h3 className="text-sm font-bold text-[#111110]">مقارنة الصور قبل وبعد (Before / After)</h3>
                  <p className="text-xs text-[#55554e]">إدارة مقارنات التطوير للصور المصغرة على الصفحة الرئيسية.</p>
                </div>
                <button
                  onClick={() => {
                    setSections((prev: any) => {
                      const list = Array.isArray(prev.beforeAfter?.comparisons) ? [...prev.beforeAfter.comparisons] : [];
                      list.push({ beforeImage: "", afterImage: "", title: "", tag: "" });
                      return { ...prev, beforeAfter: { ...prev.beforeAfter, comparisons: list } };
                    });
                    toast({ title: "تمت إضافة مقارنة جديدة" });
                  }}
                  className="dash-btn-outline h-8 px-3 text-xs"
                >
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة مقارنة
                </button>
              </div>

              {(Array.isArray(sections.beforeAfter?.comparisons) ? sections.beforeAfter.comparisons : []).map((comp: any, idx: number) => (
                <div key={idx} className="mb-4 border border-[#e8e8e5] rounded-xl p-4 bg-[#fcfcfb] space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#f0f0ed]">
                    <span className="text-xs font-bold text-[#111110]">مقارنة #{idx + 1}</span>
                    <button
                      onClick={() => {
                        if (!confirm("هل تريد حذف هذه المقارنة؟")) return;
                        setSections((prev: any) => {
                          const list = [...(prev.beforeAfter?.comparisons || [])];
                          list.splice(idx, 1);
                          return { ...prev, beforeAfter: { ...prev.beforeAfter, comparisons: list } };
                        });
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#111110] mb-1">العنوان</label>
                      <input
                        value={comp.title || ""}
                        onChange={(e) => {
                          const list = [...(sections.beforeAfter?.comparisons || [])];
                          list[idx] = { ...list[idx], title: e.target.value };
                          setSections(prev => ({ ...prev, beforeAfter: { ...prev.beforeAfter, comparisons: list } }));
                        }}
                        className="dash-input h-8 text-xs"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#111110] mb-1">التصنيف</label>
                      <input
                        value={comp.tag || ""}
                        onChange={(e) => {
                          const list = [...(sections.beforeAfter?.comparisons || [])];
                          list[idx] = { ...list[idx], tag: e.target.value };
                          setSections(prev => ({ ...prev, beforeAfter: { ...prev.beforeAfter, comparisons: list } }));
                        }}
                        className="dash-input h-8 text-xs"
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-[#e8e8e5] p-3 rounded-lg bg-white">
                      <span className="text-[11px] font-bold text-[#55554e] block mb-2">صورة قبل (Before)</span>
                      <label className="dash-btn-outline w-full h-8 text-xs cursor-pointer justify-center">
                        <Upload className="w-3 h-3 ml-1" />
                        <span>رفع صورة قبل</span>
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const fd = new FormData(); fd.append("image", file);
                          const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                          if (res.ok) {
                            const data = await res.json();
                            const list = [...(sections.beforeAfter?.comparisons || [])];
                            list[idx] = { ...list[idx], beforeImage: data.url };
                            setSections(prev => ({ ...prev, beforeAfter: { ...prev.beforeAfter, comparisons: list } }));
                            toast({ title: "تم رفع صورة قبل" });
                          }
                        }} />
                      </label>
                      {comp.beforeImage && (
                        <img src={comp.beforeImage} alt="Before" className="mt-2 aspect-video object-cover rounded-lg border border-[#e8e8e5] w-full" />
                      )}
                    </div>
                    <div className="border border-[#e8e8e5] p-3 rounded-lg bg-white">
                      <span className="text-[11px] font-bold text-[#55554e] block mb-2">صورة بعد (After)</span>
                      <label className="dash-btn-outline w-full h-8 text-xs cursor-pointer justify-center">
                        <Upload className="w-3 h-3 ml-1" />
                        <span>رفع صورة بعد</span>
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const fd = new FormData(); fd.append("image", file);
                          const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                          if (res.ok) {
                            const data = await res.json();
                            const list = [...(sections.beforeAfter?.comparisons || [])];
                            list[idx] = { ...list[idx], afterImage: data.url };
                            setSections(prev => ({ ...prev, beforeAfter: { ...prev.beforeAfter, comparisons: list } }));
                            toast({ title: "تم رفع صورة بعد" });
                          }
                        }} />
                      </label>
                      {comp.afterImage && (
                        <img src={comp.afterImage} alt="After" className="mt-2 aspect-video object-cover rounded-lg border border-[#e8e8e5] w-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => saveSection("beforeAfter")} disabled={loading} className="dash-btn-primary text-xs mt-2">
                <Save className="w-3.5 h-3.5 ml-1.5" />
                حفظ المقارنات
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── PORTFOLIO METADATA EDITOR MODAL ── */}
      {editingMetaIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8e8e5] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4" dir="ltr">
            <div className="flex items-center justify-between border-b border-[#f0f0ed] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#111110]">Portfolio Metadata</h3>
                <p className="text-[11px] text-[#55554e]">Slot #{editingMetaIndex + 1} display details</p>
              </div>
              <button
                onClick={() => setEditingMetaIndex(null)}
                className="p-1.5 text-[#55554e] hover:text-[#111110] rounded-lg hover:bg-[#f0f0ed]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {metaForm.imageUrl && (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#e8e8e5] bg-[#f7f7f5]">
                <img src={metaForm.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-3 text-left">
              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Creator / Channel</label>
                <input
                  value={metaForm.creatorName}
                  onChange={e => setMetaForm(f => ({ ...f, creatorName: e.target.value }))}
                  placeholder="e.g. MrBeast"
                  className="dash-input h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Video Title</label>
                <input
                  value={metaForm.videoTitle}
                  onChange={e => setMetaForm(f => ({ ...f, videoTitle: e.target.value }))}
                  placeholder="e.g. $1 vs $1,000,000 Hotel Room!"
                  className="dash-input h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">YouTube URL</label>
                <input
                  value={metaForm.youtubeUrl}
                  onChange={e => setMetaForm(f => ({ ...f, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="dash-input h-9 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Views</label>
                <input
                  value={metaForm.views}
                  onChange={e => setMetaForm(f => ({ ...f, views: e.target.value }))}
                  placeholder="e.g. 12.4M views"
                  className="dash-input h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#111110] mb-1 block">Category</label>
                <select
                  value={metaForm.category}
                  onChange={e => setMetaForm(f => ({ ...f, category: e.target.value }))}
                  className="dash-input h-9 text-xs"
                >
                  <option value="Gaming">Gaming</option>
                  <option value="Finance">Finance</option>
                  <option value="Vlogs">Vlogs</option>
                  <option value="Reaction">Reaction</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f0ed]">
              <button
                onClick={() => setEditingMetaIndex(null)}
                className="dash-btn-outline h-9 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={savePortfolioMetadata}
                className="dash-btn-primary h-9 px-5 text-xs"
              >
                Save Metadata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL CONFIRMATION & ACTION MODAL ── */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
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
                dir="rtl"
              />
            )}

            <div className="flex gap-2.5 justify-end mt-2">
              <button
                onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                className="dash-btn-outline h-10 px-4 text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={submitModal}
                className={`h-10 px-5 rounded-xl font-semibold text-xs text-white transition-all ${
                  ['deleteClient', 'deletePlatformUser', 'clearBalance'].includes(modalConfig.type || '')
                    ? 'bg-[#dc2626] hover:bg-[#b91c1c]'
                    : 'bg-[#111110] hover:bg-[#262624]'
                }`}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

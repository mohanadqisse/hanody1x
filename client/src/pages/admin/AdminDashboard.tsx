import { API_BASE } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
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
  Monitor, LayoutDashboard, Users, Database, Play, Square, FileText, CheckCircle, Edit, Star
} from "lucide-react";
import { caseStudies as defaultCaseStudies } from "@/lib/data";
import UserContentManager from "./UserContentManager";

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
  
  // Tabs: 'home' | 'clients' | 'content' | 'inbox' | 'logs' | 'users' | 'codes' | 'creators' | 'public_ratings'
  const [activeTab, setActiveTab] = useState<'home' | 'clients' | 'users' | 'content' | 'codes' | 'creators' | 'public_ratings'>('home');

  // Existing states
  const [sections, setSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [expandedMsg, setExpandedMsg] = useState<number | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // New DASHBOARD states
  const [stats, setStats] = useState({ totalRevenue: 0, totalDues: 0, totalClients: 0, completedOrders: 0 });
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [sessionsData, setSessionsData] = useState<TimeSession[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [codesData, setCodesData] = useState<any[]>([]);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [managingUser, setManagingUser] = useState<any>(null);
  const [publicRatingsData, setPublicRatingsData] = useState<any[]>([]);
  const [expandedVisitors, setExpandedVisitors] = useState<Set<string>>(new Set());
  
  // Timer State
  const [isTracking, setIsTracking] = useState(false);
  const [trackingSeconds, setTrackingSeconds] = useState(0);
  const [trackingTitle, setTrackingTitle] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      // Save session
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

  // --- EXISTING FETCHERS ---
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
    if (!confirm("\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u061f")) return;
    try {
      const res = await fetch(API_BASE + `/api/public-ratings/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast({ title: "\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062a\u0642\u064a\u064a\u0645" }); fetchPublicRatings(); }
    } catch (e) { toast({ title: "\u062d\u062f\u062b \u062e\u0637\u0623", variant: "destructive" }); }
  }

  async function deleteVisitorRatings(vName: string) {
    if (!confirm(`\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u062c\u0645\u064a\u0639 \u062a\u0642\u064a\u064a\u0645\u0627\u062a "${vName}"\u061f`)) return;
    try {
      const res = await fetch(API_BASE + `/api/public-ratings/visitor/${encodeURIComponent(vName)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast({ title: "\u062a\u0645 \u062d\u0630\u0641 \u062c\u0645\u064a\u0639 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a" }); fetchPublicRatings(); }
    } catch (e) { toast({ title: "\u062d\u062f\u062b \u062e\u0637\u0623", variant: "destructive" }); }
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
      <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
      {multiline ? (
        <Textarea value={sections[section]?.[field] ?? ""} onChange={(e) => setSections((prev) => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }))} className="bg-card/50 border-white/10 min-h-24 text-right" dir="rtl" />
      ) : (
        <Input value={sections[section]?.[field] ?? ""} onChange={(e) => setSections((prev) => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }))} className="bg-card/50 border-white/10 text-right" dir="rtl" />
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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row-reverse font-sans" dir="rtl">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-card/60 border-l border-white/10 flex flex-col p-6 h-auto md:h-screen sticky top-0">
        <div className="flex flex-col gap-2 items-center text-center pb-8 border-b border-white/10 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center overflow-hidden mb-2">
            {sections.brand?.logoImage ? (
              <img src={sections.brand?.logoImage} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Settings className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-sm text-muted-foreground font-medium">إعدادات الحساب</h2>
          <h1 className="text-xl font-black text-foreground">مهند</h1>
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span>الرئيسية</span>
          </button>
          <button onClick={() => setActiveTab('clients')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'clients' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <Users className="w-5 h-5 flex-shrink-0" />
            <span>العملاء الكلاسيكيين</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'users' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <Users className="w-5 h-5 flex-shrink-0" />
            <span>حسابات المنصة</span>
          </button>
          <button onClick={() => setActiveTab('codes')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'codes' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>أكواد الدعوة</span>
          </button>
          <button onClick={() => setActiveTab('content')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'content' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <Database className="w-5 h-5 flex-shrink-0" />
            <span>إدارة المحتوى</span>
          </button>
          <button onClick={() => setActiveTab('creators')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'creators' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <User className="w-5 h-5 flex-shrink-0" />
            <span>إدارة صناع المحتوى</span>
          </button>
          <button onClick={() => setActiveTab('public_ratings')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'public_ratings' ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
            <Star className="w-5 h-5 flex-shrink-0" />
            <span>تقييم العملاء للصور</span>
          </button>
        </nav>

        <div className="pt-8 border-t border-white/10 mt-auto">
          <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 font-bold transition-colors">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-10">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-1">مرحباً بعودتك، <span className="text-primary">مهند</span> 👋</h1>
            <p className="text-muted-foreground">إليك نظرة عامة على أعمالك وإحصائياتك اليوم.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="border-border rounded-xl text-primary hover:bg-primary hover:text-white shrink-0">
            العودة للموقع
          </Button>
        </div>

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "إجمالي الإيرادات", value: `$${stats.totalRevenue}`, icon: "💰", color: "text-green-500" },
                { title: "الديون المستحقة", value: `$${stats.totalDues}`, icon: "🛒", color: "text-orange-500" },
                { title: "إجمالي العملاء", value: stats.totalClients, icon: "👥", color: "text-blue-500" },
                { title: "الطلبات المكتملة", value: stats.completedOrders, icon: "✅", color: "text-purple-500" }
              ].map((s, i) => (
                <div key={i} className="bg-card/40 border border-white/5 p-6 rounded-3xl flex flex-col items-center sm:items-start text-center sm:text-right hover:border-white/10 transition-colors">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl mb-4 ${s.color}`}>{s.icon}</div>
                  <h3 className="text-muted-foreground text-sm font-medium mb-1 font-sans">{s.title}</h3>
                  <p className="text-3xl font-black text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Timer & Logs */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-card/40 border border-white/5 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold">تتبع الوقت</h2>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black tabular-nums tracking-widest text-foreground font-mono mb-6">
                      {formatTime(trackingSeconds)}
                    </div>
                    <Input 
                      placeholder="ماذا تعمل الآن؟ (اختياري)" 
                      value={trackingTitle} 
                      onChange={e => setTrackingTitle(e.target.value)}
                      className="bg-black/20 border-white/10 text-center mb-4 rounded-xl"
                      disabled={isTracking}
                    />
                    <Button 
                      onClick={handleStartStopTimer}
                      className={`w-full rounded-xl h-12 font-bold text-white shadow-lg transition-all
                        ${isTracking ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'}`}
                    >
                      {isTracking ? <><Square className="w-5 h-5 ml-2" /> إيقاف العمل</> : <><Play className="w-5 h-5 ml-2 fill-white" /> ابدأ العمل</>}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-bold border-b border-white/10 pb-2 mb-2">سجل المهام المنجزة</div>
                    {sessionsData.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-2">لا توجد جلسات سابقة</p>
                    ) : sessionsData.slice(0, 5).map(sess => (
                      <div key={sess.id} className="flex justify-between items-center text-xs py-1.5 px-3 rounded-lg bg-black/20">
                        <span className="text-foreground truncate ml-4">{sess.title}</span>
                        <span className="text-muted-foreground font-mono shrink-0">{formatTime(sess.durationSeconds)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clients Quick List */}
                <div className="bg-card/40 border border-white/5 rounded-3xl p-6 flex flex-col h-[300px]">
                  <h2 className="text-lg font-bold mb-1">أحدث العملاء النشطين</h2>
                  <p className="text-xs text-muted-foreground mb-4">العملاء الذين تم إضافتهم مؤخراً لجدولة أعمالهم.</p>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {clientsData.slice(0,5).map(c => (
                      <div key={c.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                            {c.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.status}</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md">منجز</span>
                      </div>
                    ))}
                    {clientsData.length === 0 && <p className="text-center text-sm text-muted-foreground mt-10">لا يوجد عملاء حالياً</p>}
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab('clients')} className="w-full mt-4 text-xs h-8 border-white/10 rounded-xl">
                    كل العملاء
                  </Button>
                </div>
              </div>

              {/* Right Column: Chart / Empty States for now */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card/40 border border-white/5 rounded-3xl p-6 min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="absolute top-6 right-6">
                    <h2 className="text-lg font-bold">تحليلات الأرباح</h2>
                    <p className="text-xs text-muted-foreground">صُمم كواجهة فارغة تحضيرية (استخدم مكتبة رسوم بيانية مستقبلاً).</p>
                  </div>
                  <div className="w-full h-full flex items-center justify-center opacity-20 pointer-events-none mt-10">
                      <svg width="400" height="200" viewBox="0 0 400 200" className="stroke-primary">
                        <path d="M0 150 Q100 100 200 120 T400 50" fill="none" strokeWidth="4" strokeLinecap="round" />
                        <path d="M0 180 Q100 140 200 160 T400 90" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-secondary" />
                      </svg>
                  </div>
                </div>

                <div className="bg-card/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                  <h2 className="text-lg font-bold mb-1 w-full text-right">إنجاز الطلبات</h2>
                  <p className="text-xs text-muted-foreground w-full text-right mb-6">نسبة الطلبات المنتهية مقابل قيد العمل</p>
                  
                  <div className="relative w-48 h-48 mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="251.2" strokeDashoffset={stats.totalClients > 0 ? 251.2 - (251.2 * (stats.completedOrders / (stats.totalClients * 10 || 1))) : 251.2} className="text-primary transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-foreground">{stats.completedOrders}</span>
                      <span className="text-xs text-muted-foreground">إجمالي مٌنجز</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> مكتمل</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white/10" /> قيد الانتظار</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: USERS */}
        
        {activeTab === 'creators' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {managingUser ? (
              <UserContentManager user={managingUser} onBack={() => setManagingUser(null)} token={token || ""} />
            ) : (
              <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-2">إدارة صناع المحتوى</h2>
                    <p className="text-sm text-muted-foreground">قم بإدارة الثمنيلات والفواتير الخاصة بصناع المحتوى.</p>
                  </div>
                </div>

                {usersData.filter(u => u.role === 'user').length === 0 ? (
                  <div className="text-center py-20">
                    <User className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">لا يوجد صناع محتوى مسجلين حالياً.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usersData.filter(u => u.role === 'user').map(user => (
                      <div key={user.id} className="bg-card p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              {user.fullName}
                              {user.isBanned && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full">محظور</span>}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><AtSign size={12}/> {user.username || "بدون يوزر"}</span>
                              <span className="flex items-center gap-1"><Mail size={12}/> {user.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setManagingUser(user)}
                            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                          >
                            إدارة بيانات صانع المحتوى
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'public_ratings' && (() => {
          // Group ratings by visitor name
          const groupedByVisitor: Record<string, any[]> = {};
          publicRatingsData.forEach(r => {
            const name = r.visitorName || r.visitorId || 'زائر';
            if (!groupedByVisitor[name]) groupedByVisitor[name] = [];
            groupedByVisitor[name].push(r);
          });
          const visitorNames = Object.keys(groupedByVisitor);

          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/10 pb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-2">تقييم العملاء للصور</h2>
                    <p className="text-sm text-muted-foreground">عرض تقييمات الزوار للصور في قسم الأعمال المختارة.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">
                      إجمالي التقييمات: <strong className="text-foreground">{publicRatingsData.length}</strong>
                    </span>
                    <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">
                      عدد المُقيِّمين: <strong className="text-foreground">{visitorNames.length}</strong>
                    </span>
                  </div>
                </div>
                
                {publicRatingsData.length === 0 ? (
                  <div className="text-center py-20">
                    <Star className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">لا يوجد تقييمات حتى الآن.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visitorNames.map(visitorName => {
                      const ratings = groupedByVisitor[visitorName];
                      const isExpanded = expandedVisitors.has(visitorName);
                      const avgRating = (ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length).toFixed(1);

                      return (
                        <div key={visitorName} className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden transition-all">
                          {/* Visitor Header - Collapsible */}
                          <div
                            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => toggleVisitorExpand(visitorName)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                                {visitorName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                                  <span className="text-primary text-xs">تصويت</span>
                                  {visitorName}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span>عدد التقييمات: <strong className="text-foreground">{ratings.length}</strong></span>
                                  <span>•</span>
                                  <span>المتوسط: <strong className="text-yellow-400">{avgRating}</strong> / 5</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => { e.stopPropagation(); deleteVisitorRatings(visitorName); }}
                                className="text-xs rounded-xl font-bold h-9 px-3 bg-red-900/50 hover:bg-red-600"
                                title="حذف جميع تقييمات هذا الزائر"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Ratings Table */}
                          {isExpanded && (
                            <div className="border-t border-white/5 px-4 sm:px-5 pb-4">
                              <table className="w-full text-right mt-3" dir="rtl">
                                <thead>
                                  <tr className="text-muted-foreground text-xs border-b border-white/10">
                                    <th className="pb-2 px-3 font-bold">صورة العمل المختارة</th>
                                    <th className="pb-2 px-3 font-bold">التقييم</th>
                                    <th className="pb-2 px-3 font-bold">تاريخ التقييم</th>
                                    <th className="pb-2 px-3 font-bold text-center">حذف</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ratings.map((rating: any) => (
                                    <tr key={rating.id} className="border-b border-white/5 hover:bg-white/5 text-sm">
                                      <td className="py-3 px-3">رقم {rating.portfolioItemId}</td>
                                      <td className="py-3 px-3">
                                        <div className="flex items-center gap-1" dir="ltr">
                                          {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                              key={s}
                                              size={14}
                                              className={s <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 fill-gray-700'}
                                            />
                                          ))}
                                          <span className="text-yellow-400 font-bold text-xs mr-1">{rating.rating}/5</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-3 text-xs text-muted-foreground">{new Date(rating.createdAt).toLocaleDateString('ar-JO')}</td>
                                      <td className="py-3 px-3 text-center">
                                        <button
                                          onClick={() => deletePublicRating(rating.id)}
                                          className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                          title="حذف هذا التقييم"
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

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-2">حسابات المنصة</h2>
                  <p className="text-sm text-muted-foreground">العملاء الذين قاموا بالتسجيل في الموقع الخاص بك.</p>
                </div>
              </div>

              {usersData.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground">لا يوجد مستخدمين مسجلين حالياً.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {usersData.map(user => (
                    <div key={user.id} className="bg-card p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            {user.fullName}
                            {user.isBanned && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full">محظور</span>}
                            <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">{user.role === 'guest' ? 'ضيف' : 'صانع محتوى'}</span>
                          </h3>
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><AtSign size={12}/> {user.username || "بدون يوزر"}</span>
                            <span className="flex items-center gap-1"><Mail size={12}/> {user.email}</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> انضم: {new Date(user.createdAt).toLocaleDateString('ar-JO')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          onClick={() => handleBanUser(user.id, user.isBanned)}
                          variant={user.isBanned ? "outline" : "destructive"}
                          className="rounded-xl w-full sm:w-auto font-bold h-10"
                        >
                          {user.isBanned ? <ShieldCheck className="w-4 h-4 mr-1 ml-1" /> : <ShieldX className="w-4 h-4 mr-1 ml-1" />}
                          {user.isBanned ? "إلغاء الحظر" : "حظر المستخدم"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setModalConfig({ isOpen: true, type: 'deletePlatformUser', title: 'حذف المستخدم نهائياً', description: 'هل أنت متأكد من حذف هذا المستخدم وكل بياناته؟', clientId: user.id })}
                          className="rounded-xl w-full sm:w-auto h-10 bg-red-900/50 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
{activeTab === 'clients' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-2">إدارة العملاء والطلبات</h2>
                  <p className="text-sm text-muted-foreground">اضغط على العميل لعرض طلباته وإضافة مدفوعات جديدة.</p>
                </div>
                <Button onClick={handleAddClient} className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-500/20 font-bold shrink-0">
                  + إضافة عميل
                </Button>
              </div>

              {clientsData.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground">لا يوجد عملاء حالياً. انقر على الزر أعلاه لإضافة عميل جديد.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientsData.map(client => (
                    <div key={client.id} className="bg-black/20 border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center shrink-0 text-xl border border-primary/30">
                          {client.name.substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{client.name}</h3>
                          <div className="flex gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                              الصور المنجزة: <strong className="text-foreground">{client.ordersCompleted}</strong>
                              <button onClick={() => handleEditOrderCount(client.id, client.ordersCompleted)} className="text-primary hover:text-primary/70 text-xs underline">تعديل</button>
                            </span>
                            <span>|</span>
                            <span>الديون المستحقة: <strong className="text-orange-400">${client.balance}</strong></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => handleAddWorkAction(client.id)}
                          className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 rounded-xl text-xs font-bold"
                        >
                          + تسجيل عمل / صور
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleClearBalance(client.id)}
                          className={`text-xs rounded-xl font-bold border-white/10 ${client.balance === 0 ? 'opacity-50 cursor-not-allowed text-green-400' : 'text-foreground hover:bg-white/5'}`}
                          disabled={client.balance === 0}
                        >
                          {client.balance === 0 ? <><CheckCircle className="w-4 h-4 ml-1" /> أرصدة خالصة</> : "تصفير الحساب"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-xs rounded-xl font-bold w-10 p-0"
                          title="حذف العميل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: CODES */}
        {activeTab === 'codes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-2">أكواد صناع المحتوى</h2>
                  <p className="text-sm text-muted-foreground">قم بإدارة الأكواد التي تسمح بصناع المحتوى بتسجيل حساب جديد.</p>
                </div>
                <Button onClick={handleAddCode} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg font-bold shrink-0">
                  + إضافة كود جديد
                </Button>
              </div>

              {codesData.length === 0 ? (
                <div className="text-center py-20">
                  <ShieldCheck className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground">لا يوجد أكواد مسجلة حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {codesData.map(code => (
                    <div key={code.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${code.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {code.isActive ? 'مُفعّل' : 'مُعطّل'}
                          </span>
                          <button onClick={() => handleDeleteCode(code.id)} className="text-muted-foreground hover:text-red-500 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="text-2xl font-mono font-black text-foreground mb-1" dir="ltr">{code.code}</h3>
                        <p className="text-xs text-muted-foreground">تم الإنشاء: {new Date(code.createdAt).toLocaleDateString('ar-JO')}</p>
                      </div>
                      
                      <Button 
                        variant={code.isActive ? "destructive" : "secondary"} 
                        size="sm" 
                        onClick={() => handleToggleCode(code.id)}
                        className="w-full rounded-xl font-bold text-xs"
                      >
                        {code.isActive ? "إيقاف الكود" : "تفعيل الكود"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: CONTENT MANAGEMENT (Brings back all original settings) */}
        {activeTab === 'content' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl max-w-[100%] mx-auto">
            <h2 className="text-2xl font-black mb-6">إدارة محتوى الموقع وتكوينه</h2>

            {/* ===== MESSAGES INBOX ===== */}
            <div className="glass-panel rounded-3xl p-8 bg-card/40 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Inbox className="w-6 h-6 text-primary" />
                    {messages.filter(m => !m.read).length > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                        {messages.filter(m => !m.read).length}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">الرسائل الواردة</h2>
                </div>
                <Button variant="outline" size="sm" onClick={fetchMessages} disabled={messagesLoading} className="border-border text-muted-foreground hover:text-foreground text-xs rounded-xl">
                  {messagesLoading ? "جارٍ التحديث..." : "تحديث"}
                </Button>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-10">
                  <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">لا توجد رسائل حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 5).map((msg) => ( /* Show brief list in content tab to save space */
                    <div key={msg.id} className="bg-black/20 rounded-xl p-4 border border-white/5 flex gap-4 text-sm">
                      <Mail className="w-5 h-5 flex-shrink-0 mt-1 text-primary"/>
                      <div>
                        <p className="font-bold">{msg.name} <span className="font-normal text-muted-foreground text-xs mx-2">[{msg.email}]</span></p>
                        <p className="text-muted-foreground mt-1 truncate max-w-[300px] sm:max-w-md">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  {messages.length > 5 && <p className="text-xs text-muted-foreground text-center">يوجد المزيد من الرسائل في قاعدة البيانات.</p>}
                </div>
              )}
            </div>

            {/* BRANDING */}
            <div className="glass-panel rounded-3xl p-8 bg-card/40 border border-white/5">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><FileText className="w-5 h-5"/> هوية العلامة التجارية</h2>
              {editableSection("brand", "name", "اسم العلامة")}
              {editableSection("brand", "logoLetter", "حرف الشعار")}
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    رابط قناة اليوتيوب (عام)
                  </span>
                </label>
                <Input value={sections.brand?.youtubeChannelUrl ?? ""} onChange={(e) => setSections((prev) => ({ ...prev, brand: { ...prev.brand, youtubeChannelUrl: e.target.value } }))} className="bg-card/50 border-white/10" dir="ltr" placeholder="https://youtube.com/@channelname" />
                <p className="text-xs text-muted-foreground mt-1">يُستخدم كرابط افتراضي لزر "انتقال إلى قناة اليوتيوب" في بطاقات قصص النجاح</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-2">الصورة الشخصية / الشعار</label>
                <div className="flex items-center gap-4 flex-row-reverse justify-end">
                  <label className="flex items-center gap-2 cursor-pointer bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/30 transition border border-primary/30">
                    <Upload className="w-4 h-4" /> رفع صورة
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
                    <img src={sections.brand.logoImage} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-muted-foreground text-xs">لا يوجد</div>
                  )}
                </div>
              </div>
              <Button onClick={() => saveSection("brand")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                <Save className="w-4 h-4 ml-2" /> حفظ
              </Button>
            </div>

            {/* UPLOAD IMAGES */}
            <div className="glass-panel rounded-3xl p-8 bg-card/40 border border-white/5">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><Upload className="w-5 h-5"/> إدارة مكتبة الصور المرفوعة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {images.map((url) => (
                  <div key={url} className="relative group cursor-pointer" onClick={() => { navigator.clipboard?.writeText(url); toast({ title: "تم نسخ الرابط" }); }}>
                    <img src={url} alt="" className="w-full aspect-video object-cover rounded-xl border border-white/5" />
                    <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); deleteImage(url); }} className="w-8 h-8 bg-red-500/90 rounded-lg flex items-center justify-center hover:bg-red-600 transition">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-3 cursor-pointer bg-black/30 border border-dashed border-white/20 rounded-2xl px-6 py-8 hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-bold text-muted-foreground">اضغط هنا لرفع صورة جديدة للمكتبة</span>
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </label>
            </div>

            {/* LOGIN LOGS */}
            <div className="glass-panel rounded-3xl p-8 bg-card/40 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">سجل تسجيلات الدخول</h2>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLoginLogs} disabled={logsLoading} className="border-border text-muted-foreground hover:text-foreground text-xs rounded-xl">
                  {logsLoading ? "تحديث..." : "تحديث"}
                </Button>
              </div>
              {loginLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center">لا توجد سجلات</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {loginLogs.slice(0, 10).map((log) => {
                    const isSuccess = log.success === true || log.success === 1;
                    return (
                      <div key={log.id} className="flex flex-col gap-3 p-4 rounded-xl border bg-black/20 border-white/5">
                        <div className="flex items-center gap-4">
                          {isSuccess ? <ShieldCheck className="w-5 h-5 text-green-500" /> : <ShieldX className="w-5 h-5 text-red-500" />}
                          <div className="flex-1 text-right">
                            <span className="font-bold text-sm">{log.username}</span>
                            <p className="text-[10px] text-muted-foreground" dir="ltr">{log.ipAddress}</p>
                          </div>
                          <button onClick={() => deleteLoginLog(log.id)} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* HERO SECTION */}
            <div className="glass-panel rounded-3xl p-8 bg-card/40 border border-white/5">
              <h2 className="text-xl font-bold text-foreground mb-6">محتوى القسم الرئيسي (Hero)</h2>
              {editableSection("hero", "badge", "الشارة")}
              {editableSection("hero", "headline", "العنوان الرئيسي")}
              {editableSection("hero", "subheadline", "العنوان الفرعي", true)}
              {editableSection("hero", "ctaPrimary", "زر CTA الرئيسي")}
              {editableSection("hero", "trustText", "نص الثقة")}
              {editableSection("hero", "heroCard1", "رابط صورة البطاقة 1")}
              {editableSection("hero", "heroCard2", "رابط صورة البطاقة 2")}
              <Button onClick={() => saveSection("hero")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                <Save className="w-4 h-4 ml-2" /> حفظ
              </Button>
            </div>

            {/* PRICING */}
            <div className="glass-panel rounded-3xl p-8 bg-card/40 border border-white/5">
              <h2 className="text-xl font-bold text-foreground mb-6">أسعار الباقات</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {editableSection("pricing", "basicPrice", "سعر الباقة الأساسية")}
                {editableSection("pricing", "basicFeatures", "ميزات الباقة الأساسية (كل ميزة في سطر جديد)", true)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {editableSection("pricing", "proPrice", "سعر الباقة الاحترافية")}
                {editableSection("pricing", "proFeatures", "ميزات الباقة الاحترافية (كل ميزة في سطر جديد)", true)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {editableSection("pricing", "elitePrice", "سعر باقة النخبة")}
                {editableSection("pricing", "eliteFeatures", "ميزات باقة النخبة (كل ميزة في سطر جديد)", true)}
              </div>
              <Button onClick={() => saveSection("pricing")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                <Save className="w-4 h-4 ml-2" /> حفظ
              </Button>
            </div>

            {/* PORTFOLIO */}
            <div className="glass-panel rounded-3xl p-8 bg-card/40 border border-white/5">
              <h2 className="text-xl font-bold text-foreground mb-6">صور معرض الأعمال (Portfolio)</h2>
              <p className="text-sm text-gray-400 mb-4">انسخ الروابط من الأعلى وألصقها هنا مسافة أو فاصلة بين كل رابط.</p>
              {editableSection("portfolio", "images", "روابط الصور", true)}
              <Button onClick={() => saveSection("portfolio")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                <Save className="w-4 h-4 ml-2" /> حفظ
              </Button>
            </div>

            {/* CASE STUDIES */}
            <div className="glass-panel rounded-3xl p-8 bg-card/40 border border-white/5">
              <h2 className="text-xl font-bold text-foreground mb-6">قصص نجاح صناع محتوى</h2>
              {((Array.isArray(sections.caseStudies) && sections.caseStudies.length > 0) ? sections.caseStudies : defaultCaseStudies).map((study: any, idx: number) => (
                <div key={study.id || idx} className="mb-8 border border-white/10 rounded-2xl p-6 bg-black/20 text-right">
                  <h3 className="text-lg font-bold text-primary mb-4">قصة حالة {idx + 1}</h3>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">اسم اليوتيوبر / القناة</label>
                    <Input value={study.name || ""} onChange={(e) => updateCaseStudy(idx, 'name', e.target.value)} dir="rtl" className="bg-card/50" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">المجال (Niche)</label>
                    <Input value={study.niche || ""} onChange={(e) => updateCaseStudy(idx, 'niche', e.target.value)} dir="rtl" className="bg-card/50" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">الصورة الشخصية (تظهر مكان الحرفين)</label>
                    <div className="flex items-center gap-4 flex-row-reverse justify-end">
                      <label className="flex items-center gap-2 cursor-pointer bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/30 transition border border-primary/30">
                        <Upload className="w-4 h-4" /> رفع صورة
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const fd = new FormData(); fd.append("image", file);
                          const res = await fetch(API_BASE + "/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                          if (res.ok) {
                            const data = await res.json();
                            updateCaseStudy(idx, 'avatarImage', data.url);
                            toast({ title: "تم رفع صورة صانع المحتوى بنجاح!" });
                          }
                        }} />
                      </label>
                      {study.avatarImage ? (
                        <img src={study.avatarImage} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-muted-foreground text-xs">{study.avatarInitials || "لا يوجد"}</div>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">الوصف المختصر (يظهر على البطاقة)</label>
                    <Input value={study.shortBio || ""} onChange={(e) => updateCaseStudy(idx, 'shortBio', e.target.value)} dir="rtl" className="bg-card/50" placeholder="مثال: انتقل Alex من 50 ألف إلى 500 ألف مشترك" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        رابط قناة اليوتيوب (يظهر كزر على البطاقة)
                      </span>
                    </label>
                    <Input value={study.youtubeUrl || ""} onChange={(e) => updateCaseStudy(idx, 'youtubeUrl', e.target.value)} dir="ltr" className="bg-card/50" placeholder="https://youtube.com/@channelname" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">القصة (Story)</label>
                    <Textarea value={study.story || ""} onChange={(e) => updateCaseStudy(idx, 'story', e.target.value)} dir="rtl" className="bg-card/50 min-h-24" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">إحصائيات دراسة الحالة (تظهر داخل الصفحة)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(study.metrics || []).map((metric: any, mIdx: number) => (
                        <div key={mIdx} className="p-3 bg-black/30 rounded-xl border border-white/5">
                          <label className="block text-xs text-muted-foreground mb-1">الرقم/القيمة</label>
                          <Input value={metric.value || ""} onChange={(e) => updateCaseStudyMetric(idx, mIdx, 'value', e.target.value)} dir="rtl" className="bg-card/50 mb-2 text-primary font-bold text-center" />
                          <label className="block text-xs text-muted-foreground mb-1">الوصف</label>
                          <Input value={metric.label || ""} onChange={(e) => updateCaseStudyMetric(idx, mIdx, 'label', e.target.value)} dir="rtl" className="bg-card/50 text-center" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={() => saveSection("caseStudies")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                <Save className="w-4 h-4 ml-2" /> حفظ القصص
              </Button>
            </div>

          </div>
        )}

      </main>
      {/* GLOBAL MODAL */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-foreground mb-2">{modalConfig.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{modalConfig.description}</p>
            
            {(['addClient', 'addWork', 'editOrder', 'addCode'].includes(modalConfig.type || '') || (modalConfig.type === 'banUser' && modalConfig.initialValue !== "unban")) && (
              <Input
                type={modalConfig.type === 'addClient' || modalConfig.type === 'banUser' || modalConfig.type === 'addCode' ? 'text' : 'number'}
                autoFocus
                placeholder={modalConfig.placeholder}
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitModal()}
                className="bg-black/20 border-white/10 mb-6 rounded-xl text-right"
                dir="rtl"
              />
            )}
            
            <div className="flex gap-3 justify-end mt-2">
              <Button variant="ghost" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="rounded-xl">
                إلغاء
              </Button>
              <Button 
                onClick={submitModal} 
                className={`rounded-xl font-bold text-white ${
                  ['deleteClient', 'clearBalance'].includes(modalConfig.type || '') 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                تأكيد
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

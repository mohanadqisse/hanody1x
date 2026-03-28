import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Save, Upload, Trash2, Settings, Mail, MailOpen, ChevronDown, ChevronUp, Package, User, AtSign, Clock, Inbox, Shield, ShieldCheck, ShieldX, Globe } from "lucide-react";
import { caseStudies as defaultCaseStudies } from "@/lib/data";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  service: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

interface LoginLog {
  id: number;
  username: string;
  ipAddress: string | null;
  deviceInfo: string | null;
  success: boolean | number;
  attemptedAt: string | number;
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
  const [sections, setSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [expandedMsg, setExpandedMsg] = useState<number | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchSections();
    fetchImages();
    fetchMessages();
    fetchLoginLogs();
  }, [isAuthenticated]);

  async function fetchSections() {
    const res = await fetch("/api/content/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSections(data);
    }
  }

  async function fetchImages() {
    const res = await fetch("/api/content/images");
    if (res.ok) {
      const data = await res.json();
      setImages(data);
    }
  }

  async function fetchMessages() {
    setMessagesLoading(true);
    try {
      const res = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setMessagesLoading(false);
    }
  }

  async function fetchLoginLogs() {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/auth/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLoginLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch login logs", err);
    } finally {
      setLogsLoading(false);
    }
  }

  async function deleteLoginLog(id: number) {
    try {
      const res = await fetch(`/api/auth/logs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLoginLogs(prev => prev.filter(l => l.id !== id));
        toast({ title: "تم حذف السجل" });
      } else {
        toast({ title: "خطأ في الحذف", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  }

  async function markAsRead(id: number) {
    try {
      await fetch(`/api/messages/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteMessage(id: number) {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        toast({ title: "تم حذف الرسالة" });
      }
    } catch (err) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  }

  async function saveSection(section: string) {
    setLoading(true);
    try {
      const contentToSave = section === "caseStudies" 
        ? (Array.isArray(sections.caseStudies) && sections.caseStudies.length > 0 ? sections.caseStudies : defaultCaseStudies)
        : (sections[section] || {});
        
      const res = await fetch(`/api/content/${section}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: JSON.stringify(contentToSave) }),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      toast({ title: "تم الحفظ بنجاح" });
    } catch (err) {
      toast({ title: "خطأ", description: "فشل حفظ البيانات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        await fetchImages();
        toast({ title: "تم رفع الصورة" });
      } else {
        const errorData = await res.json().catch(() => ({ message: "خطأ غير معروف" }));
        toast({ title: "خطأ في رفع الصورة", description: errorData.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ في رفع الصورة", description: "تعذر الاتصال بالخادم", variant: "destructive" });
    }
  }

  async function deleteImage(url: string) {
    const filename = url.split("/").pop();
    const res = await fetch(`/api/upload/${filename}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchImages();
      toast({ title: "تم حذف الصورة" });
    }
  }

  const updateCaseStudy = (index: number, field: string, value: string) => {
    setSections(prev => {
      const currentCaseStudies = Array.isArray(prev.caseStudies) && prev.caseStudies.length > 0 
        ? [...prev.caseStudies] 
        : [...defaultCaseStudies];
      currentCaseStudies[index] = { ...currentCaseStudies[index], [field]: value };
      return { ...prev, caseStudies: currentCaseStudies };
    });
  };

  const updateCaseStudyMetric = (studyIndex: number, metricIndex: number, field: 'label' | 'value', val: string) => {
    setSections(prev => {
      const currentCaseStudies = Array.isArray(prev.caseStudies) && prev.caseStudies.length > 0 
        ? [...prev.caseStudies] 
        : [...defaultCaseStudies];
      const study = { ...currentCaseStudies[studyIndex] };
      const metrics = [...(study.metrics || defaultCaseStudies[studyIndex]?.metrics || [])];
      metrics[metricIndex] = { ...metrics[metricIndex], [field]: val };
      study.metrics = metrics;
      currentCaseStudies[studyIndex] = study;
      return { ...prev, caseStudies: currentCaseStudies };
    });
  };

  if (!isAuthenticated) return null;

  const editableSection = (section: string, field: string, label: string, multiline = false) => (
    <div key={field} className="mb-4">
      <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
      {multiline ? (
        <Textarea
          value={sections[section]?.[field] ?? ""}
          onChange={(e) => setSections((prev) => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }))}
          className="bg-card/50 border-white/10 min-h-24 text-right"
          dir="rtl"
        />
      ) : (
        <Input
          value={sections[section]?.[field] ?? ""}
          onChange={(e) => setSections((prev) => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }))}
          className="bg-card/50 border-white/10 text-right"
          dir="rtl"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-8 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-foreground">لوحة التحكم</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => { logout(); navigate("/"); }}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        <div className="space-y-8">
          {/* ===== MESSAGES INBOX ===== */}
          <div className="glass-panel rounded-3xl p-8">
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
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMessages}
                disabled={messagesLoading}
                className="border-border text-muted-foreground hover:text-foreground text-xs"
              >
                {messagesLoading ? "جارٍ التحديث..." : "تحديث"}
              </Button>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-16">
                <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">لا توجد رسائل حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.slice().reverse().map((msg) => {
                  const isExpanded = expandedMsg === msg.id;
                  const date = new Date(typeof msg.created_at === 'number' ? msg.created_at * 1000 : msg.created_at);
                  const formattedDate = date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        msg.read
                          ? 'bg-card/30 border-border/50'
                          : 'bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.08)]'
                      }`}
                    >
                      {/* Header row - clickable */}
                      <button
                        onClick={() => {
                          setExpandedMsg(isExpanded ? null : msg.id);
                          if (!msg.read) markAsRead(msg.id);
                        }}
                        className="w-full flex items-center gap-4 p-4 text-right hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {msg.read ? (
                            <MailOpen className="w-5 h-5 text-muted-foreground/50" />
                          ) : (
                            <Mail className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            {!msg.read && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                                جديد
                              </span>
                            )}
                            {msg.service && (
                              <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground text-[10px] font-bold">
                                {packageLabels[msg.service] || msg.service}
                              </span>
                            )}
                            <span className={`font-bold text-sm truncate ${msg.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {msg.name}
                            </span>
                          </div>
                          <p className={`text-xs truncate ${msg.read ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                            {msg.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-muted-foreground/50 hidden sm:block">{formattedDate}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground/50" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground/50" />
                          )}
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-border/30 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-right bg-card/40 rounded-xl p-3">
                              <User className="w-4 h-4 text-primary flex-shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground/60 font-medium">الاسم</p>
                                <p className="text-sm text-foreground font-semibold">{msg.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-right bg-card/40 rounded-xl p-3">
                              <AtSign className="w-4 h-4 text-primary flex-shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground/60 font-medium">البريد الإلكتروني</p>
                                <p className="text-sm text-foreground font-semibold" dir="ltr">{msg.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-right bg-card/40 rounded-xl p-3">
                              <Package className="w-4 h-4 text-primary flex-shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground/60 font-medium">الباقة المختارة</p>
                                <p className="text-sm text-foreground font-semibold">{msg.service ? (packageLabels[msg.service] || msg.service) : 'لم يحدد'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-right bg-card/40 rounded-xl p-3">
                              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground/60 font-medium">تاريخ الإرسال</p>
                                <p className="text-sm text-foreground font-semibold">{formattedDate}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-card/40 rounded-xl p-4">
                            <p className="text-[10px] text-muted-foreground/60 font-medium mb-2">تفاصيل الطلب</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" dir="rtl">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-2 justify-end pt-2">
                            <a
                              href={`mailto:${msg.email}?subject=رد على طلبك - Hanody1x`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition border border-primary/30"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              رد بالبريد
                            </a>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/20 text-red-400 text-xs font-bold hover:bg-destructive/30 transition border border-destructive/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== LOGIN LOGS ===== */}
          <div className="glass-panel rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">سجل تسجيلات الدخول</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLoginLogs}
                disabled={logsLoading}
                className="border-border text-muted-foreground hover:text-foreground text-xs"
              >
                {logsLoading ? "جارٍ التحديث..." : "تحديث"}
              </Button>
            </div>

            {loginLogs.length === 0 ? (
              <div className="text-center py-16">
                <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">لا توجد سجلات دخول حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {loginLogs.map((log) => {
                  const dateValue = typeof log.attemptedAt === 'number' && log.attemptedAt < 1e12 ? log.attemptedAt * 1000 : log.attemptedAt;
                  const date = new Date(dateValue);
                  const formattedDate = date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
                  const formattedTime = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const isSuccess = log.success === true || log.success === 1;
                  
                  // Device parsing logic
                  let shortDevice = "جهاز غير معروف";
                  let DeviceIcon = Globe;
                  if (log.deviceInfo) {
                    const ua = log.deviceInfo.toLowerCase();
                    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
                      shortDevice = "هاتف محمول";
                    } else if (ua.includes("windows") || ua.includes("mac") || ua.includes("linux")) {
                      shortDevice = "جهاز كمبيوتر";
                    } else {
                      shortDevice = "متصفح ويب";
                    }
                  }

                  return (
                    <div
                      key={log.id}
                      className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all ${
                        isSuccess
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {isSuccess ? (
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                          ) : (
                            <ShieldX className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {isSuccess ? 'نجاح' : 'فشل'}
                            </span>
                            <span className="font-bold text-sm text-foreground">{log.username}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 justify-end text-xs text-muted-foreground/80 mt-2">
                            {log.deviceInfo && (
                              <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md" title={log.deviceInfo}>
                                <DeviceIcon className="w-3 h-3 text-primary/70" />
                                <span>{shortDevice}</span>
                              </span>
                            )}
                            {log.ipAddress && (
                              <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/50">IP:</span>
                                <span dir="ltr" className="font-mono text-[11px]">{log.ipAddress}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3 text-secondary/70" />
                              <span dir="ltr">{formattedTime}</span>
                            </span>
                            <span className="bg-black/20 px-2 py-1 rounded-md">
                              {formattedDate}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="flex items-center justify-center flex-shrink-0 mr-2">
                          <button
                            onClick={() => deleteLoginLog(log.id)}
                            className="p-2 rounded-xl bg-destructive/10 text-red-400 hover:bg-destructive text-xs hover:text-white transition"
                            title="حذف السجل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">صورتي المرفوعة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {images.map((url) => (
                <div key={url} className="relative group cursor-pointer" onClick={() => { navigator.clipboard?.writeText(url); toast({ title: "تم نسخ الرابط" }); }}>
                  <img src={url} alt="" className="w-full aspect-video object-cover rounded-xl" />
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteImage(url); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-destructive/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl pointer-events-none">
                    اضغط لنسخ الرابط
                  </div>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-3 cursor-pointer bg-card/50 border border-dashed border-white/20 rounded-2xl px-6 py-4 hover:border-primary/50 transition-colors w-fit">
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">رفع صورة جديدة</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            </label>
          </div>

          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">محتوى القسم الرئيسي</h2>
            {editableSection("hero", "badge", "الشارة")}
            {editableSection("hero", "headline", "العنوان الرئيسي")}
            {editableSection("hero", "subheadline", "العنوان الفرعي", true)}
            {editableSection("hero", "ctaPrimary", "زر CTA الرئيسي")}
            {editableSection("hero", "trustText", "نص الثقة")}
            {editableSection("hero", "heroCard1", "رابط صورة البطاقة 1 (اختياري - انسخ من الاعلى)")}
            {editableSection("hero", "heroCard2", "رابط صورة البطاقة 2 (اختياري - انسخ من الاعلى)")}
            <Button onClick={() => saveSection("hero")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>

          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">هوية العلامة التجارية</h2>
            {editableSection("brand", "name", "اسم العلامة")}
            {editableSection("brand", "logoLetter", "حرف الشعار")}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">الصورة الشخصية / الشعار</label>
              <div className="flex items-center gap-4 flex-row-reverse justify-end">
                <label className="flex items-center gap-2 cursor-pointer bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/30 transition border border-primary/30">
                  <Upload className="w-4 h-4" /> رفع صورة
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("image", file);
                    const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                    if (res.ok) {
                      const data = await res.json();
                      setSections((prev) => ({ ...prev, brand: { ...prev.brand, logoImage: data.url } }));
                      toast({ title: "تم رفع الصورة بنجاح!" });
                    } else {
                      const errorData = await res.json().catch(() => ({ message: "خطأ غير معروف" }));
                      toast({ title: "خطأ في رفع الصورة", description: errorData.message, variant: "destructive" });
                    }
                  }} />
                </label>
                {sections.brand?.logoImage ? (
                  <div className="relative group">
                    <img src={sections.brand.logoImage} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                    <button onClick={() => setSections((prev) => ({ ...prev, brand: { ...prev.brand, logoImage: "" } }))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-muted-foreground text-xs">لا يوجد</div>
                )}
              </div>
            </div>
            {editableSection("brand", "logoImage", "رابط صورة الشعار (يُعبأ تلقائياً عند الرفع)")}
            <Button onClick={() => saveSection("brand")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>

          <div className="glass-panel rounded-3xl p-8">
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
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>

          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">صور معرض الأعمال (Portfolio)</h2>
            <p className="text-sm text-gray-400 mb-4">انسخ الروابط من الأعلى وألصقها هنا مسافة أو فاصلة بين كل رابط.</p>
            {editableSection("portfolio", "images", "روابط الصور", true)}
            <Button onClick={() => saveSection("portfolio")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>

          <div className="glass-panel rounded-3xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">قصص نجاح يوتيوبرز</h2>
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
                  <label className="block text-sm text-gray-400 mb-2">الصورة الرمزية (محسّن)</label>
                  <div className="flex items-center gap-4 flex-row-reverse justify-end">
                    <label className="flex items-center gap-2 cursor-pointer bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/30 transition border border-primary/30">
                      <Upload className="w-4 h-4" /> إضافة صورة حقيقية
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("image", file);
                        const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                        if (res.ok) {
                          const data = await res.json();
                          updateCaseStudy(idx, 'avatarImage', data.url);
                          toast({ title: "تم رفع وتعيين الصورة بنجاح!" });
                        } else {
                          const errorData = await res.json().catch(() => ({ message: "خطأ غير معروف" }));
                          toast({ title: "خطأ في رفع الصورة", description: errorData.message, variant: "destructive" });
                        }
                      }} />
                    </label>
                    {study.avatarImage ? (
                      <div className="relative group">
                        <img src={study.avatarImage} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                        <button onClick={() => updateCaseStudy(idx, 'avatarImage', '')} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-muted-foreground text-xs">لا يوجد</div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">نبذة قصيرة</label>
                  <Textarea value={study.shortBio || ""} onChange={(e) => updateCaseStudy(idx, 'shortBio', e.target.value)} dir="rtl" className="bg-card/50 min-h-20" />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">القصة الكاملة (تظهر في صفحة دراسة الحالة)</label>
                  <Textarea value={study.story || ""} onChange={(e) => updateCaseStudy(idx, 'story', e.target.value)} dir="rtl" className="bg-card/50 min-h-32" />
                </div>

                {/* Metrics / Stats Editing */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-3 flex items-center gap-2 justify-end">
                    <span>الإحصائيات (تظهر في صفحة دراسة الحالة)</span>
                    📊
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(study.metrics || defaultCaseStudies[idx]?.metrics || []).map((metric: any, mIdx: number) => (
                      <div key={mIdx} className="bg-card/40 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="text-center">
                          <span className="text-[10px] text-muted-foreground/60 font-medium">إحصائية {mIdx + 1}</span>
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1">القيمة</label>
                          <Input 
                            value={metric.value || ""} 
                            onChange={(e) => updateCaseStudyMetric(idx, mIdx, 'value', e.target.value)} 
                            dir="rtl" 
                            className="bg-card/50 text-center font-bold text-primary"
                            placeholder="مثال: +145%"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1">التسمية</label>
                          <Input 
                            value={metric.label || ""} 
                            onChange={(e) => updateCaseStudyMetric(idx, mIdx, 'label', e.target.value)} 
                            dir="rtl" 
                            className="bg-card/50 text-center text-sm"
                            placeholder="مثال: ارتفاع معدل النقر"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={() => saveSection("caseStudies")} disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-xl w-full">
              <Save className="w-4 h-4 ml-2" />
              حفظ قصص النجاح
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

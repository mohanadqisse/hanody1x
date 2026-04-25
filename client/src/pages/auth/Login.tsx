import { API_BASE } from "@/lib/api";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useSection } from "@/hooks/useContent";
import { User, LogIn, UserPlus, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useUser();
  const [view, setView] = useState<"options" | "loginForm">("options");
  const [popup, setPopup] = useState<"guest" | "creator" | null>(null);
  const brand = useSection("brand", { logoLetter: "H", logoImage: "" } as any);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<"guest" | "user" | null>(null);
  const [banData, setBanData] = useState<{ message: string } | null>(null);
  const [isUnbanRequested, setIsUnbanRequested] = useState(false);

  const handleGuestLogin = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/users/auth/guest`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        // Store token first, then navigate
        localStorage.setItem("user_token", data.token);
        login(data.token, data.user);
        // Use setTimeout to ensure state is saved before navigation on mobile
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
    } catch (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleCreatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast({ title: "يرجى تعبئة جميع الحقول", variant: "destructive" });
    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/users/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: loginRole || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        window.location.href = "/dashboard";
      } else {
        if (res.status === 403) {
          const defaultBanMsg = "عذراً، لقد تم حظر حسابك من استخدام المنصة بشكل مؤقت أو دائم.\nنظراً لاكتشاف نشاط يتعارض مع سياسات وشروط الاستخدام الخاصة بنا، أو بسبب سوء الاستخدام لخدماتنا.\nنحن نحرص على توفير بيئة آمنة لجميع عملائنا.";
          setBanData({ message: data.message && data.message.length > 5 ? data.message : defaultBanMsg });
        } else {
          toast({ title: data.message || "فشل تسجيل الدخول", variant: "destructive" });
        }
      }
    } catch (error) {
      toast({ title: "حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 cursor-pointer hover:bg-white/10 transition-colors overflow-hidden">
              {brand?.logoImage ? (
                <img src={brand.logoImage} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black">{brand?.logoLetter || "H"}</span>
              )}
            </div>
          </Link>
          <h1 className="text-3xl font-black mb-2 tracking-tight">بوابة الدخول</h1>
          <p className="text-muted-foreground">اختر طريقة الدخول المناسبة لك</p>
        </div>

        {view === "options" && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setPopup("guest")}
              className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <User size={24} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">الدخول كزائر</h3>
                  <p className="text-sm text-muted-foreground">تصفح النظام ببيانات تجريبية</p>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setPopup("creator")}
              className="group flex items-center justify-between p-5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <LogIn size={24} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">تسجيل الدخول</h3>
                  <p className="text-sm text-primary/80">لصناع المحتوى المسجلين</p>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setLocation("/register")}
              className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <UserPlus size={24} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">إنشاء حساب</h3>
                  <p className="text-sm text-muted-foreground">عميل جديد؟ ابدأ من هنا</p>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {view === "loginForm" && (
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleCreatorLogin}
            className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 border-white/10 text-right h-12 rounded-xl"
                dir="ltr"
                placeholder="اسم المستخدم"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 border-white/10 text-right h-12 rounded-xl pl-12"
                  dir="ltr"
                  placeholder="••••••••"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setView("options")}
                className="flex-1 rounded-xl h-12"
              >
                رجوع
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 rounded-xl h-12 font-bold"
              >
                {isLoading ? "جاري الدخول..." : "تسجيل الدخول"}
              </Button>
            </div>
          </motion.form>
        )}
      </motion.div>

      {/* Popups */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card p-8 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-black mb-3">تنبيه</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                {popup === "guest" 
                  ? "أنت تدخل كزائر، بعض الميزات ستكون محدودة وتعمل ببيانات تجريبية." 
                  : "هذه الصفحة مخصصة لصناع المحتوى المسجلين فقط."}
              </p>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setPopup(null)}
                  className="flex-1 rounded-xl h-12"
                >
                  رجوع
                </Button>
                <Button 
                  onClick={() => {
                    setLoginRole(popup === "guest" ? "guest" : "user");
                    setPopup(null);
                    setView("loginForm");
                  }}
                  className="flex-1 rounded-xl h-12 font-bold"
                >
                  متابعة
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {banData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card p-8 rounded-3xl border-2 border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.4)] max-w-md w-full text-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-3xl font-black mb-4 text-red-500">تم تقييد حسابك</h2>
              {isUnbanRequested && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-xl mb-4 text-sm font-bold flex items-center justify-center gap-2">
                  <AlertCircle size={16} />
                  تم طلب إزالة الحظر، بانتظار موافقة صاحب الموقع.
                </div>
              )}
              <div className="text-muted-foreground mb-8 text-base leading-relaxed whitespace-pre-wrap px-2">
                {banData.message}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/" className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl h-12 border-white/10 hover:bg-white/5">
                    الرجوع إلى الموقع
                  </Button>
                </a>
                {!isUnbanRequested && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsUnbanRequested(true)}
                    className="flex-1 w-full rounded-xl h-12 font-bold shadow-lg shadow-red-500/20"
                  >
                    طلب إزالة الحظر
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

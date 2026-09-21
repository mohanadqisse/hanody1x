import { API_BASE } from "@/lib/api";
import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowRight, Eye, EyeOff, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const { login } = useAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "خطأ في تسجيل الدخول");
      }

      const { token } = await res.json();
      login(token);
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      toast({
        title: "خطأ",
        description: err instanceof Error ? err.message : "فشل تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen bg-[#f7f7f5] text-[#111110] selection:bg-[#111110] selection:text-white" dir="rtl">
      {/* ── SECURITY WARNING MODAL (RESTRICTED ACCESS) ── */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-md w-full bg-white border border-[#e8e8e5] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Subtle accent bar at top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-neutral-200 via-neutral-800 to-neutral-200" />

              <div className="w-16 h-16 rounded-2xl bg-[#f5f5f3] border border-[#e8e8e5] flex items-center justify-center mx-auto mb-5 text-[#111110]">
                <ShieldAlert className="w-8 h-8 text-[#111110]" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f0ed] text-[#55554e] text-xs font-semibold tracking-wider uppercase mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111110]" />
                <span>منطقة خاصة • RESTRICTED ACCESS</span>
              </div>

              <h2 className="text-2xl font-bold text-[#111110] mb-2 tracking-tight">تحذير أمني</h2>
              <p className="text-sm text-[#55554e] leading-relaxed mb-8">
                هذه الصفحة مخصصة لمالك الموقع ومسؤولي النظام فقط. محاولة الدخول غير المصرح بها مسجلة ومحمية بأنظمة الرقابة.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowWarning(false)}
                  className="w-full h-12 rounded-xl bg-[#111110] hover:bg-[#222220] active:scale-[0.99] text-white font-medium text-sm transition-all duration-150 flex items-center justify-center shadow-sm"
                >
                  أنا المالك — متابعة
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full h-10 rounded-xl text-[#777770] hover:text-[#111110] hover:bg-[#f5f5f3] text-xs font-medium transition-colors"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN ADMIN LOGIN INTERFACE (SPLIT EDITORIAL) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* RIGHT / FORM COLUMN (in RTL, first visual column) */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white relative">
          {/* Top navigation link */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#777770] hover:text-[#111110] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#f5f5f3]"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للموقع</span>
            </button>
            <span className="text-[11px] font-mono tracking-widest text-[#99998f] uppercase">
              PORTAL v3.5
            </span>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md mx-auto my-12">
            <div className="mb-8 text-right">
              <div className="w-12 h-12 rounded-2xl bg-[#f7f7f5] border border-[#e8e8e5] flex items-center justify-center mb-5 text-[#111110]">
                <Lock className="w-5 h-5 text-[#111110]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111110] mb-2">
                لوحة التحكم الإدارية
              </h1>
              <p className="text-sm text-[#55554e]">
                أدخل بيانات اعتماد المشرف للوصول إلى مركز الإدارة والعمليات.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Username field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#111110]">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="hanody"
                    {...form.register("username")}
                    disabled={loading}
                    className="w-full h-12 px-4 rounded-xl bg-white border border-[#e8e8e5] text-[#111110] placeholder-[#99998f] text-sm outline-none transition-all duration-150 focus:border-[#111110] focus:ring-1 focus:ring-[#111110] disabled:bg-[#f7f7f5] disabled:cursor-not-allowed"
                    dir="ltr"
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#111110]">
                    كلمة المرور
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...form.register("password")}
                    disabled={loading}
                    className="w-full h-12 px-4 pl-11 rounded-xl bg-white border border-[#e8e8e5] text-[#111110] placeholder-[#99998f] text-sm outline-none transition-all duration-150 focus:border-[#111110] focus:ring-1 focus:ring-[#111110] disabled:bg-[#f7f7f5] disabled:cursor-not-allowed"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99998f] hover:text-[#111110] transition-colors p-1"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-xl bg-[#111110] hover:bg-[#222220] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التحقق...
                  </span>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#f0f0ed] text-center">
              <p className="text-[11px] text-[#99998f] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111110]" />
                اتصال آمن ومشفّر بدرجة حماية عالية
              </p>
            </div>
          </div>

          {/* Bottom subtle copyright */}
          <div className="text-center text-[11px] text-[#99998f]">
            © {new Date().getFullYear()} MUHANAD STUDIO. ALL RIGHTS RESERVED.
          </div>
        </div>

        {/* LEFT / EDITORIAL BRAND PANEL (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 bg-[#f7f7f5] border-r border-[#e8e8e5] flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#111110 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111110]" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#111110] uppercase">
                MUHANAD • ADMIN
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#777770] bg-white border border-[#e8e8e5] px-3 py-1 rounded-full">
              SECURE WORKSPACE
            </span>
          </div>

          {/* Center Editorial Manifesto */}
          <div className="relative z-10 my-auto py-12 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e8e8e5] text-xs font-semibold text-[#111110] mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#111110]" />
              <span>لوحة الإدارة الحصرية</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-[#111110] leading-tight tracking-tight mb-5">
              إدارة احترافية شاملة لأعمال واستوديو الصور المصغرة.
            </h2>

            <p className="text-sm text-[#55554e] leading-relaxed mb-8">
              تحكم بمرونة كاملة في إدارة طلبات العملاء، مراجعات التصاميم بدقة، متابعة أوقات العمل، وإدارة المحتوى والتقييمات بكل سلاسة وأمان.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#e8e8e5] p-4 rounded-2xl shadow-xs">
                <span className="text-xs text-[#99998f] block mb-1">الرقابة والأمان</span>
                <span className="text-sm font-bold text-[#111110]">مراقبة مستمرة</span>
              </div>
              <div className="bg-white border border-[#e8e8e5] p-4 rounded-2xl shadow-xs">
                <span className="text-xs text-[#99998f] block mb-1">بيانات الاستوديو</span>
                <span className="text-sm font-bold text-[#111110]">مزامنة فورية</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Details */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-[#777770] border-t border-[#e8e8e5] pt-6">
            <span>منصة الإدارة والتحكم</span>
            <span className="font-mono">ENCRYPTED // SESSION</span>
          </div>
        </div>
      </div>
    </div>
  );
}

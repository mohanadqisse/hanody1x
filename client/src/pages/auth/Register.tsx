import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useUser();
  
  const [popup, setPopup] = useState<boolean>(true);
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (role: "user" | "guest", e?: React.FormEvent) => {
    e?.preventDefault();
    if (!fullName || !username || !email || !password || !confirmPassword) {
      return toast({ title: "يرجى تعبئة جميع الحقول", variant: "destructive" });
    }
    if (password !== confirmPassword) {
      return toast({ title: "كلمات المرور غير متطابقة", variant: "destructive" });
    }
    if (password.length < 6) {
      return toast({ title: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
    }

    if (username.includes(" ") || !/^[A-Za-z0-9_]+$/.test(username)) {
      return toast({ title: "اسم المستخدم يجب أن يحتوي على حروف إنجليزية وأرقام فقط (بدون مسافات)", variant: "destructive" });
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return toast({ title: "كلمة المرور ضعيفة: يجب أن تحتوي على حرف إنجليزي كبير، حرف صغير، ورقم", variant: "destructive" });
    }

    if (role === "user" && !inviteCode) {
      setShowInviteModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/users/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, email, password, role, inviteCode })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        toast({ title: "تم إنشاء الحساب بنجاح!" });
        setLocation("/dashboard");
      } else {
        toast({ title: data.message || "فشل إنشاء الحساب", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: popup ? 0 : 1, y: popup ? 20 : 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2 tracking-tight">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground">قم بإنشاء حسابك لإدارة أعمالك بسهولة</p>
        </div>

        <motion.form
          onSubmit={(e) => e.preventDefault()}
          className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-black/20 border-white/10 text-right h-12 rounded-xl"
              placeholder="مثال: محمد أحمد"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/20 border-white/10 text-right h-12 rounded-xl"
              dir="ltr"
              placeholder="email@example.com"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/20 border-white/10 text-right h-12 rounded-xl"
              dir="ltr"
              placeholder="username"
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
          <div>
            <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
          <div className="pt-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <Button 
                type="button" 
                onClick={(e) => handleRegister("guest", e)}
                disabled={isLoading}
                variant="outline"
                className="flex-1 rounded-xl h-12 font-bold border-white/20 hover:bg-white/10"
              >
                {isLoading ? "جاري..." : "إنشاء حساب كزائر"}
              </Button>
              <Button 
                type="button" 
                onClick={(e) => handleRegister("user", e)}
                disabled={isLoading}
                className="flex-1 rounded-xl h-12 font-bold bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? "جاري..." : "إنشاء كصانع محتوى"}
              </Button>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setLocation("/login")}
              className="w-full rounded-xl h-12"
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </Button>
          </div>
        </motion.form>
      </motion.div>

      {/* Popup */}
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
                هذه الصفحة مخصصة لصناع المحتوى لإنشاء حساب جديد.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/")}
                  className="flex-1 rounded-xl h-12"
                >
                  رجوع
                </Button>
                <Button 
                  onClick={() => setPopup(false)}
                  className="flex-1 rounded-xl h-12 font-bold"
                >
                  متابعة
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showInviteModal && (
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
              <h2 className="text-xl font-black mb-3">كود صانع المحتوى</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                أدخل كود صانع المحتوى لإنشاء الحساب
              </p>
              
              <Input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="bg-black/20 border-white/10 text-center h-12 rounded-xl mb-6 text-lg font-mono tracking-widest"
                dir="ltr"
                placeholder="الكود"
                autoFocus
              />

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 rounded-xl h-12"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={(e) => {
                    setShowInviteModal(false);
                    handleRegister("user", e as any);
                  }}
                  className="flex-1 rounded-xl h-12 font-bold bg-primary text-white"
                  disabled={!inviteCode}
                >
                  تأكيد
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

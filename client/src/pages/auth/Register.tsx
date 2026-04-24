import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { AlertCircle } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useUser();
  
  const [popup, setPopup] = useState<boolean>(true);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      return toast({ title: "يرجى تعبئة جميع الحقول", variant: "destructive" });
    }
    if (password !== confirmPassword) {
      return toast({ title: "كلمات المرور غير متطابقة", variant: "destructive" });
    }
    if (password.length < 6) {
      return toast({ title: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/users/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
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
          onSubmit={handleRegister}
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">كلمة المرور</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/20 border-white/10 text-right h-12 rounded-xl"
              dir="ltr"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black/20 border-white/10 text-right h-12 rounded-xl"
              dir="ltr"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full rounded-xl h-12 font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "جاري الإنشاء..." : "إنشاء حساب"}
            </Button>
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
      </AnimatePresence>
    </div>
  );
}

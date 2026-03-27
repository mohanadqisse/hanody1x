import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowRight, Eye, EyeOff, ShieldAlert } from "lucide-react";
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
      const res = await fetch("/api/auth/login", {
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
    <div className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden">
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full glass-panel p-8 rounded-3xl text-center border-destructive/20 shadow-[-10px_0_40px_rgba(255,0,0,0.1),10px_0_40px_rgba(255,0,0,0.1)]"
            >
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-4">تحذير أمني</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                هذه الصفحة مخصصة لمالك الموقع فقط. محاولة الدخول غير المصرح بها مسجلة.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setShowWarning(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-white-keep rounded-xl py-6 font-bold text-lg"
                >
                  أنا المالك - متابعة
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  العودة للرئيسية
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button  
        variant="ghost" 
        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowRight className="w-4 h-4 ml-2" />
        العودة للرئيسية
      </Button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white-keep" />
          </div>
          <h1 className="text-2xl font-black text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-2">تسجيل الدخول للإدارة</p>
        </div>

        <div className="glass-panel rounded-3xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} className="bg-card/50 border-white/10 text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••" 
                          {...field} 
                          className="bg-card/50 border-white/10 text-right pl-10" 
                          dir="rtl"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white-keep rounded-xl py-6 font-bold text-lg">
                {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

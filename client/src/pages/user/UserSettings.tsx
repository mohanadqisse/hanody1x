import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Lock, Camera } from "lucide-react";

export default function UserSettings() {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsContent, setSettingsContent] = useState<any>(null);

  useEffect(() => {
    // Fetch dynamic texts
    fetch("/api/users/dashboard/settings-content")
      .then(res => res.json())
      .then(data => setSettingsContent(data))
      .catch(() => {});
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === "guest") {
      return toast({ title: "هذه الميزة غير متاحة للزوار", variant: "destructive" });
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("/api/users/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName, avatar, password: password || undefined })
      });
      
      if (res.ok) {
        updateUser({ fullName, avatar });
        setPassword("");
        toast({ title: settingsContent?.updateSuccessMessage || "تم تحديث بياناتك بنجاح ✅" });
      } else {
        toast({ title: "حدث خطأ أثناء التحديث", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "حدث خطأ أثناء التحديث", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-black">إعدادات الحساب</h2>
        <p className="text-muted-foreground mt-1">قم بتحديث معلوماتك الشخصية وصورتك وكلمة المرور.</p>
      </div>

      <Card className="bg-card border-white/5">
        <CardContent className="p-6">
          <form onSubmit={handleUpdate} className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-black overflow-hidden border-2 border-primary/30">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : fullName.charAt(0)}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="text-white" />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium mb-2">رابط الصورة الشخصية</label>
                <Input 
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-black/20 border-white/10 rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <UserIcon size={16} /> الاسم الكامل
                </label>
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-black/20 border-white/10 rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Lock size={16} /> كلمة المرور الجديدة
                </label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="اتركه فارغاً إذا لم ترد تغييره"
                  className="bg-black/20 border-white/10 rounded-xl h-12"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground mt-2">يجب أن تكون 6 أحرف على الأقل في حال أردت تغييرها.</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="rounded-xl h-12 px-8 font-bold"
              >
                {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

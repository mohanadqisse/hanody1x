import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Lock, Camera, Image as ImageIcon, Upload } from "lucide-react";

export default function UserSettings() {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsContent, setSettingsContent] = useState<any>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fd = new FormData();
    fd.append("image", file);
    
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setAvatar(data.url);
        toast({ title: "تم رفع الصورة بنجاح!" });
      } else {
        toast({ title: "حدث خطأ أثناء رفع الصورة", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "حدث خطأ أثناء رفع الصورة", variant: "destructive" });
    }
    setShowImageOptions(false);
  };

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

      <div className="bg-card border border-white/5 rounded-xl shadow-sm">
        <div className="p-6">
          <form onSubmit={handleUpdate} className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5 relative">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-black overflow-hidden border-2 border-primary/30 relative">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : fullName.charAt(0)}
                </div>
                <div 
                  onClick={() => setShowImageOptions(!showImageOptions)}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <Camera className="text-white" />
                </div>

                {/* Dropdown Options */}
                {showImageOptions && (
                  <div className="absolute top-full mt-2 w-40 bg-card border border-white/10 rounded-xl shadow-xl z-10 right-1/2 translate-x-1/2 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                    {avatar && (
                      <a 
                        href={avatar} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={() => setShowImageOptions(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <ImageIcon size={16} /> عرض الصورة
                      </a>
                    )}
                    <div 
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5 transition-colors cursor-pointer text-primary"
                    >
                      <Upload size={16} /> تعديل الصورة
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-1">تغيير الصورة الشخصية</h3>
                <p className="text-sm text-muted-foreground">قم بالنقر على الصورة لاختيار وتعديل صورتك الشخصية.</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
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
        </div>
      </div>
    </div>
  );
}

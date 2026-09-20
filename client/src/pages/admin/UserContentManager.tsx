import { API_BASE } from "@/lib/api";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Plus, Trash2, Image as ImageIcon, CreditCard, Bell, Settings, Upload, Camera } from "lucide-react";

export default function UserContentManager({ user, onBack, token }: { user: any, onBack: () => void, token: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'transactions' | 'notifications' | 'settings'>('thumbnails');
  
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for new items
  const [newThumb, setNewThumb] = useState({ title: "", image: "", status: "قيد التنفيذ", downloadUrl: "", notes: "", price: "" });
  const [newTrans, setNewTrans] = useState({ description: "", amount: "", status: "pending" });
  const [newNotif, setNewNotif] = useState({ message: "" });
  
  // States for settings
  const [settings, setSettings] = useState({ fullName: user.fullName || "", avatar: user.avatar || "", password: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [user.id, activeTab]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'thumbnails') {
        const res = await fetch(API_BASE + `/api/dashboard/users/${user.id}/thumbnails`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setThumbnails(await res.json());
      } else if (activeTab === 'transactions') {
        const res = await fetch(API_BASE + `/api/dashboard/users/${user.id}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setTransactions(await res.json());
      } else if (activeTab === 'notifications') {
        const res = await fetch(API_BASE + `/api/dashboard/users/${user.id}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setNotifications(await res.json());
      }
    } catch (e) {
      toast({ title: "حدث خطأ في تحميل بيانات المستخدم", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch(API_BASE + "/api/upload", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setter(data.url);
        toast({ title: "تم رفع الصورة بنجاح!" });
      } else {
        toast({ title: "حدث خطأ أثناء رفع الصورة", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "حدث خطأ أثناء رفع الصورة", variant: "destructive" });
    }
    setIsUploading(false);
  };

  // --- Thumbnails ---
  const addThumbnail = async () => {
    if (!newThumb.title || !newThumb.image) return toast({ title: "يرجى تعبئة العنوان والصورة", variant: "destructive" });
    try {
      const res = await fetch(API_BASE + "/api/dashboard/thumbnails", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, ...newThumb })
      });
      if (res.ok) {
        toast({ title: "تم إضافة الثمنيل" });
        setNewThumb({ title: "", image: "", status: "قيد التنفيذ", downloadUrl: "", notes: "", price: "" });
        fetchUserData();
      }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const updateThumbnail = async (id: number, field: string, value: string | number) => {
    try {
      await fetch(API_BASE + `/api/dashboard/thumbnails/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value })
      });
      fetchUserData();
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const deleteThumbnail = async (id: number) => {
    try {
      await fetch(API_BASE + `/api/dashboard/thumbnails/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchUserData();
      toast({ title: "تم الحذف" });
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  // --- Transactions ---
  const addTransaction = async () => {
    if (!newTrans.description || !newTrans.amount) return toast({ title: "يرجى تعبئة الوصف والمبلغ", variant: "destructive" });
    try {
      const res = await fetch(API_BASE + "/api/dashboard/transactions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, ...newTrans })
      });
      if (res.ok) {
        toast({ title: "تم إضافة الفاتورة" });
        setNewTrans({ description: "", amount: "", status: "pending" });
        fetchUserData();
      }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const updateTransaction = async (id: number, field: string, value: string | number) => {
    try {
      await fetch(API_BASE + `/api/dashboard/transactions/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value })
      });
      fetchUserData();
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await fetch(API_BASE + `/api/dashboard/transactions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchUserData();
      toast({ title: "تم الحذف" });
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  // --- Notifications ---
  const addNotification = async () => {
    if (!newNotif.message) return toast({ title: "يرجى كتابة الرسالة", variant: "destructive" });
    try {
      const res = await fetch(API_BASE + "/api/dashboard/notifications", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, message: newNotif.message })
      });
      if (res.ok) {
        toast({ title: "تم إرسال الإشعار" });
        setNewNotif({ message: "" });
        fetchUserData();
      }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const deleteNotification = async (id: number) => {
    try {
      await fetch(API_BASE + `/api/dashboard/notifications/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchUserData();
      toast({ title: "تم الحذف" });
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  // --- Settings ---
  const updateSettings = async () => {
    if (!settings.fullName) return toast({ title: "الاسم مطلوب", variant: "destructive" });
    try {
      const res = await fetch(API_BASE + `/api/dashboard/users/${user.id}/settings`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast({ title: "تم تحديث الإعدادات بنجاح" });
        setSettings({ ...settings, password: "" });
      }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const statusOptions = [
    "في انتظار التنفيذ",
    "قيد التنفيذ",
    "تم التنفيذ",
    "تم التسليم"
  ];

  return (
    <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-black overflow-hidden border border-primary/30 shrink-0">
            {settings.avatar ? <img src={settings.avatar} className="w-full h-full object-cover" /> : user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground mb-1">
              إدارة حساب: <span className="text-primary">{user.fullName}</span>
            </h2>
            <p className="text-sm text-muted-foreground">قم بإدارة الثمنيلات، الفواتير، الإشعارات، والإعدادات.</p>
          </div>
        </div>
        <Button onClick={onBack} variant="outline" className="rounded-xl border-white/10 shrink-0">
          الرجوع للقائمة <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        <button onClick={() => setActiveTab('thumbnails')} className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'thumbnails' ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'}`}>
          <ImageIcon className="w-4 h-4 inline-block mr-2 ml-1" /> الثمنيلات
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'transactions' ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'}`}>
          <CreditCard className="w-4 h-4 inline-block mr-2 ml-1" /> الفواتير والمدفوعات
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'notifications' ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'}`}>
          <Bell className="w-4 h-4 inline-block mr-2 ml-1" /> الإشعارات
        </button>
        <button onClick={() => setActiveTab('settings')} className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'settings' ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'}`}>
          <Settings className="w-4 h-4 inline-block mr-2 ml-1" /> الإعدادات
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">جاري التحميل...</div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* THUMBNAILS TAB */}
          {activeTab === 'thumbnails' && (
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="space-y-4 mb-6">
                {thumbnails.map(t => (
                  <div key={t.id} className="bg-card p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <Input value={t.title} onChange={e => updateThumbnail(t.id, 'title', e.target.value)} className="bg-black/30 h-8 text-sm" placeholder="عنوان العمل" />
                      <Button size="sm" variant="destructive" onClick={() => deleteThumbnail(t.id)} className="h-8 w-8 p-0 shrink-0"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <Input value={t.image} onChange={e => updateThumbnail(t.id, 'image', e.target.value)} placeholder="رابط الصورة" className="bg-black/30 h-8 text-xs flex-1" dir="ltr" />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 shrink-0 relative overflow-hidden text-xs"
                          disabled={isUploading}
                        >
                          {isUploading ? "جاري الرفع..." : <Upload className="w-3 h-3 mr-1 ml-1" />}
                          {!isUploading && "رفع صورة"}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleImageUpload(e, (url) => updateThumbnail(t.id, 'image', url))}
                          />
                        </Button>
                      </div>
                      <select 
                        value={t.status} 
                        onChange={e => updateThumbnail(t.id, 'status', e.target.value)}
                        className="bg-black/30 border border-input rounded-md px-2 text-xs h-8 text-foreground"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <Input value={t.downloadUrl || ""} onChange={e => updateThumbnail(t.id, 'downloadUrl', e.target.value)} placeholder="رابط التحميل عالي الجودة" className="bg-black/30 h-8 text-xs" dir="ltr" />
                    <div className="flex gap-2">
                      <Input type="number" value={t.price || 0} onChange={e => updateThumbnail(t.id, 'price', parseInt(e.target.value))} placeholder="السعر ($)" className="bg-black/30 h-8 text-xs w-24" dir="ltr" />
                      <Input value={t.notes || ""} onChange={e => updateThumbnail(t.id, 'notes', e.target.value)} placeholder="ملاحظات (تظهر للعميل)" className="bg-black/30 h-8 text-xs flex-1" />
                    </div>
                  </div>
                ))}
                {thumbnails.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا يوجد ثمنيلات</p>}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <h4 className="text-sm font-bold text-muted-foreground">إضافة ثمنيل جديد</h4>
                <Input placeholder="العنوان" value={newThumb.title} onChange={e => setNewThumb({...newThumb, title: e.target.value})} className="bg-black/20" />
                <div className="flex gap-2">
                  <Input placeholder="رابط الصورة (أو ارفع من الجهاز ->)" value={newThumb.image} onChange={e => setNewThumb({...newThumb, image: e.target.value})} className="bg-black/20 flex-1" dir="ltr" />
                  <Button 
                    variant="outline" 
                    className="shrink-0 relative overflow-hidden"
                    disabled={isUploading}
                  >
                    {isUploading ? "جاري الرفع..." : <Upload className="w-4 h-4 mr-2" />}
                    {!isUploading && "رفع من الجهاز"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleImageUpload(e, (url) => setNewThumb({...newThumb, image: url}))}
                    />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={newThumb.status} 
                    onChange={e => setNewThumb({...newThumb, status: e.target.value})}
                    className="bg-black/20 border border-input rounded-xl px-3 text-sm h-10 text-foreground w-1/3"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <Input type="number" placeholder="السعر ($)" value={newThumb.price} onChange={e => setNewThumb({...newThumb, price: e.target.value})} className="bg-black/20 w-1/3" dir="ltr" />
                  <Button onClick={addThumbnail} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl">
                    <Plus className="w-4 h-4 ml-2" /> إضافة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="space-y-4 mb-6">
                {transactions.map(t => (
                  <div key={t.id} className="bg-card p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <Input value={t.description} onChange={e => updateTransaction(t.id, 'description', e.target.value)} className="bg-black/30 h-8 text-sm" />
                      <Button size="sm" variant="destructive" onClick={() => deleteTransaction(t.id)} className="h-8 w-8 p-0 shrink-0"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex gap-2">
                      <Input type="number" value={t.amount} onChange={e => updateTransaction(t.id, 'amount', parseInt(e.target.value))} className="bg-black/30 h-8 text-xs w-24" dir="ltr" />
                      <select 
                        value={t.status} 
                        onChange={e => updateTransaction(t.id, 'status', e.target.value)}
                        className="bg-black/30 border border-input rounded-md px-2 text-xs h-8 text-foreground flex-1"
                      >
                        <option value="pending">غير مدفوع (Pending)</option>
                        <option value="paid">مدفوع (Paid)</option>
                      </select>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا يوجد فواتير</p>}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <h4 className="text-sm font-bold text-muted-foreground">إضافة فاتورة جديدة</h4>
                <Input placeholder="وصف الفاتورة" value={newTrans.description} onChange={e => setNewTrans({...newTrans, description: e.target.value})} className="bg-black/20" />
                <div className="flex gap-2">
                  <Input type="number" placeholder="المبلغ ($)" value={newTrans.amount} onChange={e => setNewTrans({...newTrans, amount: e.target.value})} className="bg-black/20" dir="ltr" />
                  <Button onClick={addTransaction} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl">
                    <Plus className="w-4 h-4 ml-2" /> إضافة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="space-y-4 mb-6">
                {notifications.map(n => (
                  <div key={n.id} className="bg-card p-4 rounded-xl border border-white/5 flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString('ar-JO')}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => deleteNotification(n.id)} className="h-8 w-8 p-0 shrink-0"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا يوجد إشعارات</p>}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <h4 className="text-sm font-bold text-muted-foreground">إرسال إشعار جديد</h4>
                <div className="flex gap-2">
                  <Input placeholder="اكتب رسالتك هنا..." value={newNotif.message} onChange={e => setNewNotif({message: e.target.value})} className="bg-black/20 flex-1" />
                  <Button onClick={addNotification} className="shrink-0 bg-primary hover:bg-primary/90 text-white rounded-xl">
                    إرسال
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-black overflow-hidden border-2 border-primary/30">
                    {settings.avatar ? <img src={settings.avatar} className="w-full h-full object-cover" /> : settings.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div 
                    onClick={() => settingsFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Camera className="text-white w-6 h-6" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={settingsFileInputRef} 
                    onChange={(e) => handleImageUpload(e, (url) => setSettings({...settings, avatar: url}))}
                    className="hidden" 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">تغيير الصورة الشخصية</h3>
                  <p className="text-sm text-muted-foreground">انقر على الصورة لرفع صورة جديدة</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                  <Input 
                    value={settings.fullName}
                    onChange={(e) => setSettings({...settings, fullName: e.target.value})}
                    className="bg-black/30 border-white/10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
                  <Input 
                    type="password"
                    value={settings.password}
                    onChange={(e) => setSettings({...settings, password: e.target.value})}
                    placeholder="اتركه فارغاً إذا لم ترد تغييره"
                    className="bg-black/30 border-white/10 rounded-xl"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">سيتم تغيير كلمة المرور للمستخدم عند الحفظ.</p>
                </div>
                <div className="pt-2">
                  <Button onClick={updateSettings} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl font-bold px-8">
                    حفظ الإعدادات
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

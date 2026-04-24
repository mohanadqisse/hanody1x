import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Plus, Trash2, Image as ImageIcon, CreditCard, Save } from "lucide-react";

export default function UserContentManager({ user, onBack, token }: { user: any, onBack: () => void, token: string }) {
  const { toast } = useToast();
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New thumbnail state
  const [newThumb, setNewThumb] = useState({ title: "", image: "", status: "قيد العمل", downloadUrl: "", notes: "" });
  
  // New transaction state
  const [newTrans, setNewTrans] = useState({ description: "", amount: "", status: "pending" });

  useEffect(() => {
    fetchUserData();
  }, [user.id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [tRes, trRes] = await Promise.all([
        fetch(`/api/dashboard/users/${user.id}/thumbnails`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/dashboard/users/${user.id}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (tRes.ok) setThumbnails(await tRes.json());
      if (trRes.ok) setTransactions(await trRes.json());
    } catch (e) {
      toast({ title: "حدث خطأ في تحميل بيانات المستخدم", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addThumbnail = async () => {
    if (!newThumb.title || !newThumb.image) return toast({ title: "يرجى تعبئة العنوان ورابط الصورة", variant: "destructive" });
    try {
      const res = await fetch("/api/dashboard/thumbnails", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, ...newThumb })
      });
      if (res.ok) {
        toast({ title: "تم إضافة الثمنيل" });
        setNewThumb({ title: "", image: "", status: "قيد العمل", downloadUrl: "", notes: "" });
        fetchUserData();
      }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const updateThumbnail = async (id: number, field: string, value: string) => {
    try {
      await fetch(`/api/dashboard/thumbnails/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value })
      });
      fetchUserData();
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const deleteThumbnail = async (id: number) => {
    try {
      await fetch(`/api/dashboard/thumbnails/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchUserData();
      toast({ title: "تم الحذف" });
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const addTransaction = async () => {
    if (!newTrans.description || !newTrans.amount) return toast({ title: "يرجى تعبئة الوصف والمبلغ", variant: "destructive" });
    try {
      const res = await fetch("/api/dashboard/transactions", {
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
      await fetch(`/api/dashboard/transactions/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value })
      });
      fetchUserData();
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await fetch(`/api/dashboard/transactions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchUserData();
      toast({ title: "تم الحذف" });
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
  };

  return (
    <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
            إدارة حساب: <span className="text-primary">{user.fullName}</span>
          </h2>
          <p className="text-sm text-muted-foreground">هنا يمكنك التحكم في الثمنيلات والفواتير التي يراها صانع المحتوى.</p>
        </div>
        <Button onClick={onBack} variant="outline" className="rounded-xl border-white/10 shrink-0">
          الرجوع للقائمة <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Thumbnails Manager */}
          <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="text-primary w-5 h-5" /> الثمنيلات
            </h3>
            
            <div className="space-y-4 mb-6">
              {thumbnails.map(t => (
                <div key={t.id} className="bg-card p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Input value={t.title} onChange={e => updateThumbnail(t.id, 'title', e.target.value)} className="bg-black/30 h-8 text-sm" />
                    <Button size="sm" variant="destructive" onClick={() => deleteThumbnail(t.id)} className="h-8 w-8 p-0 shrink-0"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex gap-2">
                    <Input value={t.image} onChange={e => updateThumbnail(t.id, 'image', e.target.value)} placeholder="رابط الصورة" className="bg-black/30 h-8 text-xs flex-1" dir="ltr" />
                    <select 
                      value={t.status} 
                      onChange={e => updateThumbnail(t.id, 'status', e.target.value)}
                      className="bg-black/30 border border-input rounded-md px-2 text-xs h-8 text-foreground"
                    >
                      <option value="قيد العمل">قيد العمل</option>
                      <option value="تم التسليم">تم التسليم</option>
                      <option value="بانتظار المراجعة">بانتظار المراجعة</option>
                    </select>
                  </div>
                  <Input value={t.downloadUrl || ""} onChange={e => updateThumbnail(t.id, 'downloadUrl', e.target.value)} placeholder="رابط التحميل عالي الجودة" className="bg-black/30 h-8 text-xs" dir="ltr" />
                  <Input value={t.notes || ""} onChange={e => updateThumbnail(t.id, 'notes', e.target.value)} placeholder="ملاحظات (تظهر للعميل)" className="bg-black/30 h-8 text-xs" />
                </div>
              ))}
              {thumbnails.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا يوجد ثمنيلات</p>}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="text-sm font-bold text-muted-foreground">إضافة ثمنيل جديد</h4>
              <Input placeholder="العنوان" value={newThumb.title} onChange={e => setNewThumb({...newThumb, title: e.target.value})} className="bg-black/20" />
              <Input placeholder="رابط الصورة" value={newThumb.image} onChange={e => setNewThumb({...newThumb, image: e.target.value})} className="bg-black/20" dir="ltr" />
              <Button onClick={addThumbnail} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl">
                <Plus className="w-4 h-4 ml-2" /> إضافة
              </Button>
            </div>
          </div>

          {/* Transactions Manager */}
          <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="text-primary w-5 h-5" /> الفواتير والمدفوعات
            </h3>
            
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

        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock } from "lucide-react";

export default function Billing() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await fetch("/api/users/dashboard/billing", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setTransactions(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBilling();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="loader" /></div>;

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const paid = transactions.filter(t => t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
  const remaining = total - paid;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black">الحسابات والفوترة</h2>
          <p className="text-muted-foreground mt-1">تابع الدفعات والمبالغ المتبقية</p>
        </div>
        <Button className="rounded-xl font-bold gap-2">
          <FileText size={18} /> تحميل كملف PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-white/5 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-1">المبلغ الإجمالي</p>
            <h3 className="text-3xl font-black">${total}</h3>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-sm opacity-80 mb-1">تم دفعه</p>
            <h3 className="text-3xl font-black">${paid}</h3>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-sm opacity-80 mb-1">المبلغ المتبقي</p>
            <h3 className="text-3xl font-black">${remaining}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 font-bold text-muted-foreground">التاريخ</th>
                <th className="p-4 font-bold text-muted-foreground">الوصف</th>
                <th className="p-4 font-bold text-muted-foreground">المبلغ</th>
                <th className="p-4 font-bold text-muted-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={t.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">{new Date(t.date || t.createdAt).toLocaleDateString('ar-JO')}</td>
                  <td className="p-4 font-medium">{t.description}</td>
                  <td className="p-4 font-bold text-lg">${t.amount}</td>
                  <td className="p-4">
                    {t.status === "paid" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-500">
                        <CheckCircle size={14} /> مدفوع
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-500">
                        <Clock size={14} /> معلق
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    لا توجد عمليات مسجلة بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

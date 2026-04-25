import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock } from "lucide-react";

export default function Billing() {
  const { user } = useUser();
    const [transactions, setTransactions] = useState<any[]>([]);
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await fetch(API_BASE + "/api/users/dashboard/billing", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // If the backend isn't updated yet or returns array, handle gracefully
          if (Array.isArray(data)) {
            setTransactions(data);
          } else {
            setTransactions(data.transactions || []);
            setThumbnails(data.thumbnails || []);
          }
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

  const total = thumbnails.reduce((sum, t) => sum + (t.price || 0), 0) + (thumbnails.length === 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) : 0);
  const paid = transactions.filter(t => t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
  const remaining = total - paid;

  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Arabic Font Support (using a basic embedded font trick or simply English/Romanized for now if a specific font isn't loaded)
    // To support Arabic properly, we need to load an Arabic font. For simplicity, we can use default fonts, but they might not render Arabic well.
    // However, jspdf-autotable handles basic tables. We will write English or simple text if Arabic is corrupted, but we will try.
    
    doc.setFontSize(22);
    doc.text("Invoice - " + (user?.fullName || "Creator"), 14, 20);
    
    doc.setFontSize(12);
    doc.text("Date: " + new Date().toLocaleDateString(), 14, 30);
    
    doc.setFontSize(16);
    doc.text("Thumbnails & Work", 14, 45);
    
    const thumbData = thumbnails.map(t => [
      t.title, 
      new Date(t.createdAt).toLocaleDateString(), 
      t.status, 
      "$" + (t.price || 0)
    ]);
    
    (doc as any).autoTable({
      startY: 50,
      head: [["Thumbnail Name", "Date", "Status", "Price"]],
      body: thumbData.length ? thumbData : [["No thumbnails", "-", "-", "-"]],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    let finalY = (doc as any).lastAutoTable.finalY || 50;
    
    doc.setFontSize(16);
    doc.text("Payments & Transactions", 14, finalY + 15);
    
    const transData = transactions.map(t => [
      t.description,
      new Date(t.date || t.createdAt).toLocaleDateString(),
      t.status === "paid" ? "Paid" : "Pending",
      "$" + t.amount
    ]);
    
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [["Description", "Date", "Status", "Amount"]],
      body: transData.length ? transData : [["No payments", "-", "-", "-"]],
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
    });
    
    finalY = (doc as any).lastAutoTable.finalY || finalY + 20;
    
    doc.setFontSize(14);
    doc.text("Summary", 14, finalY + 15);
    
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [["Total Owed", "Total Paid", "Remaining Balance"]],
      body: [["$" + total, "$" + paid, "$" + remaining]],
      theme: 'plain',
      styles: { fontSize: 12, fontStyle: 'bold' }
    });
    
    doc.save(`Invoice_${user?.fullName || 'Creator'}.pdf`);
  };
return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black">الحسابات والفوترة</h2>
          <p className="text-muted-foreground mt-1">تابع الدفعات والمبالغ المتبقية</p>
        </div>
        <Button onClick={handleDownloadPDF} className="rounded-xl font-bold gap-2">
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

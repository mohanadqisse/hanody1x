import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      const element = document.getElementById("invoice-template");
      if (!element) return;
      
      element.style.display = "block";
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      element.style.display = "none";
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${user?.fullName || 'Creator'}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
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

      {/* Hidden Invoice Template for PDF */}
      <div id="invoice-template" style={{ display: 'none', position: 'absolute', top: 0, left: 0, zIndex: -100, width: '800px', padding: '40px', backgroundColor: '#0f0f13', color: '#fff', direction: 'rtl', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2a2a35', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', margin: 0, color: '#3b82f6' }}>فاتورة حساب</h1>
            <p style={{ margin: '5px 0 0', color: '#9ca3af' }}>صانع المحتوى: {user?.fullName}</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>التاريخ: {new Date().toLocaleDateString('ar-JO')}</p>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: '1px solid #2a2a35', paddingBottom: '10px', marginBottom: '15px' }}>الأعمال والثمنيلات</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e1e24' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #3b82f6' }}>عنوان العمل</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #3b82f6' }}>التاريخ</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #3b82f6' }}>الحالة</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #3b82f6' }}>السعر</th>
              </tr>
            </thead>
            <tbody>
              {thumbnails.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                  <td style={{ padding: '12px' }}>{t.title}</td>
                  <td style={{ padding: '12px' }}>{new Date(t.createdAt).toLocaleDateString('ar-JO')}</td>
                  <td style={{ padding: '12px' }}>{t.status}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>${t.price || 0}</td>
                </tr>
              ))}
              {thumbnails.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>لا يوجد أعمال مسجلة</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: '1px solid #2a2a35', paddingBottom: '10px', marginBottom: '15px' }}>سجل الفواتير والمدفوعات</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e1e24' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #10b981' }}>الوصف</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #10b981' }}>التاريخ</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #10b981' }}>الحالة</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #10b981' }}>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                  <td style={{ padding: '12px' }}>{t.description}</td>
                  <td style={{ padding: '12px' }}>{new Date(t.date || t.createdAt).toLocaleDateString('ar-JO')}</td>
                  <td style={{ padding: '12px' }}>{t.status === 'paid' ? 'مدفوع' : 'غير مدفوع'}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>${t.amount}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>لا يوجد مدفوعات مسجلة</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '50px', backgroundColor: '#1e1e24', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ color: '#9ca3af', margin: '0 0 5px' }}>المبلغ الإجمالي</p>
            <h3 style={{ fontSize: '24px', margin: 0 }}>${total}</h3>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ color: '#9ca3af', margin: '0 0 5px' }}>تم سداده</p>
            <h3 style={{ fontSize: '24px', margin: 0, color: '#10b981' }}>${paid}</h3>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 20px', backgroundColor: '#ef444420', borderRadius: '8px', border: '1px solid #ef444450', flex: 1 }}>
            <p style={{ color: '#ef4444', margin: '0 0 5px', fontSize: '14px' }}>المبلغ المتبقي</p>
            <h3 style={{ fontSize: '28px', margin: 0, color: '#ef4444' }}>${remaining}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

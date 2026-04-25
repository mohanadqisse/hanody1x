import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, MessageSquare, Star, Send, X } from "lucide-react";

export default function Thumbnails() {
  const { user } = useUser();
  const { toast } = useToast();
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");

  // Comment/Rating modals
  const [commentThumbId, setCommentThumbId] = useState<number | null>(null);
  const [ratingThumbId, setRatingThumbId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("user_token") : "";

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const res = await fetch(API_BASE + "/api/users/dashboard/thumbnails", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setThumbnails(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThumbnails();
  }, []);

  const filtered = thumbnails.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "الكل" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Comments ---
  const openComments = async (thumbId: number) => {
    setCommentThumbId(thumbId);
    setCommentText("");
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCommentsList(await res.json());
    } catch (e) { console.error(e); }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !commentThumbId) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${commentThumbId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText })
      });
      if (res.ok) {
        const newComment = await res.json();
        setCommentsList([newComment, ...commentsList]);
        setCommentText("");
        toast({ title: "تم إرسال التعليق بنجاح ✅" });
      }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
    setSubmitting(false);
  };

  // --- Ratings ---
  const openRating = async (thumbId: number) => {
    setRatingThumbId(thumbId);
    setSelectedRating(0);
    setExistingRating(null);
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${thumbId}/rating`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSelectedRating(data.rating);
          setExistingRating(data.rating);
        }
      }
    } catch (e) { console.error(e); }
  };

  const submitRating = async () => {
    if (!selectedRating || !ratingThumbId) return;
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE + `/api/users/dashboard/thumbnails/${ratingThumbId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: selectedRating })
      });
      if (res.ok) {
        setExistingRating(selectedRating);
        toast({ title: `تم التقييم بنجاح! ⭐ ${selectedRating}/5` });
        setRatingThumbId(null);
      }
    } catch (e) { toast({ title: "حدث خطأ", variant: "destructive" }); }
    setSubmitting(false);
  };

  // --- Download ---
  const handleDownload = (thumb: any) => {
    const url = thumb.downloadUrl || thumb.image;
    if (!url) {
      toast({ title: "رابط التحميل غير متاح حالياً", variant: "destructive" });
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = thumb.title || "thumbnail";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="loader" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-black">معرض الثمنيلات</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="ابحث عن تصميم..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-black/20 border-white/10 rounded-xl"
            />
          </div>
          <select 
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="الكل">الكل</option>
            <option value="في انتظار التنفيذ">في انتظار التنفيذ</option>
            <option value="قيد التنفيذ">قيد التنفيذ</option>
            <option value="تم التنفيذ">تم التنفيذ</option>
            <option value="تم التسليم">تم التسليم</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((thumb, i) => (
          <motion.div
            key={thumb.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-3xl overflow-hidden border border-white/5 group"
          >
            <div className="aspect-video bg-black/40 relative overflow-hidden">
              <img 
                src={thumb.image} 
                alt={thumb.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Button 
                  onClick={() => handleDownload(thumb)}
                  variant="secondary" 
                  size="sm" 
                  className="rounded-xl font-bold bg-white text-black hover:bg-gray-200"
                >
                  <Download className="ml-2 w-4 h-4" /> تحميل بأعلى جودة
                </Button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{thumb.title}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(thumb.createdAt).toLocaleDateString('ar-JO')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-bold whitespace-nowrap ${
                  thumb.status === 'تم التسليم' ? 'bg-green-500/20 text-green-500' :
                  thumb.status === 'تم التنفيذ' ? 'bg-blue-500/20 text-blue-500' :
                  thumb.status === 'قيد التنفيذ' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {thumb.status}
                </span>
              </div>
              
              {thumb.notes && (
                <div className="bg-white/5 p-3 rounded-xl mb-4">
                  <p className="text-sm text-gray-300">ملاحظات: {thumb.notes}</p>
                </div>
              )}

              <div className="flex gap-2 border-t border-white/5 pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 rounded-xl bg-white/5 hover:bg-white/10"
                  onClick={() => openComments(thumb.id)}
                >
                  <MessageSquare className="w-4 h-4 ml-2" /> تعليق
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-amber-500 hover:text-amber-400"
                  onClick={() => openRating(thumb.id)}
                >
                  <Star className="w-4 h-4 ml-2" /> تقييم
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground bg-white/5 rounded-3xl border border-white/5">
            لا توجد ثمنيلات تطابق بحثك.
          </div>
        )}
      </div>

      {/* ====== Comment Modal ====== */}
      <AnimatePresence>
        {commentThumbId !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCommentThumbId(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> التعليقات
                </h3>
                <button onClick={() => setCommentThumbId(null)} className="text-muted-foreground hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {commentsList.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">لا توجد تعليقات بعد. كن أول من يعلق!</p>
                )}
                {commentsList.map(c => (
                  <div key={c.id} className={`p-3 rounded-xl ${c.isAdmin ? 'bg-primary/10 border border-primary/20' : 'bg-white/5'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.isAdmin ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/70'}`}>
                        {c.isAdmin ? '🛡️ المدير' : c.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('ar-JO')}</span>
                    </div>
                    <p className="text-sm">{c.content}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب تعليقك هنا..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                    className="bg-black/30 border-white/10 rounded-xl flex-1"
                  />
                  <Button 
                    onClick={submitComment} 
                    disabled={submitting || !commentText.trim()}
                    className="rounded-xl bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== Rating Modal ====== */}
      <AnimatePresence>
        {ratingThumbId !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRatingThumbId(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2">قيّم هذا العمل</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {existingRating ? `تقييمك الحالي: ${existingRating}/5 ⭐ - يمكنك تغييره` : 'اختر تقييمك من 1 إلى 5 نجوم'}
              </p>
              
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="transition-all duration-200 hover:scale-125"
                  >
                    <Star 
                      className={`w-10 h-10 transition-colors ${
                        star <= selectedRating 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-white/20 hover:text-amber-400/50'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setRatingThumbId(null)} 
                  className="flex-1 rounded-xl border-white/10"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={submitRating} 
                  disabled={submitting || !selectedRating}
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  {submitting ? 'جاري الإرسال...' : 'تأكيد التقييم'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

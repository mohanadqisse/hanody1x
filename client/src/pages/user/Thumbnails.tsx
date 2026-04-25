import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter, MessageSquare, Star } from "lucide-react";

export default function Thumbnails() {
  const { user } = useUser();
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const token = localStorage.getItem("user_token");
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
            <option value="تم التسليم">تم التسليم</option>
            <option value="قيد العمل">قيد العمل</option>
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
                <Button variant="secondary" size="sm" className="rounded-xl font-bold bg-white text-black hover:bg-gray-200">
                  <Download className="ml-2 w-4 h-4" /> تحميل النسخة المفتوحة
                </Button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{thumb.title}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(thumb.createdAt).toLocaleDateString('ar-JO')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-bold whitespace-nowrap ${thumb.status === 'تم التسليم' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                  {thumb.status}
                </span>
              </div>
              
              {thumb.notes && (
                <div className="bg-white/5 p-3 rounded-xl mb-4">
                  <p className="text-sm text-gray-300">ملاحظات: {thumb.notes}</p>
                </div>
              )}

              <div className="flex gap-2 border-t border-white/5 pt-4">
                <Button variant="ghost" size="sm" className="flex-1 rounded-xl bg-white/5 hover:bg-white/10">
                  <MessageSquare className="w-4 h-4 ml-2" /> تعليق
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-amber-500 hover:text-amber-400">
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
    </div>
  );
}

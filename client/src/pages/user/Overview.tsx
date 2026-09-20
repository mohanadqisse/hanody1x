import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { Image as ImageIcon, CreditCard, Wallet, Calendar } from "lucide-react";

export default function Overview() {
  const { user } = useUser();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await fetch(API_BASE + "/api/users/dashboard/overview", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    return <div className="flex items-center justify-center h-full"><div className="loader" /></div>;
  }

  const { stats, recentWork } = data;
  const isGuest = user?.role === "guest";

  const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    useEffect(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }, [text]);
    return <span>{displayedText}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-black overflow-hidden shadow-lg border border-primary/30"
        >
          {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.fullName.charAt(0)}
        </motion.div>
        <div>
          <motion.h1 
            whileHover={{ color: "rgb(59 130 246)" }} // blue-500 hover color
            className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-2 cursor-default transition-colors duration-300"
          >
            مرحباً، <span className="text-primary"><TypewriterText text={user?.fullName || ""} /></span> 👋
          </motion.h1>
          <p className="text-muted-foreground mt-1">إليك ملخص سريع لأعمالك وحساباتك.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "إجمالي التصاميم", value: stats.totalThumbnails, icon: <ImageIcon size={24} />, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "تصاميم هذا الشهر", value: stats.monthlyThumbnails, icon: <Calendar size={24} />, color: "text-green-500", bg: "bg-green-500/10" },
          { title: "المبلغ المدفوع", value: `$${stats.paidAmount}`, icon: <Wallet size={24} />, color: "text-primary", bg: "bg-primary/10" },
          { title: "المبلغ المتبقي", value: `$${stats.remainingAmount}`, icon: <CreditCard size={24} />, color: "text-red-500", bg: "bg-red-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="border border-white/5 bg-card hover:bg-white/5 transition-colors overflow-hidden relative rounded-xl shadow-sm">
              {isGuest && <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><span className="text-xs bg-black/80 px-2 py-1 rounded text-white font-bold">للمسجلين فقط</span></div>}
              <div className="p-6 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="border border-white/5 bg-card overflow-hidden relative rounded-xl shadow-sm">
          {isGuest && <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><span className="text-sm bg-black/80 px-3 py-1.5 rounded-lg text-white font-bold">متاح بعد إنشاء حساب</span></div>}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">معدل الإنجاز الشهري</h3>
              <span className="text-sm font-bold bg-primary/20 text-primary px-3 py-1 rounded-full">
                {stats.monthlyThumbnails} / 30
              </span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(stats.monthlyThumbnails / 30) * 100}%` }} />
            </div>
            <p className="text-sm text-muted-foreground mt-3">لقد أنجزت {stats.monthlyThumbnails} تصاميم هذا الشهر من أصل 30 مستهدفة.</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Work */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-bold mb-4">آخر الأعمال المنجزة</h3>
        <div className="space-y-3">
          {recentWork.map((work: any, i: number) => (
            <div key={work.id} className="bg-card border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h4 className="font-bold">{work.title}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(work.createdAt).toLocaleDateString('ar-JO')}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                work.status === 'تم التسليم' ? 'bg-green-500/20 text-green-500' :
                work.status === 'تم التنفيذ' ? 'bg-blue-500/20 text-blue-500' :
                work.status === 'قيد التنفيذ' ? 'bg-amber-500/20 text-amber-500' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {work.status}
              </span>
            </div>
          ))}
          {recentWork.length === 0 && (
            <div className="text-center py-8 text-muted-foreground bg-white/5 rounded-2xl">
              لا توجد أعمال منجزة بعد
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

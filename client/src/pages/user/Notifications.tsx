import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { Bell, CheckCircle, MessageSquare, Image as ImageIcon } from "lucide-react";

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await fetch(API_BASE + "/api/users/dashboard/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setNotifications(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="loader" /></div>;

  const getIcon = (type?: string) => {
    if (type === 'comment') return <MessageSquare size={18} className="text-blue-500" />;
    if (type === 'thumbnail') return <ImageIcon size={18} className="text-green-500" />;
    return <Bell size={18} className="text-primary" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Bell className="text-primary" /> الإشعارات
        </h2>
        <p className="text-muted-foreground mt-1">تابع آخر التحديثات والرسائل من الإدارة.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card p-5 rounded-2xl border ${notif.read ? 'border-white/5 opacity-70' : 'border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]'} flex gap-4`}
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center">
              {getIcon(notif.type)}
            </div>
            <div className="flex-1">
              <p className={`text-sm md:text-base ${notif.read ? 'text-muted-foreground' : 'font-bold text-white'}`}>
                {notif.message}
              </p>
              <span className="text-xs text-muted-foreground mt-2 block">
                {new Date(notif.createdAt).toLocaleString('ar-JO')}
              </span>
            </div>
            {!notif.read && (
              <div className="shrink-0 flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            )}
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <CheckCircle size={32} />
            </div>
            <p className="text-muted-foreground text-lg">لا توجد إشعارات جديدة</p>
          </div>
        )}
      </div>
    </div>
  );
}

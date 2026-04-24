import { useState, useEffect } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Image as ImageIcon, CreditCard, 
  Settings, LogOut, Bell, Menu, X, CheckCircle, Clock, Home 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Sub-pages imports
import Overview from "./Overview";
import Thumbnails from "./Thumbnails";
import Billing from "./Billing";
import UserSettings from "./UserSettings";
import Notifications from "./Notifications";

export default function UserDashboard() {
  const { user, logout, isAuthenticated, isLoading } = useUser();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading || !isAuthenticated || !user) return null;

  const isGuest = user.role === "guest";

  const navLinks = [
    { name: "نظرة عامة", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "الثمنيلات", path: "/dashboard/thumbnails", icon: <ImageIcon size={20} /> },
    { name: "الفواتير", path: "/dashboard/billing", icon: <CreditCard size={20} /> },
    { name: "الإشعارات", path: "/dashboard/notifications", icon: <Bell size={20} /> },
    { name: "الإعدادات", path: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row-reverse font-sans" dir="rtl">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-white/5 relative z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{isGuest ? "زائر تجريبي" : "صانع محتوى"}</p>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-card border-l border-white/5 p-6 flex flex-col z-30
              ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
          >
            <div className="hidden md:flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold overflow-hidden shadow-lg border border-primary/30">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-lg text-white">{user.fullName}</h3>
                <p className="text-sm text-primary">{isGuest ? "زائر تجريبي" : "صانع محتوى"}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              {navLinks.map((link) => {
                const isActive = location === link.path || (link.path !== "/dashboard" && location.startsWith(link.path));
                return (
                  <Link key={link.path} href={link.path}>
                    <div 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200
                      ${isActive 
                        ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2 pt-4 border-t border-white/5">
              <a
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-blue-400 hover:bg-blue-500/10 transition-colors font-bold"
              >
                <Home size={20} />
                <span>الرجوع إلى الموقع</span>
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors font-bold"
              >
                <LogOut size={20} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Guest Banner */}
        {isGuest && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2 text-amber-500 font-bold">
              <span className="text-xl">⚠️</span>
              <p className="text-sm sm:text-base">أنت حالياً في وضع التجربة (Demo)، هذه البيانات غير حقيقية.</p>
            </div>
            <Link href="/register">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-black whitespace-nowrap rounded-xl">
                إنشاء حساب الآن
              </Button>
            </Link>
          </div>
        )}

        <div className="p-4 md:p-8 flex-1">
          <Switch>
            <Route path="/dashboard" component={Overview} />
            <Route path="/dashboard/thumbnails" component={Thumbnails} />
            <Route path="/dashboard/billing" component={Billing} />
            <Route path="/dashboard/notifications" component={Notifications} />
            <Route path="/dashboard/settings" component={UserSettings} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

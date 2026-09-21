import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { AdminProvider } from "@/contexts/AdminContext";
import { UserProvider } from "@/contexts/UserContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Work from "@/pages/Work";
import CaseStudy from "@/pages/CaseStudy";
import AdminLogin from "@/pages/admin/AdminLogin";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NotFound from "@/pages/not-found";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));

/* ─────────────────────────────────────────────
   Per-route page titles
   Keeps the browser tab accurate on every navigation.
───────────────────────────────────────────── */
const ROUTE_TITLES: Record<string, string> = {
  "/":                 "MUHANAD — Thumbnail Designer",
  "/work":             "MUHANAD — Selected Work",
  "/login":            "MUHANAD — Client Login",
  "/register":         "MUHANAD — Create Account",
  "/admin":            "MUHANAD — Admin",
  "/admin/dashboard":  "MUHANAD — Admin Dashboard",
};

function useDynamicTitle() {
  const [location] = useLocation();

  useEffect(() => {
    // Match exact routes first, then prefix-match for nested paths
    const exact = ROUTE_TITLES[location];
    if (exact) {
      document.title = exact;
      return;
    }
    // Nested patterns
    if (location.startsWith("/case-study/")) {
      document.title = "MUHANAD — Case Study";
      return;
    }
    if (location.startsWith("/dashboard")) {
      document.title = "MUHANAD — Dashboard";
      return;
    }
    if (location.startsWith("/admin")) {
      document.title = "MUHANAD — Admin";
      return;
    }
    // Default fallback — never shows old title
    document.title = "MUHANAD — Thumbnail Designer";
  }, [location]);
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <AdminProvider>
        <UserProvider>
          <AppContent isLoading={isLoading} />
        </UserProvider>
      </AdminProvider>
    </LanguageProvider>
  );
}

function AppContent({ isLoading }: { isLoading: boolean }) {
  // Update document.title on every route change
  useDynamicTitle();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              overflow: 'hidden',
              willChange: 'opacity',
            }}
          >
            {/* Custom Spinner Loader */}
            <svg viewBox="0 0 240 240" height="240" width="240" className="pl">
              <circle strokeLinecap="round" strokeDashoffset="-330" strokeDasharray="0 660" strokeWidth="20" stroke="#000" fill="none" r="105" cy="120" cx="120" className="pl__ring pl__ring--a" />
              <circle strokeLinecap="round" strokeDashoffset="-110" strokeDasharray="0 220" strokeWidth="20" stroke="#000" fill="none" r="35" cy="120" cx="120" className="pl__ring pl__ring--b" />
              <circle strokeLinecap="round" strokeDasharray="0 440" strokeWidth="20" stroke="#000" fill="none" r="70" cy="120" cx="85" className="pl__ring pl__ring--c" />
              <circle strokeLinecap="round" strokeDasharray="0 440" strokeWidth="20" stroke="#000" fill="none" r="70" cy="120" cx="155" className="pl__ring pl__ring--d" />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Switch>
                <Route path="/admin" component={AdminLogin} />
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/dashboard/*" component={UserDashboard} />
                <Route path="/dashboard" component={UserDashboard} />
                <Route>
                  {/* Public pages — wrapped in .pub for light theme scoping */}
                  <div className="pub" dir="ltr">
                    <Navbar />
                    <Switch>
                      <Route path="/" component={Home} />
                      <Route path="/work" component={Work} />
                      <Route path="/case-study/:id" component={CaseStudy} />
                      <Route component={NotFound} />
                    </Switch>
                    <Footer />
                  </div>
                </Route>
              </Switch>
            </Suspense>
            <Toaster />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

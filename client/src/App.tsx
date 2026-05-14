import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { AdminProvider } from "@/contexts/AdminContext";
import { UserProvider } from "@/contexts/UserContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import CaseStudy from "@/pages/CaseStudy";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import UserDashboard from "@/pages/user/UserDashboard";
import NotFound from "@/pages/not-found";

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
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ touchAction: 'manipulation', overscrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
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
              background: 'hsl(220 20% 4%)',
              overflow: 'hidden',
              willChange: 'opacity',
            }}
          >
            {/* Ambient glow */}
            <div style={{
              position: 'absolute',
              width: '50vw',
              height: '50vw',
              maxWidth: '400px',
              maxHeight: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, hsla(217,91%,55%,0.10) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }} />

            {/* 3D Cube Loader */}
            <div className="cube-loader" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Switch>
              <Route path="/admin" component={AdminLogin} />
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/dashboard/*" component={UserDashboard} />
              <Route path="/dashboard" component={UserDashboard} />
              <Route>
                <>
                  <Navbar />
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/case-study/:id" component={CaseStudy} />
                    <Route component={NotFound} />
                  </Switch>
                  <Footer />
                </>
              </Route>
            </Switch>
            <Toaster />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;


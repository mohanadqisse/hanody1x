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
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
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
            }}
          >
            {/* Ambient glow */}
            <div style={{
              position: 'absolute',
              width: '40vw',
              height: '40vw',
              maxWidth: '400px',
              maxHeight: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, hsla(217,91%,55%,0.12) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }} />

            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  borderRadius: '50%',
                  border: '1.5px solid transparent',
                  borderTopColor: 'hsla(217,91%,55%,0.6)',
                  borderRightColor: 'hsla(217,91%,55%,0.15)',
                }}
              />
              {/* Inner glow circle */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, hsla(217,91%,55%,0.15) 0%, hsla(200,90%,55%,0.08) 100%)',
                border: '1px solid hsla(217,91%,55%,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px hsla(217,91%,55%,0.15), inset 0 0 20px hsla(217,91%,55%,0.05)',
              }}>
                <span style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: 'hsla(217,91%,75%,0.9)',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Inter', 'Cairo', sans-serif",
                }}>H</span>
              </div>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                marginTop: '32px',
                width: '120px',
                height: '2px',
                borderRadius: '1px',
                background: 'hsla(217,91%,55%,0.1)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent 0%, hsla(217,91%,55%,0.6) 50%, transparent 100%)',
                }}
              />
            </motion.div>
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


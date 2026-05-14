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

            {/* Original Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="loader-container"
              style={{
                width: '10rem',
                height: '10rem',
                filter: 'drop-shadow(0 0 30px hsla(217,91%,55%,0.2))',
              }}
            >
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <path pathLength="360" d="M 56.3752 2 H 7.6248 C 7.2797 2 6.9999 2.268 6.9999 2.5985 V 61.4015 C 6.9999 61.7321 7.2797 62 7.6248 62 H 56.3752 C 56.7203 62 57.0001 61.7321 57.0001 61.4015 V 2.5985 C 57.0001 2.268 56.7203 2 56.3752 2 Z"></path>
                <path pathLength="360" d="M 55.7503 60.803 H 8.2497 V 3.1971 H 55.7503 V 60.803 Z"></path>
                <path pathLength="360" d="M 29.7638 47.6092 C 29.4971 47.3997 29.1031 47.4368 28.8844 47.6925 C 28.6656 47.9481 28.7046 48.3253 28.9715 48.5348 L 32.8768 51.6023 C 32.9931 51.6936 33.1333 51.738 33.2727 51.738 C 33.4533 51.738 33.6328 51.6634 33.7562 51.519 C 33.975 51.2634 33.936 50.8862 33.6692 50.6767 L 29.7638 47.6092 Z"></path>
                <path pathLength="360" d="M 42.3557 34.9046 C 38.4615 34.7664 36.9617 37.6749 36.7179 39.2213 L 35.8587 44.2341 C 35.8029 44.5604 36.0335 44.8681 36.374 44.9218 C 36.4084 44.9272 36.4424 44.9299 36.476 44.9299 C 36.7766 44.9299 37.0415 44.7214 37.0918 44.4281 L 37.9523 39.4076 C 37.9744 39.2673 38.544 35.9737 42.311 36.1007 C 42.6526 36.1124 42.9454 35.8544 42.9577 35.524 C 42.9702 35.1937 42.7006 34.9164 42.3557 34.9046 Z"></path>
                <path pathLength="360" d="M 13.1528 55.5663 C 13.1528 55.8968 13.4326 56.1648 13.7777 56.1648 H 50.2223 C 50.5674 56.1648 50.8472 55.8968 50.8472 55.5663 V 8.4339 C 50.8472 8.1034 50.5674 7.8354 50.2223 7.8354 H 13.7777 C 13.4326 7.8354 13.1528 8.1034 13.1528 8.4339 V 55.5663 Z"></path>
                <path pathLength="360" d="M 25.3121 26.5567 C 24.9717 27.4941 25.0042 28.8167 25.0634 29.5927 C 23.6244 29.8484 20.3838 31.0913 18.9478 37.0352 C 18.5089 37.5603 17.8746 38.1205 17.2053 38.7114 C 16.2598 39.546 15.2351 40.4515 14.4027 41.5332 V 20.5393 H 23.7222 C 23.7178 22.6817 24.1666 25.4398 25.3121 26.5567 Z"></path>
                <path pathLength="360" d="M 49.5975 43.4819 C 48.3838 39.1715 46.3138 33.6788 43.4709 29.7736 C 42.6161 28.5995 40.7095 27.0268 39.6852 26.1818 L 39.6352 26.1405 C 39.4176 24.783 39.1158 22.5803 38.8461 20.5394 H 49.5976 V 43.4819 Z"></path>
              </svg>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                marginTop: '24px',
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


import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSection } from "@/hooks/useContent";

export function Navbar() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [location] = useLocation();
  const brand = useSection("brand", { logoLetter: "H", logoImage: "" } as any);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const isHome = location === "/";

  const scrollTo = (id: string) => {
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { name: "الخدمات", id: "services", mobileHidden: false },
    { name: "قصص النجاح", id: "showcase", mobileHidden: false },
    { name: "معرض الأعمال", id: "portfolio", mobileHidden: false },
    { name: "لوحة التحكم", href: "/admin", mobileHidden: false },
  ];

  return (
    <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-4 pointer-events-none w-full">
      
      {/* Unified Nav Pill */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex pointer-events-auto items-center p-1.5 md:p-1.5 rounded-full bg-[#1c1c1e]/95 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl w-auto sm:w-max max-w-[96%] sm:max-w-full mx-auto"
        dir="rtl"
      >
        <div className="flex items-center justify-between w-full sm:w-auto gap-0 sm:gap-1 px-0.5">
          {/* Close/Icon on the right side in RTL (start) */}
          <Link href="/">
            <div className="w-7 h-7 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#2c2c2e] border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mr-0 sm:mr-1 overflow-hidden">
              {brand?.logoImage ? (
                <img src={brand.logoImage} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-0 sm:gap-1 mx-0.5 sm:mx-2 relative" onMouseLeave={() => setHoveredIdx(null)}>
            {navLinks.map((link, idx) => (
              <div 
                key={link.name}
                onMouseEnter={() => setHoveredIdx(idx)}
                onClick={() => {
                  if (link.href) window.location.href = link.href;
                  else scrollTo(link.id!);
                }}
                className={`relative px-1.5 sm:px-5 py-1 sm:py-2.5 rounded-full cursor-pointer z-10 shrink-0 transition-all ${link.mobileHidden ? "hidden sm:block" : "block"}`}
              >
                {hoveredIdx === idx && (
                  <motion.div
                    layoutId="pill-hover"
                    className="absolute inset-0 bg-white/10 rounded-full z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  />
                )}
                <span className={`relative z-10 text-[9px] sm:text-[14px] font-semibold transition-colors duration-200 whitespace-nowrap ${hoveredIdx === idx ? 'text-white' : 'text-gray-400'}`}>
                  {link.name}
                </span>
              </div>
            ))}
          </div>

          <label className="theme-toggle cursor-pointer m-0 ml-1.5 sm:ml-3 transform scale-[0.5] sm:scale-[0.8] origin-left sm:origin-right shrink-0 -mr-[18px] sm:mr-0" aria-label="تبديل المظهر">
            <span className="sun"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#ffd43b"><circle r="5" cy="12" cx="12"></circle><path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path></g></svg></span>
            <span className="moon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path></svg></span>
            <input type="checkbox" className="theme-toggle-input" checked={isDark} onChange={toggleTheme} />
            <span className="slider"></span>
          </label>
          <button 
            onClick={() => scrollTo("order")} 
            className="hidden sm:block shrink-0 bg-white text-black px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-bold shadow-lg hover:scale-105 transition-transform duration-200 ml-0 sm:ml-1 whitespace-nowrap"
          >
            اطلب الآن
          </button>
        </div>
      </motion.nav>
    </header>
  );
}

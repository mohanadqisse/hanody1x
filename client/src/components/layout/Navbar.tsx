import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSection } from "@/hooks/useContent";

const defaultBrand = { name: "Hanody1x", logoLetter: "H", logoImage: "" };

export function Navbar() {
  const brand = useSection("brand", defaultBrand as any);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    // Initialize theme based on document class
    setIsDark(document.documentElement.classList.contains("dark"));
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    setMobileMenuOpen(false);
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { name: "الخدمات", id: "services" },
    { name: "قصص النجاح", id: "showcase" },
    { name: "معرض الأعمال", id: "portfolio" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-4" : "py-6"}`}>
      <div className="absolute inset-0 bg-background/50 backdrop-blur-xl border-b border-border pointer-events-none" />
      <div className="container mx-auto px-6 relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tighter text-foreground hover:text-primary transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center overflow-hidden">
              {brand.logoImage ? (
                <img src={brand.logoImage} alt={brand.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-black">{brand.logoLetter}</span>
              )}
            </div>
            {brand.name}
          </Link>
        </div>

        <div className="flex items-center gap-4 dir-ltr">
        <nav className="hidden md:flex items-center gap-8" dir="rtl">
          {navLinks.map((link) => (
            <button key={link.name} onClick={() => scrollTo(link.id)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {link.name}
            </button>
          ))}
          <Button onClick={() => scrollTo("order")} className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 font-semibold">
            اطلب الآن
          </Button>
        </nav>


        <label className="theme-toggle cursor-pointer" aria-label="تبديل المظهر">
          <span className="sun"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#ffd43b"><circle r="5" cy="12" cx="12"></circle><path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path></g></svg></span>
          <span className="moon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path></svg></span>
          <input type="checkbox" className="theme-toggle-input" checked={isDark} onChange={toggleTheme} />
          <span className="slider"></span>
        </label>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-foreground mr-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-card border-b border-border p-6 flex flex-col gap-4 shadow-2xl md:hidden"
          >
            {navLinks.map((link) => (
              <button key={link.name} onClick={() => scrollTo(link.id)} className="text-right text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.name}
              </button>
            ))}
            <Button onClick={() => scrollTo("order")} className="bg-primary text-white hover:bg-primary/90 rounded-full font-semibold w-full">
              اطلب الآن
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

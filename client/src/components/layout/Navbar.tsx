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

        <Link href="/admin" className="text-sm font-semibold text-foreground/70 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 px-4 py-2 rounded-xl transition-all border border-border md:mr-4">
          لوحة التحكم
        </Link>
        
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-border flex items-center justify-center text-foreground focus:outline-none transition-colors"
          aria-label="تبديل المظهر"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

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

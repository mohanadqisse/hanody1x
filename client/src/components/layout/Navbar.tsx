import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home",         href: "/" },
  { label: "Work",         href: "/work" },
  { label: "About",        href: "/#about" },
  { label: "Contact",      href: "/#contact" },
];

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const scrollToSection = (id: string) => {
    if (location !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      scrollToSection(id);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Desktop pill nav */}
      <div className="hidden md:flex justify-center pt-6 px-6">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`flex items-center gap-1 px-2 py-2 rounded-full border transition-all duration-300 ${
            scrolled
              ? "bg-white/95 border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl"
              : "bg-white/80 border-black/8 backdrop-blur-md"
          }`}
        >
          {/* Brand */}
          <Link href="/">
            <span className="px-4 py-2 text-sm font-black tracking-[0.08em] uppercase text-black hover:text-black/70 transition-colors cursor-pointer">
              MUHANAD
            </span>
          </Link>

          <div className="w-px h-5 bg-black/10 mx-1" />

          {/* Nav links */}
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? location === "/" : location === link.href;
            if (link.href.startsWith("/#")) {
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-black bg-black/5"
                      : "text-black/50 hover:text-black hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </button>
              );
            }
            return (
              <Link key={link.label} href={link.href}>
                <span
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer block ${
                    isActive
                      ? "text-black bg-black/5"
                      : "text-black/50 hover:text-black hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}

          <div className="w-px h-5 bg-black/10 mx-1" />

          {/* Client Login CTA */}
          <Link href="/login">
            <span className="px-5 py-2 rounded-full text-sm font-semibold bg-black text-white hover:bg-black/80 transition-colors cursor-pointer block whitespace-nowrap">
              Client Login
            </span>
          </Link>
        </motion.nav>
      </div>

      {/* Mobile header */}
      <div
        className={`md:hidden flex items-center justify-between px-5 py-4 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "bg-white/95 backdrop-blur-xl border-b border-black/8 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <Link href="/">
          <span className="text-sm font-black tracking-[0.08em] uppercase text-black cursor-pointer">
            MUHANAD
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-black text-white cursor-pointer">
              Client Login
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-black"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={18} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden bg-white/98 border-b border-black/8 backdrop-blur-xl px-5 pb-5 pt-2"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                if (link.href.startsWith("/#")) {
                  return (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.href)}
                      className="text-left px-4 py-3 rounded-xl text-sm font-medium text-black/70 hover:text-black hover:bg-black/5 transition-colors"
                    >
                      {link.label}
                    </button>
                  );
                }
                return (
                  <Link key={link.label} href={link.href}>
                    <span
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-black/70 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

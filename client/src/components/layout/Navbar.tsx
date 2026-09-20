import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Desktop Wide Rounded Container */}
      <div className="hidden md:flex justify-center pt-5 px-6 lg:px-10 w-full">
        <motion.nav
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`w-full max-w-6xl flex items-center justify-between px-7 py-3 rounded-full border transition-all duration-300 ${
            scrolled
              ? "bg-white/95 border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl"
              : "bg-white/90 border-black/8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-md"
          }`}
        >
          {/* Brand */}
          <Link href="/">
            <span className="text-sm lg:text-base font-black tracking-[0.14em] uppercase text-black hover:text-black/70 transition-colors cursor-pointer select-none">
              MUHANAD
            </span>
          </Link>

          {/* Navigation Links — with shared hover pill */}
          <div className="flex items-center gap-6 lg:gap-8">
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoveredLink(null)}
            >
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? location === "/" : location === link.href;
                const isHovered = hoveredLink === link.label;

                if (link.href.startsWith("/#")) {
                  return (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.href)}
                      onMouseEnter={() => setHoveredLink(link.label)}
                      className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                      style={{
                        color: isActive
                          ? "#000"
                          : isHovered
                          ? "#000"
                          : "rgba(0,0,0,0.5)",
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {/* Animated background pill */}
                      {(isActive || isHovered) && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full"
                          style={{
                            backgroundColor: isActive
                              ? "rgba(0,0,0,0.06)"
                              : "rgba(0,0,0,0.04)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                            mass: 0.8,
                          }}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </button>
                  );
                }

                return (
                  <Link key={link.label} href={link.href}>
                    <button
                      onMouseEnter={() => setHoveredLink(link.label)}
                      className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer"
                      style={{
                        color: isActive
                          ? "#000"
                          : isHovered
                          ? "#000"
                          : "rgba(0,0,0,0.5)",
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {(isActive || isHovered) && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full"
                          style={{
                            backgroundColor: isActive
                              ? "rgba(0,0,0,0.06)"
                              : "rgba(0,0,0,0.04)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                            mass: 0.8,
                          }}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>

            <div className="w-px h-5 bg-black/10" />

            {/* Client Login */}
            <Link href="/login">
              <motion.span
                whileHover={{ scale: 1.03, backgroundColor: "rgba(17,17,17,0.85)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-black text-white cursor-pointer block whitespace-nowrap shadow-sm"
                style={{ display: "inline-block" }}
              >
                Client Login
              </motion.span>
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Rounded Header */}
      <div className="md:hidden pt-4 px-4 w-full">
        <div
          className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-300 ${
            scrolled || mobileOpen
              ? "bg-white/98 border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl"
              : "bg-white/90 border-black/8 shadow-sm backdrop-blur-md"
          }`}
        >
          {/* Brand on Far Left */}
          <Link href="/">
            <span className="text-sm font-black tracking-[0.12em] uppercase text-black cursor-pointer select-none">
              MUHANAD
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <motion.span
                whileTap={{ scale: 0.95 }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black text-white cursor-pointer whitespace-nowrap"
                style={{ display: "inline-block" }}
              >
                Client Login
              </motion.span>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-black"
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
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mt-2 bg-white/98 border border-black/8 rounded-2xl shadow-lg backdrop-blur-xl p-3"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  if (link.href.startsWith("/#")) {
                    return (
                      <button
                        key={link.label}
                        onClick={() => handleNavClick(link.href)}
                        className="text-left px-4 py-3 rounded-xl text-sm font-medium text-black/75 hover:text-black hover:bg-black/4 transition-colors"
                      >
                        {link.label}
                      </button>
                    );
                  }
                  return (
                    <Link key={link.label} href={link.href}>
                      <span
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-black/75 hover:text-black hover:bg-black/4 transition-colors cursor-pointer"
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
      </div>
    </header>
  );
}

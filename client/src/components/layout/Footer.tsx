import { Link } from "wouter";

const footerLinks = [
  { label: "Work",         href: "/work" },
  { label: "About",        href: "/#about" },
  { label: "Contact",      href: "/#contact" },
  { label: "Client Login", href: "/login" },
];

export function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.location.href = `/#${id}`;
  };

  return (
    <footer className="border-t border-black/8 py-10 mt-20">
      <div className="pub-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/">
            <span className="text-sm font-black tracking-[0.08em] uppercase text-black cursor-pointer hover:text-black/60 transition-colors">
              MUHANAD
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {footerLinks.map((link) => {
              if (link.href.startsWith("/#")) {
                const id = link.href.slice(2);
                return (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(id)}
                    className="text-sm text-black/40 hover:text-black transition-colors"
                  >
                    {link.label}
                  </button>
                );
              }
              return (
                <Link key={link.label} href={link.href}>
                  <span className="text-sm text-black/40 hover:text-black transition-colors cursor-pointer">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-black/30 text-center md:text-right">
            © {new Date().getFullYear()} MUHANAD · hanody1x.com
          </p>
        </div>
      </div>
    </footer>
  );
}

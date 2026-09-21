import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "ar" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
  isRTL: boolean;
}

const enTranslations: Record<string, string> = {
  // Navbar
  "nav.services": "Services",
  "nav.showcase": "Success Stories",
  "nav.portfolio": "Portfolio",
  "nav.login": "Login",
  "nav.admin": "Admin",
  "nav.order": "Order Now",

  // Hero
  "hero.instagram": "Follow me on Instagram",

  // Stats
  "stats.thumbnails": "Thumbnails Delivered",
  "stats.ctr": "Avg. CTR Improvement",
  "stats.delivery": "Hours Avg. Delivery",
  "stats.clients": "Happy Clients",

  // Pricing
  "pricing.title": "Service Packages",
  "pricing.subtitle": "Choose the package that fits your channel. All packages deliver high-quality, click-optimized designs.",
  "pricing.popular": "Most Popular",
  "pricing.bestFor": "Best choice for professionals",
  "pricing.perImage": "/per image",
  "pricing.choose": "Choose",

  // Urgency
  "urgency.day": "Day",
  "urgency.hour": "Hour",
  "urgency.minute": "Min",
  "urgency.second": "Sec",

  // Before/After
  "ba.badge": "Professional Comparison",
  "ba.title": "See the Difference",
  "ba.subtitle": "Drag the line left and right to see how professional design can dramatically change viewer impression.",
  "ba.before": "Before",
  "ba.after": "After",

  // Showcase
  "showcase.title": "Creator Success Stories",
  "showcase.subtitle": "Discover how custom thumbnails transformed these channels and launched their growth.",
  "showcase.viewCase": "View Case Study",
  "showcase.youtube": "Visit YouTube Channel",

  // Portfolio
  "portfolio.title": "Selected Works",
  "portfolio.subtitle": "A curated gallery of click-optimized thumbnails across various niches.",
  "portfolio.rateBtn": "Rate Images",
  "portfolio.all": "All",

  // Rating Modal
  "rating.title": "Welcome to Image Rating",
  "rating.namePrompt": "Please enter your name before starting",
  "rating.namePlaceholder": "Enter your name...",
  "rating.start": "Start Rating",
  "rating.cancel": "Cancel",
  "rating.imageOf": "Image",
  "rating.of": "of",
  "rating.question": "How do you rate this image?",
  "rating.confirm": "Confirm Rating",
  "rating.submitting": "Submitting...",
  "rating.done": "All images rated!",

  // Why Choose Me
  "wcm.badge": "Why Me",

  // How It Works
  "hiw.badge": "Simple Process",
  "hiw.step": "Step",

  // About
  "about.badge": "About Me",
  "about.designer": "Thumbnail Designer",
  "about.skillsLabel": "Skills & Expertise",

  // Special Offer
  "offer.limited": "Limited Time Offer",
  "offer.discount": "on your first order",
  "offer.code": "Discount Code",
  "offer.activate": "Activate 20% Discount Now",
  "offer.activated": "Discount Activated ✓",
  "offer.useNow": "Use Offer Now",

  // Sticky buttons
  "sticky.whatsapp": "Chat on WhatsApp",
  "sticky.orderNow": "Order Now",

  // Contact
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.package": "Package",
  "contact.selectPkg": "Select a package...",
  "contact.details": "Project Details",
  "contact.submit": "Send Message",
  "contact.sending": "Sending...",
  "contact.directTitle": "Prefer Direct Contact?",
  "contact.directDesc": "Send me a direct message on Instagram for the fastest response.",
  "contact.instagram": "Order via Instagram",
  "contact.whatsapp": "Order via WhatsApp",

  // Footer
  "footer.rights": "All rights reserved.",
  "footer.services": "Services",
  "footer.portfolio": "Portfolio",
  "footer.order": "Order Now",

  // Lightbox
  "lightbox.colors": "Colors",
  "lightbox.copied": "✓ Copied!",
  "lightbox.orderSimilar": "Order Similar Image Now",
  "lightbox.download": "Download High Quality",

  // Case Study page
  "caseStudy.back": "Back to Home",
  "caseStudy.notFound": "Case study not found",
  "caseStudy.fullStory": "Full Story",
  "caseStudy.getResults": "Get Similar Results",
  "caseStudy.viewYoutube": "Visit YouTube Channel",
  "caseStudy.contactNow": "Contact Me Now",
};

const translations: Record<Lang, Record<string, string>> = {
  ar: enTranslations,
  en: enTranslations,
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
  dir: "ltr",
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  const unlockScroll = () => {
    // Nuclear scroll unlock — clears ALL possible scroll-locking styles
    const b = document.body;
    const h = document.documentElement;
    b.style.overflow = '';
    b.style.overflowY = '';
    b.style.overflowX = '';
    b.style.position = '';
    b.style.top = '';
    b.style.left = '';
    b.style.right = '';
    b.style.width = '';
    b.style.height = '';
    b.style.touchAction = '';
    b.style.pointerEvents = '';
    h.style.overflow = '';
    h.style.overflowY = '';
    h.style.position = '';
    h.style.touchAction = '';
    b.classList.remove('overflow-hidden', 'modal-open', 'menu-open', 'no-scroll');
    h.classList.remove('overflow-hidden', 'modal-active');
    // Force reflow to apply changes
    void b.offsetHeight;
  };

  const setLang = (newLang: Lang) => {
    unlockScroll();
    setLangState("en");
    localStorage.setItem("site_lang", "en");

    requestAnimationFrame(() => {
      unlockScroll();
      requestAnimationFrame(() => {
        unlockScroll();
      });
    });
    setTimeout(unlockScroll, 50);
    setTimeout(unlockScroll, 150);
    setTimeout(unlockScroll, 300);
    setTimeout(unlockScroll, 500);
  };

  const t = (key: string): string => {
    return enTranslations[key] || key;
  };

  const dir = "ltr" as const;
  const isRTL = false;

  useEffect(() => {
    localStorage.setItem("site_lang", "en");
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
    document.documentElement.classList.remove("rtl");
    document.documentElement.classList.add("ltr");
    
    // Always unlock scroll
    unlockScroll();
    setTimeout(unlockScroll, 100);
    setTimeout(unlockScroll, 300);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "ar" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
  isRTL: boolean;
}

const translations: Record<Lang, Record<string, string>> = {
  ar: {
    // Navbar
    "nav.services": "الخدمات",
    "nav.showcase": "قصص النجاح",
    "nav.portfolio": "معرض الأعمال",
    "nav.login": "تسجيل الدخول",
    "nav.admin": "لوحة التحكم",
    "nav.order": "اطلب الآن",

    // Hero
    "hero.instagram": "تابعني على إنستجرام",

    // Stats
    "stats.thumbnails": "صورة مصغرة مُسلَّمة",
    "stats.ctr": "متوسط تحسُّن معدل النقر",
    "stats.delivery": "ساعة متوسط التسليم",
    "stats.clients": "عميل راضٍ",

    // Pricing
    "pricing.title": "باقات الخدمة",
    "pricing.subtitle": "اختر الباقة المناسبة لقناتك. جميع الباقات تقدم تصاميم عالية الجودة ومُحسَّنة للنقر.",
    "pricing.popular": "الأكثر طلباً",
    "pricing.bestFor": "الخيار الأمثل للمحترفين",
    "pricing.perImage": "/لكل صورة",
    "pricing.choose": "اختر",

    // Urgency
    "urgency.day": "يوم",
    "urgency.hour": "ساعة",
    "urgency.minute": "دقيقة",
    "urgency.second": "ثانية",

    // Before/After
    "ba.badge": "مقارنة احترافية",
    "ba.title": "شاهد الفرق بنفسك",
    "ba.subtitle": "اسحب الخط لليمين واليسار لتشاهد كيف يمكن لتصميم احترافي أن يغير جذرياً انطباع المشاهد.",
    "ba.before": "قبل",
    "ba.after": "بعد",

    // Showcase
    "showcase.title": "قصص نجاح صناع محتوى",
    "showcase.subtitle": "اكتشف كيف غيّرت الصور المصغرة المخصصة هذه القنوات وأطلقت نموها بشكل صاروخي.",
    "showcase.viewCase": "عرض دراسة الحالة",
    "showcase.youtube": "انتقال إلى قناة اليوتيوب",

    // Portfolio
    "portfolio.title": "أعمال مختارة",
    "portfolio.subtitle": "معرض مختار من الصور المصغرة المُحسَّنة للنقر عبر مختلف التخصصات.",
    "portfolio.rateBtn": "تقييم الصور",
    "portfolio.all": "الكل",

    // Rating Modal
    "rating.title": "مرحباً بك في تقييم الصور",
    "rating.namePrompt": "يرجى إدخال اسمك قبل البدء بالتقييم",
    "rating.namePlaceholder": "أدخل اسمك هنا...",
    "rating.start": "ابدأ التقييم",
    "rating.cancel": "إلغاء",
    "rating.imageOf": "صورة",
    "rating.of": "من",
    "rating.question": "ما تقييمك لهذه الصورة؟",
    "rating.confirm": "تأكيد التقييم",
    "rating.submitting": "جاري الإرسال...",
    "rating.done": "تم تقييم جميع الصور!",

    // Why Choose Me
    "wcm.badge": "لماذا أنا",

    // How It Works
    "hiw.badge": "العملية بسيطة",
    "hiw.step": "الخطوة",

    // About
    "about.badge": "من أنا",
    "about.designer": "مصمم صور مصغرة",
    "about.skillsLabel": "المهارات والخبرات",

    // Special Offer
    "offer.limited": "عرض محدود الوقت",
    "offer.discount": "على أول طلب",
    "offer.code": "كود الخصم",
    "offer.activate": "تفعيل الخصم 20% الآن",
    "offer.activated": "تم تفعيل الخصم بنجاح ✓",
    "offer.useNow": "استخدم العرض الآن",

    // Sticky buttons
    "sticky.whatsapp": "تواصل عبر واتساب",
    "sticky.orderNow": "اطلب الآن",

    // Contact
    "contact.name": "الاسم",
    "contact.email": "البريد الإلكتروني",
    "contact.package": "الباقة المطلوبة",
    "contact.selectPkg": "اختر باقة...",
    "contact.details": "تفاصيل المشروع",
    "contact.submit": "إرسال الرسالة",
    "contact.sending": "جارٍ الإرسال...",
    "contact.directTitle": "تفضل التواصل المباشر؟",
    "contact.directDesc": "أرسل لي رسالة مباشرة على إنستغرام للرد الأسرع.",
    "contact.instagram": "اطلب عبر إنستغرام",
    "contact.whatsapp": "اطلب عبر واتساب",

    // Footer
    "footer.rights": "جميع الحقوق محفوظة.",
    "footer.services": "الخدمات",
    "footer.portfolio": "معرض الأعمال",
    "footer.order": "اطلب الآن",

    // Lightbox
    "lightbox.colors": "الألوان",
    "lightbox.copied": "✓ تم النسخ!",
    "lightbox.orderSimilar": "اطلب صورة مماثلة الآن",
    "lightbox.download": "تحميل بجودة عالية",

    // Case Study page
    "caseStudy.back": "العودة للرئيسية",
    "caseStudy.notFound": "قصة النجاح غير موجودة",
    "caseStudy.fullStory": "القصة الكاملة",
    "caseStudy.getResults": "احصل على نتائج مماثلة",
    "caseStudy.viewYoutube": "زيارة القناة على يوتيوب",
    "caseStudy.contactNow": "تواصل معي الآن",
  },

  en: {
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
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  t: (key: string) => key,
  dir: "rtl",
  isRTL: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("site_lang");
    if (stored === "en" || stored === "ar") return stored;
    // Auto-detect: if browser language starts with "ar", default to Arabic
    const browserLang = navigator.language || "";
    return browserLang.startsWith("ar") ? "ar" : "ar"; // Default to Arabic for this Arabic-first site
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("site_lang", newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["ar"]?.[key] || key;
  };

  const dir = lang === "ar" ? "rtl" as const : "ltr" as const;
  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    // Add class for CSS-level targeting
    document.documentElement.classList.toggle("rtl", isRTL);
    document.documentElement.classList.toggle("ltr", !isRTL);
  }, [lang, dir, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

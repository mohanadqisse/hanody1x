import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "ar" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
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

    // Hero defaults
    "hero.badge": "متاح لمشاريع جديدة",
    "hero.headline": "صورتك المصغرة هي سبب النقر.",
    "hero.subheadline": "أصمم صوراً مصغرة احترافية عالية معدل النقر تُوقف التمرير وتجذب الانتباه وتزيد مشاهدات قناتك بشكل ملحوظ.",
    "hero.ctaPrimary": "احصل على صورتك المصغرة",
    "hero.ctaSecondary": "شاهد أعمالي",
    "hero.trustText": "موثوق من أكثر من 50 يوتيوبر",
    "hero.instagram": "تابعني على إنستجرام",

    // Stats
    "stats.thumbnails": "صورة مصغرة مُسلَّمة",
    "stats.ctr": "متوسط تحسُّن معدل النقر",
    "stats.delivery": "ساعة متوسط التسليم",
    "stats.clients": "عميل راضٍ",

    // How it works
    "hiw.title": "كيف نعمل معاً؟",
    "hiw.subtitle": "ثلاث خطوات بسيطة تفصلك عن صورة مصغرة تضاعف مشاهداتك",
    "hiw.badge": "العملية بسيطة",
    "hiw.step1Title": "أرسل تفاصيلك",
    "hiw.step1Desc": "أخبرني عن قناتك وموضوع الفيديو والجمهور المستهدف. كلما زادت التفاصيل كان التصميم أدق.",
    "hiw.step2Title": "تصميم وتعديل",
    "hiw.step2Desc": "أصمم لك صورة مصغرة احترافية وأرسلها للمراجعة. يمكنك طلب تعديلات حسب الباقة المختارة.",
    "hiw.step3Title": "استلم ملفاتك",
    "hiw.step3Desc": "بعد اعتمادك تصل إليك الملفات بجودة عالية جاهزة للرفع خلال 24-48 ساعة كحد أقصى.",

    // Why choose me
    "wcm.title": "لماذا تختارني؟",
    "wcm.feat1Title": "تسليم سريع",
    "wcm.feat1Desc": "لا تفوّت جدول رفع الفيديوهات. معظم المسودات تُسلَّم خلال 24-48 ساعة.",
    "wcm.feat2Title": "تركيز على معدل النقر",
    "wcm.feat2Desc": "قرارات مبنية على تحليلات يوتيوب ومبادئ التسلسل البصري وليس التخمين.",
    "wcm.feat3Title": "أسلوب فريد ومميز",
    "wcm.feat3Desc": "عناصر مخصصة وتدرجات لونية متقدمة وتكوين يميّزك عن الجميع.",
    "wcm.feat4Title": "خبرة مع يوتيوبرز",
    "wcm.feat4Desc": "أفهم سير عمل القنوات وخطافات الاستبقاء وعلم نفس الجمهور.",

    // Portfolio
    "portfolio.title": "أعمال مختارة",
    "portfolio.subtitle": "معرض مختار من الصور المصغرة المُحسَّنة للنقر عبر مختلف التخصصات.",
    "portfolio.rateBtn": "تقييم الصور",
    "portfolio.imgAlt": "معرض أعمال",

    // Case Studies
    "showcase.title": "قصص نجاح صناع محتوى",
    "showcase.subtitle": "اكتشف كيف غيّرت الصور المصغرة المخصصة هذه القنوات وأطلقت نموها بشكل صاروخي.",
    "showcase.viewCase": "عرض دراسة الحالة",
    "showcase.youtube": "انتقال إلى قناة اليوتيوب",

    // About
    "about.title": "مصمم متخصص في يوتيوب",
    "about.badge": "من أنا",
    "about.designer": "مصمم صور مصغرة",

    // Before/After
    "ba.badge": "مقارنة احترافية",
    "ba.title": "شاهد الفرق بنفسك",
    "ba.subtitle": "اسحب الخط لليمين واليسار لتشاهد كيف يمكن لتصميم احترافي أن يغير جذرياً انطباع المشاهد.",
    "ba.before": "قبل",
    "ba.after": "بعد",

    // Pricing
    "pricing.title": "اختر خطتك",
    "pricing.popular": "الأكثر طلباً",

    // Contact
    "contact.title": "ابدأ طلبك",
    "contact.subtitle": "املأ النموذج أدناه أو راسلني مباشرة على إنستغرام للبدء.",
    "contact.name": "الاسم",
    "contact.email": "البريد الإلكتروني",
    "contact.package": "الباقة المطلوبة",
    "contact.details": "تفاصيل المشروع",
    "contact.submit": "إرسال الرسالة",
    "contact.sending": "جارٍ الإرسال...",
    "contact.directTitle": "تفضل التواصل المباشر؟",
    "contact.directDesc": "أرسل لي رسالة مباشرة على إنستغرام للرد الأسرع.",
    "contact.instagram": "اطلب عبر إنستغرام",
    "contact.whatsapp": "اطلب عبر واتساب",
    "contact.whatsappFloat": "تواصل عبر واتساب",

    // Offer
    "offer.limited": "عرض محدود الوقت",
    "offer.discount": "على أول طلب",
    "offer.activate": "تفعيل الخصم 20% الآن",
    "offer.activated": "تم تفعيل الخصم بنجاح ✓",
    "offer.useNow": "استخدم العرض الآن",
    "offer.day": "يوم",
    "offer.hour": "ساعة",
    "offer.minute": "دقيقة",
    "offer.second": "ثانية",

    // Final CTA
    "finalCta.headline": "مستعد للانتشار الواسع؟",
    "finalCta.cta": "اطلب صورتك المصغرة الآن",

    // Urgency
    "urgency.title": "الأماكن تنفذ بسرعة!",

    // Rating
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
    "rating.done": "الانتهاء من التقييم",

    // Footer
    "footer.rights": "جميع الحقوق محفوظة.",
    "footer.services": "الخدمات",
    "footer.portfolio": "معرض الأعمال",
    "footer.order": "اطلب الآن",

    // CaseStudy page
    "caseStudy.notFound": "قصة النجاح غير موجودة",
    "caseStudy.back": "العودة للرئيسية",
    "caseStudy.backShowcase": "العودة لقصص النجاح",
    "caseStudy.fullStory": "القصة الكاملة",
    "caseStudy.getResults": "احصل على نتائج مماثلة",

    // CTR
    "ctr.title": "كيف تعمل الصورة المصغرة المحسّنة؟",
    "ctr.subtitle": "العلم وراء معدل النقر المرتفع",

    // Lightbox
    "lightbox.colors": "الألوان",
    "lightbox.copied": "✓ تم النسخ!",
    "lightbox.orderSimilar": "اطلب صورة مماثلة الآن",
    "lightbox.orderSimilarShort": "اطلب صورة مماثلة",

    // Sticky
    "sticky.whatsapp": "تواصل عبر واتساب",
    "sticky.orderNow": "اطلب الآن",
  },

  en: {
    // Navbar
    "nav.services": "Services",
    "nav.showcase": "Success Stories",
    "nav.portfolio": "Portfolio",
    "nav.login": "Login",
    "nav.admin": "Admin",
    "nav.order": "Order Now",

    // Hero defaults
    "hero.badge": "Available for new projects",
    "hero.headline": "Your thumbnail is the reason they click.",
    "hero.subheadline": "I design professional, high-CTR thumbnails that stop the scroll, grab attention, and significantly boost your channel views.",
    "hero.ctaPrimary": "Get Your Thumbnail",
    "hero.ctaSecondary": "View My Work",
    "hero.trustText": "Trusted by 50+ YouTubers",
    "hero.instagram": "Follow me on Instagram",

    // Stats
    "stats.thumbnails": "Thumbnails Delivered",
    "stats.ctr": "Avg. CTR Improvement",
    "stats.delivery": "Hours Avg. Delivery",
    "stats.clients": "Happy Clients",

    // How it works
    "hiw.title": "How We Work Together",
    "hiw.subtitle": "Three simple steps between you and a thumbnail that doubles your views",
    "hiw.badge": "Simple Process",
    "hiw.step1Title": "Send Your Details",
    "hiw.step1Desc": "Tell me about your channel, video topic, and target audience. The more details, the better the design.",
    "hiw.step2Title": "Design & Revise",
    "hiw.step2Desc": "I design a professional thumbnail and send it for review. You can request revisions based on your package.",
    "hiw.step3Title": "Receive Your Files",
    "hiw.step3Desc": "After your approval, high-quality files are delivered ready to upload within 24-48 hours max.",

    // Why choose me
    "wcm.title": "Why Choose Me?",
    "wcm.feat1Title": "Fast Delivery",
    "wcm.feat1Desc": "Never miss your upload schedule. Most drafts are delivered within 24-48 hours.",
    "wcm.feat2Title": "CTR Focused",
    "wcm.feat2Desc": "Decisions based on YouTube analytics and visual hierarchy principles, not guesswork.",
    "wcm.feat3Title": "Unique Style",
    "wcm.feat3Desc": "Custom elements, advanced color gradients, and composition that sets you apart.",
    "wcm.feat4Title": "YouTuber Experience",
    "wcm.feat4Desc": "I understand channel workflows, retention hooks, and audience psychology.",

    // Portfolio
    "portfolio.title": "Selected Works",
    "portfolio.subtitle": "A curated gallery of click-optimized thumbnails across various niches.",
    "portfolio.rateBtn": "Rate Images",
    "portfolio.imgAlt": "Portfolio item",

    // Case Studies
    "showcase.title": "Creator Success Stories",
    "showcase.subtitle": "Discover how custom thumbnails transformed these channels and launched their growth.",
    "showcase.viewCase": "View Case Study",
    "showcase.youtube": "Visit YouTube Channel",

    // About
    "about.title": "YouTube Design Specialist",
    "about.badge": "About Me",
    "about.designer": "Thumbnail Designer",

    // Before/After
    "ba.badge": "Professional Comparison",
    "ba.title": "See the Difference",
    "ba.subtitle": "Drag the line left and right to see how professional design can dramatically change viewer impression.",
    "ba.before": "Before",
    "ba.after": "After",

    // Pricing
    "pricing.title": "Choose Your Plan",
    "pricing.popular": "Most Popular",

    // Contact
    "contact.title": "Start Your Order",
    "contact.subtitle": "Fill out the form below or message me directly on Instagram to get started.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.package": "Package",
    "contact.details": "Project Details",
    "contact.submit": "Send Message",
    "contact.sending": "Sending...",
    "contact.directTitle": "Prefer Direct Contact?",
    "contact.directDesc": "Send me a direct message on Instagram for the fastest response.",
    "contact.instagram": "Order via Instagram",
    "contact.whatsapp": "Order via WhatsApp",
    "contact.whatsappFloat": "Chat on WhatsApp",

    // Offer
    "offer.limited": "Limited Time Offer",
    "offer.discount": "on your first order",
    "offer.activate": "Activate 20% Discount Now",
    "offer.activated": "Discount Activated ✓",
    "offer.useNow": "Use Offer Now",
    "offer.day": "Day",
    "offer.hour": "Hour",
    "offer.minute": "Min",
    "offer.second": "Sec",

    // Final CTA
    "finalCta.headline": "Ready to Go Viral?",
    "finalCta.cta": "Get Your Thumbnail Now",

    // Urgency
    "urgency.title": "Spots Filling Up Fast!",

    // Rating
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
    "rating.done": "Finish Rating",

    // Footer
    "footer.rights": "All rights reserved.",
    "footer.services": "Services",
    "footer.portfolio": "Portfolio",
    "footer.order": "Order Now",

    // CaseStudy page
    "caseStudy.notFound": "Case study not found",
    "caseStudy.back": "Back to Home",
    "caseStudy.backShowcase": "Back to Success Stories",
    "caseStudy.fullStory": "Full Story",
    "caseStudy.getResults": "Get Similar Results",

    // CTR
    "ctr.title": "How Optimized Thumbnails Work",
    "ctr.subtitle": "The science behind high click-through rates",

    // Lightbox
    "lightbox.colors": "Colors",
    "lightbox.copied": "✓ Copied!",
    "lightbox.orderSimilar": "Order Similar Image Now",
    "lightbox.orderSimilarShort": "Order Similar",

    // Sticky
    "sticky.whatsapp": "Chat on WhatsApp",
    "sticky.orderNow": "Order Now",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  t: (key: string) => key,
  dir: "rtl",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("site_lang");
    return (stored === "en" || stored === "ar") ? stored : "ar";
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("site_lang", newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["ar"]?.[key] || key;
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ParticleField } from "@/components/ParticleField";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Palette, 
  Smile, 
  Eye, 
  Target, 
  Zap, 
  Clock, 
  TrendingUp, 
  Wand2, 
  Users, 
  CheckCircle2, 
  Star,
  ArrowLeft,
  MessageCircle,
  Send,
  Pencil,
  Download,
  Sparkles,
  Award,
  Gift,
  Mail,
  Inbox,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { caseStudies as defaultCaseStudies, portfolioItems } from "@/lib/data";
import { useImages, useSection } from "@/hooks/useContent";

const easeApple = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];
const defaultViewport = { once: true, margin: "-100px" };

function addRipple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.classList.add("ripple-host");
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.2;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const ripple = document.createElement("span");
  ripple.className = "ripple-wave";
  ripple.style.cssText = `width:${size}px;height:${size}px;top:${y}px;left:${x}px`;
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

function CountUp({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      let startTime: number;
      let animationFrame: number;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeProgress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        }
      };

      animationFrame = requestAnimationFrame(step);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

const defaultHero = {
  badge: "متاح لمشاريع جديدة",
  headline: "صورتك المصغرة هي سبب النقر.",
  subheadline: "أصمم صوراً مصغرة احترافية عالية معدل النقر تُوقف التمرير وتجذب الانتباه وتزيد مشاهدات قناتك بشكل ملحوظ.",
  ctaPrimary: "احصل على صورتك المصغرة",
  ctaSecondary: "شاهد أعمالي",
  trustText: "موثوق من أكثر من 50 يوتيوبر",
};

function Hero() {
  const images = useImages();
  const h = useSection("hero", defaultHero);
  const headline = h.headline.split(" ");
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 800], [0, 160]);
  const orbY2 = useTransform(scrollY, [0, 800], [0, 100]);

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ParticleField />
        <motion.div
          style={{ y: orbY1 }}
          className="parallax-orb absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-orb-pulse"
        />
        <motion.div
          style={{ y: orbY2 }}
          className="parallax-orb absolute top-1/3 -right-1/4 w-[40vw] h-[40vw] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen animate-orb-pulse"
          initial={false}
        />
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="خلفية سينمائية" 
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: easeApple }}
            className="text-right"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 shadow-[0_0_15px_rgba(34,197,94,0.1)] border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="text-sm font-semibold text-foreground/90">{h.badge}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black text-foreground leading-[1.1] tracking-tighter mb-6 flex flex-wrap gap-x-4 gap-y-2 justify-end dir-rtl">
              {headline.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: easeApple }}
                  className={i === headline.length - 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text" : "will-change-transform"}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: easeApple }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed will-change-transform"
            >
              {h.subheadline}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: easeApple }}
              className="flex flex-col sm:flex-row gap-4 mb-12 justify-end will-change-transform"
            >
              <Button 
                onClick={(e) => { addRipple(e); document.getElementById("order")?.scrollIntoView({ behavior: "smooth" }); }}
                size="lg" 
                className="h-14 px-8 rounded-2xl bg-primary text-white text-lg font-bold border-0 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_10px_40px_rgba(59,130,246,0.5)] hover:scale-105 hover:-translate-y-1 transition-all duration-300 btn-shimmer ripple-host"
              >
                {h.ctaPrimary}
              </Button>
              <Button 
                onClick={(e) => { addRipple(e); document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" }); }}
                size="lg" 
                variant="outline"
                className="h-14 px-8 rounded-2xl border-border bg-foreground/5 backdrop-blur-md text-foreground hover:bg-foreground/10 text-lg font-semibold hover:scale-105 hover:-translate-y-1 transition-all duration-300 ripple-host"
              >
                {h.ctaSecondary}
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex items-center gap-4 text-sm text-muted-foreground justify-end"
            >
              <span className="font-medium">{h.trustText}</span>
              <div className="flex items-center gap-1 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <div className="flex -space-x-3 space-x-reverse">
                {/* تم إزالة صور الأفاتار بناء على الطلب */}
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: easeApple }}
            className="relative h-[600px] hidden lg:block will-change-transform"
          >
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-10 right-4 w-4/5 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 shadow-primary/20 rotate-2 glass-card"
            >
              <img src={images.heroCard1 || `${import.meta.env.BASE_URL}images/thumb-1.png`} alt="نموذج صورة مصغرة" className="w-full h-auto" />
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-0 w-3/4 rounded-2xl overflow-hidden border border-white/5 shadow-2xl z-10 -rotate-3 opacity-60 backdrop-blur-xl"
            >
              <img src={images.heroCard2 || `${import.meta.env.BASE_URL}images/thumb-2.png`} alt="نموذج صورة مصغرة" className="w-full h-auto grayscale-[30%]" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const defaultStats = [
  { label: "مشاهدة تم توليدها", value: "100", suffix: "M+" },
  { label: "صورة مصغرة مصممة", value: "650", suffix: "+" },
  { label: "عميل سعيد", value: "50", suffix: "+" },
];

function Stats() {
  const stats = useSection("stats", defaultStats);

  return (
    <section className="py-16 border-y border-border bg-foreground/[0.01] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border relative">
          {stats.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: easeApple }}
              className="flex flex-col items-center justify-center py-6 md:py-0 will-change-transform"
            >
              <div className="text-5xl md:text-6xl font-black text-foreground mb-3 tracking-tighter drop-shadow-md">
                <CountUp end={parseInt(stat.value) || 0} suffix={stat.suffix} />
              </div>
              <div className="text-sm md:text-base uppercase tracking-widest text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
}

const defaultPackages = [
  { name: "أساسي", price: "29", features: ["تعديل واحد", "تسليم خلال 3 أيام", "جودة HD", "تصميم أساسي"], popular: false },
  { name: "احترافي", price: "59", features: ["3 تعديلات", "تسليم خلال يومين", "جودة 4K", "تصميم متقدم", "نسختان A/B للاختبار"], popular: true },
  { name: "النخبة", price: "99", features: ["تعديلات غير محدودة", "تسليم خلال 24 ساعة", "جودة 4K", "تصميم ممتاز", "تحليل معدل النقر", "أولوية الدعم"], popular: false },
];

function Pricing({ isDiscountActive }: { isDiscountActive?: boolean }) {
  const customPricing = useSection("pricing", {} as any);
  const packagesRaw = useSection("packages", defaultPackages);
  
  const packages = packagesRaw.map((pkg: any) => {
    let price = pkg.price;
    let features = pkg.features;
    if (pkg.name === "أساسي") {
      if (customPricing.basicPrice) price = customPricing.basicPrice;
      if (customPricing.basicFeatures) features = customPricing.basicFeatures.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    if (pkg.name === "احترافي") {
      if (customPricing.proPrice) price = customPricing.proPrice;
      if (customPricing.proFeatures) features = customPricing.proFeatures.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    if (pkg.name === "النخبة") {
      if (customPricing.elitePrice) price = customPricing.elitePrice;
      if (customPricing.eliteFeatures) features = customPricing.eliteFeatures.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    return { ...pkg, price, features };
  });

  return (
    <section id="services" className="py-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.7, ease: easeApple }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tighter"
          >
            باقات الخدمة
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.7, delay: 0.1, ease: easeApple }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            اختر الباقة المناسبة لقناتك. جميع الباقات تقدم تصاميم عالية الجودة ومُحسَّنة للنقر.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {packages.map((pkg, idx) => {
            const waveGradient = pkg.popular
              ? "linear-gradient(744deg, hsl(var(--primary)), hsl(var(--secondary)) 60%, #00ddeb)"
              : idx === 0
                ? "linear-gradient(744deg, #3b82f6, #1d4ed8 60%, #06b6d4)"
                : "linear-gradient(744deg, #6366f1, #4f46e5 60%, #818cf8)";

            return (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: easeApple }}
              className={`relative ${pkg.popular ? "md:-translate-y-6 z-20" : "z-10"}`}
            >
              {pkg.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-black tracking-wider whitespace-nowrap shadow-[0_0_25px_rgba(59,130,246,0.6)] z-30">
                  <Sparkles size={12} className="fill-white" />
                  الأكثر طلباً
                  <Sparkles size={12} className="fill-white" />
                </div>
              )}

              <div className={`pricing-wave-card playing relative overflow-hidden rounded-3xl h-full flex flex-col ${pkg.popular ? "shadow-[0_8px_40px_rgba(59,130,246,0.4)] ring-2 ring-primary/50" : "shadow-[0_8px_28px_-9px_rgba(0,0,0,0.45)]"}`}>
                {/* Wave background */}
                <div className="pricing-wave" style={{ background: waveGradient }} />
                <div className="pricing-wave" style={{ background: waveGradient }} />
                <div className="pricing-wave" style={{ background: waveGradient }} />
                
                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col h-full w-full">
                  <div className="flex flex-col h-full">
                    <div className="text-right mb-2">
                      <h3 className="text-2xl font-bold tracking-tight text-white">{pkg.name}</h3>
                      {pkg.popular && <p className="text-xs text-blue-200 font-semibold mt-0.5">الخيار الأمثل للمحترفين</p>}
                    </div>

                    <div className="flex flex-col items-end gap-1 mb-8">
                      {isDiscountActive && (
                        <span className="text-xl text-white/50 line-through decoration-red-400/70 font-semibold mb-[-4px]">
                          ${pkg.price}
                        </span>
                      )}
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-sm font-medium text-white/70">/لكل صورة</span>
                        <span className="text-5xl font-black text-white drop-shadow-lg">
                          ${isDiscountActive ? (parseFloat(pkg.price) * 0.8).toFixed(0) : pkg.price}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-10 flex-grow">
                      {pkg.features.map((feat: string) => (
                        <li key={feat} className="flex items-center gap-3 text-sm justify-end">
                          <span className="font-medium text-white/90">{feat}</span>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20">
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={(e) => { addRipple(e); document.getElementById("order")?.scrollIntoView({ behavior: "smooth" }); }}
                      className={`w-full rounded-2xl py-7 text-lg font-bold transition-all ripple-host ${
                        pkg.popular
                          ? "bg-white text-primary shadow-[0_4px_30px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_40px_rgba(255,255,255,0.5)] hover:scale-[1.02]"
                          : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
                      }`}
                    >
                      {pkg.popular && <Sparkles size={16} className="ml-2 inline" />}
                      اختر {pkg.name}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const defaultCtr = {
  title: "مصممة للنقر — ليس فقط للجمال.",
  subtitle: "معظم الصور المصغرة تبدو جميلة. أعمالي مبنية على علم نفس الإنسان لتحقيق أداء فعلي. معدل نقر أعلى = مشاهدات أكثر = نمو أسرع.",
  highlight: "نتائج مُثبتة",
  highlightDesc: "بعض العملاء حققوا زيادة تتجاوز 120% في معدل النقر",
};

function CTRSection() {
  const ctr = useSection("ctr", defaultCtr);
  const principles = [
    { icon: <Palette size={24} />, title: "ألوان عالية التباين", desc: "ألوان تبرز على يوتيوب في الوضع الليلي والنهاري." },
    { icon: <Smile size={24} />, title: "تعبيرات عاطفية", desc: "وجوه تنقل مشاعر الفيديو فوراً للمشاهد." },
    { icon: <Eye size={24} />, title: "تكوين يثير الفضول", desc: "تخطيطات بصرية تخلق حلقة مفتوحة في الذهن." },
    { icon: <Target size={24} />, title: "نقطة تركيز واضحة", desc: "لا فوضى. موضوع واحد واضح يشد العين." },
    { icon: <Zap size={24} />, title: "يُوقف التمرير", desc: "أنماط بصرية مدروسة تجعل المشاهد يتوقف للنظر." }
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden border-t border-border">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-2/3 bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.7, ease: easeApple }}
              className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] text-right tracking-tighter"
            >
              {ctr.title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.7, delay: 0.1, ease: easeApple }}
              className="text-lg text-gray-400 mb-10 text-right leading-relaxed"
            >
              {ctr.subtitle}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.7, delay: 0.2, ease: easeApple }}
              className="inline-flex items-center gap-4 glass-card p-6 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-3xl transition-colors duration-500" style={{ boxShadow: "inset 0 0 20px rgba(59,130,246,0)" }} />
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <TrendingUp size={28} />
              </div>
              <div className="text-right z-10">
                <p className="text-foreground font-bold text-lg mb-1">{ctr.highlight}</p>
                <p className="text-sm text-muted-foreground">{ctr.highlightDesc}</p>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            {principles.map((item, idx) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: easeApple }}
                className="relative w-full flex items-center gap-6 p-6 rounded-3xl bg-card/20 hover:bg-card/50 transition-all duration-300 group overflow-hidden border border-transparent hover:border-border"
              >
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shrink-0 shadow-lg">
                  {item.icon}
                </div>
                <div className="text-right flex-1">
                  <h4 className="text-xl font-bold text-foreground mb-2 tracking-tight">{item.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const defaultUrgency = { text: "3 أماكن فقط متبقية هذا الأسبوع" };

function Urgency() {
  const urgency = useSection("urgency", defaultUrgency);
  const [timeLeft, setTimeLeft] = useState({ d: 5, h: 23, m: 59, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { d, h, m, s } = prev;
        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else {
            m = 59;
            if (h > 0) h--;
            else {
              h = 23;
              if (d > 0) d--;
            }
          }
        }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 glass-card border-y border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-4">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
            </span>
            <span className="text-xl font-bold text-foreground tracking-tight">{urgency.text}</span>
          </div>
          
          <div className="flex items-center gap-6 text-3xl md:text-4xl font-mono font-black text-foreground drop-shadow-md">
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.d).padStart(2, '0')}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-sans mt-1">يوم</span>
            </div>
            <span className="text-primary/50 mb-4">:</span>
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.h).padStart(2, '0')}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-sans mt-1">ساعة</span>
            </div>
            <span className="text-primary/50 mb-4">:</span>
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.m).padStart(2, '0')}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-sans mt-1">دقيقة</span>
            </div>
            <span className="text-primary/50 mb-4">:</span>
            <div className="flex flex-col items-center text-primary">
              <span>{String(timeLeft.s).padStart(2, '0')}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-sans mt-1">ثانية</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientShowcase() {
  return (
    <section id="showcase" className="py-32 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.7, ease: easeApple }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tighter"
          >
            قصص نجاح يوتيوبرز
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.7, delay: 0.1, ease: easeApple }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            اكتشف كيف غيّرت الصور المصغرة المخصصة هذه القنوات وأطلقت نموها بشكل صاروخي.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(useSection("caseStudies", defaultCaseStudies) as typeof defaultCaseStudies).map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: easeApple }}
              className="glass-card rounded-3xl p-8 hover:bg-card/40 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-5 mb-6 flex-row-reverse">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] overflow-hidden">
                  {(client as any).avatarImage ? (
                    <img src={(client as any).avatarImage} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    client.avatarInitials
                  )}
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-foreground text-xl tracking-tight">{client.name}</h4>
                  <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-semibold mt-1 inline-block">{client.niche}</span>
                </div>
              </div>
              <p className="text-gray-400 text-base mb-8 h-12 text-right leading-relaxed">{client.shortBio}</p>
              
              <Link 
                href={`/case-study/${client.id}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform duration-300" />
                عرض دراسة الحالة
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortfolioGrid() {
  const images = useImages();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const openLightbox = (src: string) => setLightboxSrc(src);
  const closeLightbox = () => setLightboxSrc(null);

  return (
    <section id="portfolio" className="py-32 bg-card/20 relative">
      <div className="container mx-auto px-6">
        <div className="text-right mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">أعمال مختارة</h2>
          <p className="text-lg text-muted-foreground max-w-xl">معرض مختار من الصور المصغرة المُحسَّنة للنقر عبر مختلف التخصصات.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolioItems.map((item, idx) => {
            const src = (images.portfolio && images.portfolio[item.id - 1]) || `${import.meta.env.BASE_URL}images/thumb-${(item.id % 3) + 1}.png`;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (idx % 4) * 0.07, ease: easeApple }}
                onClick={() => openLightbox(src)}
                className="group aspect-video rounded-2xl overflow-hidden glass-card cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative"
              >
                <img
                  src={src}
                  alt={`معرض أعمال ${item.id}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={closeLightbox}
          >
            <motion.div
              key="lightbox-image"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.35, ease: easeApple }}
              className="relative max-w-5xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={lightboxSrc}
                alt="عرض مكبّر"
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
              />
              <button
                onClick={closeLightbox}
                className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary hover:bg-primary/80 transition-colors flex items-center justify-center text-white font-bold text-lg shadow-xl"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const defaultWhyChooseMe = {
  title: "لماذا تختارني؟",
  feat1Title: "تسليم سريع",
  feat1Desc: "لا تفوّت جدول رفع الفيديوهات. معظم المسودات تُسلَّم خلال 24-48 ساعة.",
  feat2Title: "تركيز على معدل النقر",
  feat2Desc: "قرارات مبنية على تحليلات يوتيوب ومبادئ التسلسل البصري وليس التخمين.",
  feat3Title: "أسلوب فريد ومميز",
  feat3Desc: "عناصر مخصصة وتدرجات لونية متقدمة وتكوين يميّزك عن الجميع.",
  feat4Title: "خبرة مع يوتيوبرز",
  feat4Desc: "أفهم سير عمل القنوات وخطافات الاستبقاء وعلم نفس الجمهور.",
};

function WhyChooseMe() {
  const wcm = useSection("whyChooseMe", defaultWhyChooseMe);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const features = [
    { icon: <Clock size={32} />, title: wcm.feat1Title, desc: wcm.feat1Desc },
    { icon: <TrendingUp size={32} />, title: wcm.feat2Title, desc: wcm.feat2Desc },
    { icon: <Wand2 size={32} />, title: wcm.feat3Title, desc: wcm.feat3Desc },
    { icon: <Users size={32} />, title: wcm.feat4Title, desc: wcm.feat4Desc },
  ];

  return (
    <section className="py-32 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.7, ease: easeApple }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tighter"
          >
            {wcm.title}
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const isHovered = hoveredIdx === idx;
            const isOtherHovered = hoveredIdx !== null && hoveredIdx !== idx;
            return (
              <motion.div 
                key={feat.title}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={defaultViewport}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: easeApple }}
                className={`text-center p-8 glass-card rounded-3xl transition-all duration-300 card-glow relative ${isHovered ? 'scale-110 z-10 bg-card/60 shadow-[0_20px_50px_rgba(59,130,246,0.25)] -translate-y-2' : isOtherHovered ? 'blur-sm opacity-50 scale-95' : 'hover:bg-card/40'}`}
              >
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-foreground/5 flex items-center justify-center mb-8 transition-all duration-500 ${isHovered ? 'text-primary bg-primary/20 scale-110 shadow-[0_0_30px_rgba(59,130,246,0.4)]' : 'text-primary/70'}`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 tracking-tight">{feat.title}</h3>
                <p className="text-base text-gray-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const defaultHowItWorks = {
  title: "كيف نعمل معاً؟",
  subtitle: "ثلاث خطوات بسيطة تفصلك عن صورة مصغرة تضاعف مشاهداتك",
  step1Title: "أرسل تفاصيلك",
  step1Desc: "أخبرني عن قناتك وموضوع الفيديو والجمهور المستهدف. كلما زادت التفاصيل كان التصميم أدق.",
  step2Title: "تصميم وتعديل",
  step2Desc: "أصمم لك صورة مصغرة احترافية وأرسلها للمراجعة. يمكنك طلب تعديلات حسب الباقة المختارة.",
  step3Title: "استلم ملفاتك",
  step3Desc: "بعد اعتمادك تصل إليك الملفات بجودة عالية جاهزة للرفع خلال 24-48 ساعة كحد أقصى.",
};

function HowItWorks() {
  const hiw = useSection("howItWorks", defaultHowItWorks);
  const steps = [
    {
      num: "01",
      icon: <Send size={28} />,
      title: hiw.step1Title,
      desc: hiw.step1Desc,
      color: "from-violet-500/20 to-violet-500/5",
      border: "border-violet-500/20",
      glow: "rgba(59,130,246,0.3)",
    },
    {
      num: "02",
      icon: <Pencil size={28} />,
      title: hiw.step2Title,
      desc: hiw.step2Desc,
      color: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-500/20",
      glow: "rgba(59,130,246,0.3)",
    },
    {
      num: "03",
      icon: <Download size={28} />,
      title: hiw.step3Title,
      desc: hiw.step3Desc,
      color: "from-green-500/20 to-green-500/5",
      border: "border-green-500/20",
      glow: "rgba(34,197,94,0.3)",
    },
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card/10 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={{ duration: 0.7, ease: easeApple }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border-white/10">
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm font-semibold text-foreground/80">العملية بسيطة</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">{hiw.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{hiw.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-green-500/30 pointer-events-none" />
          
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={defaultViewport}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: easeApple }}
              className="relative group h-full"
            >
              <div className={`relative p-8 rounded-3xl h-full bg-gradient-to-b ${step.color} border ${step.border} glass-card card-glow text-center`}
                style={{ boxShadow: `0 0 40px ${step.glow}0` }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <div className="text-xs font-black tracking-widest text-foreground/30 bg-background border border-border px-3 py-1 rounded-full">
                    {step.num}
                  </div>
                </div>
                
                <div className="w-16 h-16 mx-auto rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground mb-6 group-hover:scale-110 group-hover:bg-foreground/10 transition-all duration-500 border border-border"
                  style={{ boxShadow: `0 0 20px ${step.glow}` }}
                >
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4 tracking-tight">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const defaultAbout = {
  title: "مصمم متخصص في يوتيوب",
  bio1: 'أنا Hanody1x، مصمم جرافيك متخصص في صور مصغرة يوتيوب. أعمل مع يوتيوبرز عرب وعالميين لتحويل أفكارهم إلى صور مصغرة تُوقف التمرير وتُضاعف المشاهدات.',
  bio2: "فلسفتي بسيطة: الصورة المصغرة الجيدة لا تبدو جميلة فحسب — بل تعمل. كل تصميم أقدمه مبني على فهم عميق لعلم النفس البصري وخوارزميات يوتيوب.",
  badge1: "+50 يوتيوبر",
  badge2: "+120% CTR",
  skills: "تصميم صور مصغرة,تحسين معدل النقر,تحليل القنوات,تأثيرات بصرية,تصميم جرافيك,علم نفس الألوان",
};

function About() {
  const aboutRaw = useSection("about", defaultAbout);
  const brand = useSection("brand", { logoLetter: "H", logoImage: "" } as any);
  const about = { ...aboutRaw, logoImage: brand.logoImage };
  const skills = (about.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  
  const whatsappUrl = "https://wa.me/00962780691000?text=" + encodeURIComponent("مرحباً، أريد طلب صورة مصغرة لقناتي");

  return (
    <section className="py-32 bg-card/20 relative overflow-hidden border-t border-border">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-2/3 bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.8, ease: easeApple }}
            className="relative"
          >
            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-3xl blur-2xl scale-105" />
              <div className="relative glass-card rounded-3xl overflow-hidden border border-white/10 p-1">
                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-5xl font-black mb-4 shadow-[0_0_40px_rgba(59,130,246,0.5)] overflow-hidden">
                      {about.logoImage ? (
                        <img src={about.logoImage} alt="Brand" className="w-full h-full object-cover" />
                      ) : (
                        "H"
                      )}
                    </div>
                    <p className="text-foreground font-black text-2xl tracking-tighter">Hanody1x</p>
                    <p className="text-primary text-sm font-semibold mt-1">مصمم صور مصغرة</p>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 glass-card rounded-2xl px-4 py-3 border border-white/10 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-foreground text-xs font-bold">{about.badge1}</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-4 py-3 border border-white/10 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="text-foreground text-xs font-bold">{about.badge2}</span>
                </div>
              </motion.div>

              {/* Social Media Icons */}
              <div className="social-icons-row relative z-20 flex items-center justify-center gap-5 mt-6">
                <div className="social-icon-container social-icon-instagram">
                  <a href="https://instagram.com/hanody1x" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-full h-full flex items-center justify-center">
                    <svg className="social-icon-svg" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.203.166 1.485.276.374.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.276 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.036.78-.166 1.203-.276 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" /></svg>
                  </a>
                </div>
                <div className="social-icon-container social-icon-linkedin">
                  <a href="https://www.linkedin.com/in/muhanad-alqaisi-?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-full h-full flex items-center justify-center">
                    <svg className="social-icon-svg" viewBox="0 0 448 512"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" /></svg>
                  </a>
                </div>
                <div className="social-icon-container social-icon-whatsapp">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-full h-full flex items-center justify-center">
                    <svg className="social-icon-svg" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.8, ease: easeApple }}
            className="text-right"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-foreground/80">من أنا</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-[1.1]">
              {about.title}
            </h2>
            <p className="text-gray-400 leading-relaxed text-lg mb-6 whitespace-pre-line">{(about.bio1 || '').replace(/<[^>]*>/g, '')}</p>
            <p className="text-gray-400 leading-relaxed mb-10">{about.bio2}</p>
            
            <div className="flex flex-wrap gap-3 justify-end">
              {skills.map((skill, idx) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={defaultViewport}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: easeApple }}
                  className="px-4 py-2 rounded-full glass-card text-sm font-semibold text-foreground/80 border border-border hover:border-primary/40 hover:text-foreground transition-all"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const defaultSpecialOffer = {
  discount: "20%",
  code: "HANODY20",
  description: "للعملاء الجدد فقط. استخدم الكود عند الطلب واحصل على خصم فوري على باقتك المختارة.",
};

function SpecialOffer({ 
  isDiscountActive, 
  onActivateDiscount 
}: { 
  isDiscountActive?: boolean;
  onActivateDiscount?: () => void;
}) {
  const offer = useSection("specialOffer", defaultSpecialOffer);
  const [seconds, setSeconds] = useState(() => {
    const stored = localStorage.getItem("offer_end");
    if (stored) {
      const diff = Math.floor((parseInt(stored) - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    const end = Date.now() + 3 * 24 * 3600 * 1000;
    localStorage.setItem("offer_end", end.toString());
    return 3 * 24 * 3600;
  });

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const fmt = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={defaultViewport}
          transition={{ duration: 0.7, ease: easeApple }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative glass-card rounded-3xl p-10 md:p-14 border border-primary/20 overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
            
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              <Gift size={28} className="text-white" />
            </motion.div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              عرض محدود الوقت
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter">
              خصم <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{offer.discount}</span> على أول طلب
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              {offer.description}
            </p>
            
            <button
              onClick={() => onActivateDiscount && onActivateDiscount()}
              disabled={isDiscountActive}
              className={`inline-flex items-center justify-center gap-3 border rounded-2xl px-10 py-5 mb-8 transition-all font-black text-xl lg:text-2xl ${
                isDiscountActive 
                  ? "bg-green-500/20 border-green-500/50 text-green-400 cursor-default"
                  : "bg-primary/20 border-primary/50 text-foreground hover:bg-primary/40 hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              }`}
            >
              {isDiscountActive ? "تم تفعيل الخصم بنجاح ✓" : "تفعيل الخصم 20% الآن"}
            </button>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-4 mb-8 md:mb-10 w-full max-w-full">
              {[{ v: fmt(d), l: "يوم" }, { v: fmt(h), l: "ساعة" }, { v: fmt(m), l: "دقيقة" }, { v: fmt(s), l: "ثانية" }].map(({ v, l }, i) => (
                <div key={l} className="flex items-center gap-1.5 md:gap-4">
                  <div className="flex flex-col items-center">
                    <div className="text-lg md:text-3xl font-mono font-black text-foreground glass-card px-2.5 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl border border-border min-w-[2rem] md:min-w-[3rem] text-center">{v}</div>
                    <span className="text-[9px] md:text-xs text-muted-foreground mt-1.5 font-medium">{l}</span>
                  </div>
                  {i < 3 && <span className="text-primary text-lg md:text-2xl font-black mb-4 md:mb-5">:</span>}
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })}
              size="lg"
              className="h-14 px-10 rounded-full bg-primary text-white text-lg font-black hover:scale-105 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(59,130,246,0.35)] transition-all duration-300"
            >
              <Sparkles className="ml-2" size={20} />
              استخدم العرض الآن
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StickyOrderButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whatsappUrl = "https://wa.me/00962780691000?text=" + encodeURIComponent("مرحباً، أريد طلب صورة مصغرة لقناتي");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.8 }}
          transition={{ duration: 0.4, ease: easeApple }}
          className="fixed bottom-6 left-6 z-50 flex flex-col gap-3"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#25D366] text-white font-bold text-sm shadow-[0_4px_30px_rgba(37,211,102,0.4)] hover:scale-105 hover:shadow-[0_4px_40px_rgba(37,211,102,0.6)] transition-all duration-300"
          >
            <MessageCircle size={20} fill="white" />
            تواصل عبر واتساب
          </a>
          <button
            onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-primary text-white font-bold text-sm shadow-[0_4px_30px_rgba(59,130,246,0.4)] hover:scale-105 hover:shadow-[0_4px_40px_rgba(59,130,246,0.6)] transition-all duration-300"
          >
            <Inbox size={18} />
            اطلب الآن
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  package: z.string().min(1, "يرجى اختيار باقة"),
  details: z.string().min(10, "يرجى كتابة تفاصيل المشروع"),
});

const defaultContact = {
  title: "ابدأ طلبك",
  subtitle: "املأ النموذج أدناه أو راسلني مباشرة على إنستغرام للبدء.",
};

function Contact({ isDiscountActive }: { isDiscountActive?: boolean }) {
  const contact = useSection("contact", defaultContact);
  const customPricing = useSection("pricing", {} as any);
  const getPrice = (name: string, defaultP: string) => {
    let p = defaultP;
    if (name === "أساسي" && customPricing.basicPrice) p = customPricing.basicPrice;
    if (name === "احترافي" && customPricing.proPrice) p = customPricing.proPrice;
    if (name === "النخبة" && customPricing.elitePrice) p = customPricing.elitePrice;
    return isDiscountActive ? (parseFloat(p) * 0.8).toFixed(0) : p;
  };
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      package: "",
      details: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name, email: values.email, packageType: values.package, details: values.details }),
      });
      if (!res.ok) throw new Error("failed");
      toast({
        title: "تم إرسال رسالتك بنجاح!",
        description: "سأرد عليك خلال 24 ساعة.",
      });
      form.reset();
    } catch {
      toast({
        variant: "destructive",
        title: "خطأ في الإرسال",
        description: "يرجى المحاولة مجدداً أو التواصل عبر واتساب أو إنستغرام.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = "https://wa.me/00962780691000?text=" + encodeURIComponent("مرحباً، أريد طلب صورة مصغرة لقناتي");

  return (
    <section id="order" className="py-32 bg-background relative border-t border-border">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={{ duration: 0.7, ease: easeApple }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">{contact.title}</h2>
          <p className="text-lg text-muted-foreground">{contact.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-12 glass-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="md:col-span-3 relative z-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-semibold">الاسم</FormLabel>
                        <FormControl>
                          <Input placeholder="اسمك الكامل" className="h-14 bg-background/50 border-border text-foreground text-right rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-semibold">البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input placeholder="example@email.com" className="h-14 bg-background/50 border-border text-foreground rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="package"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-semibold">الباقة المطلوبة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 bg-background/50 border-border text-foreground rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all">
                            <SelectValue placeholder="اختر باقة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border rounded-xl">
                          <SelectItem value="basic">أساسي (${getPrice("أساسي", "29")})</SelectItem>
                          <SelectItem value="pro">احترافي (${getPrice("احترافي", "59")})</SelectItem>
                          <SelectItem value="elite">النخبة (${getPrice("النخبة", "99")})</SelectItem>
                          <SelectItem value="custom">احتياج مخصص</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 font-semibold">تفاصيل المشروع</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أخبرني عن قناتك وموضوع الفيديو وأي أفكار لديك..." 
                          className="bg-background/50 border-border min-h-[150px] text-foreground resize-none text-right rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all p-4" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black text-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                  {isSubmitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="md:col-span-2 flex flex-col justify-center gap-10 relative z-10 border-t md:border-t-0 md:border-l md:border-white/10 pt-10 md:pt-0 md:pl-10">
            <div className="text-center md:text-right">
              <h4 className="text-2xl font-bold text-foreground mb-3">تفضل التواصل المباشر؟</h4>
              <p className="text-base text-gray-400 mb-8">أرسل لي رسالة مباشرة على إنستغرام للرد الأسرع.</p>
              <div className="flex flex-col gap-3">
                <a 
                  href="https://instagram.com/hanody1x" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-3 w-full h-14 rounded-2xl border border-border glass-card hover:bg-foreground/10 text-foreground font-bold transition-all hover:scale-105 group"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  اطلب عبر إنستغرام
                </a>
                <a 
                  href={whatsappUrl}
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] font-bold transition-all hover:scale-105 group"
                >
                  <MessageCircle size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  اطلب عبر واتساب
                </a>
              </div>
            </div>
            
            <div className="p-8 rounded-3xl bg-primary/10 border border-primary/20 relative">
              <div className="absolute -top-3 -right-3 text-4xl text-primary opacity-50">"</div>
              <p className="text-base text-primary/90 font-medium italic mb-4 text-right leading-relaxed">رد خلال 10 دقائق وكانت الصورة جاهزة في اليوم التالي. سرعة مذهلة وعمل متقن.</p>
              <p className="text-sm text-white/50 text-left font-bold">— عميل سعيد</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const defaultFinalCta = {
  headline: "مستعد للانتشار الواسع؟",
  cta: "اطلب صورتك المصغرة الآن",
};

function FinalCTA() {
  const finalCta = useSection("finalCta", defaultFinalCta);
  return (
    <section className="py-40 relative overflow-hidden flex items-center justify-center text-center">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-[120px] pointer-events-none" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={defaultViewport}
          transition={{ duration: 1, ease: easeApple }}
          className="text-6xl md:text-[6rem] font-black text-foreground mb-10 tracking-tighter leading-tight"
        >
          {finalCta.headline}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={{ duration: 0.7, delay: 0.2, ease: easeApple }}
          className="relative inline-block group"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-full opacity-30 group-hover:opacity-100 group-hover:blur-2xl transition-all duration-700" />
          <Button 
            onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })}
            size="lg" 
            className="relative h-16 md:h-20 px-8 md:px-12 rounded-full bg-primary text-white text-xl md:text-2xl font-black hover:bg-primary/90 hover:scale-[1.05] hover:-translate-y-1 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.6)]"
          >
            {finalCta.cta}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isDiscountActive, setIsDiscountActive] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <StickyOrderButton />
      <Hero />
      <Stats />
      <HowItWorks />
      <Pricing isDiscountActive={isDiscountActive} />
      <SpecialOffer isDiscountActive={isDiscountActive} onActivateDiscount={() => {
        setIsDiscountActive(true);
        document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
      }} />
      <CTRSection />
      <About />
      <Urgency />
      <ClientShowcase />
      <PortfolioGrid />
      <WhyChooseMe />
      <Contact isDiscountActive={isDiscountActive} />
      <FinalCTA />
    </div>
  );
}

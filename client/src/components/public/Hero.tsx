import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useImages, useSection } from "@/hooks/useContent";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const defaultHero = {
  badge: "Available for new projects",
  headline: "I design thumbnails\nthat get clicks.",
  subheadline:
    "Professional YouTube thumbnail design that stops the scroll, grabs attention, and converts views into subscribers.",
  ctaPrimary: "View My Work",
  ctaSecondary: "Get in Touch",
};

export function Hero() {
  const images = useImages();
  const h = useSection("hero", defaultHero as typeof defaultHero);

  // Prefer English defaults on public site
  const badge = "Available for new projects";
  const subheadline =
    "Professional YouTube thumbnail design that stops the scroll, grabs attention, and converts views into subscribers.";

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="pub-container">
        <div className="max-w-4xl">
          {/* Availability badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/10 bg-white mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-black/60 tracking-wide uppercase">
              {badge}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-black leading-[1.05] tracking-tight mb-6"
          >
            I design thumbnails
            <br />
            <span className="text-black/30">that get clicks.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="text-lg md:text-xl text-black/50 mb-10 max-w-xl leading-relaxed font-normal"
          >
            {subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link href="/work">
              <span className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors cursor-pointer group">
                View My Work
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>

            <button
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-black/15 text-black text-sm font-semibold hover:border-black/30 hover:bg-black/3 transition-all"
            >
              Get in Touch
            </button>
          </motion.div>
        </div>

        {/* Hero thumbnail previews */}
        {(images.heroCard1 || images.heroCard2) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease }}
            className="mt-16 md:mt-20 relative"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {images.portfolio?.slice(0, 6).map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.06, ease }}
                  className="aspect-video rounded-xl overflow-hidden border border-black/8 bg-black/5"
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading={i < 3 ? "eager" : "lazy"}
                  />
                </motion.div>
              ))}
              {!images.portfolio?.length && images.heroCard1 && (
                <div className="col-span-2 md:col-span-2 aspect-video rounded-xl overflow-hidden border border-black/8">
                  <img
                    src={images.heroCard1}
                    alt="Thumbnail sample"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

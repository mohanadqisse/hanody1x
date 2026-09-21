import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSection } from "@/hooks/useContent";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

interface FinalCtaData {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

const defaultFinalCta: FinalCtaData = {
  eyebrow: "Ready to start?",
  heading: "Let's build thumbnails",
  subheading: "that actually work.",
  description: "Limited spots available. Tell me about your channel and let's get started.",
  ctaText: "Get in Touch",
  ctaLink: "#contact",
};

export function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const data = useSection<FinalCtaData>("finalCta", defaultFinalCta);

  const eyebrow = data.eyebrow || defaultFinalCta.eyebrow;
  const heading = data.heading || defaultFinalCta.heading;
  const subheading = data.subheading || defaultFinalCta.subheading;
  const description = data.description || defaultFinalCta.description;
  const ctaText = data.ctaText || defaultFinalCta.ctaText;
  const ctaLink = data.ctaLink || defaultFinalCta.ctaLink || "#contact";

  const handleCTA = () => {
    if (ctaLink.startsWith("#")) {
      const el = document.getElementById(ctaLink.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = ctaLink;
    }
  };

  return (
    <section className="pub-section" ref={ref}>
      <div className="pub-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
          className="relative rounded-3xl bg-black text-white px-8 py-16 md:px-16 md:py-20 overflow-hidden text-center"
        >
          {/* Subtle texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                {eyebrow}
              </p>
            )}
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-[1.05] text-white/75">
              {heading}
              {subheading && (
                <>
                  <br />
                  <span className="text-white/30">{subheading}</span>
                </>
              )}
            </h2>
            {description && (
              <p className="text-white/50 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed">
                {description}
              </p>
            )}
            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors group cursor-pointer"
            >
              {ctaText}
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

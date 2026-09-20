import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
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
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
              Ready to start?
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-[1.05]">
              Let's build thumbnails
              <br />
              <span className="text-white/30">that actually work.</span>
            </h2>
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Limited spots available. Tell me about your channel and let's get started.
            </p>
            <button
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors group"
            >
              Get in Touch
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

import { motion } from "framer-motion";
import { Link } from "wouter";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const heroVariants = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
  },
  itemFast: {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  },
};

export function Hero() {
  const supportingCopy =
    "I create high-impact thumbnails for creators who want to stand out, get clicked, and be remembered.";

  return (
    <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-24 md:pt-52 md:pb-32 overflow-hidden flex flex-col items-center justify-center">
      <div className="pub-container w-full">
        <motion.div
          className="max-w-4xl mx-auto flex flex-col items-center text-center"
          variants={heroVariants.container}
          initial="hidden"
          animate="show"
        >
          {/* Eyebrow */}
          <motion.p
            variants={heroVariants.itemFast}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-black/40 mb-6 sm:mb-8"
          >
            MADE TO STOP THE SCROLL
          </motion.p>

          {/* Editorial Headline */}
          <motion.h1
            variants={heroVariants.item}
            className="text-[clamp(2.15rem,8.2vw,2.4rem)] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] font-black text-black leading-[0.98] tracking-[-0.035em] mb-7 sm:mb-9"
          >
            THUMBNAILS
            <br />
            PEOPLE CAN'T
            <br />
            <span className="text-black/30 font-black">IGNORE.</span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            variants={heroVariants.item}
            className="text-base sm:text-lg md:text-xl text-black/55 mb-10 max-w-[640px] leading-relaxed font-normal"
          >
            {supportingCopy}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={heroVariants.itemFast}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
          >
            <Link href="/work" className="w-full sm:w-auto flex justify-center">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black text-white text-sm font-semibold cursor-pointer group shadow-sm w-full sm:w-auto text-center"
                style={{ display: "inline-flex" }}
              >
                <span>VIEW MY WORK</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 font-sans">
                  →
                </span>
              </motion.span>
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-black/15 text-black text-sm font-semibold hover:border-black/30 hover:bg-black/5 transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              LET'S WORK TOGETHER
            </motion.button>
          </motion.div>

          {/* Subtle Editorial Scroll Indicator */}
          <motion.div
            variants={heroVariants.itemFast}
            className="pt-16 sm:pt-20 md:pt-24 flex flex-col items-center gap-2.5 opacity-25 hover:opacity-60 transition-opacity cursor-pointer select-none"
            onClick={() => {
              const el = document.getElementById("portfolio");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-black">
              SCROLL
            </span>
            <div className="w-px h-7 bg-black/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

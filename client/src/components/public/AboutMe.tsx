import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSection } from "@/hooks/useContent";

/* ─────────────────────────────────────────────
   Shared easing curve
───────────────────────────────────────────── */
const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

/* ─────────────────────────────────────────────
   Data shape
───────────────────────────────────────────── */
interface AboutMeData {
  eyebrow: string;
  headline1: string;
  headline2: string;
  bio1: string;
  bio2: string;
  specialties: string; // comma-separated
  stat1Number: string;
  stat1Title: string;
  stat1Desc: string;
  stat2Number: string;
  stat2Title: string;
  stat2Desc: string;
  stat3Number: string;
  stat3Title: string;
  stat3Desc: string;
  profileImage: string;
  ctaLabel: string;
  ctaLink: string;
}

/* ─────────────────────────────────────────────
   Defaults — intentionally empty for stats/image
   so fake numbers never appear on the public site.
───────────────────────────────────────────── */
const defaultAboutMe: AboutMeData = {
  eyebrow: "About",
  headline1: "YouTube Thumbnail",
  headline2: "Designer",
  bio1: "I'm Muhanad — a graphic designer specializing in YouTube thumbnails. I work with content creators worldwide to design thumbnails that don't just look good — they perform.",
  bio2: "Every thumbnail I deliver is built on a deep understanding of visual hierarchy, color psychology, and YouTube behavior. The goal is always the same: more clicks.",
  specialties: "",
  stat1Number: "",
  stat1Title: "",
  stat1Desc: "",
  stat2Number: "",
  stat2Title: "",
  stat2Desc: "",
  stat3Number: "",
  stat3Title: "",
  stat3Desc: "",
  profileImage: "",
  ctaLabel: "Let's Work Together",
  ctaLink: "#contact",
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function AboutMe() {
  const data = useSection<AboutMeData>("aboutMe", defaultAboutMe);

  /* Specialties */
  const specialties = (data.specialties || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  /* Stats — only show if the number field is non-empty */
  const stats = [
    { number: data.stat1Number, title: data.stat1Title, desc: data.stat1Desc },
    { number: data.stat2Number, title: data.stat2Title, desc: data.stat2Desc },
    { number: data.stat3Number, title: data.stat3Title, desc: data.stat3Desc },
  ].filter((s) => s.number && s.number.trim() !== "");

  /* CTA scroll target */
  const ctaTarget = (data.ctaLink || "#contact").startsWith("#")
    ? (data.ctaLink || "#contact").slice(1)
    : "contact";

  const handleCTA = () => {
    const el = document.getElementById(ctaTarget);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.location.href = data.ctaLink || "#contact";
  };

  return (
    <section id="about" className="pub-section border-t border-black/8">
      <div className="pub-container">

        {/* ── Two-column editorial grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-12 md:gap-20 lg:gap-28 items-start">

          {/* ══════════════════════════════
              LEFT — Profile image
          ══════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease }}
            className="w-full"
          >
            {data.profileImage ? (
              /* ── Uploaded image ── */
              <div className="relative w-full max-w-sm sm:max-w-md mx-auto md:max-w-none overflow-hidden rounded-3xl border border-black/8 shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
                   style={{ aspectRatio: "3/4" }}>
                <img
                  src={data.profileImage}
                  alt={`${data.headline1} ${data.headline2}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
                {/* Subtle bottom gradient for depth */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.12) 0%, transparent 50%)",
                  }}
                />
              </div>
            ) : (
              /* ── Empty state — no fake person ── */
              <div
                className="relative w-full max-w-sm sm:max-w-md mx-auto md:max-w-none rounded-3xl border border-dashed border-black/12 bg-black/[0.025] flex flex-col items-center justify-center gap-4"
                style={{ aspectRatio: "3/4" }}
              >
                {/* Subtle monogram / placeholder */}
                <div className="w-20 h-20 rounded-full border border-black/10 bg-white/80 flex items-center justify-center">
                  <span className="text-2xl font-black text-black/15 tracking-tight select-none">M</span>
                </div>
                <p className="text-xs text-black/20 font-medium tracking-wider uppercase text-center px-6">
                  Profile photo
                  <br />
                  <span className="font-normal">Upload via Admin Panel</span>
                </p>
              </div>
            )}
          </motion.div>

          {/* ══════════════════════════════
              RIGHT — Editorial content
          ══════════════════════════════ */}
          <div className="flex flex-col">

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease }}
              className="text-xs font-semibold uppercase tracking-widest text-black/30 mb-5"
            >
              {data.eyebrow || "About"}
            </motion.p>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.07, ease }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.05] mb-8"
            >
              {data.headline1}
              <br />
              <span className="text-black/22">{data.headline2}</span>
            </motion.h2>

            {/* Biography */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.13, ease }}
              className="space-y-4 text-black/55 leading-relaxed text-[0.9375rem] mb-10"
            >
              {data.bio1 && <p>{data.bio1}</p>}
              {data.bio2 && <p>{data.bio2}</p>}
            </motion.div>

            {/* Specialties */}
            {specialties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: 0.2, ease }}
                className="mb-10"
              >
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-black/25 mb-3">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((s) => (
                    <span
                      key={s}
                      className="px-4 py-1.5 rounded-full border border-black/10 text-xs font-medium text-black/50 bg-black/[0.025] tracking-wide"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stats — only if admin has entered real values */}
            {stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: 0.27, ease }}
                className="mb-10 space-y-5"
              >
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-black/25">
                  By the numbers
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.map((item, i) => (
                    <motion.div
                      key={`${item.title}-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5, delay: 0.32 + i * 0.07, ease }}
                      className="border border-black/8 rounded-2xl p-4 bg-black/[0.015]"
                    >
                      <p className="text-2xl font-black text-black tracking-tight mb-0.5">
                        {item.number}
                      </p>
                      {item.title && (
                        <p className="text-xs font-semibold text-black/55 mb-1">
                          {item.title}
                        </p>
                      )}
                      {item.desc && (
                        <p className="text-xs text-black/35 leading-relaxed">
                          {item.desc}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA */}
            {data.ctaLabel && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.35, ease }}
              >
                <button
                  id="about-me-cta"
                  onClick={handleCTA}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors duration-200 group"
                >
                  {data.ctaLabel}
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </button>
              </motion.div>
            )}

          </div>
          {/* ── end RIGHT ── */}
        </div>
        {/* ── end grid ── */}

      </div>
    </section>
  );
}

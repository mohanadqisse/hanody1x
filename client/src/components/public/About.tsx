import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useSection } from "@/hooks/useContent";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const defaultAbout = {
  title: "YouTube Thumbnail Designer",
  bio1: "I'm Muhanad — a graphic designer specializing in YouTube thumbnails. I work with content creators worldwide to design thumbnails that don't just look good, they perform.",
  bio2: "Every thumbnail I deliver is built on a deep understanding of visual hierarchy, color psychology, and YouTube algorithm behavior. The goal is always the same: more clicks.",
  badge1: "50+ Creators",
  badge2: "+120% Avg CTR",
};

const skills = [
  "Thumbnail Design",
  "CTR Optimization",
  "Color Psychology",
  "Visual Effects",
  "Channel Branding",
  "Composition",
];

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const data = useSection("about", defaultAbout as typeof defaultAbout);

  // Use English defaults
  const bio1 = "I'm Muhanad — a graphic designer specializing in YouTube thumbnails. I work with content creators worldwide to design thumbnails that don't just look good, they perform.";
  const bio2 = "Every thumbnail I deliver is built on a deep understanding of visual hierarchy, color psychology, and YouTube algorithm behavior. The goal is always the same: more clicks.";

  return (
    <section id="about" className="pub-section border-t border-black/8" ref={ref}>
      <div className="pub-container">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease }}
              className="text-xs font-semibold uppercase tracking-widest text-black/30 mb-4"
            >
              About
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.05, ease }}
              className="text-3xl md:text-4xl font-black text-black tracking-tight mb-8"
            >
              YouTube Thumbnail<br />
              <span className="text-black/30">Designer</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="space-y-4 text-black/55 leading-relaxed"
            >
              <p>{bio1}</p>
              <p>{bio2}</p>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3.5 py-1.5 rounded-full border border-black/10 text-xs font-medium text-black/50 bg-black/2"
                >
                  {skill}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — quick facts */}
          <div className="space-y-6">
            {[
              {
                number: "50+",
                title: "YouTube Creators",
                desc: "From emerging channels to established creators across multiple niches.",
              },
              {
                number: "120%",
                title: "Average CTR Increase",
                desc: "Measurable results — not just beautiful thumbnails, but thumbnails that perform.",
              },
              {
                number: "48h",
                title: "Average Delivery",
                desc: "Fast turnaround without compromising quality. Most orders done in 1–2 days.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease }}
                className="flex gap-5 items-start border-b border-black/8 pb-6 last:border-0 last:pb-0"
              >
                <span className="text-3xl font-black text-black min-w-[4rem]">
                  {item.number}
                </span>
                <div>
                  <p className="font-semibold text-black text-sm mb-1">{item.title}</p>
                  <p className="text-black/45 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

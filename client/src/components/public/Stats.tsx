import { motion } from "framer-motion";
import { useSection } from "@/hooks/useContent";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const defaultStats = [
  { value: "500+", label: "Thumbnails Delivered" },
  { value: "50+",  label: "YouTube Creators" },
  { value: "100M+", label: "Combined Views" },
];

export function Stats() {
  // Try to pull live stats from CMS, fall back to defaults
  const apiStats = useSection<typeof defaultStats>("stats", defaultStats);
  const stats = Array.isArray(apiStats) && apiStats.length > 0
    ? apiStats.map((s: any) => ({
        value: s.suffix ? `${s.value}${s.suffix}` : s.value,
        label: s.label,
      }))
    : defaultStats;

  return (
    <section className="pub-section border-t border-black/8">
      <div className="pub-container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 md:divide-x md:divide-black/8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              className="flex flex-col items-center sm:items-center text-center"
            >
              <span className="text-5xl md:text-6xl font-black text-black tracking-tight mb-2">
                {stat.value}
              </span>
              <span className="text-sm text-black/40 font-medium uppercase tracking-widest">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

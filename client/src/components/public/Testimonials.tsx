import { motion } from "framer-motion";
import { useSection } from "@/hooks/useContent";
import { caseStudiesEn } from "@/lib/i18n-defaults";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export interface TestimonialItem {
  id: string | number;
  name: string;
  niche: string;
  initials?: string;
  quote: string;
  metricValue?: string;
  metricLabel?: string;
}

const defaultTestimonials: TestimonialItem[] = caseStudiesEn.map((cs) => ({
  id: cs.id,
  name: cs.name,
  niche: cs.niche,
  initials: cs.avatarInitials,
  quote: cs.shortBio,
  metricValue: cs.metrics[0]?.value || "",
  metricLabel: cs.metrics[0]?.label || "",
}));

export function Testimonials() {
  const apiTestimonials = useSection<TestimonialItem[]>("testimonials", defaultTestimonials);
  const list = Array.isArray(apiTestimonials) && apiTestimonials.length > 0
    ? apiTestimonials
    : defaultTestimonials;

  if (list.length === 0) return null;

  return (
    <section className="pub-section border-t border-black/8">
      <div className="pub-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-black/30 mb-3">
            Results
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight">
            Creators Who Grew
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((t, i) => {
            const initials = t.initials || (t.name ? t.name.split(" ").map(w => w[0]?.toUpperCase()).join("").slice(0, 2) : "YT");

            return (
              <motion.div
                key={t.id || i}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease }}
                className="border border-black/8 rounded-2xl p-6 bg-white hover:border-black/16 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top metric highlight (if configured) */}
                  {t.metricValue && t.metricValue.trim() && (
                    <div className="mb-4">
                      <span className="text-3xl font-black text-black">{t.metricValue}</span>
                      {t.metricLabel && (
                        <span className="block text-xs text-black/35 font-medium uppercase tracking-wider mt-0.5">
                          {t.metricLabel}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quote */}
                  <p className="text-sm text-black/60 leading-relaxed mb-5">{t.quote}</p>
                </div>

                {/* Creator footer */}
                <div className="flex items-center gap-3 pt-4 border-t border-black/8">
                  <div className="w-9 h-9 rounded-full bg-black/6 flex items-center justify-center text-xs font-black text-black/50 shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">{t.name}</p>
                    {t.niche && <p className="text-xs text-black/35">{t.niche}</p>}
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

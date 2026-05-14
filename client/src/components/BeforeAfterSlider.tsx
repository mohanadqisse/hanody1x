import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─── types ─── */
export interface ComparisonItem {
  beforeImage: string;
  afterImage: string;
  title?: string;
  tag?: string;
}

interface BeforeAfterSliderProps {
  comparisons: ComparisonItem[];
}

/* ─── slider core ─── */
function SliderCore({ beforeImage, afterImage }: { beforeImage: string; afterImage: string }) {
  const { t } = useLanguage();
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  const calcPercent = useCallback((clientX: number) => {
    if (!containerRef.current) return 50;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const raw = ((clientX - left) / width) * 100;
    const clamped = Math.max(0, Math.min(raw, 100));
    // Snap to edges when within 2%
    if (clamped < 2) return 0;
    if (clamped > 98) return 100;
    return clamped;
  }, []);

  const onPointerMove = useCallback((clientX: number) => {
    if (!dragging.current) return;
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => setPos(calcPercent(clientX)));
  }, [calcPercent]);

  useEffect(() => {
    const mm = (e: MouseEvent) => onPointerMove(e.clientX);
    const tm = (e: TouchEvent) => { e.preventDefault(); onPointerMove(e.touches[0].clientX); };
    const stop = () => { dragging.current = false; document.body.style.cursor = ''; };

    window.addEventListener('mousemove', mm, { passive: true });
    window.addEventListener('touchmove', tm, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
      cancelAnimationFrame(rafId.current);
    };
  }, [onPointerMove]);

  const startDrag = (clientX: number) => {
    dragging.current = true;
    document.body.style.cursor = 'ew-resize';
    setPos(calcPercent(clientX));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/9] overflow-hidden select-none touch-none"
      style={{ cursor: 'ew-resize', willChange: 'transform' }}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX); }}
      onTouchStart={(e) => startDrag(e.touches[0].clientX)}
    >
      {/* After image (full) */}
      <img
        src={afterImage}
        alt={t("ba.after")}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        loading="lazy"
      />

      {/* Before image (clipped — pixel-perfect with divider) */}
      <img
        src={beforeImage}
        alt={t("ba.before")}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
        loading="lazy"
      />

      {/* Labels */}
      <div
        className="absolute top-3 md:top-5 px-3 py-1 md:px-3.5 md:py-1.5 rounded-lg text-white/90 text-[10px] md:text-xs font-semibold pointer-events-none tracking-wide uppercase"
        style={{
          right: '12px',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {t("ba.after")}
      </div>
      <div
        className="absolute top-3 md:top-5 px-3 py-1 md:px-3.5 md:py-1.5 rounded-lg text-white/90 text-[10px] md:text-xs font-semibold pointer-events-none tracking-wide uppercase"
        style={{
          left: '12px',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          opacity: pos < 10 ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        {t("ba.before")}
      </div>

      {/* ── Divider line + handle ── */}
      <div
        className="absolute top-0 bottom-0 z-10 pointer-events-none"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)', opacity: pos === 0 || pos === 100 ? 0 : 1, transition: 'opacity 0.15s ease' }}
      >
        {/* Thin line */}
        <div
          className="absolute inset-0"
          style={{
            width: '1.5px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.7)',
            boxShadow: '0 0 6px rgba(255,255,255,0.2)',
          }}
        />

        {/* Floating glass pill handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="flex items-center justify-center gap-[3px]"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {/* Left arrow */}
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ opacity: 0.9 }}>
              <path d="M6 2L2 6L6 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* Right arrow */}
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ opacity: 0.9 }}>
              <path d="M2 2L6 6L2 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main section ─── */
export function BeforeAfterSlider({ comparisons }: BeforeAfterSliderProps) {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);

  if (!comparisons || comparisons.length === 0) return null;
  const active = comparisons[activeIdx] || comparisons[0];

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] max-w-[800px] max-h-[400px] bg-gradient-to-b from-primary/4 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-foreground/70 tracking-wide">{t("ba.badge")}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl md:text-5xl font-black mb-3 md:mb-4 tracking-tighter"
          >
            {t("ba.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto"
          >
            {t("ba.subtitle")}
          </motion.p>
        </div>

        {/* Active info */}
        <AnimatePresence mode="wait">
          {(active.title || active.tag) && (
            <motion.div
              key={`info-${activeIdx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center gap-2.5 mb-5"
            >
              {active.tag && (
                <span className="px-2.5 py-0.5 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/60 text-[11px] font-medium">
                  {active.tag}
                </span>
              )}
              {active.title && (
                <h3 className="text-sm md:text-base font-semibold text-foreground/80">{active.title}</h3>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slider container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.35)] border border-white/8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`slider-${activeIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <SliderCore
                beforeImage={active.beforeImage}
                afterImage={active.afterImage}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Thumbnails */}
        {comparisons.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 md:mt-8"
          >
            <div
              className="flex gap-2.5 md:gap-3 overflow-x-auto pb-3 px-0.5 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {comparisons.map((item, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`relative flex-shrink-0 snap-start rounded-xl overflow-hidden transition-all duration-300 focus:outline-none ${
                      isActive
                        ? 'ring-[1.5px] ring-white/40 ring-offset-1 ring-offset-background shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{ width: 'clamp(120px, 18vw, 170px)', aspectRatio: '16/9' }}
                  >
                    <div className="absolute inset-0">
                      <img src={item.afterImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" draggable={false} />
                      <img src={item.beforeImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: 'inset(0 50% 0 0)' }} loading="lazy" draggable={false} />
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/50" />
                    </div>
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[9px] md:text-[10px] font-medium text-white/90 text-center truncate" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>
                        {item.title}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        [style*="scrollbar-width"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

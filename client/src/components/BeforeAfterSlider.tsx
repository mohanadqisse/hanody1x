import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

/* ─── constants ─── */
const INITIAL_POS = 50;

/* ─── single slider core ─── */
function SliderCore({ beforeImage, afterImage }: { beforeImage: string; afterImage: string }) {
  const [pos, setPos] = useState(INITIAL_POS);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  const calcPercent = useCallback((clientX: number) => {
    if (!containerRef.current) return INITIAL_POS;
    const { left, width } = containerRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(((clientX - left) / width) * 100, 100));
  }, []);

  const onPointerMove = useCallback((clientX: number) => {
    if (!dragging.current) return;
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => setPos(calcPercent(clientX)));
  }, [calcPercent]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => onPointerMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); onPointerMove(e.touches[0].clientX); };
    const stop = () => { dragging.current = false; document.body.style.cursor = ''; };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
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
      className="relative w-full aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden select-none touch-none"
      style={{ cursor: dragging.current ? 'ew-resize' : 'ew-resize', willChange: 'transform' }}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX); }}
      onTouchStart={(e) => startDrag(e.touches[0].clientX)}
    >
      {/* After (full background) */}
      <img
        src={afterImage}
        alt="بعد التعديل"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        loading="lazy"
      />

      {/* Before (clipped via clip-path — pixel-perfect sync) */}
      <img
        src={beforeImage}
        alt="قبل التعديل"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
        loading="lazy"
      />

      {/* Labels */}
      <div
        className="absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-white text-[11px] md:text-sm font-bold pointer-events-none border border-white/15 select-none"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        بعد التعديل ✨
      </div>
      <div
        className="absolute top-4 left-4 md:top-6 md:left-6 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-white text-[11px] md:text-sm font-bold pointer-events-none border border-white/15 select-none"
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          opacity: pos < 12 ? 0 : 1,
          transition: 'opacity 0.25s ease',
        }}
      >
        قبل التعديل
      </div>

      {/* ── Divider line ── */}
      <div
        className="absolute top-0 bottom-0 z-10 pointer-events-none"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)', width: '2px' }}
      >
        {/* Thin glowing line */}
        <div className="absolute inset-0 w-full" style={{
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 0 8px rgba(255,255,255,0.4), 0 0 20px rgba(59,130,246,0.15)',
        }} />

        {/* Handle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 44, height: 44 }}
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
            transform: 'scale(1.8)',
          }} />
          {/* Glass handle */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35), 0 0 0 2px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
              <path d="m9 18-6-6 6-6" />
              <path d="m15 18 6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main section ─── */
export function BeforeAfterSlider({ comparisons }: BeforeAfterSliderProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!comparisons || comparisons.length === 0) return null;
  const active = comparisons[activeIdx] || comparisons[0];

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vw] max-w-[900px] max-h-[500px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">مقارنة احترافية</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 tracking-tighter"
          >
            شاهد الفرق بنفسك
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            اسحب الخط لليمين واليسار لتشاهد كيف يمكن لتصميم احترافي أن يغير جذرياً انطباع المشاهد.
          </motion.p>
        </div>

        {/* Active title & tag */}
        <AnimatePresence mode="wait">
          {(active.title || active.tag) && (
            <motion.div
              key={`info-${activeIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              {active.tag && (
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  {active.tag}
                </span>
              )}
              {active.title && (
                <h3 className="text-lg md:text-xl font-bold text-foreground">{active.title}</h3>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`slider-${activeIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <SliderCore
                beforeImage={active.beforeImage}
                afterImage={active.afterImage}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Thumbnails — only show when multiple comparisons */}
        {comparisons.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 md:mt-10"
          >
            <div
              ref={scrollRef}
              className="flex gap-3 md:gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {comparisons.map((item, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`relative flex-shrink-0 snap-start rounded-xl md:rounded-2xl overflow-hidden transition-all duration-400 group focus:outline-none ${
                      isActive
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02] shadow-[0_8px_30px_rgba(59,130,246,0.3)]'
                        : 'opacity-60 hover:opacity-90 hover:scale-[1.01]'
                    }`}
                    style={{ width: 'clamp(140px, 20vw, 200px)', aspectRatio: '16/9' }}
                  >
                    {/* Split thumbnail preview */}
                    <div className="absolute inset-0">
                      <img
                        src={item.afterImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                      <img
                        src={item.beforeImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ clipPath: 'inset(0 50% 0 0)' }}
                        loading="lazy"
                        draggable={false}
                      />
                      {/* Center divider line on thumbnail */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-white/70" />
                    </div>

                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-colors duration-300 ${
                      isActive ? 'bg-primary/10' : 'bg-black/20 group-hover:bg-black/10'
                    }`} />

                    {/* Title label */}
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-[10px] md:text-xs font-bold text-white text-center truncate" style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      }}>
                        {item.title}
                      </div>
                    )}

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
}

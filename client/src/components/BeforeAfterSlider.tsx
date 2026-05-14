import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { motion } from 'framer-motion';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

export function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: globalThis.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const stopDragging = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', stopDragging);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDragging);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging]);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tighter"
          >
            الفرق بين صورتك العادية والصورة المصغرة الاحترافية
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            اسحب الخط لليمين واليسار لتشاهد كيف يمكن لتصميم احترافي أن يغير جذرياً انطباع المشاهد.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl glass-card cursor-ew-resize select-none border border-white/10"
          ref={containerRef}
          onMouseDown={(e: ReactMouseEvent) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e: ReactTouchEvent) => {
            setIsDragging(true);
            handleMove(e.touches[0].clientX);
          }}
        >
          {/* After Image (Background - Right side visible) */}
          <img
            src={afterImage}
            alt="After"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable="false"
          />

          {/* Before Image (Foreground - Left side clipped) */}
          <div
            className="absolute inset-0 top-0 left-0 bottom-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImage}
              alt="Before"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable="false"
            />
          </div>

          {/* Labels */}
          <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm text-white font-bold text-sm pointer-events-none border border-white/10">
            بعد التعديل الاحترافي
          </div>
          <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm text-white font-bold text-sm pointer-events-none border border-white/10" style={{ opacity: sliderPosition < 20 ? 0 : 1, transition: 'opacity 0.2s' }}>
            قبل التعديل
          </div>

          {/* Slider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-10 pointer-events-none flex items-center justify-center"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="m9 18-6-6 6-6"/>
                <path d="m15 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Eye } from "lucide-react";
import { ColorPalette } from "./ColorPalette";

export interface PortfolioViewerItem {
  id: number | string;
  imageUrl: string;
  creatorName?: string;
  videoTitle?: string;
  youtubeUrl?: string;
  views?: string;
  category?: string;
}

interface PortfolioViewerProps {
  item: PortfolioViewerItem | null;
  onClose: () => void;
}

export function PortfolioViewer({ item, onClose }: PortfolioViewerProps) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (item) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  const hasRealYoutubeUrl =
    item.youtubeUrl &&
    item.youtubeUrl.trim().length > 0 &&
    (item.youtubeUrl.startsWith("http://") || item.youtubeUrl.startsWith("https://"));

  const hasMetadata =
    Boolean(item.creatorName?.trim()) ||
    Boolean(item.videoTitle?.trim()) ||
    Boolean(item.views?.trim()) ||
    Boolean(item.category?.trim()) ||
    Boolean(hasRealYoutubeUrl);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10"
        dir="ltr"
      >
        {/* Neutral dark backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-black/10 shadow-2xl p-4 sm:p-6 md:p-8 z-10 text-left"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors z-20 cursor-pointer"
            aria-label="Close viewer"
          >
            <X size={18} />
          </button>

          {/* Desktop 2-column layout: Large thumbnail on left, Info & Palette on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left: Large Thumbnail */}
            <div className="lg:col-span-8 w-full flex items-center justify-center bg-black/[0.03] rounded-2xl border border-black/8 overflow-hidden aspect-video">
              <img
                src={item.imageUrl}
                alt={item.videoTitle || item.creatorName || "Thumbnail"}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right: Information Panel & Color Palette */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Views Row */}
                {(item.category || item.views) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {item.category && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-black/50 bg-black/5 px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                    )}
                    {item.views && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/70 bg-black/4 px-3 py-1 rounded-full">
                        <Eye size={12} className="text-black/40" />
                        {item.views}
                      </span>
                    )}
                  </div>
                )}

                {/* Creator Name */}
                {item.creatorName && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/35 block mb-1">
                      Creator / Channel
                    </span>
                    <h3 className="text-2xl font-black text-black tracking-tight leading-tight">
                      {item.creatorName}
                    </h3>
                  </div>
                )}

                {/* Video Title */}
                {item.videoTitle && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/35 block mb-1">
                      Video Title
                    </span>
                    <p className="text-sm font-medium text-black/75 leading-snug">
                      {item.videoTitle}
                    </p>
                  </div>
                )}
              </div>

              {/* Dominant Color Palette */}
              <div className="pt-2 border-t border-black/8">
                <ColorPalette imageUrl={item.imageUrl} />
              </div>

              {/* Watch on YouTube Button */}
              {hasRealYoutubeUrl && (
                <div className="pt-2">
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-black/85 transition-all shadow-sm group cursor-pointer"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink
                      size={13}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

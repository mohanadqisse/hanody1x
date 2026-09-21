import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { usePortfolioCreators, type PortfolioItem } from "@/hooks/useContent";
import { ProjectCard } from "@/components/public/ProjectCard";
import { PortfolioViewer, type PortfolioViewerItem } from "@/components/public/PortfolioViewer";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export default function Work() {
  const { creators, isLoading } = usePortfolioCreators();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<PortfolioViewerItem | null>(null);

  // Guarantee page opens at the very top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Collect all unique categories from all creators' thumbnails
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const creator of creators) {
      for (const item of creator.items) {
        if (item.category && item.category.trim()) {
          set.add(item.category.trim());
        }
      }
    }
    const list = Array.from(set);
    return list.length > 1 ? ["All", ...list] : ["All"];
  }, [creators]);

  // Total thumbnail count across all active creators
  const totalThumbnails = useMemo(() => {
    return creators.reduce((acc, c) => acc + (c.items?.length || 0), 0);
  }, [creators]);

  // Filter creator sections by category
  const filteredCreators = useMemo(() => {
    if (activeCategory === "All") return creators;
    return creators
      .map((creator) => ({
        ...creator,
        items: creator.items.filter((item) => item.category === activeCategory),
      }))
      .filter((creator) => creator.items.length > 0);
  }, [creators, activeCategory]);

  return (
    <main className="pt-32 md:pt-40 pb-28" dir="ltr">
      <div className="pub-container text-left">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-black/30 mb-3">
            Portfolio
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-black tracking-tight mb-4">
            All Work
          </h1>
          <p className="text-black/50 text-base md:text-lg max-w-xl leading-relaxed">
            A collection of YouTube thumbnail designs across multiple niches and channels.
          </p>

          {/* Dynamic counts */}
          {!isLoading && creators.length > 0 && (
            <div className="flex items-center gap-3 mt-6 text-xs text-black/40 font-semibold uppercase tracking-wider">
              <span>{creators.length} {creators.length === 1 ? "Creator" : "Creators"}</span>
              <span>•</span>
              <span>{totalThumbnails} {totalThumbnails === 1 ? "Thumbnail" : "Thumbnails"}</span>
            </div>
          )}
        </motion.div>

        {/* Category filter — only shown if multiple real categories exist */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="flex flex-wrap gap-2 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-black text-white font-semibold shadow-xs"
                    : "border border-black/12 text-black/60 hover:border-black/25 hover:text-black bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-16 py-8">
            {[1, 2].map((n) => (
              <div key={n} className="space-y-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black/5" />
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-black/8 rounded-md" />
                    <div className="h-3 w-24 bg-black/5 rounded-md" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((m) => (
                    <div key={m} className="aspect-video rounded-3xl bg-black/5" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Creator-Grouped Sections */}
        {!isLoading && filteredCreators.length > 0 ? (
          <div className="space-y-20 md:space-y-28">
            {filteredCreators.map((creator, cIdx) => {
              const items = creator.items || [];
              const initials = creator.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join("") || "YT";

              // If only 2 items, 2 large columns; if 3+ items, 3 large columns on desktop
              const gridCols = items.length === 2
                ? "grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8";

              return (
                <section
                  key={creator.id}
                  className={cIdx > 0 ? "pt-16 md:pt-20 border-t border-black/8" : ""}
                >
                  {/* Creator Header — Visually placed on the LEFT */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
                  >
                    <div className="flex items-center gap-4 md:gap-5">
                      {/* Creator Avatar / Photo */}
                      {creator.avatarUrl ? (
                        <img
                          src={creator.avatarUrl}
                          alt={creator.name}
                          loading="lazy"
                          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl object-cover border border-black/10 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-black/5 border border-black/10 flex items-center justify-center text-black/50 font-black text-lg md:text-xl shrink-0">
                          {initials}
                        </div>
                      )}

                      {/* Creator Name & Sub Count */}
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight leading-tight">
                            {creator.name}
                          </h2>
                          {creator.youtubeUrl && (
                            <a
                              href={creator.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-black/30 hover:text-black transition-colors"
                              title={`Visit ${creator.name} on YouTube`}
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>

                        {/* Subscriber Count underneath creator name (real value only) */}
                        {creator.subscriberCount && creator.subscriberCount.trim() && (
                          <p className="text-xs md:text-sm font-semibold text-black/45 mt-0.5">
                            {creator.subscriberCount.trim()} Subscribers
                          </p>
                        )}

                        {creator.description && (
                          <p className="text-xs text-black/50 mt-1 max-w-lg leading-relaxed">
                            {creator.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badge showing thumbnails count for this creator */}
                    <div className="text-xs font-semibold text-black/35 uppercase tracking-wider hidden sm:block">
                      {items.length} {items.length === 1 ? "design" : "designs"}
                    </div>
                  </motion.div>

                  {/* Large Thumbnails Presentation */}
                  {items.length > 0 ? (
                    <div className={gridCols}>
                      {items.map((project, i) => (
                        <ProjectCard
                          key={project.id}
                          project={{
                            ...project,
                            creatorName: project.creatorName || creator.name,
                          }}
                          index={i}
                          onClick={(p) =>
                            setSelectedItem({
                              ...p,
                              creatorName: p.creatorName || creator.name,
                            })
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-left text-black/35 text-sm">
                      No thumbnails uploaded for this creator yet.
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : !isLoading ? (
          <div className="py-28 text-center text-black/35">
            <p className="text-lg font-medium">No projects found in this category.</p>
          </div>
        ) : null}
      </div>

      {/* Large Image Viewer / Lightbox */}
      <PortfolioViewer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}

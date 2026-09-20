import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolioItems } from "@/hooks/useContent";
import { ProjectCard, type ProjectData } from "@/components/public/ProjectCard";
import { PortfolioViewer, type PortfolioViewerItem } from "@/components/public/PortfolioViewer";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export default function Work() {
  const allProjects = usePortfolioItems();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<PortfolioViewerItem | null>(null);

  // Derive real categories that actually exist in the database
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProjects) {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    }
    const list = Array.from(set);
    return list.length > 0 ? ["All", ...list] : ["All"];
  }, [allProjects]);

  // Filter projects by real category
  const filtered = useMemo(() => {
    if (activeCategory === "All") return allProjects;
    return allProjects.filter((p) => p.category === activeCategory);
  }, [allProjects, activeCategory]);

  return (
    <main className="pt-32 md:pt-40 pb-20" dir="ltr">
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
          <p className="text-black/50 text-base max-w-lg leading-relaxed">
            A collection of YouTube thumbnail designs across multiple niches and channels.
          </p>
        </motion.div>

        {/* Category filter — only shown if real categories exist */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-black text-white font-semibold"
                    : "border border-black/12 text-black/55 hover:border-black/25 hover:text-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Count */}
        <p className="text-xs text-black/35 font-semibold mb-6 uppercase tracking-wider">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="thumb-grid">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={(p) => setSelectedItem(p)}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-black/30">
            <p className="text-lg font-medium">No projects in this category yet.</p>
          </div>
        )}
      </div>

      {/* Large Image Viewer / Lightbox */}
      <PortfolioViewer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}

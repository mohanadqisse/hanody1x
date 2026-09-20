import { useState } from "react";
import { motion } from "framer-motion";
import { useImages } from "@/hooks/useContent";
import { ProjectCard, type ProjectData } from "@/components/public/ProjectCard";
import { portfolioItems, portfolioCategoriesEn } from "@/lib/data";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export default function Work() {
  const images = useImages();
  const portfolioUrls: string[] = images.portfolio ?? [];
  const [activeCategory, setActiveCategory] = useState("All");

  // Build projects from real portfolio images
  const allProjects: ProjectData[] = portfolioUrls.map((url, i) => {
    const meta = portfolioItems[i];
    return {
      id: meta?.id ?? i + 1,
      imageUrl: url,
      category: meta?.categoryEn ?? "Other",
    };
  });

  // Filter
  const filtered =
    activeCategory === "All"
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory);

  return (
    <main className="pt-24 pb-20">
      <div className="pub-container">
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
          <p className="text-black/45 text-base max-w-lg leading-relaxed">
            A collection of YouTube thumbnail designs across multiple niches
            and channels.
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {portfolioCategoriesEn.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-black text-white"
                  : "border border-black/12 text-black/50 hover:border-black/25 hover:text-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Count */}
        <p className="text-xs text-black/30 font-medium mb-6 uppercase tracking-wider">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="thumb-grid">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-black/30">
            <p className="text-lg font-medium">No projects in this category yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

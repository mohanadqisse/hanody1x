import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useImages } from "@/hooks/useContent";
import { ProjectCard, type ProjectData } from "./ProjectCard";
import { portfolioItems } from "@/lib/data";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export function SelectedWork() {
  const images = useImages();
  const portfolioUrls: string[] = images.portfolio ?? [];

  // Build project list from real portfolio images
  const projects: ProjectData[] = portfolioUrls.slice(0, 9).map((url, i) => {
    const meta = portfolioItems[i];
    return {
      id: meta?.id ?? i + 1,
      imageUrl: url,
      category: meta?.categoryEn ?? undefined,
    };
  });

  // Only render if we have real images
  if (projects.length === 0) return null;

  return (
    <section id="portfolio" className="pub-section">
      <div className="pub-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-black/30 mb-2">
              Selected Work
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight">
              Recent Projects
            </h2>
          </div>
          <Link href="/work">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-black/50 hover:text-black transition-colors cursor-pointer group">
              View all projects
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </motion.div>

        {/* Grid — CSS handles neighbour dimming via .thumb-grid */}
        <div className="thumb-grid">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
          className="mt-12 text-center"
        >
          <Link href="/work">
            <span className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-black/15 text-black text-sm font-semibold hover:border-black/30 hover:bg-black/3 transition-all cursor-pointer group">
              View All Projects
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

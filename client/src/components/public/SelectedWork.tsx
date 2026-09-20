import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { usePortfolioItems } from "@/hooks/useContent";
import { ProjectCard, type ProjectData } from "./ProjectCard";
import { PortfolioViewer, type PortfolioViewerItem } from "./PortfolioViewer";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export function SelectedWork() {
  const allItems = usePortfolioItems();
  const [selectedItem, setSelectedItem] = useState<PortfolioViewerItem | null>(null);

  // Take first 9 for home page selected work
  const projects: ProjectData[] = allItems.slice(0, 9);

  // Only render if we have real images
  if (projects.length === 0) return null;

  return (
    <section id="portfolio" className="pub-section">
      <div className="pub-container">
        {/*
          Section header
          ──────────────
          FIX: This heading is always in the viewport on page load (it sits
          directly below the Hero). Using animate={inView ? … : {}} with a
          useInView ref caused the element to stay at opacity:0 on a cold
          load because the IntersectionObserver fires asynchronously after
          the initial render — the race is lost before the observer has a
          chance to set inView=true.

          Solution: unconditional `animate` — the motion always plays from
          initial → animate on mount, regardless of scroll position. This
          is correct for any element that is visible above-the-fold.
        */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="mb-12"
        >
          {/* Eyebrow */}
          <p className="text-xs font-semibold uppercase tracking-widest text-black/30 mb-4">
            Selected Work
          </p>

          {/* Editorial headline */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-black tracking-tight leading-[1.05]">
              Thumbnails that
              <br />
              <span className="text-black/22">stop the scroll.</span>
            </h2>

            {/* "View all" — pinned to bottom-right of header row on desktop */}
            <Link href="/work">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-black/40 hover:text-black transition-colors cursor-pointer group shrink-0 mb-1">
                View all work
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </div>

          {/* Supporting sentence */}
          <p className="mt-4 text-sm text-black/40 max-w-md leading-relaxed">
            A selection of thumbnail work designed to earn attention and drive clicks.
          </p>
        </motion.div>

        {/* Grid — cards have their own whileInView per ProjectCard */}
        <div className="thumb-grid">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onClick={(p) => setSelectedItem(p)}
            />
          ))}
        </div>

        {/* View all CTA — below the fold, whileInView is correct here */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.1, ease }}
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

      {/* Large Image Viewer / Lightbox */}
      <PortfolioViewer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}

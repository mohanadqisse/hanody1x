import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export interface ProjectData {
  id: number | string;
  imageUrl: string;
  title?: string;
  creator?: string;
  category?: string;
  youtubeUrl?: string;
}

interface ProjectCardProps {
  project: ProjectData;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="thumb-card group relative aspect-video rounded-xl overflow-hidden border border-black/8 bg-black/5 cursor-pointer"
    >
      {/* Thumbnail image */}
      <img
        src={project.imageUrl}
        alt={project.title || `Thumbnail ${project.id}`}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col justify-end p-4">
        <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          {/* Title */}
          {project.title && (
            <p className="text-white text-sm font-semibold leading-tight mb-1 line-clamp-2">
              {project.title}
            </p>
          )}
          {/* Creator */}
          {project.creator && (
            <p className="text-white/60 text-xs mb-3">{project.creator}</p>
          )}
          {/* YouTube link */}
          {project.youtubeUrl && (
            <a
              href={project.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
            >
              Watch on YouTube
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Category badge */}
      {project.category && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {project.category}
          </span>
        </div>
      )}
    </motion.div>
  );
}

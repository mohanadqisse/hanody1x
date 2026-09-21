import { motion } from "framer-motion";
import { Eye, ExternalLink } from "lucide-react";

export interface ProjectData {
  id: number | string;
  imageUrl: string;
  creatorName?: string;
  videoTitle?: string;
  title?: string;
  views?: string;
  youtubeUrl?: string;
  category?: string;
}

interface ProjectCardProps {
  project: ProjectData;
  index: number;
  onClick?: (project: ProjectData) => void;
}

export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const displayTitle = project.videoTitle || project.title;
  const hasHoverMeta =
    Boolean(project.creatorName?.trim()) ||
    Boolean(displayTitle?.trim()) ||
    Boolean(project.views?.trim()) ||
    Boolean(project.category?.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.28), ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onClick?.(project)}
      className="thumb-card group relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-black/8 bg-black/5 cursor-pointer select-none shadow-2xs hover:shadow-lg transition-shadow duration-300"
    >
      {/* Thumbnail artwork */}
      <img
        src={project.imageUrl}
        alt={displayTitle || project.creatorName || `Thumbnail ${project.id}`}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />

      {/* Subtle hover overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 ${
          hasHoverMeta
            ? "bg-black/0 group-hover:bg-gradient-to-t group-hover:from-black/85 group-hover:via-black/40 group-hover:to-transparent"
            : "bg-black/0 group-hover:bg-black/25"
        }`}
      >
        {/* Top badges (category & external link indicator) */}
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {project.category ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {project.category}
            </span>
          ) : <div />}
          {project.youtubeUrl && (
            <span className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 border border-white/10">
              <ExternalLink size={12} />
            </span>
          )}
        </div>

        {/* Bottom meta */}
        {hasHoverMeta && (
          <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-250 ease-out text-left space-y-1">
            {displayTitle ? (
              <p className="text-white text-sm sm:text-base font-bold tracking-tight leading-snug line-clamp-2">
                {displayTitle}
              </p>
            ) : project.creatorName ? (
              <p className="text-white text-sm sm:text-base font-bold tracking-tight leading-tight">
                {project.creatorName}
              </p>
            ) : null}

            <div className="flex items-center gap-3 text-xs text-white/75 font-medium">
              {displayTitle && project.creatorName && (
                <span>{project.creatorName}</span>
              )}
              {project.views && (
                <span className="inline-flex items-center gap-1">
                  <Eye size={11} className="text-white/60" />
                  {project.views}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

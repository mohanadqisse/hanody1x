import { motion } from "framer-motion";

export interface ProjectData {
  id: number | string;
  imageUrl: string;
  creatorName?: string;
  videoTitle?: string;
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
  const hasHoverMeta = Boolean(project.creatorName?.trim()) || Boolean(project.views?.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.32), ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onClick?.(project)}
      className="thumb-card group relative aspect-video rounded-2xl overflow-hidden border border-black/8 bg-black/5 cursor-pointer select-none"
    >
      {/* Thumbnail image */}
      <img
        src={project.imageUrl}
        alt={project.videoTitle || project.creatorName || `Thumbnail ${project.id}`}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />

      {/* Subtle hover overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 flex flex-col justify-end p-4 ${
          hasHoverMeta
            ? "bg-black/0 group-hover:bg-black/50"
            : "bg-black/0 group-hover:bg-black/20"
        }`}
      >
        {hasHoverMeta && (
          <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-250 ease-out text-left">
            {project.creatorName && (
              <p className="text-white text-sm font-bold tracking-tight leading-tight">
                {project.creatorName}
              </p>
            )}
            {project.views && (
              <p className="text-white/70 text-xs font-medium mt-0.5">
                {project.views}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

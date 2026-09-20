import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { caseStudiesEn } from "@/lib/i18n-defaults";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export default function CaseStudy() {
  const { id } = useParams<{ id: string }>();

  // Use the English case studies from i18n-defaults
  const study = caseStudiesEn.find((c) => c.id === id);

  if (!study) {
    return (
      <main className="pt-32 pb-20 text-center">
        <div className="pub-container">
          <h1 className="text-4xl font-black text-black mb-4">Case Study Not Found</h1>
          <Link href="/work">
            <span className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors cursor-pointer">
              <ArrowLeft size={15} />
              Back to Work
            </span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20">
      <div className="pub-container max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          {/* Back link */}
          <Link href="/work">
            <span className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors cursor-pointer mb-10 group">
              <ArrowLeft
                size={14}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
              Back to Work
            </span>
          </Link>

          {/* Creator header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-full bg-black/6 flex items-center justify-center text-base font-black text-black/50 shrink-0">
              {study.avatarInitials}
            </div>
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight">{study.name}</h1>
              <p className="text-black/40 text-sm font-medium">{study.niche}</p>
            </div>
            {study.youtubeUrl && (
              <a
                href={study.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black border border-black/10 hover:border-black/25 px-3.5 py-2 rounded-full transition-all"
              >
                YouTube
                <ExternalLink size={11} />
              </a>
            )}
          </div>

          {/* Quote */}
          <blockquote className="text-xl md:text-2xl font-semibold text-black/70 leading-relaxed mb-10 border-l-2 border-black/15 pl-6">
            {study.shortBio}
          </blockquote>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {study.metrics.map((metric) => (
              <div
                key={metric.label}
                className="border border-black/8 rounded-2xl p-6 text-center"
              >
                <div className="text-3xl font-black text-black mb-1">{metric.value}</div>
                <div className="text-xs text-black/35 font-medium uppercase tracking-wider">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Full story */}
          <div className="border-t border-black/8 pt-8">
            <h2 className="text-lg font-black text-black mb-4">The Story</h2>
            <p className="text-black/55 leading-relaxed text-base">{study.story}</p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                window.location.href = "/#contact";
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors"
            >
              Get Similar Results
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

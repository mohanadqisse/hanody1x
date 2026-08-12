import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { caseStudies as defaultCaseStudies } from "@/lib/data";
import { useSection } from "@/hooks/useContent";
import { useLanguage } from "@/contexts/LanguageContext";

const easeApple = "easeOut";

export default function CaseStudy() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLanguage();
  // Always use Arabic/original data for case study content — never swap to English defaults
  // Only UI labels (buttons, headers) are translated via t()
  const allStudies = useSection("caseStudies", defaultCaseStudies) as typeof defaultCaseStudies;
  const study = allStudies.find((c) => c.id === id);

  if (!study) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32">
        <h1 className="text-4xl font-black mb-4">{t("caseStudy.notFound")}</h1>
        <Link href="/">
          <Button className="rounded-full">{t("caseStudy.back")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeApple }}
        >
          <Link href="/#showcase">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowRight className="w-4 h-4" />
              <span>{t("caseStudy.back")}</span>
            </button>
          </Link>

          <div className="glass-panel rounded-3xl p-8 md:p-12 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xl font-black overflow-hidden">
                {(study as any).avatarImage ? (
                  <img src={(study as any).avatarImage} alt={study.name} className="w-full h-full object-cover" />
                ) : (
                  study.avatarInitials
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground">{study.name}</h1>
                <p className="text-muted-foreground">{study.niche}</p>
              </div>
            </div>

            <blockquote className="text-xl md:text-2xl font-medium text-foreground/90 leading-relaxed mb-8 border-r-2 border-primary pr-6">
              {study.shortBio}
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {study.metrics.map((metric) => (
                <div key={metric.label} className="bg-card/50 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-primary mb-2">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-bold text-foreground mb-4">{t("caseStudy.fullStory")}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{study.story}</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/#order">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-6 text-lg font-bold">
                {t("caseStudy.getResults")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

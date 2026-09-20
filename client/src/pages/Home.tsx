import { Hero }           from "@/components/public/Hero";
import { Stats }          from "@/components/public/Stats";
import { SelectedWork }   from "@/components/public/SelectedWork";
import { Testimonials }   from "@/components/public/Testimonials";
import { AboutMe }        from "@/components/public/AboutMe";
import { FinalCTA }       from "@/components/public/FinalCTA";
import { ContactSection } from "@/components/public/ContactSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <SelectedWork />
      <Stats />
      <Testimonials />
      {/* ── Standalone About Me — editorial closing section ── */}
      <AboutMe />
      <FinalCTA />
      <ContactSection />
    </main>
  );
}

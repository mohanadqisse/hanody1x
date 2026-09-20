import { Hero }           from "@/components/public/Hero";
import { Stats }          from "@/components/public/Stats";
import { SelectedWork }   from "@/components/public/SelectedWork";
import { About }          from "@/components/public/About";
import { Testimonials }   from "@/components/public/Testimonials";
import { FinalCTA }       from "@/components/public/FinalCTA";
import { ContactSection } from "@/components/public/ContactSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <SelectedWork />
      <About />
      <Testimonials />
      <FinalCTA />
      <ContactSection />
    </main>
  );
}

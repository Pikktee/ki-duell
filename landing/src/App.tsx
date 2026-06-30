import { CyberBackground } from "./components/CyberBackground";
import { Header } from "./sections/Header";
import { HeroSection } from "./sections/HeroSection";
import { ConceptDemoSection } from "./sections/ConceptDemoSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { DifficultyTiersSection } from "./sections/DifficultyTiersSection";
import { EducationSection } from "./sections/EducationSection";
import { LeaderboardTeaserSection } from "./sections/LeaderboardTeaserSection";
import { FaqSection } from "./sections/FaqSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { FooterSection } from "./sections/FooterSection";

export default function App() {
  return (
    <div className="relative min-h-screen text-cyber-light">
      <CyberBackground />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <ConceptDemoSection />
        <HowItWorksSection />
        <DifficultyTiersSection />
        <EducationSection />
        <LeaderboardTeaserSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <FooterSection />
    </div>
  );
}

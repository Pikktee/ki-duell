import { Lightbulb } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";
import { SectionLabel } from "../components/SectionLabel";

export function EducationSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <SectionLabel>Lerneffekt</SectionLabel>
        <GlassPanel className="px-8 sm:px-12 py-12 text-left">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 border border-neon-cyan/40 text-neon-cyan rounded-none">
            <Lightbulb className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-cyber-light tracking-tight">
            Was du dabei lernst
          </h2>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-cyber-light/80">
            Du trainierst dein Auge — und kalibrierst dein Bauchgefühl gegen den Stand der Technik.
            Wo erkennt der Mensch noch zuverlässig die Maschine? Wo nicht mehr?{" "}
            <span className="text-neon-cyan/90">
              Jede Auflösung zeigt dir, welches Modell die Fälschung erzeugt hat.
            </span>{" "}
            Du verlässt das Spiel mit einem realistischen Bild davon, wie weit generative KI heute ist —
            und wo sie noch scheitert.
          </p>
        </GlassPanel>
      </div>
    </section>
  );
}

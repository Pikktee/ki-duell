import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";
import { PillChip } from "../components/PillChip";
import { SectionLabel } from "../components/SectionLabel";
import {
  DEMO_FAKE_CAPTION,
  DEMO_FAKE_IMAGE,
  DEMO_REAL_CAPTION,
  DEMO_REAL_IMAGE,
} from "../lib/constants";

export function ConceptDemoSection() {
  const [revealed, setRevealed] = useState(false);

  return (
    <section id="konzept" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl text-center">
        <SectionLabel>Das Konzept · Eine Runde</SectionLabel>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-light tracking-tight">
          So sieht das aus
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-base sm:text-lg text-cyber-light/60 leading-relaxed">
          Eines dieser Werke ist ein echtes Museumswerk. Im Spiel wäre das andere eine KI-Fälschung
          im selben Stil — generiert vom stärksten Modell der gewählten Stufe.
        </p>
        <p className="mt-6 text-xl sm:text-2xl text-neon-cyan font-medium">
          Welches Werk ist die Fälschung?
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          <DemoCard
            chip="Werk A"
            image={DEMO_REAL_IMAGE}
            caption={DEMO_REAL_CAPTION}
            revealed={revealed}
            isFake={false}
          />
          <DemoCard
            chip="Werk B"
            image={DEMO_FAKE_IMAGE}
            caption={DEMO_FAKE_CAPTION}
            revealed={revealed}
            isFake={true}
          />
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="inline-flex items-center gap-2.5 px-7 py-3 border border-neon-cyan text-neon-cyan font-mono font-bold tracking-[0.2em] uppercase text-xs hover:bg-neon-cyan/10 hover:shadow-[0_0_18px_rgba(0,255,156,0.3)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {revealed ? "Wieder verdecken" : "Auflösen"}
          </button>
          <p className="text-xs text-cyber-light/50 max-w-md">
            Hinweis: Diese Demo zeigt zwei echte Met-Museums-Bilder als visuelles Beispiel. Im Spiel
            ersetzt eine echte KI-Fälschung im Stil des Künstlers eines der beiden Werke.
          </p>
        </div>
      </div>
    </section>
  );
}

interface DemoCardProps {
  chip: string;
  image: string;
  caption: string;
  revealed: boolean;
  isFake: boolean;
}

function DemoCard({ chip, image, caption, revealed, isFake }: DemoCardProps) {
  return (
    <div className="relative">
      {/* Pill chip overlapping the panel's top edge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
        <PillChip>{chip}</PillChip>
      </div>
      <GlassPanel accent={revealed ? (isFake ? "none" : "cyan") : "none"} className="aspect-square">
        <div className="relative h-full w-full">
          <img
            src={image}
            alt={caption}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {/* Subtle darken on top of the image so captions read */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 via-cyber-dark/0 to-cyber-dark/40" />
          {/* Reveal overlay */}
          {revealed && (
            <div className="absolute inset-x-0 top-0 flex items-center justify-center pt-4">
              <span
                className={
                  isFake
                    ? "px-3 py-1 bg-neon-magenta text-cyber-dark font-mono text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_18px_rgba(255,0,127,0.5)]"
                    : "px-3 py-1 bg-neon-cyan text-cyber-dark font-mono text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_18px_rgba(0,255,156,0.5)]"
                }
              >
                {isFake ? "KI-Fälschung (Spiel-Beispiel)" : "Echt"}
              </span>
            </div>
          )}
          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 px-4 py-3 text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyber-light/70">
              {caption}
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

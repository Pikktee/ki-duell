import { Bot, Eye, Skull } from "lucide-react";
import { clsx } from "clsx";
import { GlassPanel } from "../components/GlassPanel";
import { SectionLabel } from "../components/SectionLabel";

interface Tier {
  key: "leicht" | "mittel" | "schwer";
  icon: typeof Bot;
  label: string;
  pips: number;
  tagline: string;
  textModel: string;
  imageModel: string;
  accent: "cyan" | "amber" | "red";
}

const TIERS: Tier[] = [
  {
    key: "leicht",
    icon: Bot,
    label: "Leicht",
    pips: 1,
    tagline: "Ältere Modelle — die Fälschungen verraten sich oft.",
    textModel: "GPT-3.5",
    imageModel: "FLUX.1 [schnell]",
    accent: "cyan",
  },
  {
    key: "mittel",
    icon: Eye,
    label: "Mittel",
    pips: 2,
    tagline: "Solide Mittelklasse — schon ordentlich, aber mit Mustern.",
    textModel: "Gemini 2.5 Flash",
    imageModel: "FLUX.1 [dev]",
    accent: "amber",
  },
  {
    key: "schwer",
    icon: Skull,
    label: "Schwer",
    pips: 3,
    tagline: "Aktuelle Spitzenmodelle — täuschend echt.",
    textModel: "Claude Opus 4.7",
    imageModel: "FLUX 1.1 Pro",
    accent: "red",
  },
];

const TEXT_BY_ACCENT: Record<Tier["accent"], string> = {
  cyan: "text-neon-cyan",
  amber: "text-neon-amber",
  red: "text-neon-red",
};
const PIP_ON: Record<Tier["accent"], string> = {
  cyan: "bg-neon-cyan",
  amber: "bg-neon-amber",
  red: "bg-neon-red",
};

export function DifficultyTiersSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <SectionLabel>Die Stufen</SectionLabel>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-light tracking-tight">
            Wie weit ist die KI?
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-base sm:text-lg text-cyber-light/60 leading-relaxed">
            Drei Stufen, drei Generationen von Sprach- und Bildmodellen. Je höher die Stufe,
            desto schwerer wirst du die KI von der menschlichen Hand unterscheiden.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <GlassPanel key={tier.key} accent={tier.accent} className="p-8 flex flex-col items-center text-center">
                <div className={clsx("p-4 rounded-full bg-cyber-dark/60 mb-5", TEXT_BY_ACCENT[tier.accent])}>
                  <Icon className="w-9 h-9" strokeWidth={1.5} />
                </div>

                <div className="flex gap-1.5 mb-5">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={clsx(
                        "h-1.5 w-5",
                        i <= tier.pips ? PIP_ON[tier.accent] : "bg-cyber-light/15",
                      )}
                    />
                  ))}
                </div>

                <h3
                  className={clsx(
                    "text-2xl font-black uppercase tracking-[0.2em] mb-3",
                    TEXT_BY_ACCENT[tier.accent],
                  )}
                >
                  {tier.label}
                </h3>

                <p className="text-sm text-cyber-light/80 leading-relaxed min-h-[3em]">
                  {tier.tagline}
                </p>

                <div className="mt-6 pt-5 border-t border-cyber-light/10 w-full font-mono text-[11px] tracking-wider text-cyber-light/60 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx("uppercase font-bold", TEXT_BY_ACCENT[tier.accent])}>
                      Text:
                    </span>
                    <span className="truncate">{tier.textModel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx("uppercase font-bold", TEXT_BY_ACCENT[tier.accent])}>
                      Bild:
                    </span>
                    <span className="truncate">{tier.imageModel}</span>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </div>
    </section>
  );
}

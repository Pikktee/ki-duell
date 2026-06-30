import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { GlassPanel } from "../components/GlassPanel";
import { SectionLabel } from "../components/SectionLabel";

const FAQS = [
  {
    q: "Sind die echten Werke wirklich von Menschen?",
    a: "Ja. Jedes Original ist ein wortgetreues gemeinfreies Werk (Lyrik, Prosa, Gemälde) oder ein Met-Museum-Scan. Nur die Fälschung entsteht durch eine KI.",
  },
  {
    q: "Was kostet das?",
    a: "Nichts. Kein Konto nötig — gib einen Namen ein und spiel los. Mit Google-Login zählst du zusätzlich in der globalen Rangliste.",
  },
  {
    q: "Werden meine Daten gespeichert?",
    a: "Nur das, was für die Rangliste nötig ist (Spielername, Score, Zeit). Anonyme Spieler hinterlassen keinen Account, nur einen Tageseintrag.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionLabel>Häufige Fragen</SectionLabel>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-light tracking-tight">
            Drei Fragen, knapp
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <GlassPanel key={i} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-neon-cyan/[0.03] transition-colors focus:outline-none focus-visible:bg-neon-cyan/[0.05]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-cyber-light">{f.q}</span>
                  <ChevronDown
                    className={clsx(
                      "w-5 h-5 shrink-0 text-neon-cyan transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    strokeWidth={1.75}
                  />
                </button>
                <div
                  className={clsx(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 pt-1 text-sm sm:text-base text-cyber-light/70 leading-relaxed">
                      {f.a}
                    </p>
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

import { Layers, Image as ImageIcon, Calendar } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";
import { SectionLabel } from "../components/SectionLabel";

const STEPS = [
  {
    n: "01",
    icon: Layers,
    title: "Stil-Match",
    body: "Jede Runde zeigt zwei Werke vom selben Künstler zum selben Motiv — eines echt, eines KI.",
  },
  {
    n: "02",
    icon: ImageIcon,
    title: "6 Runden, 3 Texte, 3 Bilder",
    body: "Gedichte, Prosa und Gemälde im Wechsel. Du tippst auf das Werk, das du für die Fälschung hältst.",
  },
  {
    n: "03",
    icon: Calendar,
    title: "Eine Challenge pro Tag",
    body: "Jeden Tag eine neue Auswahl — gleich für alle Spieler. Pro Tag und Stufe ein Versuch.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <SectionLabel>Der Ablauf</SectionLabel>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-light tracking-tight">
            So funktioniert's
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ n, icon: Icon, title, body }) => (
            <GlassPanel key={n} className="p-8 min-h-[260px]">
              <div className="flex items-start justify-between">
                <span className="font-mono text-2xl text-neon-cyan tracking-wider">{n}</span>
                <Icon className="w-7 h-7 text-neon-cyan" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-cyber-light">{title}</h3>
              <p className="mt-3 text-sm sm:text-base text-cyber-light/60 leading-relaxed">{body}</p>
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
}

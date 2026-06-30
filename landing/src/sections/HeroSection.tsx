import { ArrowDown, Play } from "lucide-react";
import { AnimatedLogo } from "../components/AnimatedLogo";
import { GAME_URL } from "../lib/constants";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-8 fade-in-up">
        <span className="h-px w-10 bg-neon-cyan/50" aria-hidden="true" />
        <p className="font-mono text-[10px] tracking-[0.3em] text-neon-cyan uppercase">
          Tages-Challenge · Echt oder KI
        </p>
        <span className="h-px w-10 bg-neon-cyan/50" aria-hidden="true" />
      </div>

      <div className="fade-in-up" style={{ animationDelay: "150ms" }}>
        <AnimatedLogo />
      </div>

      <p
        className="mt-12 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-cyber-light/90 fade-in-up"
        style={{ animationDelay: "350ms" }}
      >
        Zwei Werke pro Runde — eines hat ein Mensch geschaffen, eines hat eine KI im selben Stil gefälscht.
        <span className="block mt-2 text-neon-cyan/90">Welches ist welches?</span>
      </p>

      <div
        className="mt-10 flex flex-col items-center gap-4 fade-in-up"
        style={{ animationDelay: "500ms" }}
      >
        <a
          href={GAME_URL}
          className="group inline-flex items-center justify-center gap-3 min-w-[260px] px-8 py-4 bg-neon-cyan text-cyber-dark font-mono font-bold tracking-[0.2em] uppercase text-sm transition-all duration-150 hover:bg-white hover:shadow-[0_0_28px_rgba(0,255,156,0.45)] shadow-[0_0_18px_rgba(0,255,156,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-cyber-dark"
        >
          <Play className="w-4 h-4" fill="currentColor" strokeWidth={0} />
          Jetzt spielen
        </a>
        <a
          href="#konzept"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-neon-cyan/70 hover:text-neon-cyan underline decoration-neon-cyan/40 hover:decoration-neon-cyan underline-offset-4 transition-colors"
        >
          Wie funktioniert das?
          <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
        </a>
      </div>
    </section>
  );
}

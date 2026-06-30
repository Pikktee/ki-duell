import { Play, LogIn } from "lucide-react";
import { GAME_URL, GAME_URL_LOGIN } from "../lib/constants";

export function FinalCtaSection() {
  return (
    <section className="relative px-6 py-24 sm:py-36 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyber-light tracking-tight pulse-glow-cyan">
          Bereit, dein Auge zu testen?
        </h2>
        <p className="mt-5 text-base sm:text-lg text-cyber-light/70 leading-relaxed">
          Heutige Challenge wartet. Pro Stufe ein Versuch.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href={GAME_URL}
            className="group inline-flex items-center justify-center gap-3 min-w-[300px] px-8 py-4 bg-neon-cyan text-cyber-dark font-mono font-bold tracking-[0.2em] uppercase text-sm transition-all duration-150 hover:bg-white hover:shadow-[0_0_28px_rgba(0,255,156,0.45)] shadow-[0_0_18px_rgba(0,255,156,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-cyber-dark"
          >
            <Play className="w-4 h-4" fill="currentColor" strokeWidth={0} />
            Jetzt spielen
          </a>
          <a
            href={GAME_URL_LOGIN}
            className="group inline-flex items-center justify-center gap-2.5 min-w-[300px] px-8 py-3 border border-cyber-light/20 text-cyber-light/80 font-mono font-bold tracking-[0.2em] uppercase text-[11px] hover:border-neon-cyan/80 hover:text-neon-cyan hover:bg-neon-cyan/[0.05] hover:shadow-[0_0_15px_rgba(0,255,156,0.2)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <LogIn className="w-3.5 h-3.5" strokeWidth={1.75} />
            Mit Google anmelden — für globales Ranking
          </a>
        </div>
      </div>
    </section>
  );
}

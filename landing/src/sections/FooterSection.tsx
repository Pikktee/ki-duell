import { AnimatedLogo } from "../components/AnimatedLogo";

export function FooterSection() {
  return (
    <footer className="relative px-6 pt-16 pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start">
          {/* Left: mini wordmark + tagline */}
          <div>
            <AnimatedLogo size="small" withTagline={false} />
            <p className="mt-4 text-xs text-cyber-light/50 max-w-xs leading-relaxed">
              Ein nicht-kommerzielles Projekt von Henrik. Trainiere dein Auge für künstliche Kunst.
            </p>
          </div>

          {/* Middle: nav links */}
          <nav className="md:justify-self-center" aria-label="Footer-Navigation">
            <ul className="space-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyber-light/60">
              <li>
                <a className="hover:text-neon-cyan transition-colors" href="#">Über das Projekt</a>
              </li>
              <li>
                <a className="hover:text-neon-cyan transition-colors" href="#">Bibliothek-Quellen</a>
              </li>
              <li>
                <a className="hover:text-neon-cyan transition-colors" href="#">Impressum</a>
              </li>
              <li>
                <a className="hover:text-neon-cyan transition-colors" href="#">Datenschutz</a>
              </li>
            </ul>
          </nav>

          {/* Right: credits */}
          <div className="md:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyber-light/40 mb-3">
              Credits
            </p>
            <p className="text-xs text-cyber-light/50 leading-relaxed">
              Bilder: Met Museum (CC0).<br />
              Texte: Project Gutenberg / Wikisource.<br />
              KI-Fälschungen: OpenRouter · Replicate · ElevenLabs.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-cyber-light/5 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-cyber-light/30">
          © {new Date().getFullYear()} · Echt oder KI?
        </div>
      </div>
    </footer>
  );
}

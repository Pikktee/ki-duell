import { HelpCircle, Volume2, Languages } from "lucide-react";

const iconBtn =
  "flex items-center justify-center w-9 h-9 border border-cyber-light/20 text-cyber-light/80 " +
  "hover:border-neon-cyan/80 hover:bg-neon-cyan/10 hover:text-white " +
  "hover:shadow-[0_0_15px_rgba(0,255,156,0.25)] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan " +
  "transition-all duration-150";

export function Header() {
  return (
    <header className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2">
      <button type="button" className={iconBtn} aria-label="Hilfe" title="Hilfe">
        <HelpCircle className="w-4 h-4" strokeWidth={1.75} />
      </button>
      <button type="button" className={iconBtn} aria-label="Sprache" title="Sprache: Deutsch">
        <Languages className="w-4 h-4" strokeWidth={1.75} />
      </button>
      <button type="button" className={iconBtn} aria-label="Ton" title="Ton">
        <Volume2 className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </header>
  );
}

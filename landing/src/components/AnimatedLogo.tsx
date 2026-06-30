import { clsx } from "clsx";

interface Props {
  size?: "hero" | "small";
  className?: string;
  /** Show the tagline below the wordmark */
  withTagline?: boolean;
}

/**
 * Wordmark lockup "Echt oder KI?" — same two-typeface treatment as the game
 * (Playfair Italic for "Echt oder", Orbitron Extra-Bold for "KI?"), plus the
 * passive glitch-text effect on "KI?". No audio reactivity (this is the
 * landing-page version).
 */
export function AnimatedLogo({ size = "hero", className, withTagline = true }: Props) {
  const heroSize = size === "hero";
  return (
    <div
      className={clsx("relative inline-flex flex-col items-center justify-center text-center", className)}
      aria-label="Echt oder KI?"
    >
      <div className={clsx("relative overflow-hidden", heroSize ? "px-8 py-4" : "px-2")}>
        <div className="scanline-sweep-anim hidden motion-safe:block" aria-hidden="true" />
        <h1
          className={clsx(
            "flex flex-wrap items-baseline justify-center gap-3 md:gap-4 m-0 leading-none",
            heroSize ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl" : "text-2xl",
          )}
        >
          <span className="font-playfair font-bold italic text-neon-cyan text-glow-cyan">
            Echt oder
          </span>
          <span
            className="font-orbitron font-extrabold text-neon-magenta text-glow-magenta glitch-text"
            data-text={"KI ?"}
          >
            KI{" "}?
          </span>
        </h1>
      </div>
      {withTagline && heroSize && (
        <p className="mt-3 text-xs sm:text-sm font-sans tracking-[0.3em] text-cyber-light/60 uppercase">
          Trainiere dein Auge für künstliche Kunst
        </p>
      )}
    </div>
  );
}

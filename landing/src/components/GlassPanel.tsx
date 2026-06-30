import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Add the SVG noise overlay inside the panel (subtle CRT feel) */
  noise?: boolean;
  /** Tier accent — adds a single-color neon border + glow */
  accent?: "cyan" | "amber" | "red" | "none";
}

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  cyan: "border-neon-cyan/40 shadow-[0_0_30px_rgba(0,255,156,0.18)]",
  amber: "border-neon-amber/40 shadow-[0_0_30px_rgba(255,176,0,0.18)]",
  red: "border-neon-red/40 shadow-[0_0_30px_rgba(255,51,51,0.18)]",
  none: "border-transparent",
};

export function GlassPanel({ children, className, noise = true, accent = "none", ...rest }: Props) {
  return (
    <div
      className={clsx(
        "cyber-panel relative overflow-hidden border",
        ACCENT[accent],
        className,
      )}
      {...rest}
    >
      <div className="cyber-panel-border" />
      {noise && <div className="cyber-noise" />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

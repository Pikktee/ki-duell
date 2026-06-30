import { clsx } from "clsx";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  variant?: "outline" | "solid";
}

export function PillChip({ children, className, variant = "outline" }: Props) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-4 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] uppercase",
        variant === "outline"
          ? "border border-neon-cyan text-neon-cyan bg-cyber-dark/80"
          : "bg-neon-cyan text-cyber-dark",
        className,
      )}
    >
      {children}
    </span>
  );
}

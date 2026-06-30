interface Props {
  children: string;
}

/** Mono-uppercase chrome label that sits above a section heading. */
export function SectionLabel({ children }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="h-px w-8 bg-neon-cyan/40" aria-hidden="true" />
      <p className="font-mono text-[10px] sm:text-xs tracking-[0.3em] text-neon-cyan uppercase">
        {children}
      </p>
      <span className="h-px w-8 bg-neon-cyan/40" aria-hidden="true" />
    </div>
  );
}

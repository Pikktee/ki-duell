import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { audioManager } from '../audio';

export const AnimatedLogo = ({ className, enableBeat = true, animateEntrance = true }: { className?: string, enableBeat?: boolean, animateEntrance?: boolean }) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const [beatDelayed, setBeatDelayed] = useState(true);

  useEffect(() => {
    setBeatDelayed(true);
    const timer = setTimeout(() => {
      setBeatDelayed(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [animateEntrance]);

  const activeBeat = enableBeat && !beatDelayed;

  useEffect(() => {
    if (!activeBeat) return;
    
    let rafId: number;
    let multiplier = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (reducedMotion || !logoRef.current) return;
      
      const { bass } = audioManager.getAudioReactivity();
      
      // Smoothly fade in the multiplier for the beat effect over a couple of seconds
      if (multiplier < 1) {
        multiplier += 0.01;
      }
      if (multiplier > 1) multiplier = 1;

      const effectiveBass = bass * multiplier;
      
      logoRef.current.style.setProperty('--beat', effectiveBass.toFixed(3));
      
      if (effectiveBass > 0.35) {
        logoRef.current.classList.add('beat-glitch-active');
      } else {
        logoRef.current.classList.remove('beat-glitch-active');
      }
    };
    
    rafId = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(rafId);
      if (logoRef.current) {
        logoRef.current.style.removeProperty('--beat');
        logoRef.current.classList.remove('beat-glitch-active');
      }
    };
  }, [activeBeat]);

  return (
    <div 
      className={clsx("relative inline-flex flex-col items-center justify-center text-center beat-container", activeBeat && "beat-container-active", className)}
      aria-label="Echt oder KI?"
      ref={logoRef}
    >
      <div className="relative overflow-hidden px-8 py-4">
        {/* Scanline Sweep effect inside the text area */}
        <div className="scanline-sweep hidden motion-safe:block"></div>
        
        <h1 className="flex flex-wrap items-baseline justify-center gap-4 text-5xl md:text-7xl m-0">
          <span className="font-playfair font-bold italic text-neon-cyan beat-glow-cyan">
            Echt oder
          </span>
          <span 
            className="font-orbitron font-extrabold text-neon-magenta glitch-text text-glow-magenta beat-glow-magenta"
            data-text={`KI\u2009?`}
          >
            KI{'\u2009'}?
          </span>
        </h1>
      </div>
      
      <p className={clsx("mt-2 text-sm font-sans tracking-[0.3em] text-cyber-light/60 uppercase")}>
        Trainiere dein Auge für künstliche Kunst
      </p>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { DailyChallenge, SubmissionResult } from '../types';
import { Loader2, Timer, X, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from 'motion/react';
import { audioManager } from '../audio';

import { TTSButton } from './TTSButton';
import { setLocalDailyStatus } from '../localStore';

interface GameViewProps {
  user: User | null;
  displayName: string;
  challenge: DailyChallenge;
  onComplete: (result: SubmissionResult) => void;
  onAbort: () => void;
  isMuted?: boolean;
  toggleMute?: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
export function GameView({ user, displayName, challenge, onComplete, onAbort, isMuted, toggleMute }: GameViewProps) {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showAbortModal, setShowAbortModal] = useState(false);

  const round = challenge.rounds[currentRoundIdx];
  const nextRound = challenge.rounds[currentRoundIdx + 1];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentRoundIdx]);

  useEffect(() => {
    // Preload images for the next round
    if (nextRound) {
      nextRound.items.forEach(item => {
        if (item.typ === 'bild') {
          const img = new Image();
          img.src = item.inhalt;
        }
      });
    }
  }, [nextRound]);

  useEffect(() => {
    // Start server-side timer
    const startDailyRun = httpsCallable<{difficulty: string, displayName?: string}, any>(functions, 'startDailyRun');
    if (displayName !== 'Godmode') {
      setLocalDailyStatus(challenge.difficulty, { status: 'abandoned' });
    }
    startDailyRun({ difficulty: challenge.difficulty, displayName }).catch(err => console.error("Error starting run:", err));

    // Start local visual timer
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [challenge.difficulty, displayName]);

  const isLastRound = currentRoundIdx === challenge.rounds.length - 1;
  const currentSelectedId = guesses[round?.roundId];

  const handleSelect = async (itemId: string) => {
    if (currentSelectedId || isSubmitting) return; // prevent multi-select

    if (isLastRound) {
      audioManager.playSfx('submit');
    } else {
      audioManager.playSfx('card-select', 0.1);
    }
    const finalGuesses = { ...guesses, [round.roundId]: itemId };
    setGuesses(finalGuesses);

    // Wait a brief moment for the visual selection highlight
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isLastRound) {
      await submitScore(finalGuesses);
    } else {
      setCurrentRoundIdx(prev => prev + 1);
    }
  };

  const submitScore = async (finalGuesses: Record<string, string>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const submitDailyScore = httpsCallable<any, SubmissionResult>(functions, 'submitDailyScore');
      const result = await submitDailyScore({
        difficulty: challenge.difficulty,
        guesses: finalGuesses,
        displayName
      });
      if (displayName !== 'Godmode') {
        const d = result.data;
        setLocalDailyStatus(challenge.difficulty, {
           status: 'completed',
           score: d.score,
           correct: d.correct,
           total: d.total,
           durationMs: d.durationMs
        });
      }
      onComplete({ ...result.data, guesses: finalGuesses });
    } catch (err: any) {
      console.error("Submit Error:", err);
      setError(err.message || "Fehler beim Absenden der Ergebnisse.");
      setIsSubmitting(false);
    }
  };

  if (!round) return null;

  return (
    <div className="flex flex-col h-full w-full">
      {/* HUD HEADER */}
      <header className="h-[80px] border-b-2 border-neon-cyan bg-neon-cyan/5 flex items-center justify-between px-6 md:px-10 z-40 sticky top-0 backdrop-blur-md">
        <div className="font-mono uppercase text-left flex-[1]">
          <span className="block text-[10px] text-neon-cyan tracking-[2px]">TAGES-CHALLENGE</span>
          <span className="text-xl md:text-2xl font-black text-white">{challenge.difficulty}</span>
        </div>
        
        <div className="font-mono uppercase text-center hidden md:flex flex-col items-center flex-[1]">
          <span className="block text-[10px] text-neon-cyan tracking-[2px]">RUNDE</span>
          <span className="text-2xl font-black text-white">0{currentRoundIdx + 1} / 0{challenge.rounds.length}</span>
        </div>

        <div className="font-mono uppercase text-center flex flex-col items-center flex-[1]">
          <span className="block text-[10px] text-neon-cyan tracking-[2px]">ZEIT</span>
          <span className="text-xl md:text-2xl font-black text-toxic-yellow flex items-center gap-2">
            <Timer className="w-5 h-5" /> {formatTime(elapsedSeconds)}
          </span>
        </div>

        <div className="font-mono uppercase text-right flex flex-col items-end flex-[1]">
          <div className="flex items-center gap-2 text-cyber-light mb-1">
            {displayName === 'Godmode' && <span className="bg-toxic-yellow text-black text-[9px] px-1 font-bold animate-pulse">GODMODE</span>}
            <span className="block text-[10px] text-neon-cyan tracking-[2px]">SPIELER: {displayName || 'ANONYM'}</span>
          </div>
          <div className="flex items-center gap-2">
            {toggleMute && (
              <button 
                onClick={toggleMute}
                title="Ton umschalten"
                aria-label="Ton umschalten"
                className="p-2 border border-cyber-light/20 text-cyber-light hover:border-neon-cyan/80 hover:bg-neon-cyan/10 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,156,0.3)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neon-cyan rounded-none"
              >
                {isMuted ? <VolumeX className="w-5 h-5 opacity-60" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}
            <button 
              onClick={() => {
                audioManager.playSfx('click');
                setShowAbortModal(true);
              }} 
              className="p-2 border border-cyber-light/20 text-cyber-light hover:border-neon-magenta/80 hover:bg-neon-magenta/10 hover:text-neon-magenta hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neon-magenta rounded-none"
              title="Spiel abbrechen"
              aria-label="Spiel abbrechen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ROUND CONTENT */}
      <div ref={scrollContainerRef} className="flex-1 p-6 md:p-10 flex flex-col gap-[30px] overflow-y-auto">
        <div className="text-center max-w-3xl mx-auto w-full">
          <div className="bg-neon-magenta text-black px-3 py-1 font-black uppercase text-[14px] inline-block mb-2">
            {(() => {
              const mapping: Record<string, string> = {
                'gemaelde': 'Gemälde',
                'gedicht': 'Gedicht',
                'prosa': 'Prosa',
                'portraet': 'Porträt',
                'hoerspiel': 'Hörspiel',
                'artikel': 'Artikel'
              };
              return mapping[round.kategorie?.toLowerCase()] || round.kategorie;
            })()}
          </div>
          <h2 className="text-xl md:text-2xl font-black font-sans uppercase tracking-widest text-cyber-light leading-tight mt-2">
            Welches Werk ist die KI-Fälschung?
          </h2>
        </div>

        {error && (
           <div className="p-4 border border-toxic-yellow text-toxic-yellow font-mono text-sm uppercase bg-toxic-yellow/10 text-center">
             {error}
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-grow pt-4">
          {round.items.map((item, idx) => {
            const isSelected = currentSelectedId === item.id;
            return (
              <div 
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Werk ${idx === 0 ? 'A' : 'B'} auswählen`}
                aria-pressed={isSelected}
                onClick={() => handleSelect(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(item.id);
                  }
                }}
                className={clsx(
                  "relative flex flex-col cursor-pointer transition-all duration-300 border-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  isSelected 
                    ? "border-neon-cyan shadow-[0_0_30px_rgba(0,255,156,0.5)] scale-[1.02]" 
                    : "border-cyber-gray hover:border-neon-cyan/80 hover:shadow-[0_0_20px_rgba(0,255,156,0.3)] hover:-translate-y-1"
                )}
              >
                {/* CYBER BACKGROUND FOR EVERY CARD */}
                <div className="absolute inset-0 bg-cyber-dark z-0 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col w-full h-full">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyber-gray/90 backdrop-blur-md border border-neon-cyan/50 px-5 py-1 rounded-full font-mono font-bold text-[14px] text-neon-cyan z-40 shadow-[0_0_15px_rgba(0,255,156,0.2)] tracking-widest whitespace-nowrap">
                    WERK {idx === 0 ? 'A' : 'B'}
                  </span>

                  {/* Content rendering */}
                  <div className="w-full h-full bg-[#111]/40 flex flex-col flex-grow relative overflow-hidden">
                    {item.typ === 'text' ? (
                      <div className="flex flex-col w-full h-full min-h-[300px] md:min-h-[400px]">
                        {/* Header for Play Button */}
                        <div className="flex justify-end p-4 flex-shrink-0">
                          <TTSButton itemId={item.id} text={item.inhalt} />
                        </div>
                        {/* Text Content */}
                        <div className="px-6 pb-6 overflow-y-auto flex-grow flex flex-col justify-start">
                          <div className="font-serif leading-[1.6] text-[16px] md:text-[18px] text-[#ccc] whitespace-pre-line text-center italic w-full">
                            {item.inhalt}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full p-4 md:p-6 flex flex-col items-center justify-center">
                        <div className="w-full aspect-square flex items-center justify-center overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.8)_inset]">
                           <CyberImageWithShimmer src={item.inhalt} alt="Gemaelde" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Action is removed as per auto-advance requirement */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-cyber-dark border border-neon-cyan p-8 flex items-center shadow-[0_0_30px_rgba(0,255,156,0.3)]">
             <Loader2 className="animate-spin w-8 h-8 text-neon-cyan mr-4" />
             <span className="font-mono text-neon-cyan font-bold tracking-widest text-lg">KI ENTLARVEN...</span>
          </div>
        </div>
      )}

      {showAbortModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-overlay" onClick={() => setShowAbortModal(false)}>
          <div 
            className="cyber-panel border border-neon-magenta max-w-md w-full p-8 relative shadow-[0_0_40px_rgba(255,0,255,0.2)] text-left flex flex-col gap-6 animate-modal"
            style={{ borderRadius: '1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cyber-panel-border" style={{ borderRadius: '1rem' }}></div>
            <h2 className="text-2xl font-black uppercase mb-2 font-mono tracking-widest text-neon-magenta border-b border-neon-magenta/30 pb-4 flex items-center gap-3">
              <X className="w-8 h-8" /> Spiel abbrechen?
            </h2>
            <p className="font-sans leading-relaxed text-[16px] text-cyber-light/90">
              Wenn du abbrichst, kannst du diese Stufe <strong className="text-white">HEUTE nicht erneut starten</strong>.
            </p>
            <p className="font-sans leading-relaxed text-[16px] text-cyber-light/90">
              Trotzdem abbrechen?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
               <button
                 onClick={() => {
                   audioManager.playSfx('click');
                   setShowAbortModal(false);
                 }}
                 className="flex-1 p-3 font-mono font-bold tracking-widest uppercase transition-all bg-cyber-light/5 hover:bg-cyber-light/10 text-white border border-cyber-light/20 focus:outline-none focus:ring-2 focus:ring-cyber-light cursor-pointer"
               >
                 Weiterspielen
               </button>
               <button
                 onClick={() => {
                   audioManager.playSfx('click');
                   setShowAbortModal(false);
                   onAbort();
                 }}
                 className="flex-1 p-3 font-mono font-bold tracking-widest uppercase transition-all bg-neon-magenta/10 hover:bg-neon-magenta text-neon-magenta hover:text-black border border-neon-magenta focus:outline-none focus:ring-2 focus:ring-neon-magenta cursor-pointer"
               >
                 Abbrechen
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CyberImageWithShimmer({ src, alt }: { src: string, alt: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const shouldReduceMotion = useReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkImageStatus = () => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setStatus('loaded');
      clearTimeout(timeoutRef.current!);
    }
  };

  useEffect(() => {
    setCurrentSrc(src);
    setStatus('loading');
    
    // Safety timeout: 8 seconds maximum for loading state
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus(prev => prev === 'loading' ? 'error' : prev);
    }, 8000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [src]);

  // Decode check for cache-race
  useEffect(() => {
    if (status === 'loading' && imgRef.current) {
      checkImageStatus();
      // Use decode API if available
      imgRef.current.decode().then(() => {
        setStatus('loaded');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }).catch((e) => {
        // Only ignore if it's the AbortError from changing src, otherwise let natural onError/onLoad resolve or fail
      });
    }
  }, [currentSrc, status]);

  const handleReload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent select click on parent
    audioManager.playSfx('click');
    const cacheBuster = `?r=${Date.now()}`;
    const newSrc = src.includes('?') ? `${src}&${cacheBuster.substring(1)}` : `${src}${cacheBuster}`;
    setCurrentSrc(newSrc);
    setStatus('loading');
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus(prev => prev === 'loading' ? 'error' : prev);
    }, 8000);
  };

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: 'transparent' }}>
      {status !== 'loaded' && (
        <div className={clsx("absolute inset-0 bg-[#080808] z-10 overflow-hidden flex flex-col items-center justify-center space-y-2", shouldReduceMotion ? "opacity-80" : "")}>
           {!shouldReduceMotion && status === 'loading' && (
             <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent w-[150%] animate-[shimmer_1.5s_infinite]" 
                style={{ transform: 'skewX(-20deg)' }}
             ></div>
           )}
           {shouldReduceMotion && status === 'loading' && (
             <div className="w-8 h-8 rounded-full border-4 border-cyber-gray border-t-neon-cyan opacity-50 z-20"></div>
           )}
           {status === 'error' && (
             <>
               <span className="text-neon-magenta font-mono text-[10px] sm:text-xs z-20 px-2 text-center uppercase border border-neon-magenta/30 bg-neon-magenta/10 py-1">
                 Fehler
               </span>
               <button 
                 onClick={handleReload}
                 title="Erneut laden"
                 aria-label="Erneut laden"
                 className="z-20 p-1 px-3 mt-2 font-mono text-[9px] uppercase tracking-widest text-cyber-light bg-cyber-light/10 border border-cyber-light/20 hover:bg-neon-cyan/10 hover:border-neon-cyan/50 hover:text-white transition-colors"
               >
                 Neu Laden
               </button>
             </>
           )}
        </div>
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={() => {
          setStatus('loaded');
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onError={() => {
          setStatus('error');
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        className={clsx(
          "w-full h-full object-cover relative z-0 transition-opacity duration-300",
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        )}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

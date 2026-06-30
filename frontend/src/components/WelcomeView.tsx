import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase';
import { Loader2, Bot, Shield, Skull, Trophy, LogOut, Edit2, Check, X, Play, Info, HelpCircle, Volume2, VolumeX, Eye, MousePointer2, BarChart, User as UserIcon, Lightbulb } from 'lucide-react';
import { Difficulty, DailyChallenge, TierInfo, GetTiersResponse, DailyStatus, DailyStatusResult } from '../types';
import { clsx } from 'clsx';
import { audioManager } from '../audio';

import { AnimatedLogo } from './AnimatedLogo';
import { getLocalDailyStatus, cleanupOldDailyStatuses } from '../localStore';

const TooltipPortal = ({ text, anchorEl, onClose }: { text: string, anchorEl: HTMLElement | null, onClose: () => void }) => {
  if (!anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  
  // Calculate position: default above, if not enough space, place below
  const spaceAbove = rect.top;
  const placeBelow = spaceAbove < 150;
  
  const top = placeBelow ? rect.bottom + window.scrollY + 12 : rect.top + window.scrollY - 12;
  const left = rect.left + window.scrollX + rect.width / 2;

  return createPortal(
    <div 
      className="absolute w-[250px] p-4 bg-cyber-gray border border-neon-cyan text-left shadow-[0_0_15px_rgba(0,255,156,0.15)] z-[100] text-xs font-sans leading-relaxed text-cyber-light/90 cursor-default"
      style={{
        top: Math.round(top),
        left: Math.round(left),
        transform: placeBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
      }}
      onClick={e => { e.stopPropagation(); onClose(); }}
      onMouseLeave={onClose}
    >
      {text}
      <div 
        className={clsx(
          "absolute left-1/2 w-3.5 h-3.5 bg-cyber-gray border-neon-cyan rotate-45 -translate-x-1/2",
          placeBelow 
            ? "-top-[7.5px] border-t border-l" 
            : "-bottom-[7.5px] border-b border-r"
        )}
      ></div>
    </div>,
    document.body
  );
};

interface WelcomeViewProps {
  user: User | null;
  displayName: string;
  onUpdateName: (newName: string) => void;
  onStart: (difficulty: Difficulty, challenge: DailyChallenge) => void;
  onViewLeaderboard: () => void;
  onSignOut: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export function WelcomeView({ user, displayName, onUpdateName, onStart, onViewLeaderboard, onSignOut, isMuted, toggleMute }: WelcomeViewProps) {
  const [loading, setLoading] = useState<Difficulty | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(displayName);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('leicht');
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(() => {
    if (displayName === 'Godmode') return null;
    cleanupOldDailyStatuses();
    const local = getLocalDailyStatus();
    
    // Create initial structure with local data for synchronous lock state
    const results: Record<Difficulty, DailyStatusResult | null> = { leicht: null, mittel: null, schwer: null };
    for (const d of ['leicht', 'mittel', 'schwer'] as Difficulty[]) {
      if (local[d]) {
        results[d] = {
          completed: local[d].status === 'completed',
          abandoned: local[d].status === 'abandoned',
          score: local[d].score,
          correct: local[d].correct,
          total: local[d].total,
          durationMs: local[d].durationMs,
        };
      }
    }
    return { results } as DailyStatus;
  });
  const [statusLoading, setStatusLoading] = useState(displayName !== 'Godmode');
  const [showHelp, setShowHelp] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{ diff: Difficulty, el: HTMLElement } | null>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHelp) {
        audioManager.playSfx('click');
        setShowHelp(false);
      }
      
      if (e.key === 'Tab' && showHelp) {
        const focusableElements = document.querySelectorAll('.animate-modal button, .animate-modal [href], .animate-modal input, .animate-modal select, .animate-modal textarea, .animate-modal [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    if (showHelp) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTiers = async () => {
      try {
        const getTiersCallable = httpsCallable<void, GetTiersResponse>(functions, 'getTiers');
        const result = await getTiersCallable();
        if (result.data?.tiers) {
          setTiers(result.data.tiers);
        }
      } catch (err) {
        console.error("Failed to fetch tiers:", err);
      }
    };
    fetchTiers();
  }, []);

  useEffect(() => {
    // Only fetch if user exists
    if (!user) return;
    let mounted = true;
    
    const fetchStatus = async () => {
      if (displayName === 'Godmode') {
        if (mounted) {
          setDailyStatus(null);
          setStatusLoading(false);
        }
        return;
      }
      
      cleanupOldDailyStatuses();
      const localStatus = getLocalDailyStatus();
      
      setStatusLoading(true);
      
      try {
        const getStatusCallable = httpsCallable<{displayName: string}, DailyStatus>(functions, 'getMyDailyStatus');
        const result = await getStatusCallable({ displayName });
        if (mounted && result.data) {
          const mergedData = { ...result.data };
          if (mergedData.results) {
             for (const d of ['leicht', 'mittel', 'schwer'] as const) {
                const svr = mergedData.results[d];
                const loc = localStatus[d];
                if (loc) {
                   if (!svr || svr.abandoned || (!svr.completed && loc.status === 'completed')) {
                       mergedData.results[d] = {
                           ...(svr || {}),
                           completed: loc.status === 'completed' || !!svr?.completed,
                           abandoned: (loc.status === 'abandoned' && !svr?.completed) || !!svr?.abandoned,
                           score: loc.score ?? svr?.score,
                           correct: loc.correct ?? svr?.correct,
                           total: loc.total ?? svr?.total,
                           durationMs: loc.durationMs ?? svr?.durationMs
                       };
                       if (loc.status === 'completed') {
                           mergedData.results[d]!.abandoned = false;
                           mergedData.results[d]!.completed = true;
                       }
                   }
                }
             }
          }
          
          setDailyStatus(mergedData);
          
          // Auto-select first unplayed tier
          if (mergedData.results) {
            const difficulties: Difficulty[] = ['leicht', 'mittel', 'schwer'];
            for (const d of difficulties) {
              if (mergedData.results[d] === null) {
                setSelectedDifficulty(d);
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch daily status:", err);
      } finally {
        if (mounted) setStatusLoading(false);
      }
    };
    
    fetchStatus();
    return () => { mounted = false; };
  }, [user, displayName]);

  useEffect(() => {
    setEditNameValue(displayName);
  }, [displayName]);

  const handleSaveName = async () => {
    if (!editNameValue.trim()) {
      setError("Name darf nicht leer sein.");
      return;
    }
    setError(null);
    try {
      await onUpdateName(editNameValue);
      setIsEditingName(false);
    } catch (err: any) {
      setError(err.message || "Fehler beim Aktualisieren des Namens.");
    }
  };

  const startGame = async (diff: Difficulty) => {
    setLoading(diff);
    setError(null);

    try {
      const getDailyChallenge = httpsCallable<{ difficulty: Difficulty }, DailyChallenge>(functions, 'getDailyChallenge');
      const result = await getDailyChallenge({ difficulty: diff });
      onStart(diff, result.data);
    } catch (err: any) {
      console.error("Failed to get challenge:", err);
      if (err.code === 'failed-precondition' || err.message?.includes('failed-precondition')) {
        setError(`Diese Stufe hast du heute schon gespielt - komm morgen wieder!`);
        setLoading(null);
      } else {
        // MOCK FALLBACK FOR PREVIEW / MISSING CONFIG
        console.warn("Using mock data due to missing backend/config.");
        setError(`Backend-Verbindung fehlgeschlagen (${err.code}). Starte Notfall-Modus...`);
        setTimeout(() => {
           onStart(diff, getMockChallenge(diff));
        }, 2000);
      }
    } finally {
      if (!error) setLoading(null);
    }
  };

  const isGodmode = displayName === 'Godmode';
  const playedResults = isGodmode ? {} : (dailyStatus?.results || {});
  const allPlayed = ['leicht', 'mittel', 'schwer'].every(d => playedResults[d as Difficulty] !== null && playedResults[d as Difficulty] !== undefined);
  const selectedIsPlayed = playedResults[selectedDifficulty] !== null && playedResults[selectedDifficulty] !== undefined;

  function formatTime(ms?: number) {
    if (!ms) return "0:00";
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex flex-col w-full items-center justify-center text-center max-w-4xl mx-auto" onClick={() => setActiveTooltip(null)}>
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <button 
          onClick={() => {
            audioManager.playSfx('click');
            setShowHelp(true);
          }}
          title="Hilfe"
          aria-label="Hilfe"
          className="p-2 border border-cyber-light/20 text-cyber-light hover:border-neon-cyan/80 hover:bg-neon-cyan/10 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,156,0.3)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan rounded-none"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleMute}
          title="Sound umschalten"
          aria-label="Sound umschalten"
          className="p-2 border border-cyber-light/20 text-cyber-light hover:border-neon-cyan/80 hover:bg-neon-cyan/10 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,156,0.3)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan rounded-none"
        >
          {isMuted ? <VolumeX className="w-5 h-5 opacity-60" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => {
            audioManager.playSfx('click');
            onSignOut();
          }}
          title="Logout"
          aria-label="Logout"
          className="p-2 border border-cyber-light/20 text-cyber-light hover:border-neon-magenta/80 hover:bg-neon-magenta/10 hover:text-neon-magenta hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-magenta rounded-none"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-overlay" onClick={() => setShowHelp(false)}>
          <div 
            role="dialog"
            aria-labelledby="help-title"
            aria-modal="true"
            tabIndex={-1}
            autoFocus
            className="cyber-panel max-w-2xl w-full relative shadow-[0_0_40px_rgba(0,255,156,0.15)] text-left rounded-2xl flex flex-col animate-modal overflow-hidden focus:outline-none"
            style={{ maxHeight: '90vh', borderRadius: '1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cyber-panel-border" style={{ borderRadius: '1rem' }}></div>
            {/* Header */}
            <div className="flex-shrink-0 px-8 pt-8 pb-4 relative z-10">
              <button 
                onClick={() => {
                  audioManager.playSfx('click');
                  setShowHelp(false);
                }}
                title="Schließen"
                className="absolute top-6 right-6 p-2 border border-cyber-light/20 text-cyber-light hover:border-neon-cyan/80 hover:bg-neon-cyan/10 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,156,0.3)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neon-cyan rounded-none"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 id="help-title" className="text-3xl font-black uppercase mb-0 font-mono tracking-widest relative inline-block">
                <span className="text-neon-cyan">Echt oder</span> <span className="text-neon-magenta">KI{'\u2009'}?</span>
                <div className="absolute -bottom-3 left-0 w-full h-[1px] bg-gradient-to-r from-neon-cyan/80 via-neon-cyan/20 to-transparent"></div>
              </h2>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 pt-4 pb-2 space-y-5 cyber-scrollbar">
              <section className="flex items-start gap-5 p-5 border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent shadow-[inset_4px_0_0_0_rgba(0,255,156,0.7)] relative">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_10px_rgba(0,255,156,0.2)] text-neon-cyan shrink-0">
                  <Eye className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-mono text-neon-cyan font-bold tracking-widest uppercase mb-1">Worum geht's?</h3>
                  <p className="font-sans leading-relaxed text-[15px] text-cyber-light/80">Erkenne, welches von zwei Werken ein <strong className="text-white">MENSCH</strong> geschaffen hat – und welches eine KI im selben Stil gefälscht hat.</p>
                </div>
              </section>
              <section className="flex items-start gap-5 p-5 border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent shadow-[inset_4px_0_0_0_rgba(0,255,156,0.7)] relative">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_10px_rgba(0,255,156,0.2)] text-neon-cyan shrink-0">
                  <MousePointer2 className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-mono text-neon-cyan font-bold tracking-widest uppercase mb-1">So spielst du</h3>
                  <p className="font-sans leading-relaxed text-[15px] text-cyber-light/80">Pro Runde siehst du ein Paar (gleiche:r Künstler:in, gleiches Thema). Tippe auf das Werk, das du für die KI-Fälschung hältst.</p>
                </div>
              </section>
              <section className="flex items-start gap-5 p-5 border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent shadow-[inset_4px_0_0_0_rgba(0,255,156,0.7)] relative">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_10px_rgba(0,255,156,0.2)] text-neon-cyan shrink-0">
                  <BarChart className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-mono text-neon-cyan font-bold tracking-widest uppercase mb-1">Schwierigkeit</h3>
                  <p className="font-sans leading-relaxed text-[15px] text-cyber-light/80">leicht / mittel / schwer stehen für unterschiedlich starke KI-Modelle – je höher das Level, desto überzeugender die KI-generierten Bilder und Texte.</p>
                </div>
              </section>
              <section className="flex items-start gap-5 p-5 border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent shadow-[inset_4px_0_0_0_rgba(0,255,156,0.7)] relative">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_10px_rgba(0,255,156,0.2)] text-neon-cyan shrink-0">
                  <Trophy className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-mono text-neon-cyan font-bold tracking-widest uppercase mb-1">Punkte & Ranglisten</h3>
                  <p className="font-sans leading-relaxed text-[15px] text-cyber-light/80">Für jede richtig erkannte Fälschung gibt es Punkte. Schwere Stufen zählen im Gesamt-Ranking mehr. Du hast einen Versuch pro Tag und Stufe.</p>
                </div>
              </section>
              <section className="flex items-start gap-5 p-5 border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 to-transparent shadow-[inset_4px_0_0_0_rgba(0,255,156,0.7)] relative">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_10px_rgba(0,255,156,0.2)] text-neon-cyan shrink-0">
                  <UserIcon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-mono text-neon-cyan font-bold tracking-widest uppercase mb-1">Mitmachen</h3>
                  <p className="font-sans leading-relaxed text-[15px] text-cyber-light/80">Ohne Anmeldung spielst du im Tages-Ranking mit (Name eingeben). Mit Login zählst du zusätzlich im globalen Gesamt-Ranking.</p>
                </div>
              </section>
            </div>
            
            {/* Footer */}
            <div className="flex-shrink-0 px-8 pb-8 pt-4">
              <button
                 onClick={() => {
                   audioManager.playSfx('click');
                   setShowHelp(false);
                 }}
                 className="w-full flex items-center justify-center gap-2 p-4 font-mono font-bold tracking-widest uppercase transition-all bg-neon-cyan text-black hover:bg-white shadow-[0_0_15px_rgba(0,255,156,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-dark focus:ring-neon-cyan"
              >
                Verstanden / Los geht's
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full cyber-panel px-8 py-4 md:py-5">
        <div className="cyber-panel-border"></div>
        <div className="cyber-noise"></div>
        <div className="relative z-10 w-full">
        
        <div className="max-w-md mx-auto mb-6 text-left mt-2 pb-3 border-b border-cyber-light/10">
          <p className="text-[10px] font-mono text-neon-cyan tracking-[2px] uppercase">Spielername:</p>
          
          <div className="mt-1 min-h-[32px] flex items-center">
            {isEditingName ? (
              <div className="flex-1 flex items-center gap-2">
                <input 
                  type="text"
                  maxLength={24}
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      audioManager.playSfx('click');
                      handleSaveName();
                    }
                    if (e.key === 'Escape') {
                      audioManager.playSfx('click');
                      setIsEditingName(false);
                      setEditNameValue(displayName);
                      setError(null);
                    }
                  }}
                  autoFocus
                  className="flex-1 bg-black border border-cyber-light/30 text-white font-mono h-8 px-2 text-sm focus:border-neon-cyan focus:outline-none"
                />
                <button 
                  onClick={() => {
                    audioManager.playSfx('click');
                    handleSaveName();
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan border border-neon-cyan transition-colors shrink-0"
                  title="Speichern"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    audioManager.playSfx('click');
                    setEditNameValue(displayName);
                    setIsEditingName(false);
                    setError(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-neon-magenta/20 hover:bg-neon-magenta/40 text-neon-magenta border border-neon-magenta transition-colors shrink-0"
                  title="Abbrechen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-2 min-h-[32px]">
                  <p className="text-xl font-mono text-white break-all flex items-center leading-none">
                    {displayName}
                  </p>
                  <button 
                    onClick={() => {
                      audioManager.playSfx('click');
                      setIsEditingName(true);
                    }}
                    className="p-1 text-cyber-light/50 hover:text-neon-cyan transition-colors"
                    title="Namen ändern"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                {user?.isAnonymous && <span className="text-[10px] uppercase bg-neon-magenta text-black px-2 py-0.5 ml-2 font-bold tracking-widest shrink-0">Gast</span>}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 border border-neon-magenta text-neon-magenta font-mono text-sm uppercase bg-neon-magenta/5">
            {error}
          </div>
        )}

        <div className="text-center w-full mb-4">
          <h3 className="text-sm font-mono text-neon-cyan tracking-[3px] uppercase mb-8">
            {(allPlayed && !isGodmode) ? "Alle Stufen heute gespielt – komm morgen wieder!" : "Tages-Challenge wählen"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['leicht', 'mittel', 'schwer'] as Difficulty[]).map((diff) => {
              const playedResult = playedResults[diff];
              const isPlayed = playedResult !== null && playedResult !== undefined;
              
              const isLoadingSkeleton = statusLoading && !isPlayed && !isGodmode;
              const isSelected = selectedDifficulty === diff && !isLoadingSkeleton;
              
              const tier = tiers.find(t => t.difficulty === diff);
              const Icon = diff === 'leicht' ? Bot : diff === 'mittel' ? Eye : Skull;

              const pips = diff === 'leicht' ? 1 : diff === 'mittel' ? 2 : 3;
              
              const borderClass = diff === 'leicht'
                ? (isSelected ? 'border-neon-cyan' : 'border-cyber-light/10 hover:border-neon-cyan/50')
                : diff === 'mittel'
                ? (isSelected ? 'border-neon-amber' : 'border-cyber-light/10 hover:border-neon-amber/50')
                : (isSelected ? 'border-neon-red' : 'border-cyber-light/10 hover:border-neon-red/50');

              const bgClass = diff === 'leicht'
                ? (isSelected ? 'bg-neon-cyan/10' : 'bg-cyber-dark hover:bg-cyber-dark/80')
                : diff === 'mittel'
                ? (isSelected ? 'bg-neon-amber/10' : 'bg-cyber-dark hover:bg-cyber-dark/80')
                : (isSelected ? 'bg-neon-red/10' : 'bg-cyber-dark hover:bg-cyber-dark/80');

              const textClass = isPlayed 
                ? 'text-cyber-light/50'
                : diff === 'leicht'
                ? (isSelected ? 'text-neon-cyan' : 'text-cyber-light/70 group-hover:text-neon-cyan/80')
                : diff === 'mittel'
                ? (isSelected ? 'text-neon-amber' : 'text-cyber-light/70 group-hover:text-neon-amber/80')
                : (isSelected ? 'text-neon-red' : 'text-cyber-light/70 group-hover:text-neon-red/80');

              const iconBgClass = isPlayed
                ? 'bg-black/30'
                : diff === 'leicht' ? (isSelected ? 'bg-neon-cyan/20' : 'bg-black/50') :
                  diff === 'mittel' ? (isSelected ? 'bg-neon-amber/20' : 'bg-black/50') :
                                      (isSelected ? 'bg-neon-red/20' : 'bg-black/50');
                                      
              const iconColorClass = isPlayed
                ? 'text-cyber-light/30'
                : diff === 'leicht' ? (isSelected ? 'text-neon-cyan' : 'text-cyber-light/50 group-hover:text-neon-cyan') :
                  diff === 'mittel' ? (isSelected ? 'text-neon-amber' : 'text-cyber-light/50 group-hover:text-neon-amber') :
                                      (isSelected ? 'text-neon-red' : 'text-cyber-light/50 group-hover:text-neon-red');

              const focusRingClass = diff === 'leicht' ? 'focus-visible:ring-neon-cyan' : diff === 'mittel' ? 'focus-visible:ring-neon-amber' : 'focus-visible:ring-neon-red';

              return (
                <button 
                  key={diff}
                  aria-label={`Stufe ${diff} auswählen`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isPlayed) return;
                    audioManager.playSfx('select');
                    setSelectedDifficulty(diff);
                  }} 
                  disabled={!!loading || (isPlayed && !isGodmode) || isLoadingSkeleton}
                  className={clsx(
                    "cyber-panel flex flex-col items-center justify-[flex-start] h-full p-6 text-center w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-300",
                    focusRingClass,
                    (!isPlayed && !isLoadingSkeleton) && "hover-lift group",
                    isSelected && !isPlayed ? "scale-105 z-10" : (activeTooltip?.diff === diff ? "scale-100 z-50" : "scale-100 z-0"),
                    isPlayed ? "opacity-90 cursor-default shadow-none border-cyber-light/5 overflow-hidden" : 
                    isLoadingSkeleton ? "opacity-50 cursor-default pointer-events-none bg-black/40 border-cyber-light/5 shadow-none" : "",
                    isPlayed && playedResult.abandoned ? "bg-red-950/20" : "",
                    isPlayed && !playedResult.abandoned ? "bg-green-950/20" : "",
                    isLoadingSkeleton && "animate-pulse"
                  )}
                >
                  <div 
                    className={clsx(
                      "cyber-panel-border transition-all duration-300",
                      !isSelected && !isPlayed && (
                        diff === 'leicht' ? 'group-hover:bg-neon-cyan group-hover:opacity-70 group-hover:!p-[2px] group-hover:[filter:drop-shadow(0_0_12px_rgba(0,255,156,0.5))]' :
                        diff === 'mittel' ? 'group-hover:bg-neon-amber group-hover:opacity-70 group-hover:!p-[2px] group-hover:[filter:drop-shadow(0_0_12px_rgba(255,176,0,0.5))]' :
                        'group-hover:bg-neon-red group-hover:opacity-70 group-hover:!p-[2px] group-hover:[filter:drop-shadow(0_0_12px_rgba(255,51,51,0.5))]'
                      )
                    )}
                    style={isSelected && !isPlayed ? {
                      backgroundColor: diff === 'leicht' ? 'var(--color-neon-cyan)' : diff === 'mittel' ? 'var(--color-neon-amber)' : 'var(--color-neon-red)',
                      filter: `drop-shadow(0 0 20px ${diff === 'leicht' ? 'rgba(0,255,156,0.6)' : diff === 'mittel' ? 'rgba(255,176,0,0.6)' : 'rgba(255,51,51,0.6)'})`,
                      opacity: 0.9,
                      padding: '2px'
                    } : undefined}
                  ></div>
                  <div className="cyber-noise"></div>
                  {isPlayed && (
                    <div className={clsx(
                      "absolute top-6 -right-12 w-[170px] whitespace-nowrap overflow-visible rotate-45 text-[9px] font-bold tracking-[0.2em] text-center py-1.5 uppercase text-black z-20",
                      playedResult.abandoned ? "bg-neon-red shadow-[0_0_10px_rgba(255,51,51,0.5)]" : "bg-neon-cyan shadow-[0_0_10px_rgba(0,255,156,0.5)]"
                    )}>
                      {playedResult.abandoned ? "Abgebrochen" : "Gespielt"}
                    </div>
                  )}
                  <div className="relative z-10 flex flex-col items-center w-full h-full">
                    <div className={clsx("p-4 rounded-full mb-4 transition-colors", iconBgClass)}>
                      <Icon className={clsx("w-10 h-10 transition-colors", iconColorClass)} strokeWidth={1.5} />
                    </div>
                    
                    <h4 className={clsx("text-2xl font-black uppercase tracking-widest mb-2 transition-colors", textClass)}>
                      {diff}
                    </h4>
                    
                    <div className="flex gap-1.5 mb-6">
                      {[1, 2, 3].map(i => {
                        const pipBg = isPlayed
                          ? (i <= pips ? 'bg-cyber-light/30' : 'bg-cyber-light/10')
                          : diff === 'leicht'
                          ? (i <= pips ? (isSelected ? 'bg-neon-cyan' : 'bg-neon-cyan/50') : 'bg-cyber-light/10')
                          : diff === 'mittel'
                          ? (i <= pips ? (isSelected ? 'bg-neon-amber' : 'bg-neon-amber/50') : 'bg-cyber-light/10')
                          : (i <= pips ? (isSelected ? 'bg-neon-red' : 'bg-neon-red/50') : 'bg-cyber-light/10');
                        
                        return (
                          <div 
                            key={i} 
                            className={clsx("w-4 h-1.5 transition-colors", pipBg)} 
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-auto min-h-[24px]">
                      {!isPlayed && (
                        <>
                          <p className="text-sm font-sans text-cyber-light/90 whitespace-nowrap">
                            {diff === 'leicht' ? 'Ältere Modelle' : diff === 'mittel' ? 'Solide Mittelklasse' : 'Aktuelle Spitzenmodelle'}
                          </p>
                          <div 
                            className="relative"
                            onMouseEnter={(e) => setActiveTooltip({ diff, el: e.currentTarget })}
                            onMouseLeave={() => setActiveTooltip(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTooltip(activeTooltip?.diff === diff ? null : { diff, el: e.currentTarget });
                            }}
                          >
                            <Info className="w-4 h-4 text-cyber-light/50 hover:text-white cursor-help transition-colors" />
                            
                            {activeTooltip?.diff === diff && (
                              <TooltipPortal 
                                text={
                                  diff === 'leicht' ? 'Ältere Text- und Bild-Generatoren. Die Fälschungen weisen meist noch erkennbare KI-Merkmale auf, wie z.B. anatomische Fehler oder stilistische Inkonsistenzen.' :
                                  diff === 'mittel' ? 'Gute, aktuelle Modelle. Die Fälschungen sind ordentlich, zeigen aber bei genauerem Hinsehen oft noch typische KI-Muster oder kleine logische Fehler.' :
                                  'Fortschrittlichste KI-Modelle. Die generierten Inhalte weisen eine hohe Qualität auf und erfordern ein sehr genaues Auge für Details, um sie von echten Werken zu unterscheiden.'
                                } 
                                anchorEl={activeTooltip.el} 
                                onClose={() => setActiveTooltip(null)} 
                              />
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className={clsx("w-full text-left transition-opacity duration-300 mt-4 pt-4 border-t", (isSelected || isPlayed) ? "border-cyber-light/10 opacity-100" : "opacity-0 border-transparent")}>
                      <div className="min-h-[80px] flex flex-col justify-center">
                        {isPlayed ? (
                           playedResult.abandoned ? (
                             <div className="flex flex-col items-center justify-center space-y-1 text-center">
                                <span className="text-sm font-mono text-neon-red/80">Abgebrochen <span className="text-cyber-light/30 mx-1">·</span> <span className="text-xs text-cyber-light/60">heute nicht mehr spielbar</span></span>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center justify-center space-y-1 text-center">
                                <span className="text-white font-mono font-bold text-lg">{playedResult.correct}/{playedResult.total} <span className="text-xs text-cyber-light/60 font-normal">richtig</span> <span className="mx-1 text-cyber-light/30">·</span> <span className="text-neon-cyan">{playedResult.score} <span className="text-xs font-normal">Pkt</span></span></span>
                                <span className="text-xs font-mono text-cyber-light/60">{formatTime(playedResult.durationMs ?? 0)}</span>
                             </div>
                           )
                        ) : tier ? (
                          <div className="text-[11px] font-mono text-cyber-light/70 space-y-2 w-full">
                            {tier.textModelle?.[0] && (
                              <div className="truncate">
                                <strong className={clsx("uppercase tracking-wider text-[10px]", diff === 'leicht' ? 'text-neon-cyan' : diff === 'mittel' ? 'text-neon-amber' : 'text-neon-red')}>Text:</strong><br />
                                {tier.textModelle[0].label}
                              </div>
                            )}
                            {tier.bildModelle?.[0] && (
                              <div className="truncate">
                                <strong className={clsx("uppercase tracking-wider text-[10px]", diff === 'leicht' ? 'text-neon-cyan' : diff === 'mittel' ? 'text-neon-amber' : 'text-neon-red')}>Bild:</strong><br />
                                {tier.bildModelle[0].label}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 max-w-sm mx-auto flex flex-col gap-4">
            <button
              onClick={() => {
                audioManager.playSfx('click');
                startGame(selectedDifficulty);
              }}
              disabled={!!loading || statusLoading || (selectedIsPlayed && !isGodmode)}
              className={clsx(
                "w-full relative min-h-[56px] flex items-center justify-center gap-3 p-4 font-mono font-bold tracking-widest uppercase transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-dark hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] border border-transparent hover:border-white",
                (selectedIsPlayed && !isGodmode)
                  ? "bg-cyber-gray text-cyber-light/50 cursor-not-allowed opacity-50 shadow-none hover:shadow-none hover:border-transparent" 
                  : selectedDifficulty === 'leicht' ? 'bg-neon-cyan hover:bg-white text-black shadow-[0_0_15px_rgba(0,255,255,0.2)] focus:ring-neon-cyan' : 
                selectedDifficulty === 'mittel' ? 'bg-neon-amber hover:bg-white text-black shadow-[0_0_15px_rgba(255,184,0,0.2)] focus:ring-neon-amber' : 
                'bg-neon-red hover:bg-white text-black shadow-[0_0_15px_rgba(255,0,60,0.2)] focus:ring-neon-red'
              )}
            >
              {(loading || statusLoading) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin w-5 h-5" />
                </div>
              )}
              <div className={clsx("flex items-center justify-center gap-3 transition-opacity", (loading || statusLoading) ? "opacity-0" : "opacity-100")}>
                <Play className="w-5 h-5" fill="currentColor" /> 
                Spiel starten
              </div>
            </button>

            <button 
              onClick={() => {
                audioManager.playSfx('click');
                onViewLeaderboard();
              }}
              className="w-full flex justify-center items-center gap-2 min-h-[44px] p-2 text-xs font-mono text-cyber-light border border-cyber-light/20 hover:border-neon-cyan hover:bg-neon-cyan/10 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,156,0.2)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neon-cyan group uppercase tracking-[1px] bg-transparent"
            >
              <Trophy className="w-4 h-4 opacity-70 group-hover:text-neon-cyan group-hover:opacity-100 transition-colors" /> Ranglisten ansehen
            </button>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}

function getMockChallenge(diff: Difficulty): DailyChallenge {
  return {
    date: new Date().toISOString(),
    difficulty: diff,
    rounds: [
      {
        roundId: 'r1',
        kategorie: 'gemaelde',
        kuenstler: 'Vincent van Gogh',
        thema: 'Nacht im Cyber-Café',
        items: [
          { id: 'i1', typ: 'bild', inhalt: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=800' },
          { id: 'i2', typ: 'bild', inhalt: 'https://images.unsplash.com/photo-1620807604473-b3c9594589d8?auto=format&fit=crop&q=80&w=800' }
        ]
      },
      {
        roundId: 'r2',
        kategorie: 'gedicht',
        kuenstler: 'Rainer Maria Rilke',
        thema: 'Der digitale Panther',
        items: [
          { id: 'i3', typ: 'text', inhalt: 'Sein Blick ist vom Vorübergehn der Daten\nso müd geworden, dass er nichts mehr hält.\nIhm ist, als ob es tausend Server gäben\nund hinter tausend Servern keine Welt.' },
          { id: 'i4', typ: 'text', inhalt: 'Der Code fließt lautlos durch die leeren Kabel,\nein stummes Rauschen in der Mitternacht.\nDas Netz umwebt die Welt so unergründlich,\nhat unsre Seele in den Schlaf gebracht.' }
        ]
      }
    ]
  };
}

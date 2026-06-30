import React, { useState } from 'react';
import { SubmissionResult, Difficulty, DailyChallenge } from '../types';
import { ArrowRight, Trophy, Zap, AlertTriangle, Check, X, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { auth, googleProvider } from '../firebase';
import { linkWithPopup } from 'firebase/auth';
import { audioManager } from '../audio';
import { TTSButton } from './TTSButton';

interface ResultsViewProps {
  challenge: DailyChallenge;
  result: SubmissionResult;
  difficulty: Difficulty;
  onContinue: () => void;
  onLeaderboard?: () => void;
}

export function ResultsView({ challenge, result, difficulty, onContinue, onLeaderboard }: ResultsViewProps) {
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const attemptGoogleLink = async () => {
    if (!auth.currentUser || !auth.currentUser.isAnonymous) return;
    setIsLinking(true);
    try {
      await linkWithPopup(auth.currentUser, googleProvider);
      // Wait a moment then maybe visual feedback
    } catch (err) {
      console.error("Link failed:", err);
    } finally {
      setIsLinking(false);
    }
  };

  if (selectedRoundId === null) {
    return (
      <div className="flex flex-col items-center min-h-screen text-center p-6 space-y-12 pb-32">
        <div className="space-y-4 mt-12 mb-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-mono text-neon-cyan text-glow-cyan">
            {result.correct} von {result.total} richtig
          </h1>
          <p className="text-cyber-light/60 text-lg md:text-xl font-mono uppercase tracking-widest leading-relaxed">
            Stufe: <span className="text-neon-cyan font-bold">{difficulty}</span><br className="md:hidden" />
            <span className="hidden md:inline"> | </span>Punkte: <span className="text-neon-cyan font-bold">{result.score}</span>
            {result.durationMs !== undefined && (
              <><br className="md:hidden" /><span className="hidden md:inline"> | </span>Zeit: <span className="text-toxic-yellow font-bold">{(result.durationMs / 1000).toFixed(1)}s</span></>
            )}
          </p>
        </div>

        {!result.countsForGlobal && auth.currentUser?.isAnonymous && (
          <div className="w-full max-w-2xl cyber-panel border border-neon-magenta p-6 md:p-8 text-left shadow-[0_0_30px_rgba(255,0,127,0.15)] relative overflow-hidden mb-4">
            <div className="cyber-panel-border"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-neon-magenta"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-magenta/10 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
              <div className="bg-neon-magenta/10 p-4 border border-neon-magenta/30 shrink-0">
                <AlertTriangle className="w-8 h-8 text-neon-magenta" />
              </div>
              <div className="flex-1">
                <h3 className="text-neon-magenta font-mono font-bold uppercase text-lg tracking-widest mb-2">Global-Ranking verpasst!</h3>
                <p className="text-sm font-serif italic text-cyber-light/80 leading-relaxed">
                  Diese Punkte zählen nur für das lokale Tages-Board. Melde dich mit <span className="font-bold text-cyber-light not-italic">Google</span> an, um für die globale Meisterschaft gewertet zu werden.
                </p>
              </div>
              <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  onClick={() => {
                    audioManager.playSfx('click');
                    attemptGoogleLink();
                  }}
                  disabled={isLinking}
                  className="w-full md:w-auto flex items-center justify-center gap-3 bg-neon-magenta text-white px-6 py-3 text-sm font-mono font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 border border-neon-magenta hover:shadow-[0_0_20px_rgba(255,0,127,0.5)] group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-neon-magenta focus:ring-offset-2 focus:ring-offset-black"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    {!isLinking && (
                      <div className="bg-white p-1 rounded-full flex items-center justify-center -ml-2">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                    )}
                    {isLinking ? 'Verbinde...' : 'Anmelden'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-2xl cyber-panel p-4 md:p-8">
          <div className="cyber-panel-border"></div>
          <div className="cyber-noise"></div>
          <div className="relative z-10">
            <h2 className="font-mono text-xl text-cyber-light mb-6 uppercase tracking-widest text-center border-b border-cyber-light/10 pb-4">Runden-Analyse</h2>
          <div className="space-y-3">
            {challenge.rounds.map((round, idx) => {
              const revealInfo = result.reveal.find(r => r.roundId === round.roundId);
              const userGuess = result.guesses?.[round.roundId];
              const isCorrect = userGuess === revealInfo?.fakeId;

              return (
                <button
                  key={round.roundId}
                  onClick={() => {
                    audioManager.playSfx('click');
                    setSelectedRoundId(round.roundId);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-cyber-dark border border-cyber-light/10 hover:border-neon-cyan transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-cyber-light/40 w-6">0{idx + 1}</span>
                    <div>
                      <div className="font-bold text-cyber-light group-hover:text-white transition-colors">{revealInfo?.kuenstler} &middot; {revealInfo?.thema}</div>
                      <div className="text-xs font-mono text-cyber-light/50 uppercase">Tipp: {isCorrect ? 'Korrekt' : 'Falsch'}</div>
                    </div>
                  </div>
                  <div 
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-cyber-light/10 bg-[rgba(10,10,10,0.5)] stagger-fade-in"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-neon-cyan" />
                    ) : (
                      <X className="w-5 h-5 text-neon-magenta" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          </div>
        </div>



        <footer className="fixed bottom-0 left-0 w-full h-[100px] bg-[#0d0d0d] border-t border-cyber-light/10 z-50 flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => {
              audioManager.playSfx('click');
              onContinue();
            }}
            className="flex items-center justify-center gap-2 bg-neon-cyan text-black px-8 py-3 font-bold font-mono uppercase tracking-[2px] text-lg hover:bg-white transition-colors w-[90%] md:w-auto"
          >
             Zurück zum Hauptmenü
          </button>
          
          {onLeaderboard && (
            <button 
              onClick={() => {
                audioManager.playSfx('click');
                onLeaderboard();
              }}
              className="flex items-center justify-center gap-2 bg-transparent text-neon-cyan border border-neon-cyan px-6 py-3 font-bold font-mono uppercase tracking-[2px] hover:bg-neon-cyan/10 transition-colors w-[90%] md:w-auto text-sm"
            >
              <Trophy className="w-4 h-4" /> Rangliste ansehen
            </button>
          )}
        </footer>
      </div>
    );
  }

  // REVEAL DETAIL PHASE
  const round = challenge.rounds.find(r => r.roundId === selectedRoundId);
  if (!round) return null;
  const revealInfo = result.reveal.find(r => r.roundId === round.roundId);
  if (!revealInfo) return null;
  
  const userGuess = result.guesses?.[round.roundId];

  return (
    <div className="flex flex-col h-full w-full relative">
       <header className="text-center py-6 md:py-10 border-b-2 border-neon-magenta bg-neon-magenta/5 z-40 relative">
         <h2 className="text-3xl md:text-4xl font-black uppercase text-neon-magenta text-glow-magenta tracking-widest font-mono">
           Detail-Analyse
         </h2>
         <p className="font-sans font-bold text-cyber-light/80 mt-2 uppercase text-sm">
           {revealInfo?.kuenstler} &middot; {revealInfo?.thema}
         </p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-grow p-6 md:p-10 overflow-y-auto mb-[100px]">
          {round.items.map((item, idx) => {
            const isFake = item.id === revealInfo.fakeId;
            const isUserGuess = item.id === userGuess;

            return (
              <div 
                key={item.id}
                className={clsx(
                  "relative flex flex-col border-[4px] bg-[#111] transition-all duration-700 animate-border-glitch",
                  isFake 
                    ? "border-neon-magenta" 
                    : "border-cyber-gray",
                  isUserGuess && (isFake ? "ring-2 ring-offset-4 ring-offset-[#111] ring-neon-cyan" : "ring-2 ring-offset-4 ring-offset-[#111] ring-neon-magenta")
                )}
              >
                {/* Result Label */}
                <div className={clsx(
                  "absolute -top-[16px] left-[20px] px-4 py-1 font-mono text-xs font-bold uppercase z-20 flex items-center gap-3",
                  isFake ? "bg-neon-magenta text-black shadow-[0_0_15px_rgba(255,0,127,0.5)]" : "bg-cyber-gray text-cyber-light"
                )}>
                  <span>{isFake ? 'KI-Generator Entlarvt' : 'Menschliches Original'}</span>
                  {isUserGuess && (
                    <span className={clsx(
                      "px-2 py-0.5 text-[9px] tracking-widest",
                      isFake ? "bg-black text-neon-cyan" : "bg-white text-black"
                    )}>
                      DEIN TIPP
                    </span>
                  )}
                </div>

                {item.typ === 'text' && (
                  <div className="absolute top-4 right-4 z-30">
                    <TTSButton itemId={item.id} text={item.inhalt} />
                  </div>
                )}

                {/* Content rendering */}
                <div className="w-full h-full flex items-center justify-center p-5 relative overflow-hidden flex-grow">
                  {/* STAMP */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className={clsx(
                      "animate-stamp font-black uppercase text-5xl md:text-7xl tracking-widest border-[6px] md:border-[10px] py-4 px-8 rounded-md bg-[#111]/80 backdrop-blur-sm",
                      isFake ? "text-neon-magenta border-neon-magenta" : "text-neon-cyan border-neon-cyan"
                    )}>
                      {isFake ? 'KI' : 'ECHT'}
                    </div>
                  </div>
                  
                  {item.typ === 'text' ? (
                    <div className="text-left font-serif text-[18px] md:text-[20px] leading-[1.6] relative z-10 w-full pl-6 border-l border-neon-magenta/50 italic text-[#ccc] min-h-[300px] flex items-center">
                       <span>{item.inhalt}</span>
                    </div>
                  ) : (
                    <div className={clsx(
                      "w-full aspect-square p-2 bg-[#222] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] border-[10px] flex items-center justify-center relative overflow-hidden",
                      isFake ? "border-neon-magenta" : "border-[#222]"
                    )}>
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img 
                         src={item.inhalt} 
                         alt="Kunstwerk" 
                         className="w-full h-full object-cover drop-shadow-lg"
                         referrerPolicy="no-referrer"
                       />
                    </div>
                  )}
                </div>

                {/* Explanation Box */}
                <div className="border-t-[4px] border-[#222] bg-cyber-dark p-6 font-mono text-sm leading-[1.6]">
                  {isFake ? (
                    <div>
                      <span className="text-neon-magenta font-bold uppercase mb-2 block tracking-wider">Modell: {revealInfo.model}</span>
                      <span className="text-white">Hier verrät sie sich: KI-Modelle haben oft Probleme mit subtilen Texturen oder repetitiven Mustern.</span>
                    </div>
                  ) : (
                    <div className="opacity-70">
                      <span className="text-cyber-light font-bold uppercase mb-2 block tracking-wider">Menschlicher Schöpfer</span>
                      <span className="text-cyber-light">Echtes Werk von {revealInfo?.kuenstler}.</span>
                      {revealInfo?.quelle && (
                        <div className="mt-2 text-xs italic text-cyber-light/60">
                          Quelle: {revealInfo.quelle}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="fixed bottom-0 left-0 w-full h-[100px] bg-[#0d0d0d] border-t border-cyber-light/10 z-50 flex items-center justify-center">
          <button
            onClick={() => {
              audioManager.playSfx('click');
              setSelectedRoundId(null);
            }}
            className="flex items-center justify-center gap-4 bg-cyber-gray hover:bg-[#222] border border-cyber-light/20 text-white px-10 py-4 font-mono font-bold uppercase tracking-[2px] text-lg transition-colors w-[90%] max-w-xl"
          >
            <ArrowLeft className="w-6 h-6" /> ZURÜCK ZUR ÜBERSICHT
          </button>
        </footer>
    </div>
  );
}

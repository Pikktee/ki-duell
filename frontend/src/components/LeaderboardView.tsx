import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ScoreEntry, Difficulty } from '../types';
import { Loader2, ArrowLeft, Trophy, Crown, Medal } from 'lucide-react';
import { clsx } from 'clsx';
import { audioManager } from '../audio';

interface LeaderboardViewProps {
  user: User | null;
  onBack: () => void;
}

type TabState = 'tages' | 'global';

const formatTime = (ms?: number) => {
  if (!ms) return '-';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function LeaderboardView({ user, onBack }: LeaderboardViewProps) {
  const [activeTab, setActiveTab] = useState<TabState>('tages');
  const [difficulty, setDifficulty] = useState<Difficulty>('mittel');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        audioManager.playSfx('click');
        onBack();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  useEffect(() => {
    fetchScores();
  }, [activeTab, difficulty]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      let q;
      if (activeTab === 'tages') {
        const today = new Date().toISOString().split('T')[0];
        q = query(
          collection(db, 'dailyScores'),
          where('date', '==', today),
          where('difficulty', '==', difficulty),
          orderBy('score', 'desc'),
          orderBy('durationMs', 'asc'),
          limit(50)
        );
      } else {
        q = query(
          collection(db, 'globalScores'),
          orderBy('totalScore', 'desc'),
          orderBy('totalDurationMs', 'asc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data() as ScoreEntry);
      
      setScores(data);
    } catch (err) {
      console.error("Firestore read error:", err);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-col min-h-[85vh] w-full max-w-4xl mx-auto cyber-panel px-4 md:px-8 py-6 mb-8"
      style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 15%, rgba(0, 0, 0, 0.65) 100%), rgba(15, 15, 15, 0.85)' }}
    >
      <div className="cyber-panel-border"></div>
      <div className="cyber-noise"></div>
      <div className="relative z-10 w-full flex-1 flex flex-col">
       <style>{`
         @media (prefers-reduced-motion: no-preference) {
           .row-animate {
             opacity: 0;
             transform: translateY(8px);
             animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           }
           @keyframes fade-in-up {
             to {
               opacity: 1;
               transform: translateY(0);
             }
           }
         }
       `}</style>
       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 mb-8 border-b border-cyber-light/10">
         <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center">
           <button 
             onClick={() => {
               audioManager.playSfx('click');
               onBack();
             }} 
             className="flex items-center gap-2 text-neon-cyan hover:text-white font-mono uppercase text-sm transition-colors mb-4 sm:mb-0 relative z-10"
           >
             <ArrowLeft className="w-4 h-4" /> ZURÜCK
           </button>
           <h2 className="text-3xl font-black uppercase text-neon-cyan tracking-widest flex items-center gap-3 font-mono relative z-10">
             <Trophy className="w-8 h-8" /> Hall of Fame
           </h2>
         </div>
       </header>

       {/* TABS */}
       <div className="flex bg-black/40 border border-cyber-light/20 p-1 mb-8 max-w-4xl mx-auto w-full">
         <button 
           onClick={() => {
             audioManager.playSfx('click');
             setActiveTab('tages');
           }}
           className={clsx(
             "flex-1 py-3 text-sm font-mono uppercase font-bold tracking-widest transition-colors",
             activeTab === 'tages' ? "bg-neon-cyan text-black" : "text-cyber-light/60 hover:text-neon-cyan"
           )}
         >
           Tages-Challenge
         </button>
         <button 
           onClick={() => {
             audioManager.playSfx('click');
             setActiveTab('global');
           }}
           className={clsx(
             "flex-1 py-3 text-sm font-mono uppercase font-bold tracking-widest transition-colors",
             activeTab === 'global' ? "bg-neon-magenta text-white" : "text-cyber-light/60 hover:text-neon-magenta"
           )}
         >
           Global
         </button>
       </div>

       {/* DIFFICULTY FILTER (Only for tages) */}
       {activeTab === 'tages' && (
         <div className="flex justify-center gap-4 mb-8">
           {(['leicht', 'mittel', 'schwer'] as Difficulty[]).map(diff => (
             <button
               key={diff}
               onClick={() => {
                 audioManager.playSfx('click');
                 setDifficulty(diff);
               }}
               className={clsx(
                 "px-4 py-2 border font-mono text-xs uppercase tracking-wider transition-colors font-bold",
                 difficulty === diff 
                   ? diff === 'leicht' ? "border-neon-cyan bg-neon-cyan text-black shadow-[0_0_15px_rgba(0,255,156,0.6)]" 
                     : diff === 'mittel' ? "border-toxic-yellow bg-toxic-yellow text-black shadow-[0_0_15px_rgba(224,255,0,0.6)]"
                     : "border-neon-magenta bg-neon-magenta text-white shadow-[0_0_15px_rgba(255,0,127,0.6)]"
                   : "bg-black/40 border-cyber-light/30 text-cyber-light hover:border-cyber-light/70 hover:bg-black/80"
               )}
             >
               {diff}
             </button>
           ))}
         </div>
       )}

       {/* LEADERBOARD LIST */}
       <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-[500px]">
         <div className="relative z-10 flex-1 flex flex-col">
           <div className="overflow-x-auto pb-4 flex-1">
             <table className="w-full table-fixed font-mono text-sm sm:text-base border-collapse min-w-[500px]">
               <thead>
                 <tr className="text-xs text-cyber-light/40 uppercase tracking-widest border-b border-cyber-light/10">
                   <th className="w-20 py-4 text-center font-normal px-1">Rang</th>
                   <th className="py-4 text-left font-normal px-2">Spieler</th>
                   <th className="w-20 sm:w-24 px-2 py-4 text-right font-normal">Punkte</th>
                   <th className="w-20 sm:w-28 px-2 py-4 text-right font-normal">Treffer</th>
                   <th className="w-20 sm:w-24 px-2 py-4 text-right font-normal">Zeit</th>
                 </tr>
               </thead>
               <tbody className={loading ? "opacity-30 transition-opacity duration-300 pointer-events-none" : "opacity-100 transition-opacity duration-300"}>
                 {loading && scores.length === 0 ? (
                   Array.from({ length: 5 }).map((_, i) => (
                     <tr key={`skeleton-${i}`} className="border-b border-cyber-light/5 animate-pulse opacity-50">
                       <td className="py-4"><div className="w-8 h-4 mx-auto bg-cyber-light/10 rounded"></div></td>
                       <td className="py-4 px-2"><div className="w-32 max-w-full h-4 bg-cyber-light/10 rounded"></div></td>
                       <td className="py-4 px-2 text-right"><div className="w-12 h-4 bg-cyber-light/10 rounded ml-auto"></div></td>
                       <td className="py-4 px-2 text-right"><div className="w-12 h-4 bg-cyber-light/10 rounded ml-auto"></div></td>
                       <td className="py-4 px-2 text-right"><div className="w-12 h-4 bg-cyber-light/10 rounded ml-auto"></div></td>
                     </tr>
                   ))
                 ) : scores.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="text-center py-24 font-mono text-cyber-light/40 uppercase">
                       Noch keine Einträge – sei der/die Erste!
                     </td>
                   </tr>
                 ) : (
                   scores.map((entry, idx) => {
                     const isMe = entry.displayName === user?.displayName;
                     const timeMs = activeTab === 'tages' ? entry.durationMs : entry.totalDurationMs;
                     const timeFormatted = formatTime(timeMs);
                     
                     let rankVisual;
                     if (idx === 0) {
                       rankVisual = <span className="flex items-center justify-center gap-1.5 text-toxic-yellow drop-shadow-[0_0_8px_rgba(224,255,0,0.6)] font-bold"><Crown className="w-4 h-4" />1.</span>;
                     } else if (idx === 1) {
                       rankVisual = <span className="flex items-center justify-center gap-1.5 text-gray-300 drop-shadow-[0_0_5px_rgba(200,200,200,0.5)] font-bold"><Medal className="w-4 h-4" />2.</span>;
                     } else if (idx === 2) {
                       rankVisual = <span className="flex items-center justify-center gap-1.5 text-[#cd7f32] drop-shadow-[0_0_5px_rgba(205,127,50,0.5)] font-bold"><Medal className="w-4 h-4" />3.</span>;
                     } else {
                       rankVisual = <span className="opacity-50">{idx + 1}.</span>;
                     }

                     const accuracyText = activeTab === 'tages' 
                       ? `${entry.correct ?? 0}/${entry.total ?? 0}`
                       : `${entry.totalCorrect ?? 0}`;

                     const scoreText = activeTab === 'tages' ? entry.score : entry.totalScore;

                     return (
                       <tr 
                         key={idx}
                         className={clsx(
                           "row-animate transition-colors relative group",
                           isMe ? "bg-neon-cyan/10 font-bold z-10" : "hover:bg-white/5",
                           !isMe && idx !== scores.length - 1 && "border-b border-cyber-light/5" // Zebra subtle
                         )}
                         style={{ 
                           animationDelay: `${idx * 40}ms`,
                           ...(isMe ? { boxShadow: 'inset 0 0 0 1px rgba(0, 255, 255, 0.4), 0 0 15px rgba(0, 255, 255, 0.15)' } : {})
                         }}
                       >
                         <td className="w-20 py-4 text-center">
                           {rankVisual}
                         </td>
                         <td className={clsx("py-4 px-2 truncate max-w-xs", isMe ? "text-neon-cyan" : "text-white")}>
                           {entry.displayName} 
                           {isMe && <span className="text-[10px] bg-neon-cyan text-black px-1.5 py-0.5 ml-2 font-bold tracking-widest rounded-sm align-middle inline-block drop-shadow-none">YOU</span>}
                         </td>
                         <td className="w-20 sm:w-24 py-4 px-2 text-right text-toxic-yellow font-bold">
                           {scoreText}
                         </td>
                         <td className={clsx("w-20 sm:w-28 py-4 px-2 text-right", isMe ? "text-neon-cyan" : "text-cyber-light/60")}>
                           {accuracyText}
                         </td>
                         <td className={clsx("w-20 sm:w-24 py-4 px-2 text-right", isMe ? "text-neon-cyan" : "text-cyber-light/60")}>
                           {timeFormatted}
                         </td>
                       </tr>
                     );
                   })
                 )}
               </tbody>
             </table>
           </div>
         </div>
       </div>
      </div>
    </div>
  );
}
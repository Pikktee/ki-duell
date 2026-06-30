/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WelcomeView } from './components/WelcomeView';
import { GameView } from './components/GameView';
import { ResultsView } from './components/ResultsView';
import { LeaderboardView } from './components/LeaderboardView';
import { LoginView } from './components/LoginView';
import { CyberBackground } from './components/CyberBackground';
import { AnimatedLogo } from './components/AnimatedLogo';
import { auth } from './firebase';
import { onAuthStateChanged, User, signOut, updateProfile } from 'firebase/auth';
import { Difficulty, DailyChallenge, SubmissionResult } from './types';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { audioManager } from './audio';
import { AnimatePresence, motion } from 'motion/react';

const ADJECTIVES = ['Neon', 'Pixel', 'Cyber', 'Glitch', 'Chrom', 'Phantom', 'Synth', 'Quanten', 'Astral', 'Holo', 'Vektor', 'Prisma', 'Kobalt', 'Plasma'];
const NOUNS = ['Falke', 'Wolf', 'Rabe', 'Fuchs', 'Drache', 'Geist', 'Komet', 'Nomade', 'Muse', 'Pinsel', 'Seher', 'Wächter', 'Schatten', 'Orakel'];

function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const includeNumber = Math.random() > 0.5;
  let name = includeNumber 
    ? `${adj} ${noun} ${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`
    : `${adj} ${noun}`;
  return name.substring(0, 24);
}

export type GameState = 'login' | 'welcome' | 'playing' | 'results' | 'leaderboard';

function PageTransition({ children, id }: { children: React.ReactNode, id: string }) {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transitionEnd: { willChange: "auto" as any } },
    exit: { opacity: 0 }
  };

  return (
    <motion.div
      key={id}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex-1 flex flex-col w-full h-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>('');
  
  // Game session state
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [challengeData, setChallengeData] = useState<DailyChallenge | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(audioManager.isMuted());
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (gameState === 'welcome' || gameState === 'leaderboard') {
      audioManager.playState('menu');
    } else if (gameState === 'playing') {
      audioManager.playState('game');
    } else if (gameState === 'results' || gameState === 'login') {
      audioManager.playState('none');
    }
  }, [gameState]);

  const toggleMute = () => {
    setIsMuted(audioManager.toggleMute());
    audioManager.playSfx('click');
  };

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let finalName = currentUser.displayName;
        if (currentUser.isAnonymous) {
          const storedKey = `anon_name`;
          let storedName = localStorage.getItem(storedKey);
          
          if ((!finalName || finalName === 'Anonym') && !storedName) {
            storedName = generateRandomName();
            localStorage.setItem(storedKey, storedName);
            try {
              await updateProfile(currentUser, { displayName: storedName });
            } catch (e) {
              console.warn("Failed to update profile", e);
            }
          }
          
          if ((!finalName || finalName === 'Anonym') && storedName) {
            finalName = storedName;
            try {
              await updateProfile(currentUser, { displayName: finalName });
            } catch (e) {
              console.warn("Failed to update profile again", e);
            }
          }
        }
        
        setDisplayName(finalName || 'Gast');
        if (!currentUser.isAnonymous) {
          setGameState(prev => prev === 'login' ? 'welcome' : prev);
        }
      } else {
        setGameState('login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStartGame = (difficulty: Difficulty, challenge: DailyChallenge) => {
    setSelectedDifficulty(difficulty);
    setChallengeData(challenge);
    setGameState('playing');
  };

  const handleGameComplete = (result: SubmissionResult) => {
    setSubmissionResult(result);
    setGameState('results');
    
    // Wait for fade out
    setTimeout(() => {
      const ratio = result.correct / result.total;
      if (ratio >= 0.8) {
        audioManager.playSfx('result-high');
      } else if (ratio >= 0.5) {
        audioManager.playSfx('result-mid');
      } else {
        audioManager.playSfx('result-low');
      }
    }, 500);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleUpdateName = async (newName: string) => {
    if (user && newName.trim()) {
      const finalName = newName.trim().substring(0, 24);
      await updateProfile(user, { displayName: finalName });
      setDisplayName(finalName);
      if (user.isAnonymous) {
        localStorage.setItem(`anon_name`, finalName);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-dark text-neon-cyan relative">
        <div className="fixed inset-0 pointer-events-none z-[100] bg-scanlines mix-blend-overlay"></div>
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-cyber-light relative flex flex-col bg-transparent`}>
      {gameState !== 'login' && <CyberBackground isActiveGame={gameState === 'playing'} />}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-scanlines"></div>

      <main className="flex-1 flex flex-col max-w-[1024px] mx-auto w-full relative z-10 px-6 pb-6">
        <AnimatePresence>
          {(gameState === 'login' || gameState === 'welcome' || gameState === 'leaderboard') && (
            <motion.div 
              initial={{ opacity: 0, height: "auto" }}
              animate={{ opacity: 1, height: "auto", transitionEnd: { willChange: "auto" as any } }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="flex-shrink-0 flex flex-col items-center justify-end w-full"
            >
              <div className="pt-4 sm:pt-6 mb-[34px] w-full flex flex-col items-center justify-end">
                <AnimatedLogo animateEntrance={gameState === 'login'} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
          <AnimatePresence mode="wait">
            {gameState === 'login' && (
              <PageTransition id="login">
                <LoginView onLoginSuccess={() => {
                  setGameState('welcome');
                  if (auth.currentUser?.displayName) {
                    setDisplayName(auth.currentUser.displayName);
                  }
                }} />
              </PageTransition>
            )}

          {gameState === 'welcome' && (
            <PageTransition id="welcome">
              <WelcomeView 
                user={user} 
                displayName={displayName}
                onStart={handleStartGame} 
                onViewLeaderboard={() => setGameState('leaderboard')}
                onSignOut={handleSignOut}
                onUpdateName={handleUpdateName}
                isMuted={isMuted}
                toggleMute={toggleMute}
              />
            </PageTransition>
          )}
          
          {gameState === 'playing' && challengeData && (
            <PageTransition id="playing">
              <GameView 
                user={user}
                displayName={displayName}
                challenge={challengeData} 
                onComplete={handleGameComplete} 
                onAbort={() => setGameState('welcome')}
                isMuted={isMuted}
                toggleMute={toggleMute}
              />
            </PageTransition>
          )}
          
          {gameState === 'results' && submissionResult && selectedDifficulty && challengeData && (
            <PageTransition id="results">
              <ResultsView 
                challenge={challengeData}
                result={submissionResult} 
                difficulty={selectedDifficulty}
                onContinue={() => setGameState('welcome')} 
                onLeaderboard={() => setGameState('leaderboard')}
              />
            </PageTransition>
          )}
          
          {gameState === 'leaderboard' && (
            <PageTransition id="leaderboard">
              <LeaderboardView 
                user={user}
                onBack={() => setGameState('welcome')} 
              />
            </PageTransition>
          )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

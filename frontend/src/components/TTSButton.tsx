import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Play, Square } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { audioManager } from '../audio';

// Modul-Level Cache, damit die URLs zwischen GameView und ResultsView erhalten bleiben
const ttsUrlCache: Record<string, string> = {};

let currentActiveTTS = {
  audio: null as HTMLAudioElement | null,
  setPlaying: null as ((v: boolean) => void) | null,
};

function stopOtherTTS(exceptAudio?: HTMLAudioElement | null) {
  if (currentActiveTTS.audio && currentActiveTTS.audio !== exceptAudio) {
    currentActiveTTS.audio.pause();
    currentActiveTTS.audio.currentTime = 0;
    if (currentActiveTTS.setPlaying) {
      currentActiveTTS.setPlaying(false);
    }
  }
  if (!exceptAudio) {
    currentActiveTTS.audio = null;
    currentActiveTTS.setPlaying = null;
  }
}

interface TTSButtonProps {
  itemId: string;
  text: string;
  className?: string;
}

export function TTSButton({ itemId, text, className = "" }: TTSButtonProps) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMounted = useRef(true);

  // Stop audio if component unmounts or text changes
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (audioRef.current) {
        if (currentActiveTTS.audio === audioRef.current) {
          stopOtherTTS(null);
        } else {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      }
    };
  }, [text]);

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Verhindert, dass die Karte ausgewählt wird beim Klick
    audioManager.playSfx('click');

    if (playing && audioRef.current) {
      if (currentActiveTTS.audio === audioRef.current) {
        stopOtherTTS(null);
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlaying(false);
      }
      return;
    }

    // Stop any currently playing TTS before starting this new one
    stopOtherTTS(null);

    if (ttsUrlCache[text]) {
      playAudio(ttsUrlCache[text]);
      return;
    }

    setLoading(true);
    try {
      const synthesizeSpeech = httpsCallable<{text: string}, {url: string, cached: boolean}>(functions, 'synthesizeSpeech');
      const res = await synthesizeSpeech({ text });
      if (!isMounted.current) return;
      if (res.data?.url) {
        ttsUrlCache[text] = res.data.url;
        playAudio(res.data.url);
      }
    } catch (err) {
      console.error("TTS Error:", err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const playAudio = (url: string) => {
    if (!audioRef.current) {
      const audio = new Audio(url);
      audio.onended = () => { if (isMounted.current) setPlaying(false); };
      audio.onerror = () => { if (isMounted.current) setPlaying(false); };
      audioRef.current = audio;
    } else if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }
    
    audioRef.current.play().then(() => {
      if (isMounted.current) {
        setPlaying(true);
        currentActiveTTS.audio = audioRef.current;
        currentActiveTTS.setPlaying = setPlaying;
      }
    }).catch(err => {
        console.error("Audio play error", err);
        if (isMounted.current) {
          setPlaying(false);
        }
    });
  };

  return (
    <button 
      onClick={handlePlayPause}
      disabled={loading}
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-cyber-dark/80 backdrop-blur-md border-[2px] border-neon-cyan/30 text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/20 transition-all duration-300 z-30 shadow-[0_0_10px_rgba(0,255,156,0.1)] hover:shadow-[0_0_20px_rgba(0,255,156,0.4)] ${playing ? 'animate-pulse border-neon-cyan shadow-[0_0_20px_rgba(0,255,156,0.6)]' : ''} ${className}`}
      title={loading ? 'Lädt...' : playing ? 'Stopp' : 'Vorlesen'}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : playing ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
    </button>
  );
}

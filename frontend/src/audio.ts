export class AudioManager {
  private muted: boolean = false;
  public musicAudio: HTMLAudioElement | null = null;
  public ambientAudio: HTMLAudioElement | null = null;
  private hasInteracted: boolean = false;
  public currentMusicState: 'menu' | 'game' | 'none' = 'none';
  private tickInterval: number | null = null;
  private fadeInterval: number | null = null;

  private sfxCache: Record<string, HTMLAudioElement> = {};

  // Web Audio Context for background reactivity
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private menuSource: MediaElementAudioSourceNode | null = null;
  private ambientSource: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private currentBass: number = 0;
  private currentLevel: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('soundMuted') === 'true';
      this.initMusic();
      this.preloadSfx();
      this.setupInteractionListener();
    }
  }

  private initMusic() {
    this.musicAudio = new Audio('audio/menu-music.mp3');
    this.musicAudio.loop = true;
    this.musicAudio.volume = this.muted ? 0 : 0.3;

    this.ambientAudio = new Audio('audio/game-ambient.mp3');
    this.ambientAudio.loop = true;
    this.ambientAudio.volume = this.muted ? 0 : 0.18;
  }

  private preloadSfx() {
    const sfxList = [
      'click', 'select', 'card-select', 'submit', 'tick',
      'result-high', 'result-mid', 'result-low'
    ];
    sfxList.forEach(name => {
      const audio = new Audio(`audio/${name}.mp3`);
      audio.preload = 'auto';
      this.sfxCache[name] = audio;
    });
  }

  private setupInteractionListener() {
    const onInteract = () => {
      if (!this.hasInteracted) {
        this.hasInteracted = true;
        this.initWebAudio();
        this.applyMusicState();
      }
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
    window.addEventListener('pointerdown', onInteract);
    window.addEventListener('keydown', onInteract);
  }

  private initWebAudio() {
    if (!this.audioContext && window.AudioContext) {
      try {
        this.audioContext = new window.AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        if (this.musicAudio) {
          this.menuSource = this.audioContext.createMediaElementSource(this.musicAudio);
          this.menuSource.connect(this.analyser);
        }
        
        if (this.ambientAudio) {
          this.ambientSource = this.audioContext.createMediaElementSource(this.ambientAudio);
          this.ambientSource.connect(this.analyser);
        }
        
        this.analyser.connect(this.audioContext.destination);
      } catch (e) {
        console.error('Web Audio API setup failed', e);
      }
    }
    
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private bassRunningAvg: number = 0;
  private currentPulse: number = 0;
  private lastComputeTime: number = 0;
  private cachedReactivity: { bass: number; level: number } = { bass: 0, level: 0 };

  public getAudioReactivity(): { bass: number, level: number } {
    const now = performance.now();
    if (now - this.lastComputeTime < 10) {
      return this.cachedReactivity;
    }
    this.lastComputeTime = now;

    if (!this.analyser || !this.dataArray || this.muted) {
      this.currentPulse += (0 - this.currentPulse) * 0.1;
      this.currentLevel += (0 - this.currentLevel) * 0.1;
      this.cachedReactivity = { bass: this.currentPulse, level: this.currentLevel };
      return this.cachedReactivity;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    
    // Bass (lower 10%)
    let bassSum = 0;
    const bassCount = Math.floor(this.dataArray.length * 0.1);
    for (let i = 0; i < bassCount; i++) {
      bassSum += this.dataArray[i];
    }
    const rawBass = (bassSum / bassCount) / 255;
    
    // Level (all bins)
    let levelSum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      levelSum += this.dataArray[i];
    }
    const rawLevel = (levelSum / this.dataArray.length) / 255;

    // Reactivity factor based on game state (dampened in game)
    const factor = this.currentMusicState === 'game' ? 0.4 : 1.0;

    // Transient-based beat detection
    this.bassRunningAvg += (rawBass - this.bassRunningAvg) * 0.02;
    const transient = Math.max(0, rawBass - this.bassRunningAvg);
    
    // Emphasize peaks and apply state factor, capped for safety
    const peak = Math.min(Math.pow(transient, 1.5) * factor * 2.5, 1.0); // multiplied by 2.5 to boost transient sensitivity, but capped at 1.0

    // Pulse: fast attack, slower release
    if (peak > this.currentPulse) {
      this.currentPulse += (peak - this.currentPulse) * 0.5; // smoother attack (limit hard stroboscope)
    } else {
      this.currentPulse += (peak - this.currentPulse) * 0.08; // slower release
    }

    // Level smoothing (also dampened by factor)
    this.currentLevel += (rawLevel * factor - this.currentLevel) * 0.2;
    
    this.cachedReactivity = { bass: this.currentPulse, level: this.currentLevel };
    return this.cachedReactivity;
  }

  public toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('soundMuted', this.muted.toString());
    
    if (this.musicAudio) this.musicAudio.volume = this.muted ? 0 : (this.currentMusicState === 'menu' ? 0.3 : 0);
    if (this.ambientAudio) this.ambientAudio.volume = this.muted ? 0 : (this.currentMusicState === 'game' ? 0.18 : 0);
    
    this.applyMusicState();
    return this.muted;
  }

  public isMuted() {
    return this.muted;
  }

  public playState(state: 'menu' | 'game' | 'none') {
    this.currentMusicState = state;
    this.applyMusicState();

    if (state === 'game') {
      this.startTick();
    } else {
      this.stopTick();
    }
  }

  private applyMusicState() {
    if (!this.hasInteracted) return;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (this.muted) {
      this.musicAudio?.pause();
      this.ambientAudio?.pause();
      return;
    }

    if (this.currentMusicState === 'menu') {
      this.ambientAudio?.pause();
      if (this.musicAudio) {
        if (this.musicAudio.paused) {
          this.musicAudio.currentTime = 6;
          this.musicAudio.volume = 0;
          this.musicAudio.play().catch(() => {});
          this.fadeInMusic(this.musicAudio, 0.3, 8000);
        } else {
          this.musicAudio.volume = 0.3;
        }
      }
    } else if (this.currentMusicState === 'game') {
      if (this.musicAudio && !this.musicAudio.paused) {
        this.crossfadeToAmbient();
      } else {
        this.musicAudio?.pause();
        if (this.ambientAudio) {
          this.ambientAudio.volume = 0.18;
          this.ambientAudio.play().catch(() => {});
        }
      }
    } else if (this.currentMusicState === 'none') {
      this.fadeOutMusic();
    }
  }

  private fadeInMusic(audio: HTMLAudioElement, targetVolume: number, duration: number) {
    let vol = 0;
    const steps = Math.max(10, Math.floor(duration / 50));
    const stepTime = duration / steps;
    const step = targetVolume / steps;

    this.fadeInterval = window.setInterval(() => {
      vol = Math.min(targetVolume, vol + step);
      if (audio) {
        audio.volume = vol;
      }
      
      if (vol >= targetVolume) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, stepTime);
  }

  private fadeOutMusic() {
    let volM = this.musicAudio ? this.musicAudio.volume : 0;
    let volA = this.ambientAudio ? this.ambientAudio.volume : 0;
    
    if (volM === 0 && Math.abs(volA) < 0.01) {
      this.musicAudio?.pause();
      this.ambientAudio?.pause();
      return;
    }
    
    const steps = 10;
    const stepTime = 500 / steps;
    const stepM = volM / steps;
    const stepA = volA / steps;

    this.fadeInterval = window.setInterval(() => {
      if (this.musicAudio) {
        volM = Math.max(0, volM - stepM);
        this.musicAudio.volume = volM;
      }
      if (this.ambientAudio) {
        volA = Math.max(0, volA - stepA);
        this.ambientAudio.volume = volA;
      }

      if (volM === 0 && volA === 0) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.musicAudio?.pause();
        this.ambientAudio?.pause();
      }
    }, stepTime);
  }

  private crossfadeToAmbient() {
    let volM = this.musicAudio ? this.musicAudio.volume : 0;
    
    if (this.ambientAudio) {
      this.ambientAudio.volume = 0;
      this.ambientAudio.play().catch(() => {});
    }

    const steps = 30; // 30 steps for 1.5s
    const duration = 1500;
    const stepTime = duration / steps;
    const stepM = volM / steps;
    const stepA = 0.18 / steps;
    
    let volA = 0;

    this.fadeInterval = window.setInterval(() => {
      if (this.musicAudio) {
        volM = Math.max(0, volM - stepM);
        this.musicAudio.volume = Math.max(0, volM);
      }
      if (this.ambientAudio) {
        volA = Math.min(0.18, volA + stepA);
        this.ambientAudio.volume = Math.max(0, volA);
      }

      if (volM <= 0 && volA >= 0.18) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.musicAudio?.pause();
        if (this.ambientAudio) this.ambientAudio.volume = 0.18;
      }
    }, stepTime);
  }

  private startTick() {
    this.stopTick();
    this.tickInterval = window.setInterval(() => {
      this.playSfx('tick', 0.8);
    }, 30000);
  }

  private stopTick() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  public playSfx(name: string, volume: number = 0.7) {
    if (this.muted || !this.hasInteracted) return;
    const cached = this.sfxCache[name];
    if (cached) {
      const clone = cached.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play().catch(() => {});
    }
  }
}

export const audioManager = new AudioManager();

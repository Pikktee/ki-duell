import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Loader2, Mail, Lock, User as UserIcon, LogIn, UserPlus, Ghost, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatedLogo } from './AnimatedLogo';

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} width="24" height="24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

type Mode = 'select' | 'email-login' | 'email-register' | 'anonymous';

const InputField = ({ icon: Icon, placeholder, type, value, onChange }: any) => (
  <div className="relative mb-4">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-neon-cyan/50" />
    </div>
    <input
      type={type}
      className="w-full bg-cyber-dark border border-cyber-light/20 focus:border-neon-cyan focus:outline-none pl-10 p-3 text-lg font-mono text-white transition-colors"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

export function LoginView({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain nicht autorisiert! Bitte füge "${window.location.hostname}" in der Firebase Console unter Authentication > Settings > Authorized domains hinzu.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login-Fenster wurde geschlossen, bevor der Vorgang abgeschlossen war.');
      } else {
        setError(err.message || 'Google Login fehlgeschlagen.');
      }
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('E-Mail oder Passwort ist falsch.');
      } else {
        setError(err.message || 'Login fehlgeschlagen. Prüfe deine Daten.');
      }
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Anzeigename erforderlich");
      return;
    }
    setLoading(true); setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name.trim() });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen.');
      setLoading(false);
    }
  };

  const handleAnonymous = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true); setError(null);
    try {
      await signInAnonymously(auth);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Anonymer Login fehlgeschlagen.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center text-center max-w-md mx-auto">
      <div className="w-full bg-cyber-gray/90 backdrop-blur-xl border border-cyber-light/10 p-8 pt-6 shadow-2xl relative rounded-sm overflow-hidden">
        <div className="cyber-noise"></div>
        <div className="relative z-10 w-full h-full text-center">
          <div className="mb-10 relative inline-block">
            <h2 className="font-mono text-sm font-bold text-white tracking-[0.3em] uppercase">
              Login
            </h2>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-px bg-neon-cyan/50"></div>
          </div>
        
        {error && (
          <div className="mb-6 p-4 border border-neon-magenta text-neon-magenta font-mono text-xs uppercase bg-neon-magenta/5 text-left">
            FEHLER: {error}
          </div>
        )}

        {mode === 'select' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <button 
                onClick={handleAnonymous} 
                disabled={loading}
                className="w-full relative min-h-[56px] flex items-center justify-center gap-3 p-4 bg-neon-cyan text-black hover:bg-white transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-cyber-dark shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] border border-transparent hover:border-white"
              >
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-black animate-spin" />
                  </div>
                )}
                <div className={clsx("flex items-center justify-center gap-3 transition-opacity", loading ? "opacity-0" : "opacity-100")}>
                  <Ghost className="w-5 h-5 text-black" />
                  <span className="font-mono font-bold tracking-widest uppercase">Sofort spielen</span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-4 my-8">
              <div className="h-px bg-cyber-light/10 flex-1"></div>
              <span className="text-xs font-mono text-cyber-light/40 tracking-widest uppercase">Oder mit Konto</span>
              <div className="h-px bg-cyber-light/10 flex-1"></div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogle} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-3 border border-cyber-light/20 bg-cyber-dark hover:border-white/50 hover:bg-white/5 transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-cyber-dark shadow-[0_0_5px_rgba(255,255,255,0)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <GoogleIcon className="w-5 h-5" />
                <span className="font-mono font-bold tracking-widest text-white group-hover:text-white">Google Login</span>
              </button>

              <div className="flex gap-4">
                <button 
                  onClick={() => setMode('email-login')} 
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 p-3 border border-cyber-light/20 bg-cyber-dark hover:border-white/50 hover:bg-white/5 transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-cyber-dark shadow-[0_0_5px_rgba(255,255,255,0)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <LogIn className="w-4 h-4 text-cyber-light group-hover:text-white transition-colors" />
                  <span className="font-mono text-xs font-bold tracking-widest uppercase text-cyber-light group-hover:text-white transition-colors">E-Mail Login</span>
                </button>
                <button 
                  onClick={() => setMode('email-register')} 
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 p-3 border border-cyber-light/20 bg-cyber-dark hover:border-white/50 hover:bg-white/5 transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-cyber-dark shadow-[0_0_5px_rgba(255,255,255,0)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <UserPlus className="w-4 h-4 text-cyber-light group-hover:text-white transition-colors" />
                  <span className="font-mono text-xs font-bold tracking-widest uppercase text-cyber-light group-hover:text-white transition-colors">Registrieren</span>
                </button>
              </div>
              
              <div className="pt-6 mt-6 border-t border-cyber-light/10 text-center flex justify-center">
                <p className="inline-flex items-center gap-3 text-[9px] sm:text-[10px] font-mono text-cyber-light/80 tracking-widest uppercase">
                  <span className="w-1 h-1 bg-cyber-light/80"></span>
                  Globale Bestenliste erfordert Konto
                  <span className="w-1 h-1 bg-cyber-light/80"></span>
                </p>
              </div>
            </div>
          </div>
        )}

        {mode !== 'select' && (
          <div className="text-left">
            <button 
              onClick={() => { setMode('select'); setError(null); }}
              className="flex items-center gap-2 text-cyber-light/60 hover:text-neon-cyan font-mono text-xs uppercase transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> ZURÜCK
            </button>

            {mode === 'email-login' && (
              <form onSubmit={handleEmailLogin}>
                <h2 className="font-mono text-neon-cyan text-sm uppercase tracking-widest mb-4">E-Mail Login</h2>
                <InputField icon={Mail} type="email" placeholder="E-Mail" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                <InputField icon={Lock} type="password" placeholder="Passwort" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                <button disabled={loading} type="submit" className="w-full bg-neon-cyan text-black p-4 font-mono font-bold tracking-widest uppercase hover:bg-white transition-colors flex justify-center mt-6">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Anmelden'}
                </button>
              </form>
            )}

            {mode === 'email-register' && (
              <form onSubmit={handleEmailRegister}>
                <h2 className="font-mono text-neon-cyan text-sm uppercase tracking-widest mb-4">Neuen Account erstellen</h2>
                <InputField icon={UserIcon} type="text" placeholder="Spielername (für Leaderboard)" value={name} onChange={(e: any) => setName(e.target.value)} />
                <InputField icon={Mail} type="email" placeholder="E-Mail" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                <InputField icon={Lock} type="password" placeholder="Passwort" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                <button disabled={loading} type="submit" className="w-full bg-neon-cyan text-black p-4 font-mono font-bold tracking-widest uppercase hover:bg-white transition-colors flex justify-center mt-6">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Registrieren'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
      </div>
    </div>
  );
}

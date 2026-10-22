/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Radar, 
  AlertTriangle, 
  TrendingUp,
  Radio,
  Sparkles,
  Check,
  Shield,
  KeyRound
} from 'lucide-react';
import { 
  AuthService, 
  AuthUser, 
  ADMIN_USERNAME, 
  ADMIN_PASSWORD, 
  ADMIN_EMAIL 
} from '../services/authService';

interface AuthGateViewProps {
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
}

export const AuthGateView: React.FC<AuthGateViewProps> = ({
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if input matches admin credentials
  const isAdminCredentials = 
    username.trim().toUpperCase() === ADMIN_USERNAME ||
    username.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const result = await AuthService.register(username, password);
        if (!result.success || !result.user) {
          setErrorMsg(result.error || 'Registration failed. Please check credentials.');
          setIsLoading(false);
          return;
        }
        await AuthService.requestNotificationPermission();
        setSuccessNotice('Account created successfully! Unlocking terminal...');
        setTimeout(() => {
          onAuthSuccess(result.user!);
        }, 500);
      } else {
        const result = await AuthService.login(username, password);
        if (!result.success || !result.user) {
          setErrorMsg(result.error || 'Login failed. Please verify credentials.');
          setIsLoading(false);
          return;
        }
        setSuccessNotice('Authentication verified! Loading live Solana stream...');
        setTimeout(() => {
          onAuthSuccess(result.user!);
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col justify-between selection:bg-cyan-400 selection:text-black relative overflow-hidden">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#00f0ff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Protocol Status Bar */}
      <header className="w-full border-b border-cyan-500/20 bg-black/60 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Zap className="w-5 h-5 fill-cyan-400 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm tracking-wider text-white">
                PUMPSURGE<span className="text-cyan-400">.LIVE</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-semibold">
                10s Sync Active
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Solana Pump.fun Real-Time Sniper & 1+ SOL Whale Radar</p>
          </div>
        </div>
      </header>

      {/* Main Authentication Center Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-6">
        <div className="w-full max-w-md bg-black border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.18)] relative backdrop-blur-xl">
          {/* Subtle Glow Header Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff]" />

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)] mb-3">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {mode === 'login' ? 'Terminal Access' : 'Create Trader Account'}
            </h1>
          </div>

          {/* Tab Selector: Login vs Register */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-cyan-500/30 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error & Success Toasts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-xs flex items-start gap-2.5 animate-pulse">
              <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {isAdminCredentials && (
            <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-400/40 text-cyan-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-mono text-[11px]">Administrator credentials recognized (Full App Control).</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#030611] border border-cyan-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#030611] border border-cyan-500/30 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || username.trim().length < 3 || password.length < 4}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <span>Authenticating Terminal...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Authenticate & Enter' : 'Create Account & Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Feature Highlights Grid at Bottom */}
      <footer className="w-full border-t border-cyan-500/20 bg-black/70 backdrop-blur-md px-6 py-4 z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">10s Auto-Sync</div>
              <div className="text-[11px] text-zinc-400">Fresh pool prices every 10 seconds</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 shrink-0">
              <Radar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">1+ SOL Whale Radar</div>
              <div className="text-[11px] text-zinc-400">Buy & Sell timestamps and PnL</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">5X & 10X Moonshots</div>
              <div className="text-[11px] text-zinc-400">Multiplier runner detection</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="font-bold text-white">Dumping Sentinel</div>
              <div className="text-[11px] text-zinc-400">Warnings when tokens fall &lt;3X</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

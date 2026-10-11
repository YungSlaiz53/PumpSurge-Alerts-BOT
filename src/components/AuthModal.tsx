/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { AuthService, AuthUser } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'register',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Real-time validations
  const isGmailValid = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(gmail.trim());
  const hasMinLength = password.length >= 6;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const isPasswordAlphanumerical = hasMinLength && hasLetters && hasNumbers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const result = await AuthService.register(gmail, password);
        if (!result.success) {
          setErrorMsg(result.error || 'Registration failed.');
          setIsLoading(false);
          return;
        }
        if (result.user) {
          // Request browser notifications on registration
          await AuthService.requestNotificationPermission();
          onAuthSuccess(result.user);
          onClose();
        }
      } else {
        const result = await AuthService.login(gmail, password);
        if (!result.success) {
          setErrorMsg(result.error || 'Login failed.');
          setIsLoading(false);
          return;
        }
        if (result.user) {
          onAuthSuccess(result.user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f131d] border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/50 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-[#0f131d] rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-xl">
              ⚡
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'register' ? 'Create Free Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'register'
              ? 'Join PumpSurge to receive real-time 5x/10x moonshot notifications'
              : 'Sign in to access your custom watchlist and live alerts'}
          </p>
        </div>

        {/* Mode Toggle Switch */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800/80 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition ${
              mode === 'register'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition ${
              mode === 'login'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (Gmail) Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Username (Live Gmail):</span>
              {gmail && (
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${isGmailValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isGmailValid ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Valid Gmail
                    </>
                  ) : (
                    'Must end with @gmail.com'
                  )}
                </span>
              )}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-950 border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition ${
                  gmail && isGmailValid
                    ? 'border-emerald-500/60 focus:border-emerald-400'
                    : gmail && !isGmailValid
                    ? 'border-amber-500/60 focus:border-amber-400'
                    : 'border-zinc-800 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Password (Alphanumerical) Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Password (Alphanumerical):</span>
              {password && mode === 'register' && (
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${isPasswordAlphanumerical ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isPasswordAlphanumerical ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Strong
                    </>
                  ) : (
                    'Letters + Numbers'
                  )}
                </span>
              )}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="e.g. Surge2026"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 bg-zinc-950 border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition ${
                  password && isPasswordAlphanumerical
                    ? 'border-emerald-500/60 focus:border-emerald-400'
                    : password && !isPasswordAlphanumerical
                    ? 'border-amber-500/60 focus:border-amber-400'
                    : 'border-zinc-800 focus:border-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirement Chips (Registration only) */}
            {mode === 'register' && (
              <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  6+ chars
                </span>
                <span className={`flex items-center gap-1 ${hasLetters ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasLetters ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  Letters (a-z)
                </span>
                <span className={`flex items-center gap-1 ${hasNumbers ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNumbers ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  Numbers (0-9)
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (mode === 'register' && (!isGmailValid || !isPasswordAlphanumerical))}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'register' ? (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Encrypted with bcrypt
          </span>
          <span>100% Free Forever</span>
        </div>
      </div>
    </div>
  );
};

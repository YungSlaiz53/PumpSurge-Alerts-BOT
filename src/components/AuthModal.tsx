/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  KeyRound,
  Check
} from 'lucide-react';
import { AuthService, AuthUser, ADMIN_USERNAME, ADMIN_PASSWORD } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register' | 'gmail';
  isFirstVisitGate?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'register',
  isFirstVisitGate = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'gmail'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gmailInput, setGmailInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Validation
  const isUsernameValid = username.trim().length >= 3;
  const isPasswordValid = password.length >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setAdminNotice(null);
    setIsLoading(true);

    try {
      // Check if user is typing Admin credentials (ADMIN01 / 125252)
      const isAdminLogin = username.trim().toUpperCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
      if (isAdminLogin) {
        setAdminNotice('Administrator verified (ADMIN01). Opening Admin Dashboard...');
      }

      if (mode === 'gmail') {
        const result = await AuthService.loginWithGmailAuthenticator(gmailInput);
        if (!result.success || !result.user) {
          setErrorMsg(result.error || 'Gmail authentication failed.');
          setIsLoading(false);
          return;
        }
        await AuthService.requestNotificationPermission();
        onAuthSuccess(result.user);
        onClose();
        return;
      }

      if (mode === 'register') {
        const result = await AuthService.register(username, password);
        if (!result.success || !result.user) {
          setErrorMsg(result.error || 'Registration failed.');
          setIsLoading(false);
          return;
        }
        await AuthService.requestNotificationPermission();
        onAuthSuccess(result.user);
        onClose();
      } else {
        const result = await AuthService.login(username, password);
        if (!result.success || !result.user) {
          setErrorMsg(result.error || 'Login failed.');
          setIsLoading(false);
          return;
        }
        onAuthSuccess(result.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const email = gmailInput.trim() || 'trader.solana@gmail.com';
      const result = await AuthService.loginWithGmailAuthenticator(email);
      if (result.success && result.user) {
        await AuthService.requestNotificationPermission();
        onAuthSuccess(result.user);
        onClose();
      } else {
        setErrorMsg(result.error || 'Google Authenticator failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authenticator failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-black border border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-[0_0_35px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          title="Dismiss / Guest Mode"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-400 p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-cyan-400 font-black text-xl">
              ⚡
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isFirstVisitGate ? 'Welcome to PumpSurge Live' : (
              mode === 'register' ? 'Register Account' : 
              mode === 'login' ? 'Sign In to App' : 'Gmail Authenticator'
            )}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'register' && 'Register your account to access real-time 15s sniper feeds'}
            {mode === 'login' && 'Enter your username and password to access your dashboard'}
            {mode === 'gmail' && 'One-click sign in with verified Gmail Authenticator'}
          </p>
        </div>

        {/* Gmail Authenticator 1-Click Shortcut Button */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => {
              if (mode === 'gmail') {
                handleInstantGoogleAuth();
              } else {
                setMode('gmail');
                setErrorMsg(null);
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-md transition active:scale-98"
          >
            {/* Google Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Login with Gmail Authenticator</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-[#0f131d] px-3 text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
            Or Standard Portal
          </span>
          <div className="border-t border-zinc-800 w-full" />
        </div>

        {/* Mode Toggle Switch (Register / Sign In) */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800/80 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition ${
              mode === 'register'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-bold'
                : 'text-zinc-400 hover:text-white'
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
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Admin Feedback Notice */}
        {adminNotice && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/50 text-indigo-300 text-xs flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{adminNotice}</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Gmail Authenticator Specific View */}
        {mode === 'gmail' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Enter Gmail to Authenticate:</span>
                <span className="text-[10px] text-cyan-400 font-mono">1-Click Fast Auth</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstantGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate with Gmail Account</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Standard Auth Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Username:</span>
                {username && (
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${isUsernameValid ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {isUsernameValid ? <Check className="w-3 h-3" /> : 'Min 3 chars'}
                  </span>
                )}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Password:</span>
                {password && (
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${isPasswordValid ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {isPasswordValid ? <Check className="w-3 h-3" /> : 'Min 4 chars'}
                  </span>
                )}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isUsernameValid || !isPasswordValid}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : mode === 'register' ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Guest preview option */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition underline underline-offset-4"
          >
            Continue as Guest / Preview Feeds
          </button>
        </div>

        {/* Security badge footer */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Live DB Session
          </span>
          <span className="font-mono text-zinc-400">PumpSurge v2.1</span>
        </div>
      </div>
    </div>
  );
};

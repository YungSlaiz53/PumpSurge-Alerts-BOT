/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Activity, 
  Terminal, 
  Trophy, 
  Star, 
  Calculator, 
  Server, 
  Radio, 
  Bell, 
  Volume2, 
  VolumeX, 
  User, 
  LogOut, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AuthUser } from '../services/authService';

export type ActiveTab = 'feed' | 'runners' | 'watchlist' | 'logs' | 'curve' | 'render';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isLiveWs: boolean;
  setIsLiveWs: (live: boolean) => void;
  latencyMs: number;
  blockSlot: number;
  trackedCount: number;
  alertsCount: number;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  watchlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isLiveWs,
  setIsLiveWs,
  latencyMs,
  blockSlot,
  trackedCount,
  alertsCount,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount,
  soundEnabled,
  onToggleSound,
  watchlistCount,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-[#0c0f17]/95 backdrop-blur sticky top-0 z-40">
      {/* Top Banner Status Bar */}
      <div className="px-4 py-1.5 bg-zinc-950/80 border-b border-zinc-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-200 font-medium">SOLANA MAINNET</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">Program: <code className="text-emerald-400">6EF8...eF6P</code></span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Commitment: <strong className="text-zinc-200">processed</strong></span>
            </span>
            <span className="text-zinc-600">•</span>
            <span>Slot: <strong className="text-zinc-200 font-mono">#{blockSlot.toLocaleString()}</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Latency: <strong className="text-emerald-400 font-mono">{latencyMs}ms</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 font-mono">
            <span>Tracking: <strong className="text-zinc-100">{trackedCount} coins</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Surges: <strong className="text-cyan-400">{alertsCount}</strong></span>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1 rounded-lg border text-xs transition flex items-center gap-1 ${
              soundEnabled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Stream mode pill */}
          <button
            onClick={() => setIsLiveWs(!isLiveWs)}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1.5 transition ${
              isLiveWs 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLiveWs ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {isLiveWs ? 'Live Stream' : 'Simulation'}
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center text-emerald-400 font-black text-lg">
              ⚡
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-zinc-100 tracking-tight flex items-center gap-1.5">
                PumpSurge <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APP V2.0</span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">Solana Pump.fun Real-Time Token Sniper &amp; Surge App</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'feed'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Radar Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('runners')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'runners'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>5x/10x Runners</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'watchlist'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Watchlist ({watchlistCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('curve')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'curve'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bonding Math</span>
          </button>

          <button
            onClick={() => setActiveTab('render')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'render'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Render Deploy</span>
          </button>
        </nav>

        {/* Right Section: Notification Bell + User Auth Portal */}
        <div className="flex items-center gap-2">
          {/* Notification Center Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title="Open Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Registration & Login Portal */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                {currentUser.username.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-white text-[11px] truncate max-w-[120px]">
                  {currentUser.username}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono">Live DB Connected</div>
              </div>
              <button
                onClick={onLogout}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition ml-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Register / Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

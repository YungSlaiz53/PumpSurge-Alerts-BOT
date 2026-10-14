/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Activity, 
  Terminal, 
  Trophy, 
  Calculator, 
  Radio, 
  Bell, 
  Volume2, 
  VolumeX, 
  User, 
  LogOut, 
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Radar
} from 'lucide-react';
import { AuthUser } from '../services/authService';

export type ActiveTab = 'feed' | 'high_buys' | 'runners' | 'whale_tracker' | 'dumped' | 'logs' | 'curve' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  latencyMs: number;
  blockSlot: number;
  trackedCount: number;
  alertsCount: number;
  highBuysCount: number;
  dumpedCount: number;
  whalesCount?: number;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isAutoSyncActive?: boolean;
  onToggleAutoSync?: () => void;
  syncCountdownSeconds?: number;
  siteTitle?: string;
  siteSubtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  latencyMs,
  blockSlot,
  trackedCount,
  alertsCount,
  highBuysCount,
  dumpedCount,
  whalesCount = 0,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount,
  soundEnabled,
  onToggleSound,
  isAutoSyncActive = true,
  onToggleAutoSync = () => {},
  syncCountdownSeconds = 15,
  siteTitle = 'PumpSurge',
  siteSubtitle = 'Real-Time Solana Pump.fun Sniper & 15s Radar',
}) => {
  const isAdmin = currentUser?.isAdmin || currentUser?.role === 'admin' || currentUser?.username === 'ADMIN01';

  return (
    <header className="border-b border-cyan-500/20 bg-black/95 backdrop-blur sticky top-0 z-40">
      {/* Top Banner Status Bar - Neon Blue, Black, White */}
      <div className="px-4 py-1.5 bg-[#020408] border-b border-cyan-500/20 text-xs flex flex-wrap items-center justify-between gap-3 text-zinc-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-white font-medium">SOLANA MAINNET</span>
            <span className="text-cyan-500/40">|</span>
            <span className="text-zinc-400">Pump.fun: <code className="text-cyan-400 font-mono">6EF8...eF6P</code></span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Slot: <strong className="text-white font-mono">#{blockSlot.toLocaleString()}</strong></span>
            </span>
            <span className="text-zinc-600">•</span>
            <span>Latency: <strong className="text-cyan-300 font-mono">{latencyMs}ms</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 15s Auto-Sync Heartbeat Status */}
          <button
            onClick={onToggleAutoSync}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border flex items-center gap-1.5 transition ${
              isAutoSyncActive
                ? 'bg-cyan-950/60 border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-zinc-950 border-white/10 text-zinc-500'
            }`}
            title="Toggle 15s auto-synchronization"
          >
            <RefreshCw className={`w-3 h-3 ${isAutoSyncActive ? 'animate-spin text-cyan-400' : ''}`} />
            <span>15s Sync: {isAutoSyncActive ? `${syncCountdownSeconds}s` : 'OFF'}</span>
          </button>

          <div className="hidden md:flex items-center gap-3 font-mono text-[11px]">
            <span>Tracking: <strong className="text-white">{trackedCount} coins</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Whales: <strong className="text-cyan-400 font-bold">{whalesCount}</strong></span>
            <span className="text-zinc-600">•</span>
            <span>High Buys: <strong className="text-orange-400">{highBuysCount}</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Surges: <strong className="text-cyan-300">{alertsCount}</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Dumped: <strong className="text-red-400">{dumpedCount}</strong></span>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1 rounded-lg border text-xs transition flex items-center gap-1 ${
              soundEnabled
                ? 'bg-cyan-950/60 border-cyan-400/40 text-cyan-300'
                : 'bg-zinc-950 border-white/10 text-zinc-500'
            }`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo - Neon Blue and Black */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-cyan-400 font-black text-lg">
              ⚡
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                {siteTitle} <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">LIVE</span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">{siteSubtitle}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-[#030611] border border-cyan-500/30 p-1 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'feed'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Radar Feed</span>
          </button>

          {/* Whale Tracker (1+ SOL) Tab (Requirement 1 & 2) */}
          <button
            onClick={() => setActiveTab('whale_tracker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'whale_tracker'
                ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,240,255,0.6)] font-black'
                : 'text-cyan-400 hover:text-white hover:bg-cyan-950/40'
            }`}
          >
            <Radar className="w-3.5 h-3.5 animate-pulse" />
            <span>Whale Radar (1+ SOL) ({whalesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('high_buys')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'high_buys'
                ? 'bg-orange-500 text-black shadow-md font-bold'
                : 'text-orange-400 hover:text-orange-300 hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High Buys ({highBuysCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('runners')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'runners'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-cyan-300" />
            <span>5x/10x Runners</span>
          </button>

          {/* Dumped Coins Tab */}
          <button
            onClick={() => setActiveTab('dumped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'dumped'
                ? 'bg-red-600 text-white shadow-md font-bold'
                : 'text-red-400 hover:text-red-300 hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Dumped (&lt; 3X) ({dumpedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('curve')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'curve'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bonding Math</span>
          </button>

          {/* Admin Dashboard Tab */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-white text-black shadow-lg shadow-white/20 font-black'
                  : 'bg-zinc-900 text-white border border-white/30 hover:bg-zinc-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin Dashboard</span>
            </button>
          )}
        </nav>

        {/* Right Section: Notification Bell + User Auth Portal */}
        <div className="flex items-center gap-2">
          {/* Notification Center Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-[#030611] hover:bg-black border border-cyan-500/30 text-zinc-300 hover:text-white transition"
            title="Open Notification Center"
          >
            <Bell className="w-4 h-4 text-cyan-400" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-black font-black text-[9px] flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Registration & Login Portal */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#030611] border border-cyan-500/30 rounded-xl px-2.5 py-1 text-xs">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                isAdmin ? 'bg-white text-black' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full rounded-lg" />
                ) : (
                  currentUser.username.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-white text-[11px] truncate max-w-[120px] flex items-center gap-1">
                  <span>{currentUser.username}</span>
                  {isAdmin ? (
                    <span className="text-[9px] px-1 bg-white text-black rounded font-mono font-bold">ADMIN</span>
                  ) : currentUser.isGmailAuthenticated ? (
                    <span className="text-[9px] text-cyan-400" title="Authenticated with Gmail">✓</span>
                  ) : null}
                </div>
                <div className="text-[9px] text-cyan-400 font-mono">
                  {isAdmin ? 'Admin Access' : 'Live DB Connected'}
                </div>
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
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition active:scale-95"
            >
              <User className="w-3.5 h-3.5 fill-black" />
              <span>Register / Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

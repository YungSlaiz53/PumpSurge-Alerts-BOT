/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Activity, 
  Terminal, 
  Send, 
  Code2, 
  Calculator, 
  Server, 
  Radio, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export type ActiveTab = 'feed' | 'logs' | 'telegram' | 'dm' | 'curve' | 'code' | 'vps';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isLiveWs: boolean;
  setIsLiveWs: (live: boolean) => void;
  latencyMs: number;
  blockSlot: number;
  trackedCount: number;
  alertsCount: number;
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
}) => {
  return (
    <header className="border-b border-zinc-800 bg-[#0d0f17]/95 backdrop-blur sticky top-0 z-50">
      {/* Top Banner Status Bar */}
      <div className="px-4 py-1.5 bg-zinc-950/80 border-b border-zinc-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-200 font-medium">SOLANA MAINNET-BETA</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">Pump.fun: <code className="text-emerald-400">6EF8...eF6P</code></span>
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

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 font-mono">
            <span>Tracking: <strong className="text-zinc-100">{trackedCount} tokens</strong></span>
            <span className="text-zinc-600">•</span>
            <span>Alerts Dispatched: <strong className="text-cyan-400">{alertsCount}</strong></span>
          </div>

          <button
            onClick={() => setIsLiveWs(!isLiveWs)}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1.5 transition ${
              isLiveWs 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLiveWs ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {isLiveWs ? 'Live Stream Active' : 'Simulation Mode'}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <div className="w-full h-full bg-[#0d0f17] rounded-[7px] flex items-center justify-center text-emerald-400 font-black text-lg">
              ⚡
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-zinc-100 tracking-tight flex items-center gap-1.5">
                PumpSniper <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PRO V1.0</span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">Pump.fun Solana Telegram Sniping &amp; 5x/10x Alert Engine</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'feed'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Radar Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'logs'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'telegram'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Channel Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('dm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'dm'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>DM Bot Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('curve')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'curve'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bonding Math</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'code'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Codebase</span>
          </button>

          <button
            onClick={() => setActiveTab('vps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'vps'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VPS &amp; Deploy</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

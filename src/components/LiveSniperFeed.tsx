/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Zap, 
  Flame, 
  Copy, 
  Check, 
  TrendingUp, 
  Clock, 
  Search, 
  Coins, 
  Sparkles,
  RefreshCw, 
  Trash2, 
  Timer,
  AlertTriangle,
  TrendingDown
} from 'lucide-react';
import { TrackedToken } from '../types';

interface LiveSniperFeedProps {
  tokens: TrackedToken[];
  onSimulateNewMint: () => void;
  onSimulateTrade: (mint: string, multiplierBump: number) => void;
  onSelectTokenForLookup: (mint: string) => void;
  onClearLogsAndCache: () => void;
  onSyncRealTime: () => void;
  isSyncing: boolean;
  solUsdPrice: number;
  syncCountdownSeconds?: number;
  isAutoSyncActive?: boolean;
  onToggleAutoSync?: () => void;
  timeUntilMidnight?: string;
  onSimulateHighBuys?: (mint: string) => void;
  onSimulateDump?: (mint?: string) => void;
}

export const LiveSniperFeed: React.FC<LiveSniperFeedProps> = ({
  tokens,
  onSimulateNewMint,
  onSimulateTrade,
  onClearLogsAndCache,
  onSyncRealTime,
  isSyncing,
  syncCountdownSeconds = 15,
  isAutoSyncActive = true,
  onToggleAutoSync = () => {},
  timeUntilMidnight = '',
  onSimulateHighBuys,
  onSimulateDump,
}) => {
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'new_listings' | 'high_buys' | 'surges' | 'dumped'>('new_listings');

  const handleCopy = (mint: string) => {
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  const highBuysCount = tokens.filter(t => t.isHighBuys).length;
  const surgesCount = tokens.filter(t => t.highestMultiplier >= 5.0).length;
  const dumpedCount = tokens.filter(t => t.isDumped || (t.highestMultiplier >= 3.0 && (t.currentPriceSol / t.initialPriceSol) < 3.0)).length;

  const filteredTokens = tokens.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.symbol.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.mint.toLowerCase().includes(filterQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterCategory === 'high_buys') {
      return t.isHighBuys;
    }
    if (filterCategory === 'surges') {
      return t.highestMultiplier >= 5.0;
    }
    if (filterCategory === 'dumped') {
      return t.isDumped || (t.highestMultiplier >= 3.0 && (t.currentPriceSol / t.initialPriceSol) < 3.0);
    }
    // 'new_listings' shows all active tokens
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Sleek Action Toolbar - Neon Blue & Black with Touch of White */}
      <div className="bg-black border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Heartbeat: 15s Auto-Sync and 24h 00:00 Reset */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              onClick={onToggleAutoSync}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 flex items-center gap-2 hover:bg-cyan-900/60 transition active:scale-95 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              title="Toggle 15-second auto-sync"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAutoSyncActive ? 'bg-cyan-400 opacity-75' : 'bg-zinc-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoSyncActive ? 'bg-cyan-400' : 'bg-zinc-600'}`}></span>
              </span>
              <span>15s Auto-Sync: <strong>{isAutoSyncActive ? 'ON' : 'PAUSED'}</strong></span>
              {isAutoSyncActive && (
                <span className="bg-cyan-400 text-black font-bold px-1.5 py-0.5 rounded text-[10px]">
                  {syncCountdownSeconds}s
                </span>
              )}
            </button>

            {timeUntilMidnight && (
              <div className="px-3 py-1.5 rounded-xl bg-[#030611] border border-cyan-500/20 text-zinc-300 flex items-center gap-1.5 text-[11px]">
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span>00:00 Reset in: <strong className="text-white">{timeUntilMidnight}</strong></span>
              </div>
            )}
          </div>

          {/* Quick Toolbar Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onSyncRealTime}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.35)] transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Prices (15s)'}</span>
            </button>

            <button
              onClick={onSimulateNewMint}
              className="px-3 py-2 rounded-xl bg-black hover:bg-cyan-950/40 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Mint</span>
            </button>

            {onSimulateDump && (
              <button
                onClick={() => onSimulateDump()}
                className="px-3 py-2 rounded-xl bg-black hover:bg-red-950/40 text-red-300 font-semibold text-xs border border-red-500/40 flex items-center gap-1.5 transition active:scale-95"
                title="Simulate token falling below 3x threshold"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Dump (&lt; 3X)</span>
              </button>
            )}

            <button
              onClick={onClearLogsAndCache}
              className="px-2.5 py-2 rounded-xl bg-black hover:bg-zinc-900 text-zinc-300 text-xs border border-white/20 flex items-center gap-1.5 transition"
              title="Clear all stored logs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Tabs: Requirement 4: "leave it as New Listings not New Listings (15s)" */}
          <div className="flex items-center gap-1 bg-[#030611] p-1 rounded-xl border border-cyan-500/30 overflow-x-auto max-w-full">
            <button
              onClick={() => setFilterCategory('new_listings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterCategory === 'new_listings'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              New Listings ({tokens.length})
            </button>

            <button
              onClick={() => setFilterCategory('high_buys')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 whitespace-nowrap ${
                filterCategory === 'high_buys'
                  ? 'bg-orange-500 text-black shadow'
                  : 'text-orange-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>High Buys ({highBuysCount})</span>
            </button>

            <button
              onClick={() => setFilterCategory('surges')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 whitespace-nowrap ${
                filterCategory === 'surges'
                  ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-cyan-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>5x/10x Surges ({surgesCount})</span>
            </button>

            <button
              onClick={() => setFilterCategory('dumped')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 whitespace-nowrap ${
                filterCategory === 'dumped'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-red-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Dumped (&lt; 3X) ({dumpedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-cyan-400" />
              <input
                type="text"
                placeholder="Search symbol, name, CA..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#030611] border border-cyan-500/30 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Token Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTokens.length === 0 ? (
          <div className="col-span-full bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            <Coins className="w-10 h-10 mx-auto mb-3 opacity-40 text-emerald-400" />
            <h3 className="font-semibold text-zinc-300 mb-1">No tokens in this filter</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Waiting for new on-chain listings or synchronize live pump.fun coins.
            </p>
            <button
              onClick={onSyncRealTime}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Synchronize Live Solana Pools</span>
            </button>
          </div>
        ) : (
          filteredTokens.map((token) => {
            const currentMult = (token.currentPriceSol / token.initialPriceSol);
            const isDumped = token.isDumped || (token.highestMultiplier >= 3.0 && currentMult < 3.0);
            const is10x = token.highestMultiplier >= 10.0 && !isDumped;
            const is5x = token.highestMultiplier >= 5.0 && !is10x && !isDumped;
            const isHighBuys = token.isHighBuys && !isDumped;
            const bondingCurvePercent = Math.min(100, (token.currentMarketCapSol / 85) * 100);
            const elapsedSeconds = Math.max(1, Math.floor((Date.now() - token.createdAt) / 1000));

            return (
              <div
                key={token.mint}
                className={`bg-zinc-900/80 border rounded-2xl p-4 flex flex-col justify-between transition hover:border-zinc-700 relative overflow-hidden group ${
                  isDumped
                    ? 'border-red-500/60 shadow-lg shadow-red-950/20 bg-gradient-to-b from-red-950/25 to-black'
                    : is10x
                    ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] bg-[#030611]'
                    : is5x
                    ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.2)] bg-[#030611]'
                    : isHighBuys
                    ? 'border-orange-500/60 shadow-md bg-[#030611]'
                    : 'bg-black border-white/10 hover:border-cyan-400/40'
                }`}
              >
                {/* Badges */}
                {isDumped && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-red-600 text-white font-black text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1 animate-pulse origin-top-right z-10 shadow-lg">
                    <AlertTriangle className="w-3 h-3 fill-white" /> WARNING COIN DUMPING
                  </div>
                )}
                {is10x && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-400 text-black font-black text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1 animate-breathe-10x origin-top-right z-10 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                    <Flame className="w-3 h-3 fill-black animate-bounce" /> 10X MOONSHOT
                  </div>
                )}
                {is5x && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500 text-black font-black text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1 animate-breathe-5x origin-top-right z-10 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                    <Zap className="w-3 h-3 fill-black" /> 5X SURGE
                  </div>
                )}
                {isHighBuys && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500 text-zinc-950 font-black text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1 animate-pulse origin-top-right z-10">
                    <TrendingUp className="w-3 h-3 fill-zinc-950" /> HIGH BUYS
                  </div>
                )}

                <div>
                  {/* Token Header */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-black shrink-0 ${
                      isDumped
                        ? 'bg-red-950/60 border-red-500/40 text-red-400'
                        : 'bg-[#060b17] border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    }`}>
                      {token.symbol.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-16">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-white truncate">{token.name}</h3>
                        <span className={`text-xs font-mono font-bold shrink-0 ${isDumped ? 'text-red-400' : 'text-cyan-400'}`}>
                          ${token.symbol}
                        </span>
                      </div>

                      {/* Dev Wallet & Time */}
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {elapsedSeconds}s ago
                        </span>
                        <span>•</span>
                        <span>Dev: <code className="text-zinc-300 font-mono">{token.creator.slice(0, 4)}...{token.creator.slice(-4)}</code></span>
                      </div>
                    </div>
                  </div>

                  {/* Dumping Alert Warning Banner if coin dropped below 3X */}
                  {isDumped && (
                    <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-[11px] flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1.5 font-black text-red-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                        WARNING COIN DUMPING
                      </span>
                      <span className="font-bold text-red-400">&lt; 3.0X ({currentMult.toFixed(2)}x)</span>
                    </div>
                  )}

                  {/* High Buys Velocity Pill Banner if moving shooting fast */}
                  {isHighBuys && (
                    <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-orange-950/40 border border-orange-500/40 text-orange-300 text-[11px] flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                        HIGH BUY VELOCITY
                      </span>
                      <span>{token.buyVelocity || 82}% Buy Pressure ({token.buyCount} Buys)</span>
                    </div>
                  )}

                  {/* Mint Address Box (Tap to copy) */}
                  <div className="mt-3 bg-zinc-950/90 border border-zinc-800 rounded-xl p-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 px-1 py-0.5 bg-zinc-900 rounded">CA</span>
                      <code className="text-xs font-mono text-zinc-300 truncate">
                        {token.mint}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy(token.mint)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition shrink-0"
                      title="Copy Mint Address"
                    >
                      {copiedMint === token.mint ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Financial & Bonding Curve Stats */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-2.5">
                      <div className="text-[10px] text-zinc-500 uppercase font-medium flex items-center justify-between">
                        <span>Market Cap</span>
                        {token.priceChange15s !== undefined && token.priceChange15s !== 0 && (
                          <span className={`text-[10px] font-bold ${token.priceChange15s > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {token.priceChange15s > 0 ? '+' : ''}{token.priceChange15s.toFixed(1)}% (15s)
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-zinc-100 text-sm mt-0.5">
                        ${Math.round(token.currentMarketCapUsd).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {token.currentMarketCapSol.toFixed(2)} SOL
                      </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-2.5">
                      <div className="text-[10px] text-zinc-500 uppercase font-medium flex items-center justify-between">
                        <span>Multiplier</span>
                        {isDumped ? (
                          <span className="text-[10px] text-red-400 font-bold">DUMPED &lt;3X</span>
                        ) : token.highestMultiplier > 1 ? (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            +{((token.highestMultiplier - 1) * 100).toFixed(0)}%
                          </span>
                        ) : null}
                      </div>
                      <div className={`font-black text-sm mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-md ${
                        isDumped ? 'text-red-300 bg-red-950/50 border border-red-500/50 animate-pulse' :
                        token.highestMultiplier >= 10 ? 'text-amber-300 bg-amber-950/40 border border-amber-500/40 animate-breathe-10x' :
                        token.highestMultiplier >= 5 ? 'text-purple-300 bg-purple-950/40 border border-purple-500/40 animate-breathe-5x' :
                        token.highestMultiplier > 1 ? 'text-emerald-400' : 'text-zinc-200'
                      }`}>
                        {currentMult.toFixed(2)}x
                        {token.highestMultiplier > currentMult && (
                          <span className="text-[10px] font-normal text-zinc-400 ml-1">
                            (pk {token.highestMultiplier.toFixed(1)}x)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {token.tradeCount} trades ({token.buyCount}B/{token.sellCount}S)
                      </div>
                    </div>
                  </div>

                  {/* Bonding Curve Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                      <span>Bonding Curve (85 SOL Target)</span>
                      <span className="font-mono text-emerald-400">{bondingCurvePercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDumped
                            ? 'bg-red-500'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(3, bondingCurvePercent))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Quick Deep Links */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
                  {/* Wave simulation buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSimulateHighBuys ? onSimulateHighBuys(token.mint) : onSimulateTrade(token.mint, 1.8)}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-orange-950/50 hover:bg-orange-900/60 text-[11px] font-bold text-orange-300 border border-orange-500/30 transition flex items-center justify-center gap-1"
                      title="Trigger High Buys flurry on this coin"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>High Buys</span>
                    </button>
                    <button
                      onClick={() => onSimulateTrade(token.mint, 5.0)}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition"
                    >
                      Pump 5x
                    </button>
                    <button
                      onClick={() => onSimulateTrade(token.mint, 10.0)}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition"
                    >
                      Pump 10x
                    </button>
                    {onSimulateDump && (
                      <button
                        onClick={() => onSimulateDump(token.mint)}
                        className="py-1 px-2 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[11px] font-bold transition flex items-center gap-0.5"
                        title="Simulate dumping below 3X"
                      >
                        <TrendingDown className="w-3 h-3" />
                        <span>Dump</span>
                      </button>
                    )}
                  </div>

                  {/* Direct Web3 Sniper & DEX Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <a
                      href={`https://pump.fun/coin/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-center text-[10px] font-semibold text-emerald-300 hover:text-white transition flex items-center justify-center gap-1"
                    >
                      💊 Pump.fun
                    </a>
                    <a
                      href={`https://photon-sol.tinyastro.io/en/lp/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-center text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center justify-center gap-1"
                    >
                      🚀 Photon
                    </a>
                    <a
                      href={`https://dexscreener.com/solana/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-center text-[10px] font-semibold text-zinc-300 hover:text-white transition flex items-center justify-center gap-1"
                    >
                      📊 Dex
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

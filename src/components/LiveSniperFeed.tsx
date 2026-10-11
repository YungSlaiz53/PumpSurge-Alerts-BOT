/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Zap, 
  Flame, 
  ExternalLink, 
  Copy, 
  Check, 
  TrendingUp, 
  Clock, 
  Search, 
  ArrowUpRight, 
  Coins, 
  ShieldCheck, 
  Sparkles,
  Play,
  RotateCcw,
  RefreshCw,
  Trash2,
  Star
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
  watchlistMints?: string[];
  onToggleWatchlist?: (mint: string) => void;
}

export const LiveSniperFeed: React.FC<LiveSniperFeedProps> = ({
  tokens,
  onSimulateNewMint,
  onSimulateTrade,
  onSelectTokenForLookup,
  onClearLogsAndCache,
  onSyncRealTime,
  isSyncing,
  solUsdPrice,
  watchlistMints = [],
  onToggleWatchlist = () => {},
}) => {
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterSurgeOnly, setFilterSurgeOnly] = useState(false);

  const handleCopy = (mint: string) => {
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  const filteredTokens = tokens.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.symbol.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.mint.toLowerCase().includes(filterQuery.toLowerCase());
    
    if (filterSurgeOnly) {
      return matchesSearch && t.highestMultiplier >= 5.0;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Control Banner & Real-time Action Controls */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#101423] to-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Sub-Second Pump.fun Sniper Radar
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  REAL-TIME SYNC
                </span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Tracking Program <code className="text-emerald-400 font-mono">6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P</code> on Solana mainnet. Real-time coins, bonding curve liquidity, and 5x/10x moonshot detection.
            </p>
          </div>

          {/* Action Buttons: Sync Real-Time Coins, Clear Logs & Cache, Simulate */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onSyncRealTime}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Solana...' : 'Synchronize Pump.fun Coins'}</span>
            </button>

            <button
              onClick={onClearLogsAndCache}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 flex items-center gap-1.5 transition active:scale-95"
              title="Clear all stored logs and token cache to start fresh"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Logs &amp; Cache</span>
            </button>

            <button
              onClick={onSimulateNewMint}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Simulate Mint
            </button>

            {tokens.length > 0 && (
              <>
                <button
                  onClick={() => onSimulateTrade(tokens[0].mint, 5.2)}
                  className="px-3 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-purple-100 font-semibold text-xs border border-purple-500/40 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Flame className="w-4 h-4 text-purple-300" />
                  Pump Top to 5x
                </button>
                <button
                  onClick={() => onSimulateTrade(tokens[0].mint, 10.5)}
                  className="px-3 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-amber-100 font-semibold text-xs border border-amber-500/40 flex items-center gap-1.5 transition active:scale-95"
                >
                  <TrendingUp className="w-4 h-4 text-amber-300" />
                  Explode to 10x
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search symbol, name, or mint CA..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSurgeOnly(!filterSurgeOnly)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                filterSurgeOnly
                  ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>5x/10x Surges Only ({tokens.filter(t => t.highestMultiplier >= 5).length})</span>
            </button>
            <span className="text-zinc-500 text-xs">Showing {filteredTokens.length} of {tokens.length} tokens</span>
          </div>
        </div>
      </div>

      {/* Token Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTokens.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4 border border-zinc-700/60 shadow-inner">
              <RefreshCw className={`w-6 h-6 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <h3 className="text-base font-bold text-zinc-200">
              {tokens.length === 0 ? 'Cache Cleared • Ready for Real-Time Pump.fun Coins' : 'No tokens match your search query'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              {tokens.length === 0
                ? 'Click below to pull genuine active Pump.fun coins from Solana mainnet or start monitoring incoming blocks.'
                : 'Try adjusting your filter or search criteria to view tracked tokens.'}
            </p>
            {tokens.length === 0 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  onClick={onSyncRealTime}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Synchronizing...' : 'Synchronize Real-Time Coins'}</span>
                </button>
                <button
                  onClick={onSimulateNewMint}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-2 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulate Test Mint</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTokens.map((token) => {
            const is5x = token.highestMultiplier >= 5.0 && token.highestMultiplier < 10.0;
            const is10x = token.highestMultiplier >= 10.0;
            const elapsedSeconds = Math.max(0, Math.round((Date.now() - token.createdAt) / 1000));
            // Bonding curve graduation estimate (85 SOL target)
            const bondingCurvePercent = Math.min(100, Math.max(0, (token.volumeSol / 85.0) * 100));

            return (
              <div
                key={token.mint}
                className={`bg-zinc-900/80 border rounded-2xl p-4 flex flex-col justify-between transition hover:border-zinc-700 relative overflow-hidden group ${
                  is10x
                    ? 'border-amber-500/50 shadow-lg shadow-amber-950/20 bg-gradient-to-b from-amber-950/20 to-zinc-900'
                    : is5x
                    ? 'border-purple-500/50 shadow-lg shadow-purple-950/20 bg-gradient-to-b from-purple-950/20 to-zinc-900'
                    : 'border-zinc-800/90'
                }`}
              >
                {/* Glow pill for Moonshot / 5x with subtle breathing animation */}
                {is10x && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-zinc-950 font-black text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1 animate-breathe-10x origin-top-right z-10">
                    <Flame className="w-3 h-3 fill-zinc-950 animate-bounce" /> 10X MOONSHOT
                  </div>
                )}
                {is5x && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500 text-zinc-950 font-black text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1 animate-breathe-5x origin-top-right z-10">
                    <Zap className="w-3 h-3 fill-zinc-950" /> 5X SURGE DETECTED
                  </div>
                )}

                <div>
                  {/* Token Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-lg font-black text-emerald-400 shrink-0">
                      {token.symbol.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-16">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-zinc-100 truncate">{token.name}</h3>
                        <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                          ${token.symbol}
                        </span>
                        <button
                          onClick={() => onToggleWatchlist(token.mint)}
                          className="p-1 rounded-md text-zinc-500 hover:text-amber-400 transition"
                          title={watchlistMints.includes(token.mint) ? 'Remove from Watchlist' : 'Add to Database Watchlist'}
                        >
                          <Star className={`w-3.5 h-3.5 ${watchlistMints.includes(token.mint) ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
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

                  {/* Mint Address Box (Tap to copy) */}
                  <div className="mt-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl p-2 flex items-center justify-between gap-2">
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
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-2.5">
                      <div className="text-[10px] text-zinc-500 uppercase font-medium">Market Cap</div>
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
                        {token.highestMultiplier > 1 && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            +{( (token.highestMultiplier - 1) * 100 ).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div className={`font-black text-sm mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-md ${
                        token.highestMultiplier >= 10 ? 'text-amber-300 bg-amber-950/40 border border-amber-500/40 animate-breathe-10x' :
                        token.highestMultiplier >= 5 ? 'text-purple-300 bg-purple-950/40 border border-purple-500/40 animate-breathe-5x' :
                        token.highestMultiplier > 1 ? 'text-emerald-400' : 'text-zinc-200'
                      }`}>
                        {token.highestMultiplier.toFixed(2)}x
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
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(3, bondingCurvePercent))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Quick Sniper Deep Links */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
                  {/* Test Pump Buttons inside card */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSimulateTrade(token.mint, 1.5)}
                      className="flex-1 py-1 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 transition"
                    >
                      +50% Buy
                    </button>
                    <button
                      onClick={() => onSimulateTrade(token.mint, 5.0)}
                      className="flex-1 py-1 px-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition"
                    >
                      Trigger 5x
                    </button>
                    <button
                      onClick={() => onSimulateTrade(token.mint, 10.0)}
                      className="flex-1 py-1 px-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition"
                    >
                      Trigger 10x
                    </button>
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

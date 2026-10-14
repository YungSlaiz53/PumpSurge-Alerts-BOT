/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  Copy, 
  Check, 
  ExternalLink, 
  Flame, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  ArrowDownRight,
  Search,
  RotateCcw
} from 'lucide-react';
import { TrackedToken } from '../types';

interface DumpedCoinsListProps {
  tokens: TrackedToken[];
  onSimulateDump: () => void;
  onSimulateTrade: (mint: string, multiplierBump: number) => void;
  solUsdPrice: number;
}

export const DumpedCoinsList: React.FC<DumpedCoinsListProps> = ({
  tokens,
  onSimulateDump,
  onSimulateTrade,
  solUsdPrice,
}) => {
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (mint: string) => {
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  // Dumped coins: either explicitly flagged as isDumped or having reached peak >= 3.0x and currently < 3.0x
  const dumpedTokens = tokens.filter((t) => {
    const isDump = t.isDumped || (t.highestMultiplier >= 3.0 && (t.currentPriceSol / t.initialPriceSol) < 3.0);
    if (!isDump) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.symbol.toLowerCase().includes(q) ||
      t.mint.toLowerCase().includes(q)
    );
  });

  const totalDumped = dumpedTokens.length;
  const avgDrawdown = totalDumped > 0 
    ? Math.round(dumpedTokens.reduce((acc, t) => acc + (t.dumpDropPercent || 50), 0) / totalDumped) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Classic Hazard / Warning Header */}
      <div className="bg-gradient-to-r from-red-950/60 via-zinc-900 to-amber-950/50 border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle diagonal stripes overlay for classic warning look */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-red-500 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-950 animate-pulse">
                <AlertTriangle className="w-4 h-4 fill-zinc-950" />
                WARNING COIN DUMPING
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs font-mono font-bold border border-red-500/30">
                BELOW 3.0X THRESHOLD
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Dumped Coins Radar &amp; Liquidity Warnings
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mt-1">
              Active surveillance of Solana bonding curves that reached surge status but collapsed below the critical <strong>3.0X Multiplier</strong> baseline.
            </p>
          </div>

          {/* Quick Simulation Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSimulateDump}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition active:scale-95 border border-red-400/50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Coin Dumping (&lt; 3X)</span>
            </button>
          </div>
        </div>

        {/* Stats Pill Bar */}
        <div className="relative z-10 mt-5 pt-4 border-t border-red-500/20 flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-zinc-950/70 border border-red-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-zinc-400">Total Dumped Tracked:</span>
            <strong className="text-red-400 text-sm font-black">{totalDumped} Coins</strong>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950/70 border border-amber-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-zinc-400">Average Dump Drawdown:</span>
            <strong className="text-amber-400 text-sm font-black">-{avgDrawdown}%</strong>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950/70 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-400">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Alerts Auto-Broadcast on Drop Below 3X</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search dumped coins by name, symbol, or mint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          Displaying: <strong className="text-white">{dumpedTokens.length}</strong> Dumped Coins
        </div>
      </div>

      {/* Grid of Dumped Coin Cards */}
      {dumpedTokens.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl p-16 text-center text-zinc-500">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-40 text-red-400" />
          <h3 className="text-base font-bold text-zinc-200 mb-1">No Coins Currently Dumping Below 3X</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5">
            Bonding curves are holding above 3X or still climbing. Click below to simulate a live dumping event and verify the warning broadcast.
          </p>
          <button
            onClick={onSimulateDump}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Coin Dumping (&lt; 3X)</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dumpedTokens.map((token) => {
            const currentMult = (token.currentPriceSol / token.initialPriceSol);
            const peakMult = token.dumpPeakMultiplier || token.highestMultiplier || 4.2;
            const dropPct = token.dumpDropPercent || Math.max(25, Math.round(((peakMult - currentMult) / peakMult) * 100));

            return (
              <div
                key={token.mint}
                className="bg-black border border-red-500/50 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-red-400 transition group"
              >
                {/* Classic Warning Banner at top of card */}
                <div className="absolute top-0 left-0 right-0 py-1 px-3 bg-red-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center justify-between shadow">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 fill-white animate-bounce" />
                    WARNING COIN DUMPING
                  </span>
                  <span className="font-mono text-[9px] bg-red-950/80 px-1.5 py-0.2 rounded">
                    &lt; 3.0X THRESHOLD
                  </span>
                </div>

                <div className="pt-4">
                  {/* Token Details */}
                  <div className="flex items-start gap-3 mt-1">
                    <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-lg font-black text-red-400 shrink-0">
                      {token.symbol.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white truncate">{token.name}</h3>
                        <span className="text-xs font-mono font-bold text-red-400">
                          ${token.symbol}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>Dumped {token.dumpTimestamp ? new Date(token.dumpTimestamp).toLocaleTimeString() : 'Recently'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mint CA Box */}
                  <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-xl p-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 px-1 py-0.5 bg-zinc-900 rounded">CA</span>
                    <code className="text-xs font-mono text-zinc-300 truncate">
                      {token.mint}
                    </code>
                    <button
                      onClick={() => handleCopy(token.mint)}
                      className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition shrink-0"
                      title="Copy Address"
                    >
                      {copiedMint === token.mint ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Comparison Stats: Peak vs Current vs Drawdown */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">Peak High</div>
                      <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                        {peakMult.toFixed(1)}x
                      </div>
                    </div>

                    <div className="bg-zinc-950/80 border border-red-500/40 rounded-xl p-2 bg-red-950/10">
                      <div className="text-[10px] text-red-400 uppercase font-bold">Current</div>
                      <div className="text-sm font-mono font-black text-red-400 mt-0.5">
                        {currentMult.toFixed(2)}x
                      </div>
                    </div>

                    <div className="bg-zinc-950/80 border border-amber-500/30 rounded-xl p-2 bg-amber-950/10">
                      <div className="text-[10px] text-amber-400 uppercase font-bold">Dump Drop</div>
                      <div className="text-sm font-mono font-black text-amber-400 mt-0.5 flex items-center justify-center gap-0.5">
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                        -{dropPct}%
                      </div>
                    </div>
                  </div>

                  {/* Market Cap & Liquidity */}
                  <div className="mt-3 flex items-center justify-between text-xs font-mono text-zinc-400 bg-zinc-950/40 p-2 rounded-xl">
                    <span>Market Cap: <strong className="text-white">${Math.round(token.currentMarketCapUsd).toLocaleString()}</strong></span>
                    <span>Sells: <strong className="text-red-400">{token.sellCount}</strong> / Buys: <strong className="text-emerald-400">{token.buyCount}</strong></span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2">
                  <button
                    onClick={() => onSimulateTrade(token.mint, 5.2)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition flex items-center justify-center gap-1"
                    title="Simulate recovery pump back to 5x"
                  >
                    <Flame className="w-3 h-3 text-purple-400" />
                    <span>Re-Pump to 5x</span>
                  </button>

                  <a
                    href={`https://pump.fun/coin/${token.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-[11px] font-semibold transition flex items-center gap-1"
                  >
                    <span>Pump.fun</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={`https://dexscreener.com/solana/${token.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-[11px] font-semibold transition flex items-center gap-1"
                  >
                    <span>Dex</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

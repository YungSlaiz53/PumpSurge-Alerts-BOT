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
  RotateCcw
} from 'lucide-react';
import { TrackedToken } from '../types';

interface LiveSniperFeedProps {
  tokens: TrackedToken[];
  onSimulateNewMint: () => void;
  onSimulateTrade: (mint: string, multiplierBump: number) => void;
  onSelectTokenForLookup: (mint: string) => void;
  solUsdPrice: number;
}

export const LiveSniperFeed: React.FC<LiveSniperFeedProps> = ({
  tokens,
  onSimulateNewMint,
  onSimulateTrade,
  onSelectTokenForLookup,
  solUsdPrice,
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
      {/* Control Banner & Quick Simulation Tools */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#101423] to-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-zinc-100">Sub-Second Pump.fun Sniper Radar</h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Listening to <code className="text-emerald-400 font-mono">6EF8...eF6P</code> instruction logs. When a new mint occurs, it is captured in under 500ms and tracked for 5x / 10x surges.
            </p>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onSimulateNewMint}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Simulate New Mint
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
          <div className="col-span-full py-16 text-center bg-zinc-900/40 border border-zinc-800/60 rounded-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">Listening to Pump.fun Solana Blocks...</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              No new tokens match your criteria yet. Click "Simulate New Mint" above or wait for live Solana mainnet blocks.
            </p>
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
                {/* Glow pill for Moonshot / 5x */}
                {is10x && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-zinc-950 font-black text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-zinc-950" /> 10X MOONSHOT
                  </div>
                )}
                {is5x && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500 text-zinc-950 font-black text-[10px] rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
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
                      <div className={`font-black text-sm mt-0.5 ${
                        token.highestMultiplier >= 10 ? 'text-amber-400' :
                        token.highestMultiplier >= 5 ? 'text-purple-400' :
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

                  {/* Multi-DEX Affiliate Sniper Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <a
                      href={`https://t.me/solana_trojanbot?start=r-alphasniper_${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-center text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center justify-center gap-1"
                    >
                      ⚡ Trojan
                    </a>
                    <a
                      href={`https://photon-sol.tinyastro.io/en/lp/${token.mint}?handle=alphasniper`}
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

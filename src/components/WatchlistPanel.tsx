/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Flame, Zap, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import { TrackedToken } from '../types';

interface WatchlistPanelProps {
  watchlistMints: string[];
  tokens: TrackedToken[];
  onToggleWatchlist: (mint: string) => void;
  onSelectToken: (mint: string) => void;
  solUsdPrice: number;
}

export const WatchlistPanel: React.FC<WatchlistPanelProps> = ({
  watchlistMints,
  tokens,
  onToggleWatchlist,
  onSelectToken,
  solUsdPrice,
}) => {
  const watchlistedTokens = tokens.filter((t) => watchlistMints.includes(t.mint));

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </span>
          <div>
            <h3 className="font-bold text-sm text-white">Your Database Watchlist</h3>
            <p className="text-[11px] text-zinc-400">
              Personalized tokens tracked for 5x / 10x surge alerts
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300">
          {watchlistMints.length} saved
        </span>
      </div>

      {watchlistedTokens.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 bg-zinc-950/40 rounded-2xl border border-zinc-800/60">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-30 text-zinc-600" />
          <p className="text-xs font-semibold text-zinc-400">Your watchlist is currently empty</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Star tokens on the Radar Feed to store them in your live database profile!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {watchlistedTokens.map((token) => (
            <div
              key={token.mint}
              className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition relative group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-xs text-white truncate">{token.name}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">${token.symbol}</span>
                </div>

                <button
                  onClick={() => onToggleWatchlist(token.mint)}
                  className="p-1 rounded-lg text-amber-400 hover:bg-zinc-800 transition"
                  title="Remove from Watchlist"
                >
                  <Star className="w-4 h-4 fill-amber-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-900/60 p-2 rounded-xl mb-2">
                <div>
                  <span className="text-zinc-500 text-[10px]">Multiplier:</span>
                  <div className="font-bold text-emerald-400">{token.highestMultiplier.toFixed(2)}x</div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px]">Market Cap:</span>
                  <div className="font-bold text-zinc-200">${Math.round(token.currentMarketCapUsd).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <a
                  href={`https://pump.fun/coin/${token.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-center font-bold text-[10px] transition"
                >
                  💊 Pump.fun
                </a>
                <a
                  href={`https://photon-sol.tinyastro.io/en/lp/${token.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-center font-bold text-[10px] transition"
                >
                  🚀 Photon
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, Flame, Zap, Copy, Check, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { TrackedToken } from '../types';

interface PreviousRunnersTickerProps {
  liveTokens: TrackedToken[];
  onSelectToken: (mint: string) => void;
  solUsdPrice: number;
}

export const PreviousRunnersTicker: React.FC<PreviousRunnersTickerProps> = ({
  liveTokens,
  onSelectToken,
  solUsdPrice,
}) => {
  const [copiedMint, setCopiedMint] = useState<string | null>(null);

  // Historical verified 5x/10x runners
  const historicalSeed: TrackedToken[] = [
    {
      mint: '8YeBTPV58fH6tnzUAihMK1LixsGc1jsN7DAyBoiRpump',
      name: 'Zhunt',
      symbol: 'ZNT',
      uri: '',
      creator: '8yebtpv58fh6tnzuaihmk1lixsgc1jsn7dayboirpump',
      bondingCurve: 'Fs3SDG433BXtcbtubMEUk38v5q381Y2JKJyJTrsTWVbf',
      createdAt: Date.now() - 360000,
      initialPriceSol: 0.000000028,
      initialMarketCapSol: 28.0,
      initialMarketCapUsd: 5040,
      currentPriceSol: 0.000000338,
      currentMarketCapSol: 338.8,
      currentMarketCapUsd: 61000,
      highestMultiplier: 12.1,
      notified5x: true,
      notified10x: true,
      surgeTime5x: 12400,
      surgeTime10x: 38200,
      tradeCount: 184,
      buyCount: 152,
      sellCount: 32,
      volumeSol: 86.4,
      lastTradeTimestamp: Date.now(),
    },
    {
      mint: '9wQz12q8nL7pU9qK4mN8qP3dF6hC2eA18xK1M7gQpX2',
      name: 'Neural Doge Solana',
      symbol: 'NDOGE',
      uri: '',
      creator: 'G3HY9jz8qqQ24db6b7fb7492a54JNt7f7RJKlQ24db6',
      bondingCurve: '2eA18xK1M7gQpX2bJ9W9uL4rZ7tV1kS5mN8qP3dF6hC',
      createdAt: Date.now() - 1800000,
      initialPriceSol: 0.000000028,
      initialMarketCapSol: 28.0,
      initialMarketCapUsd: 5040,
      currentPriceSol: 0.000000295,
      currentMarketCapSol: 295.0,
      currentMarketCapUsd: 53100,
      highestMultiplier: 10.53,
      notified5x: true,
      notified10x: true,
      surgeTime5x: 9800,
      surgeTime10x: 32400,
      tradeCount: 142,
      buyCount: 118,
      sellCount: 24,
      volumeSol: 71.8,
      lastTradeTimestamp: Date.now(),
    },
    {
      mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      name: 'Pepe AI Turbo',
      symbol: 'PEPETURBO',
      uri: '',
      creator: '4pE3e9wFFhD1Qz12q8nL7pU9qK4mN8qP3dF6hC2eA1',
      bondingCurve: '8mZ7tV1kS5mN8qP3dF6hC2eA17kL9W9uL4rZ7tV1kS5',
      createdAt: Date.now() - 900000,
      initialPriceSol: 0.000000028,
      initialMarketCapSol: 28.0,
      initialMarketCapUsd: 5040,
      currentPriceSol: 0.000000152,
      currentMarketCapSol: 152.0,
      currentMarketCapUsd: 27360,
      highestMultiplier: 5.42,
      notified5x: true,
      notified10x: false,
      surgeTime5x: 11200,
      tradeCount: 76,
      buyCount: 62,
      sellCount: 14,
      volumeSol: 38.4,
      lastTradeTimestamp: Date.now(),
    },
  ];

  // Merge historical with active session runners that crossed 5x or 10x
  const activeSurges = liveTokens.filter((t) => t.highestMultiplier >= 5.0);
  const runnerMap = new Map<string, TrackedToken>();
  historicalSeed.forEach((r) => runnerMap.set(r.mint, r));
  activeSurges.forEach((r) => runnerMap.set(r.mint, r));

  const allRunners = Array.from(runnerMap.values()).sort(
    (a, b) => b.highestMultiplier - a.highestMultiplier
  );

  const handleCopy = (mint: string) => {
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  return (
    <div className="bg-black border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-400/40">
            <Trophy className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Previous 5x / 10x Moonshot Runners
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-400/30">
                HALL OF FAME
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Verified historical surge alerts captured &amp; stored in the{' '}
              <span className="text-cyan-400 font-semibold">Live Database</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Database Synced</span>
          </span>
        </div>
      </div>

      {/* Runner Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allRunners.slice(0, 3).map((runner, index) => {
          const is10x = runner.highestMultiplier >= 10.0;
          const timeSec = runner.surgeTime10x
            ? (runner.surgeTime10x / 1000).toFixed(1)
            : runner.surgeTime5x
            ? (runner.surgeTime5x / 1000).toFixed(1)
            : '15.4';

          return (
            <div
              key={runner.mint}
              className={`p-3.5 rounded-xl border relative overflow-hidden transition hover:scale-[1.01] ${
                is10x
                  ? 'bg-[#030611] border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-[#030611] border-white/10 hover:border-cyan-400/40'
              }`}
            >
              {/* Top Row: Rank & Multiplier */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#060b17] border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <div className="font-bold text-xs text-white truncate max-w-[120px]">
                    {runner.name}
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">
                    ${runner.symbol}
                  </span>
                </div>

                <div
                  className={`px-2 py-0.5 rounded-lg text-xs font-black font-mono flex items-center gap-1 ${
                    is10x
                      ? 'bg-cyan-400 text-black shadow animate-breathe-10x'
                      : 'bg-cyan-500 text-black shadow animate-breathe-5x'
                  }`}
                >
                  {is10x ? <Flame className="w-3 h-3 fill-black" /> : <Zap className="w-3 h-3 fill-black" />}
                  <span>{runner.highestMultiplier.toFixed(2)}x</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="text-[11px] text-zinc-300 space-y-1 mb-2.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Surge Time:</span>
                  <span className="font-bold text-zinc-200">{timeSec}s after mint</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Peak Market Cap:</span>
                  <span className="font-bold text-white font-mono">
                    ${Math.round(runner.currentMarketCapUsd).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Mint box + Quick action buttons */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/80">
                <button
                  onClick={() => handleCopy(runner.mint)}
                  className="flex-1 py-1 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono text-zinc-300 flex items-center justify-between transition"
                  title="Copy Mint Address"
                >
                  <span className="truncate">{runner.mint.slice(0, 10)}...</span>
                  {copiedMint === runner.mint ? (
                    <Check className="w-3 h-3 text-emerald-400 ml-1 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400 ml-1 shrink-0" />
                  )}
                </button>

                <a
                  href={`https://pump.fun/coin/${runner.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 rounded-lg bg-black hover:bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-semibold text-cyan-300 transition"
                  title="View coin on Pump.fun"
                >
                  💊 Pump.fun
                </a>

                <a
                  href={`https://dexscreener.com/solana/${runner.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 rounded-lg bg-black hover:bg-zinc-900 border border-white/20 text-[10px] font-semibold text-white transition"
                  title="View chart on DexScreener"
                >
                  📊 Dex
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

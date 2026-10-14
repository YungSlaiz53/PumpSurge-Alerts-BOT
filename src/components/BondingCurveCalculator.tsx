/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calculator, ArrowRight, Zap, Flame, ShieldAlert, Award, TrendingUp } from 'lucide-react';

interface BondingCurveCalculatorProps {
  solUsdPrice: number;
}

export const BondingCurveCalculator: React.FC<BondingCurveCalculatorProps> = ({
  solUsdPrice,
}) => {
  // Input: Real SOL deposited into the bonding curve (0 to 85 SOL)
  const [realSolDeposited, setRealSolDeposited] = useState<number>(12.5);

  // Pump.fun Constants
  const initialVirtualSol = 30.0; // 30 SOL
  const initialVirtualTokens = 1073000000; // 1.073 Billion
  const totalSupply = 1000000000; // 1 Billion tokens
  const raydiumTargetSol = 85.0; // ~85 SOL for graduation

  // Constant product k = virtualSol * virtualTokens
  const k = initialVirtualSol * initialVirtualTokens;

  // Current virtual SOL = initialVirtualSol + realSolDeposited
  const currentVirtualSol = initialVirtualSol + realSolDeposited;

  // Current virtual tokens = k / currentVirtualSol
  const currentVirtualTokens = k / currentVirtualSol;

  // Real tokens remaining in curve = currentVirtualTokens - (initialVirtualTokens - 800,000,000)
  const tokensSold = initialVirtualTokens - currentVirtualTokens;

  // Initial Price (SOL per token)
  const initialPriceSol = initialVirtualSol / initialVirtualTokens;
  const initialMarketCapSol = initialPriceSol * totalSupply;
  const initialMarketCapUsd = initialMarketCapSol * solUsdPrice;

  // Current Price (SOL per token)
  const currentPriceSol = currentVirtualSol / currentVirtualTokens;
  const currentMarketCapSol = currentPriceSol * totalSupply;
  const currentMarketCapUsd = currentMarketCapSol * solUsdPrice;

  // Price Multiplier
  const multiplier = currentPriceSol / initialPriceSol;

  // Graduation Progress %
  const progressPercent = Math.min(100, Math.max(0, (realSolDeposited / raydiumTargetSol) * 100));

  return (
    <div className="space-y-6">
      {/* Overview Banner - Neon Blue and Black */}
      <div className="bg-black border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-400/40">
              <Calculator className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">Pump.fun Bonding Curve Math Engine</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Pump.fun utilizes a constant product AMM formula (<code className="text-cyan-400 font-mono">k = x · y</code>) with <b>30 SOL virtual liquidity</b> and <b>1.073B virtual tokens</b>. When real liquidity reaches <b>~85 SOL ($69k MC)</b>, the curve completes and migrates to Raydium.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#030611] border border-cyan-500/30 text-xs font-mono text-zinc-300">
          SOL Price: <strong className="text-cyan-400">${solUsdPrice.toFixed(0)} USD</strong>
        </div>
      </div>

      {/* Interactive Slider & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-black border border-cyan-500/30 rounded-2xl p-5 space-y-6 lg:col-span-1 shadow-[0_0_15px_rgba(0,240,255,0.06)]">
          <div>
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between mb-2">
              <span>Real SOL Deposited:</span>
              <span className="text-cyan-400 font-mono text-sm font-bold">
                {realSolDeposited.toFixed(1)} SOL
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="85"
              step="0.5"
              value={realSolDeposited}
              onChange={(e) => setRealSolDeposited(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-[#030611] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
              <span>0 SOL (Launch)</span>
              <span>42.5 SOL (50%)</span>
              <span>85 SOL (Graduation)</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="text-xs text-zinc-400 font-medium">Quick Presets:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setRealSolDeposited(0)}
                className="py-1.5 px-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-[11px] transition"
              >
                0 SOL (1.0x Launch)
              </button>
              <button
                onClick={() => setRealSolDeposited(8.2)}
                className="py-1.5 px-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-[11px] transition"
              >
                8.2 SOL (~1.5x)
              </button>
              <button
                onClick={() => setRealSolDeposited(37.1)}
                className="py-1.5 px-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-mono text-[11px] font-bold transition"
              >
                37.1 SOL (🚀 5.0x)
              </button>
              <button
                onClick={() => setRealSolDeposited(64.8)}
                className="py-1.5 px-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold transition"
              >
                64.8 SOL (💥 10.0x)
              </button>
              <button
                onClick={() => setRealSolDeposited(85.0)}
                className="col-span-2 py-1.5 px-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold transition"
              >
                🎓 85.0 SOL (Raydium Migration)
              </button>
            </div>
          </div>

          {/* Constant Parameters Info */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 space-y-2 text-[11px]">
            <div className="font-semibold text-zinc-300 flex items-center gap-1.5 text-xs">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Bonding Curve Constants
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Virtual SOL ($x$):</span>
              <span className="font-mono text-zinc-200">30.0 SOL</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Virtual Tokens ($y$):</span>
              <span className="font-mono text-zinc-200">1,073,000,000</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Constant Product ($k$):</span>
              <span className="font-mono text-zinc-200">32.19B SOL·Tokens</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Total Supply:</span>
              <span className="font-mono text-zinc-200">1,000,000,000</span>
            </div>
          </div>
        </div>

        {/* Results & Calculations Column */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-5 lg:col-span-2">
          {/* Multiplier Badge & Primary Metric */}
          <div className="bg-gradient-to-r from-zinc-950 via-[#101423] to-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-400 font-medium">Calculated Multiplier</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-black font-mono ${
                  multiplier >= 10 ? 'text-amber-400' :
                  multiplier >= 5 ? 'text-purple-400' :
                  multiplier > 1.2 ? 'text-emerald-400' : 'text-zinc-100'
                }`}>
                  {multiplier.toFixed(2)}x
                </span>
                <span className="text-xs text-zinc-500">vs initial listing price</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 font-medium">Current Market Cap</span>
              <div className="text-2xl font-bold text-white mt-1 font-mono">
                ${Math.round(currentMarketCapUsd).toLocaleString()}
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                {currentMarketCapSol.toFixed(2)} SOL
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] text-zinc-500 uppercase font-medium">Virtual SOL Reserves</span>
              <div className="text-base font-bold text-zinc-100 font-mono">
                {currentVirtualSol.toFixed(2)} SOL
              </div>
              <p className="text-[11px] text-zinc-400">
                (30.0 SOL Initial + {realSolDeposited.toFixed(1)} Real SOL)
              </p>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] text-zinc-500 uppercase font-medium">Tokens Circulating / Sold</span>
              <div className="text-base font-bold text-zinc-100 font-mono">
                {Math.round(tokensSold).toLocaleString()} tokens
              </div>
              <p className="text-[11px] text-zinc-400">
                {((tokensSold / 800000000) * 100).toFixed(1)}% of 800M curve allocation
              </p>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] text-zinc-500 uppercase font-medium">Spot Token Price</span>
              <div className="text-base font-bold text-emerald-400 font-mono truncate">
                {currentPriceSol.toFixed(11)} SOL
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                ${(currentPriceSol * solUsdPrice).toFixed(8)} USD
              </p>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] text-zinc-500 uppercase font-medium">Raydium Migration Status</span>
              <div className="text-base font-bold text-cyan-400 font-mono">
                {progressPercent >= 100 ? 'GRADUATED 🎓' : `${progressPercent.toFixed(1)}% Complete`}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {(raydiumTargetSol - realSolDeposited).toFixed(1)} SOL needed for Raydium LP
              </p>
            </div>
          </div>

          {/* Migration Progress Bar */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4">
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
              <span className="font-semibold text-zinc-300">Bonding Curve Progress towards Raydium</span>
              <span className="font-mono text-emerald-400 font-bold">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(1, progressPercent))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1.5">
              <span>Initial $4.5k Market Cap</span>
              <span>$69k Graduation Threshold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

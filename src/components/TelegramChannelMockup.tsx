/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Flame, 
  Zap, 
  ShieldAlert, 
  Info,
  CornerDownRight,
  TrendingUp,
  Share2
} from 'lucide-react';
import { TrackedToken } from '../types';

interface TelegramChannelMockupProps {
  tokens: TrackedToken[];
  channelName: string;
  affiliateRefs: {
    trojan: string;
    bonkbot: string;
    maestro: string;
    bullx: string;
  };
  solUsdPrice: number;
}

export const TelegramChannelMockup: React.FC<TelegramChannelMockupProps> = ({
  tokens,
  channelName,
  affiliateRefs,
  solUsdPrice,
}) => {
  const [copiedMint, setCopiedMint] = useState<string | null>(null);

  const handleCopy = (mint: string) => {
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  const sampleToken: TrackedToken = tokens[0] || {
    mint: '8xK1M7gQpX2bJ9W9uL4rZ7tV1kS5mN8qP3dF6hC2eA1',
    name: 'Solana Doge Alpha',
    symbol: 'SDOGE',
    uri: 'https://ipfs.io/ipfs/sample',
    creator: '9wFFhD1Qz12q8nL7pU9qK4mN8qP3dF6hC2eA1',
    bondingCurve: '7kL9W9uL4rZ7tV1kS5mN8qP3dF6hC2eA1',
    createdAt: Date.now() - 42000,
    initialPriceSol: 0.000000028,
    initialMarketCapSol: 28.0,
    currentPriceSol: 0.000000145,
    currentMarketCapSol: 145.0,
    currentMarketCapUsd: 145.0 * solUsdPrice,
    highestMultiplier: 5.18,
    notified5x: true,
    notified10x: false,
    surgeTime5x: 18400,
    tradeCount: 46,
    buyCount: 38,
    sellCount: 8,
    volumeSol: 34.2,
    lastTradeTimestamp: Date.now(),
  };

  const initialMcapUsd = Math.round(sampleToken.initialMarketCapSol * solUsdPrice);

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Send className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-zinc-100">Telegram Channel Broadcast Simulator</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time visual preview of Step A (instant new listing broadcast) and Step B (5x/10x surge reply notification) as received by users in Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono">
            Channel: <strong className="text-emerald-400">{channelName}</strong>
          </span>
        </div>
      </div>

      {/* Telegram App Container Preview */}
      <div className="max-w-3xl mx-auto bg-[#17212b] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden font-sans">
        {/* Telegram Channel Header */}
        <div className="bg-[#242f3d] px-5 py-3.5 border-b border-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-black text-lg shadow">
              ⚡
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                PumpSurge Alerts
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-medium">Channel</span>
              </div>
              <div className="text-[11px] text-[#7f91a4]">
                14,289 subscribers • Sub-second Pump.fun alerts • @PumpSurgeAlerts
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://t.me/PumpSurgeAlerts"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#64b5f6] hover:underline font-semibold flex items-center gap-1 bg-[#2b3a4a] px-3 py-1 rounded-lg"
            >
              Join @PumpSurgeAlerts
            </a>
          </div>
        </div>

        {/* Telegram Feed Messages Area */}
        <div className="p-4 md:p-6 space-y-6 bg-[#0e1621] min-h-[500px]">
          {/* Step A Message Card */}
          <div className="max-w-xl bg-[#182533] border border-[#2b3a4a] rounded-2xl p-4 shadow-md text-zinc-200 text-xs leading-relaxed space-y-3 relative group">
            <div className="flex items-center justify-between border-b border-[#2b3a4a] pb-2 text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                🟢 NEW PUMP.FUN TOKEN DETECTED
              </span>
              <span className="text-[10px] text-[#7f91a4] font-normal">14:42:01</span>
            </div>

            <div>
              <div className="text-sm font-bold text-white">
                🏷️ {sampleToken.name} (<span className="text-emerald-400 font-mono">${sampleToken.symbol}</span>)
              </div>
              <div className="text-[11px] text-[#7f91a4] mt-0.5">
                Dev: <code className="text-[#a4b5c7]">{sampleToken.creator.slice(0, 4)}...{sampleToken.creator.slice(-4)}</code>
              </div>
            </div>

            {/* Tap to copy code box */}
            <div>
              <div className="text-[11px] text-[#7f91a4] mb-1 font-medium">📋 Mint CA: (tap to copy)</div>
              <div
                onClick={() => handleCopy(sampleToken.mint)}
                className="bg-[#0e1621] border border-[#2c3d52] rounded-xl p-2.5 font-mono text-xs text-[#82b1ff] flex items-center justify-between cursor-pointer hover:bg-[#131f2f] transition"
              >
                <span className="truncate mr-2">{sampleToken.mint}</span>
                <span className="p-1 rounded bg-[#182533] shrink-0 text-[#7f91a4]">
                  {copiedMint === sampleToken.mint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </span>
              </div>
            </div>

            {/* Financial metadata */}
            <div className="grid grid-cols-2 gap-2 bg-[#121c27] p-2.5 rounded-xl text-[11px]">
              <div>
                <span className="text-[#7f91a4]">💰 Initial Market Cap:</span>
                <div className="font-bold text-white mt-0.5">${initialMcapUsd.toLocaleString()} ({sampleToken.initialMarketCapSol.toFixed(1)} SOL)</div>
              </div>
              <div>
                <span className="text-[#7f91a4]">💧 Virtual Liquidity:</span>
                <div className="font-bold text-white mt-0.5">30.0 SOL ($5,400)</div>
              </div>
            </div>

            <div className="text-[10px] text-[#7f91a4] italic">
              ⚡ Instant snipers with automated MEV protection:
            </div>

            {/* Inline Buttons with Affiliate Links */}
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-2 gap-1.5">
                <a
                  href={`https://t.me/solana_trojanbot?start=r-${affiliateRefs.trojan}_${sampleToken.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#2b3a4a] hover:bg-[#344659] text-[#64b5f6] text-center font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 text-[11px]"
                >
                  ⚡ Trojan Sniper
                </a>
                <a
                  href={`https://t.me/bonkbot_bot?start=ref_${affiliateRefs.bonkbot}_ca_${sampleToken.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#2b3a4a] hover:bg-[#344659] text-[#64b5f6] text-center font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 text-[11px]"
                >
                  🤖 BonkBot
                </a>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <a
                  href={`https://photon-sol.tinyastro.io/en/lp/${sampleToken.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#2b3a4a] hover:bg-[#344659] text-[#64b5f6] text-center font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 text-[11px]"
                >
                  🚀 Photon Web
                </a>
                <a
                  href={`https://bullx.io/terminal?address=${sampleToken.mint}&r=${affiliateRefs.bullx}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#2b3a4a] hover:bg-[#344659] text-[#64b5f6] text-center font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 text-[11px]"
                >
                  🐂 BullX / Maestro
                </a>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <a
                  href={`https://dexscreener.com/solana/${sampleToken.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#242f3d] hover:bg-[#2c3d50] text-[#a4b5c7] text-center font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 text-[11px]"
                >
                  📊 DexScreener
                </a>
                <a
                  href={`https://pump.fun/${sampleToken.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#242f3d] hover:bg-[#2c3d50] text-[#a4b5c7] text-center font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 text-[11px]"
                >
                  💊 Pump.fun
                </a>
              </div>
            </div>
          </div>

          {/* Step B Message Card (Reply to Step A) */}
          <div className="max-w-xl ml-4 sm:ml-8 bg-[#1f2338] border border-purple-500/40 rounded-2xl p-4 shadow-xl text-zinc-200 text-xs leading-relaxed space-y-3 relative">
            {/* Thread line visual */}
            <div className="flex items-center gap-2 border-b border-purple-500/30 pb-2 text-purple-300 font-bold">
              <CornerDownRight className="w-4 h-4 text-purple-400 shrink-0" />
              <span>🚀🚀 5X MULTIPLIER DETECTED! (Reply to Alert)</span>
              <span className="text-[10px] text-[#7f91a4] font-normal ml-auto">14:42:19</span>
            </div>

            {/* Quoted preview of original alert */}
            <div className="bg-[#141727] border-l-2 border-emerald-400 pl-2.5 py-1 text-[10px] text-[#7f91a4] rounded-r">
              <span className="font-bold text-white">{sampleToken.name}</span> (${sampleToken.symbol}) • CA: {sampleToken.mint.slice(0, 8)}...
            </div>

            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                🔥 {sampleToken.name} (${sampleToken.symbol})
              </div>
              <div className="text-purple-300 font-bold mt-1">
                ⚡ Surged to <b>{sampleToken.highestMultiplier.toFixed(1)}x</b> in only <b>{((sampleToken.surgeTime5x || 18400) / 1000).toFixed(1)}s</b>!
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#141727] p-2.5 rounded-xl space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#7f91a4]">💰 Current Market Cap:</span>
                <span className="font-bold text-white">${Math.round(sampleToken.currentMarketCapUsd).toLocaleString()} ({sampleToken.currentMarketCapSol.toFixed(2)} SOL)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7f91a4]">📊 Trades Velocity:</span>
                <span className="font-semibold text-emerald-400">{sampleToken.tradeCount} trades ({sampleToken.buyCount} Buys / {sampleToken.sellCount} Sells)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7f91a4]">🌊 Volume:</span>
                <span className="font-mono text-zinc-300">{sampleToken.volumeSol.toFixed(2)} SOL</span>
              </div>
            </div>

            <div className="text-[10px] text-amber-300/80 font-medium italic">
              ⚠️ High momentum volume detected on bonding curve! Quick trade below:
            </div>

            {/* Quick Trading Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <a
                href={`https://t.me/solana_trojanbot?start=r-${affiliateRefs.trojan}_${sampleToken.mint}`}
                target="_blank"
                rel="noreferrer"
                className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-center font-bold py-2 px-3 rounded-xl transition text-[11px]"
              >
                ⚡ Trojan Sniper
              </a>
              <a
                href={`https://photon-sol.tinyastro.io/en/lp/${sampleToken.mint}`}
                target="_blank"
                rel="noreferrer"
                className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-center font-bold py-2 px-3 rounded-xl transition text-[11px]"
              >
                🚀 Photon Web
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

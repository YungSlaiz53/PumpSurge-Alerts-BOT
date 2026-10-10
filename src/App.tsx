/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LiveSniperFeed } from './components/LiveSniperFeed';
import { TelegramChannelMockup } from './components/TelegramChannelMockup';
import { TelegramDMSimulator } from './components/TelegramDMSimulator';
import { BondingCurveCalculator } from './components/BondingCurveCalculator';
import { CodeExplorer } from './components/CodeExplorer';
import { DeploymentDocs } from './components/DeploymentDocs';
import { TrackedToken } from './types';

// Initial realistic sample tokens for simulation
const INITIAL_SAMPLE_TOKENS: TrackedToken[] = [
  {
    mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    name: 'Pepe AI Turbo',
    symbol: 'PEPETURBO',
    uri: 'https://ipfs.io/ipfs/QmSample1',
    creator: '4pE3e9wFFhD1Qz12q8nL7pU9qK4mN8qP3dF6hC2eA1',
    bondingCurve: '8mZ7tV1kS5mN8qP3dF6hC2eA17kL9W9uL4rZ7tV1kS5',
    createdAt: Date.now() - 14000,
    initialPriceSol: 0.000000028,
    initialMarketCapSol: 28.0,
    currentPriceSol: 0.000000152,
    currentMarketCapSol: 152.0,
    currentMarketCapUsd: 152.0 * 180.0,
    highestMultiplier: 5.42,
    notified5x: true,
    notified10x: false,
    surgeTime5x: 11200,
    tradeCount: 64,
    buyCount: 52,
    sellCount: 12,
    volumeSol: 38.4,
    channelMessageId: 1042,
    lastTradeTimestamp: Date.now(),
  },
  {
    mint: '9wQz12q8nL7pU9qK4mN8qP3dF6hC2eA18xK1M7gQpX2',
    name: 'Neural Doge Solana',
    symbol: 'NDOGE',
    uri: 'https://ipfs.io/ipfs/QmSample2',
    creator: 'G3HY9jz8qqQ24db6b7fb7492a54JNt7f7RJKlQ24db6',
    bondingCurve: '2eA18xK1M7gQpX2bJ9W9uL4rZ7tV1kS5mN8qP3dF6hC',
    createdAt: Date.now() - 48000,
    initialPriceSol: 0.000000028,
    initialMarketCapSol: 28.0,
    currentPriceSol: 0.000000295,
    currentMarketCapSol: 295.0,
    currentMarketCapUsd: 295.0 * 180.0,
    highestMultiplier: 10.53,
    notified5x: true,
    notified10x: true,
    surgeTime5x: 9800,
    surgeTime10x: 32400,
    tradeCount: 142,
    buyCount: 118,
    sellCount: 24,
    volumeSol: 71.8,
    channelMessageId: 1038,
    lastTradeTimestamp: Date.now(),
  },
  {
    mint: '3dF6hC2eA18xK1M7gQpX2bJ9W9uL4rZ7tV1kS5mN8qP',
    name: 'Quantum Cat',
    symbol: 'QCAT',
    uri: 'https://ipfs.io/ipfs/QmSample3',
    creator: '7pU9qK4mN8qP3dF6hC2eA18xK1M7gQpX2bJ9W9uL4',
    bondingCurve: '5mN8qP3dF6hC2eA18xK1M7gQpX2bJ9W9uL4rZ7tV1k',
    createdAt: Date.now() - 8000,
    initialPriceSol: 0.000000028,
    initialMarketCapSol: 28.0,
    currentPriceSol: 0.000000034,
    currentMarketCapSol: 34.0,
    currentMarketCapUsd: 34.0 * 180.0,
    highestMultiplier: 1.21,
    notified5x: false,
    notified10x: false,
    tradeCount: 11,
    buyCount: 9,
    sellCount: 2,
    volumeSol: 4.8,
    channelMessageId: 1045,
    lastTradeTimestamp: Date.now(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [isLiveWs, setIsLiveWs] = useState(true);
  const [latencyMs, setLatencyMs] = useState(138);
  const [blockSlot, setBlockSlot] = useState(314892140);
  const [tokens, setTokens] = useState<TrackedToken[]>(INITIAL_SAMPLE_TOKENS);
  const [alertsCount, setAlertsCount] = useState(48);
  const solUsdPrice = 180.0;

  // Simulate Solana block slot progression and small latency fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockSlot((prev) => prev + 1);
      setLatencyMs((prev) => Math.max(85, Math.min(220, prev + Math.floor((Math.random() - 0.5) * 12))));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Handler to simulate an instant new Pump.fun mint event
  const handleSimulateNewMint = () => {
    const randomHex = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    const names = ['Solana Frog', 'Based Grok', 'Moon Whales', 'Hyper Velocity', 'Cyber Doge', 'Axiom Pulse'];
    const chosenName = `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 99)}`;
    const chosenSymbol = chosenName.split(' ')[0].substring(0, 5).toUpperCase();
    const mint = `${randomHex()}${randomHex()}${randomHex()}${randomHex()}pump`;
    const creator = `${randomHex()}${randomHex()}${randomHex()}sol`;

    const newToken: TrackedToken = {
      mint,
      name: chosenName,
      symbol: chosenSymbol,
      uri: `https://ipfs.io/ipfs/${randomHex()}`,
      creator,
      bondingCurve: `${randomHex()}${randomHex()}curve`,
      createdAt: Date.now(),
      initialPriceSol: 0.000000028,
      initialMarketCapSol: 28.0,
      currentPriceSol: 0.000000028,
      currentMarketCapSol: 28.0,
      currentMarketCapUsd: 28.0 * solUsdPrice,
      highestMultiplier: 1.0,
      notified5x: false,
      notified10x: false,
      tradeCount: 1,
      buyCount: 1,
      sellCount: 0,
      volumeSol: 1.2,
      channelMessageId: Math.floor(Math.random() * 9000) + 1000,
      lastTradeTimestamp: Date.now(),
    };

    setTokens((prev) => [newToken, ...prev.slice(0, 19)]);
    setAlertsCount((prev) => prev + 1);
  };

  // Handler to simulate buying waves or 5x/10x surges on a token
  const handleSimulateTrade = (mint: string, multiplierBump: number) => {
    setTokens((prev) =>
      prev.map((token) => {
        if (token.mint !== mint) return token;

        const newMult = Math.max(token.highestMultiplier, multiplierBump);
        const newPrice = token.initialPriceSol * newMult;
        const newCapSol = token.initialMarketCapSol * newMult;
        const now = Date.now();

        const was5x = token.notified5x;
        const was10x = token.notified10x;
        const is5xNow = newMult >= 5.0;
        const is10xNow = newMult >= 10.0;

        return {
          ...token,
          highestMultiplier: newMult,
          currentPriceSol: newPrice,
          currentMarketCapSol: newCapSol,
          currentMarketCapUsd: newCapSol * solUsdPrice,
          notified5x: was5x || is5xNow,
          notified10x: was10x || is10xNow,
          surgeTime5x: token.surgeTime5x || (is5xNow ? now - token.createdAt : undefined),
          surgeTime10x: token.surgeTime10x || (is10xNow ? now - token.createdAt : undefined),
          tradeCount: token.tradeCount + 5,
          buyCount: token.buyCount + 5,
          volumeSol: token.volumeSol + 12.5,
          lastTradeTimestamp: now,
        };
      })
    );
  };

  const affiliateRefs = {
    trojan: 'alphasniper',
    bonkbot: 'alphasniper',
    photon: 'alphasniper',
    maestro: 'alphasniper',
    bullx: 'alphasniper',
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLiveWs={isLiveWs}
        setIsLiveWs={setIsLiveWs}
        latencyMs={latencyMs}
        blockSlot={blockSlot}
        trackedCount={tokens.length}
        alertsCount={alertsCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'feed' && (
          <LiveSniperFeed
            tokens={tokens}
            onSimulateNewMint={handleSimulateNewMint}
            onSimulateTrade={handleSimulateTrade}
            onSelectTokenForLookup={(mint) => {
              setActiveTab('dm');
            }}
            solUsdPrice={solUsdPrice}
          />
        )}

        {activeTab === 'telegram' && (
          <TelegramChannelMockup
            tokens={tokens}
            channelName="@PumpFunAlphaAlerts"
            affiliateRefs={affiliateRefs}
            solUsdPrice={solUsdPrice}
          />
        )}

        {activeTab === 'dm' && (
          <TelegramDMSimulator
            tokens={tokens}
            solUsdPrice={solUsdPrice}
          />
        )}

        {activeTab === 'curve' && (
          <BondingCurveCalculator solUsdPrice={solUsdPrice} />
        )}

        {activeTab === 'code' && <CodeExplorer />}

        {activeTab === 'vps' && <DeploymentDocs />}
      </main>

      {/* Institutional Web3 Terminal Footer */}
      <footer className="border-t border-zinc-900 bg-[#07080c] py-6 px-4 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-zinc-400">PumpSniper Core Engine</span>
            <span>•</span>
            <span>Solana Program: <code className="text-zinc-400 font-mono">6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P</code></span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Free Forever</span>
            <span>•</span>
            <span>Affiliate Trading Routing</span>
            <span>•</span>
            <span>Node.js / TypeScript / Telegraf</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

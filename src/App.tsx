/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LiveSniperFeed } from './components/LiveSniperFeed';
import { TelegramChannelMockup } from './components/TelegramChannelMockup';
import { TelegramDMSimulator } from './components/TelegramDMSimulator';
import { BondingCurveCalculator } from './components/BondingCurveCalculator';
import { CodeExplorer } from './components/CodeExplorer';
import { DeploymentDocs } from './components/DeploymentDocs';
import { TerminalLogs } from './components/TerminalLogs';
import { PreviousRunnersTicker } from './components/PreviousRunnersTicker';
import { TrackedToken, LogEntry } from './types';
import { PumpSyncService } from './services/pumpSyncService';
import { Volume2, VolumeX, Sparkles, Send } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [isLiveWs, setIsLiveWs] = useState(true);
  const [latencyMs, setLatencyMs] = useState(128);
  const [blockSlot, setBlockSlot] = useState(455683050);
  const [tokens, setTokens] = useState<TrackedToken[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: Date.now() - 2000,
      level: 'info',
      tag: 'SYSTEM',
      message: 'PumpSniper Core Engine initialized. Ready to sync live Solana Pump.fun stream.',
    },
    {
      id: 'init-2',
      timestamp: Date.now() - 1000,
      level: 'success',
      tag: 'SOLANA',
      message: 'Solana RPC cluster connected: Commitment [processed]. Target: 6EF8...eF6P.',
    },
    {
      id: 'init-3',
      timestamp: Date.now() - 500,
      level: 'info',
      tag: 'TELEGRAM',
      message: 'Channel broadcaster synchronized to: https://t.me/PumpSurgeAlerts (@PumpSurgeAlerts).',
    },
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);
  const solUsdPrice = 180.0;

  // Fun synthesized retro Web Audio sound effects for 5x & 10x surges
  const playSurgeAudio = useCallback(
    (is10x: boolean) => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = is10x ? 'triangle' : 'sine';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(is10x ? 440 : 330, now);
        osc.frequency.exponentialRampToValueAtTime(is10x ? 1760 : 880, now + 0.35);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch {
        // AudioContext might be restricted until user gesture
      }
    },
    [soundEnabled]
  );

  // Real-time synchronization function
  const handleSyncRealTime = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await PumpSyncService.fetchRealTimePumpCoins(solUsdPrice);
      if (result.tokens.length > 0) {
        setTokens(result.tokens);
        setAlertsCount((prev) => prev + result.tokens.length);
      }
      setLogs((prev) => [...result.newLogs, ...prev].slice(0, 300));
    } catch (err: any) {
      const errLog = PumpSyncService.createLog('error', 'SYNC ERROR', err.message || 'Failed to fetch live coins');
      setLogs((prev) => [errLog, ...prev]);
    } finally {
      setIsSyncing(false);
    }
  }, [solUsdPrice]);

  // Clean reset of logs and cache
  const handleClearLogsAndCache = useCallback(() => {
    const { tokens: emptyTokens, logs: cleanLogs } = PumpSyncService.clearLogsAndCache();
    setTokens(emptyTokens);
    setLogs(cleanLogs);
    setAlertsCount(0);
  }, []);

  // Synchronize live real-time coins from Pump.fun on initial load
  useEffect(() => {
    handleSyncRealTime();
  }, [handleSyncRealTime]);

  // Simulate Solana block slot progression and small latency fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockSlot((prev) => prev + 1);
      setLatencyMs((prev) => Math.max(75, Math.min(210, prev + Math.floor((Math.random() - 0.5) * 10))));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Handler to simulate an instant new Pump.fun mint event
  const handleSimulateNewMint = () => {
    const randomHex = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    const names = ['Axiom Velocity', 'Moonshot Grok', 'Solana Turbo Cat', 'Quantum Pepe', 'Cyber Whales'];
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
      initialMarketCapUsd: 28.0 * solUsdPrice,
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

    setTokens((prev) => [newToken, ...prev]);
    setAlertsCount((prev) => prev + 1);

    const mintLog: LogEntry = {
      id: `mint-${Date.now()}`,
      timestamp: Date.now(),
      level: 'info',
      tag: 'NEW MINT',
      message: `Detected new mint: ${chosenName} ($${chosenSymbol}) | CA: ${mint.slice(0, 8)}... | Initial LP: 30 SOL | Alert dispatched to @PumpSurgeAlerts`,
    };
    setLogs((prev) => [mintLog, ...prev]);
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

        if (is10xNow && !was10x) {
          playSurgeAudio(true);
          const logEntry: LogEntry = {
            id: `surge-10x-${now}`,
            timestamp: now,
            level: 'alert',
            tag: '10X MOONSHOT',
            message: `💥💥 10X Surge: ${token.name} ($${token.symbol}) crossed ${newMult.toFixed(1)}x ($${Math.round(newCapSol * solUsdPrice).toLocaleString()})! Reply sent to @PumpSurgeAlerts`,
          };
          setLogs((p) => [logEntry, ...p]);
        } else if (is5xNow && !was5x) {
          playSurgeAudio(false);
          const logEntry: LogEntry = {
            id: `surge-5x-${now}`,
            timestamp: now,
            level: 'alert',
            tag: '5X SURGE',
            message: `🚀🚀 5X Multiplier: ${token.name} ($${token.symbol}) reached ${newMult.toFixed(1)}x in velocity window! Reply sent to @PumpSurgeAlerts`,
          };
          setLogs((p) => [logEntry, ...p]);
        }

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
          volumeSol: token.volumeSol + 14.5,
          lastTradeTimestamp: now,
        };
      })
    );
  };

  // Direct affiliate references (without PHOTON_REF)
  const affiliateRefs = {
    trojan: 'alphasniper',
    bonkbot: 'alphasniper',
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Previous 5x / 10x Runners Hall of Fame */}
            <PreviousRunnersTicker
              liveTokens={tokens}
              onSelectToken={() => setActiveTab('dm')}
              solUsdPrice={solUsdPrice}
            />

            {/* Live Sniper Radar Feed */}
            <LiveSniperFeed
              tokens={tokens}
              onSimulateNewMint={handleSimulateNewMint}
              onSimulateTrade={handleSimulateTrade}
              onSelectTokenForLookup={() => setActiveTab('dm')}
              onClearLogsAndCache={handleClearLogsAndCache}
              onSyncRealTime={handleSyncRealTime}
              isSyncing={isSyncing}
              solUsdPrice={solUsdPrice}
            />

            {/* Live Terminal Log Stream docked right under the radar feed */}
            <div className="pt-4 border-t border-zinc-800/80">
              <TerminalLogs
                logs={logs}
                onClearLogs={handleClearLogsAndCache}
                onSyncRealTime={handleSyncRealTime}
                isSyncing={isSyncing}
              />
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <TerminalLogs
            logs={logs}
            onClearLogs={handleClearLogsAndCache}
            onSyncRealTime={handleSyncRealTime}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'telegram' && (
          <TelegramChannelMockup
            tokens={tokens}
            channelName="@PumpSurgeAlerts"
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
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-zinc-400">PumpSniper Core Engine</span>
            <span>•</span>
            <a
              href="https://t.me/PumpSurgeAlerts"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Send className="w-3 h-3" />
              <span>@PumpSurgeAlerts</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
            >
              {soundEnabled ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3 text-zinc-500" />}
              <span>Surge Audio: {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>
            <span>•</span>
            <span>Direct Photon Routing</span>
            <span>•</span>
            <span>Real-time Solana Mainnet Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

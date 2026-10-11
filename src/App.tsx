/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LiveSniperFeed } from './components/LiveSniperFeed';
import { PreviousRunnersTicker } from './components/PreviousRunnersTicker';
import { TerminalLogs } from './components/TerminalLogs';
import { WatchlistPanel } from './components/WatchlistPanel';
import { BondingCurveCalculator } from './components/BondingCurveCalculator';
import { RenderDeployDocs } from './components/RenderDeployDocs';
import { AuthModal } from './components/AuthModal';
import { NotificationCenter, AppNotification } from './components/NotificationCenter';
import { TrackedToken, LogEntry } from './types';
import { PumpSyncService } from './services/pumpSyncService';
import { AuthService, AuthUser } from './services/authService';
import { Volume2, VolumeX, Bell, Trophy, Star, Server, Sparkles, Activity } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [isLiveWs, setIsLiveWs] = useState(true);
  const [latencyMs, setLatencyMs] = useState(115);
  const [blockSlot, setBlockSlot] = useState(455683100);
  const [tokens, setTokens] = useState<TrackedToken[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // User Authentication & Watchlist State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => AuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [watchlistMints, setWatchlistMints] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pumpsurge_watchlist');
      return saved ? JSON.parse(saved) : ['8YeBTPV58fH6tnzUAihMK1LixsGc1jsN7DAyBoiRpump'];
    } catch {
      return [];
    }
  });

  // In-App Notification Center State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-seed-1',
      type: '10x',
      title: '💥 10X Moonshot Alert!',
      message: 'Zhunt ($ZNT) reached 12.10x in 38.2s on Solana bonding curve!',
      mint: '8YeBTPV58fH6tnzUAihMK1LixsGc1jsN7DAyBoiRpump',
      name: 'Zhunt',
      symbol: 'ZNT',
      multiplier: 12.1,
      marketCapUsd: 61000,
      timestamp: Date.now() - 360000,
    },
    {
      id: 'notif-seed-2',
      type: '5x',
      title: '🚀 5X Multiplier Spike!',
      message: 'Pepe AI Turbo ($PEPETURBO) surged to 5.42x in only 11.2s!',
      mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      name: 'Pepe AI Turbo',
      symbol: 'PEPETURBO',
      multiplier: 5.42,
      marketCapUsd: 27360,
      timestamp: Date.now() - 900000,
    },
  ]);

  // Real-time Event Logs Stream
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: Date.now() - 2000,
      level: 'info',
      tag: 'SYSTEM',
      message: 'PumpSurge App Engine v2.0 initialized. Live Database Connected.',
    },
    {
      id: 'init-2',
      timestamp: Date.now() - 1000,
      level: 'success',
      tag: 'SOLANA',
      message: 'Solana RPC cluster connected: Commitment [processed]. Tracking: 6EF8...eF6P.',
    },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [alertsCount, setAlertsCount] = useState(2);
  const solUsdPrice = 180.0;

  // Persist watchlist changes
  useEffect(() => {
    localStorage.setItem('pumpsurge_watchlist', JSON.stringify(watchlistMints));
  }, [watchlistMints]);

  const handleToggleWatchlist = (mint: string) => {
    setWatchlistMints((prev) => {
      const exists = prev.includes(mint);
      const next = exists ? prev.filter((m) => m !== mint) : [...prev, mint];
      const actionLog: LogEntry = {
        id: `watchlist-${Date.now()}`,
        timestamp: Date.now(),
        level: 'info',
        tag: 'DATABASE',
        message: `${exists ? 'Removed' : 'Added'} token ${mint.slice(0, 8)}... to personal watchlist.`,
      };
      setLogs((l) => [actionLog, ...l]);
      return next;
    });
  };

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
        // Audio context may require user interaction
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
    setNotifications([]);
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
      setLatencyMs((prev) => Math.max(75, Math.min(190, prev + Math.floor((Math.random() - 0.5) * 8))));
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
      lastTradeTimestamp: Date.now(),
    };

    setTokens((prev) => [newToken, ...prev]);

    const mintLog: LogEntry = {
      id: `mint-${Date.now()}`,
      timestamp: Date.now(),
      level: 'info',
      tag: 'NEW MINT',
      message: `Detected new mint: ${chosenName} ($${chosenSymbol}) | CA: ${mint.slice(0, 8)}... | Initial LP: 30 SOL`,
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
          const timeSec = ((now - token.createdAt) / 1000).toFixed(1);
          
          // Dispatch in-app notification
          const newNotif: AppNotification = {
            id: `notif-10x-${now}`,
            type: '10x',
            title: '💥 10X MOONSHOT ALERT!',
            message: `${token.name} ($${token.symbol}) skyrocketed to ${newMult.toFixed(1)}x in ${timeSec}s!`,
            mint: token.mint,
            name: token.name,
            symbol: token.symbol,
            multiplier: newMult,
            marketCapUsd: newCapSol * solUsdPrice,
            timestamp: now,
          };
          setNotifications((n) => [newNotif, ...n]);
          setAlertsCount((c) => c + 1);

          // Native desktop notification
          AuthService.sendDesktopNotification(
            '💥 10X MOONSHOT ALERT!',
            `${token.name} ($${token.symbol}) hit ${newMult.toFixed(1)}x ($${Math.round(newCapSol * solUsdPrice).toLocaleString()})!`
          );

          const logEntry: LogEntry = {
            id: `surge-10x-${now}`,
            timestamp: now,
            level: 'alert',
            tag: '10X MOONSHOT',
            message: `💥💥 10X Surge: ${token.name} ($${token.symbol}) crossed ${newMult.toFixed(1)}x ($${Math.round(newCapSol * solUsdPrice).toLocaleString()})! Notification dispatched.`,
          };
          setLogs((p) => [logEntry, ...p]);
        } else if (is5xNow && !was5x) {
          playSurgeAudio(false);
          const timeSec = ((now - token.createdAt) / 1000).toFixed(1);

          // Dispatch in-app notification
          const newNotif: AppNotification = {
            id: `notif-5x-${now}`,
            type: '5x',
            title: '🚀 5X MULTIPLIER DETECTED!',
            message: `${token.name} ($${token.symbol}) reached ${newMult.toFixed(1)}x in ${timeSec}s velocity window!`,
            mint: token.mint,
            name: token.name,
            symbol: token.symbol,
            multiplier: newMult,
            marketCapUsd: newCapSol * solUsdPrice,
            timestamp: now,
          };
          setNotifications((n) => [newNotif, ...n]);
          setAlertsCount((c) => c + 1);

          // Native desktop notification
          AuthService.sendDesktopNotification(
            '🚀 5X MULTIPLIER ALERT!',
            `${token.name} ($${token.symbol}) reached ${newMult.toFixed(1)}x on Solana bonding curve!`
          );

          const logEntry: LogEntry = {
            id: `surge-5x-${now}`,
            timestamp: now,
            level: 'alert',
            tag: '5X SURGE',
            message: `🚀🚀 5X Multiplier: ${token.name} ($${token.symbol}) reached ${newMult.toFixed(1)}x in velocity window! Notification dispatched.`,
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

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    const log: LogEntry = {
      id: `logout-${Date.now()}`,
      timestamp: Date.now(),
      level: 'info',
      tag: 'AUTH',
      message: 'User logged out. Switched to public guest session.',
    };
    setLogs((l) => [log, ...l]);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top App Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLiveWs={isLiveWs}
        setIsLiveWs={setIsLiveWs}
        latencyMs={latencyMs}
        blockSlot={blockSlot}
        trackedCount={tokens.length}
        alertsCount={alertsCount}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={notifications.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        watchlistCount={watchlistMints.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* RADAR FEED VIEW */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Previous 5x / 10x Runners Hall of Fame Ticker */}
            <PreviousRunnersTicker
              liveTokens={tokens}
              onSelectToken={() => setActiveTab('feed')}
              solUsdPrice={solUsdPrice}
            />

            {/* Live Sniper Radar Feed */}
            <LiveSniperFeed
              tokens={tokens}
              onSimulateNewMint={handleSimulateNewMint}
              onSimulateTrade={handleSimulateTrade}
              onSelectTokenForLookup={() => setActiveTab('feed')}
              onClearLogsAndCache={handleClearLogsAndCache}
              onSyncRealTime={handleSyncRealTime}
              isSyncing={isSyncing}
              solUsdPrice={solUsdPrice}
              watchlistMints={watchlistMints}
              onToggleWatchlist={handleToggleWatchlist}
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

        {/* 5X / 10X RUNNERS DEDICATED VIEW */}
        {activeTab === 'runners' && (
          <div className="space-y-6">
            <PreviousRunnersTicker
              liveTokens={tokens}
              onSelectToken={() => setActiveTab('feed')}
              solUsdPrice={solUsdPrice}
            />
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Active Multiplier Runners Filtering
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                All tokens that have surged 5x, 10x, and above during current and previous on-chain tracking sessions.
              </p>
              <LiveSniperFeed
                tokens={tokens.filter((t) => t.highestMultiplier >= 2.0)}
                onSimulateNewMint={handleSimulateNewMint}
                onSimulateTrade={handleSimulateTrade}
                onSelectTokenForLookup={() => {}}
                onClearLogsAndCache={handleClearLogsAndCache}
                onSyncRealTime={handleSyncRealTime}
                isSyncing={isSyncing}
                solUsdPrice={solUsdPrice}
                watchlistMints={watchlistMints}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </div>
          </div>
        )}

        {/* WATCHLIST VIEW */}
        {activeTab === 'watchlist' && (
          <WatchlistPanel
            watchlistMints={watchlistMints}
            tokens={tokens}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectToken={() => setActiveTab('feed')}
            solUsdPrice={solUsdPrice}
          />
        )}

        {/* LIVE TERMINAL VIEW */}
        {activeTab === 'logs' && (
          <TerminalLogs
            logs={logs}
            onClearLogs={handleClearLogsAndCache}
            onSyncRealTime={handleSyncRealTime}
            isSyncing={isSyncing}
          />
        )}

        {/* BONDING CURVE MATH CALCULATOR */}
        {activeTab === 'curve' && (
          <BondingCurveCalculator solUsdPrice={solUsdPrice} />
        )}

        {/* RENDER DEPLOYMENT SETTINGS */}
        {activeTab === 'render' && <RenderDeployDocs />}
      </main>

      {/* Registration & Authentication Portal Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          const log: LogEntry = {
            id: `auth-success-${Date.now()}`,
            timestamp: Date.now(),
            level: 'success',
            tag: 'DATABASE',
            message: `User ${user.username} authenticated. Live database connected.`,
          };
          setLogs((l) => [log, ...l]);
        }}
      />

      {/* In-App Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onClearAll={() => setNotifications([])}
        onSelectToken={() => setIsNotificationsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* App Footer */}
      <footer className="border-t border-zinc-900 bg-[#07080c] py-5 px-4 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-zinc-300">PumpSurge Web &amp; Mobile App</span>
            <span>•</span>
            <span className="font-mono text-zinc-500">Render Production Ready</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Live SQLite/JSON Database</span>
            <span>•</span>
            <span>Gmail Registration Portal</span>
            <span>•</span>
            <span>5x/10x Push Notifications</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

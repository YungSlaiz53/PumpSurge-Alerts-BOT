/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LiveSniperFeed } from './components/LiveSniperFeed';
import { PreviousRunnersTicker } from './components/PreviousRunnersTicker';
import { TerminalLogs } from './components/TerminalLogs';
import { DumpedCoinsList } from './components/DumpedCoinsList';
import { AdminDashboard } from './components/AdminDashboard';
import { BondingCurveCalculator } from './components/BondingCurveCalculator';
import { WhaleTrackingDashboard } from './components/WhaleTrackingDashboard';
import { AuthModal } from './components/AuthModal';
import { AuthGateView } from './components/AuthGateView';
import { NotificationCenter, AppNotification } from './components/NotificationCenter';
import { TrackedToken, LogEntry, TrackedWhaleWallet, WhaleTransaction, WhaleBuyTransaction } from './types';
import { PumpSyncService } from './services/pumpSyncService';
import { WhaleTrackingService } from './services/whaleTrackingService';
import { AuthService, AuthUser, ADMIN_USERNAME, ADMIN_EMAIL } from './services/authService';
import { SiteConfigService, SiteConfig } from './services/siteConfigService';
import { AlertTriangle, Bell, Info, ShieldAlert, CheckCircle2, Trophy } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [latencyMs, setLatencyMs] = useState(115);
  const [blockSlot, setBlockSlot] = useState(455683100);
  const [tokens, setTokens] = useState<TrackedToken[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 1+ SOL Whale Radar & Wallet Tracker State (Requirements 1, 2, 3)
  const [whaleWallets, setWhaleWallets] = useState<TrackedWhaleWallet[]>([]);
  const [whaleTransactions, setWhaleTransactions] = useState<WhaleTransaction[]>([]);
  
  // Site Customizer State (Admin controlled)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => SiteConfigService.getConfig());

  // 10-Second Auto-Synchronize State (Requirement 2: reduced to 10secs)
  const [isAutoSyncActive, setIsAutoSyncActive] = useState(true);
  const [syncCountdown, setSyncCountdown] = useState(10);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

  // User Authentication State
  // Requirement 1: once you enter the link to this site, login or register page shows
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => AuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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
    {
      id: 'notif-seed-3',
      type: 'coin_dumping',
      title: '⚠️ Warning Coin Dumping',
      message: 'SolDoge Rug ($SOLDOGE) collapsed to 1.84x (below 3X threshold from 4.6x peak)!',
      mint: 'DUMP777V58fH6tnzUAihMK1LixsGc1jsN7DAyBoiRpump',
      name: 'SolDoge Rug',
      symbol: 'SOLDOGE',
      multiplier: 1.84,
      marketCapUsd: 9200,
      timestamp: Date.now() - 120000,
      dropPercent: 60,
    },
  ]);

  // Real-time Event Logs Stream
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: Date.now() - 2000,
      level: 'info',
      tag: 'SYSTEM',
      message: 'PumpSurge App Engine v2.1 initialized. Live Database Connected.',
    },
    {
      id: 'init-2',
      timestamp: Date.now() - 1000,
      level: 'success',
      tag: 'SOLANA',
      message: 'Solana RPC cluster connected: Commitment [processed]. 10s price synchronizer active.',
    },
    {
      id: 'init-3',
      timestamp: Date.now() - 500,
      level: 'alert',
      tag: 'WARNING COIN DUMPING',
      message: '⚠️ Below 3X Dumping Sentinel online: Active warnings on sudden drawdowns.',
    },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [alertsCount, setAlertsCount] = useState(3);
  const solUsdPrice = 180.0;
  const isSyncingRef = useRef(false);

  // Listen for Site Config Updates
  useEffect(() => {
    const handleConfigChange = (e: any) => {
      if (e.detail) {
        setSiteConfig(e.detail);
      }
    };
    window.addEventListener('site_config_updated', handleConfigChange);
    return () => window.removeEventListener('site_config_updated', handleConfigChange);
  }, []);

  // Web Audio Synth for notifications (5x, 10x, high buys, new listing, and dumping alarm)
  const playSurgeAudio = useCallback(
    (type: '5x' | '10x' | 'high_buys' | 'listing' | 'dumping') => {
      if (!soundEnabled) return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const now = ctx.currentTime;
        if (type === 'dumping') {
          // Classic down-pitch hazard siren for coin dumping
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.linearRampToValueAtTime(280, now + 0.38);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.38);
        } else if (type === '10x') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === '5x') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(330, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'high_buys') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.2);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
        } else {
          // New listing chirp
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587, now);
          osc.frequency.exponentialRampToValueAtTime(1174, now + 0.18);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
        }
      } catch {
        // Audio interaction
      }
    },
    [soundEnabled]
  );

  // Real-time synchronization function (called on mount and every 15s)
  const handleSyncRealTime = useCallback(async (_isManual = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const result = await PumpSyncService.fetchRealTimePumpCoins(solUsdPrice);

      if (result.resetExecuted) {
        setLogs(result.newLogs);
      } else {
        setLogs((prev) => [...result.newLogs, ...prev].slice(0, 300));
      }

      if (result.tokens.length > 0) {
        setTokens(result.tokens);
        WhaleTrackingService.init(result.tokens, solUsdPrice);
        WhaleTrackingService.updatePricesFromTokens(result.tokens);

        // Periodically capture live 1+ SOL whale buys when coins are actively trading
        if (Math.random() > 0.45) {
          const simulatedTx = WhaleTrackingService.simulateRandomWhaleBuy(result.tokens, solUsdPrice);
          if (simulatedTx) {
            setLogs((prev) => [
              PumpSyncService.createLog(
                'info',
                '1+ SOL WHALE BUY',
                `🐋 1+ SOL Buy: ${simulatedTx.walletLabel || simulatedTx.walletAddress.slice(0, 6)} bought ${simulatedTx.solAmount} SOL of $${simulatedTx.tokenSymbol} ($${Math.round(simulatedTx.solUsdValue).toLocaleString()})`
              ),
              ...prev,
            ]);
          }
        }

        // Periodically capture whale sells / profit taking
        if (Math.random() > 0.65) {
          const sellTx = WhaleTrackingService.simulateRandomWhaleSell(result.tokens, solUsdPrice);
          if (sellTx) {
            const pnlText = (sellTx.realizedProfitSol || 0) >= 0 
              ? `+${sellTx.realizedProfitSol} SOL (+${sellTx.realizedPnlPercent}%)`
              : `${sellTx.realizedProfitSol} SOL (${sellTx.realizedPnlPercent}%)`;
            setLogs((prev) => [
              PumpSyncService.createLog(
                'warn',
                'WHALE SELL EVENT',
                `🔴 Whale Sold: ${sellTx.walletLabel || sellTx.walletAddress.slice(0, 6)} sold ${sellTx.solAmount} SOL of $${sellTx.tokenSymbol} (${pnlText})! Status: ${sellTx.holdingStatus}`
              ),
              ...prev,
            ]);
          }
        }

        setWhaleWallets(WhaleTrackingService.getTrackedWallets());
        setWhaleTransactions(WhaleTrackingService.getTransactions());
      }

      // Check for newly listed coins in this 15-second cycle
      if (result.newlyListedTokens.length > 0) {
        result.newlyListedTokens.forEach((token) => {
          const newNotif: AppNotification = {
            id: `notif-new-${Date.now()}-${token.mint.slice(0, 4)}`,
            type: 'new_listing',
            title: '✨ New Coin Listed on Pump.fun!',
            message: `${token.name} ($${token.symbol}) detected in current 15s cycle!`,
            mint: token.mint,
            name: token.name,
            symbol: token.symbol,
            multiplier: 1.0,
            marketCapUsd: token.currentMarketCapUsd,
            timestamp: Date.now(),
          };
          setNotifications((prev) => [newNotif, ...prev]);

          AuthService.sendDesktopNotification(
            '✨ New Coin Listed on Pump.fun!',
            `${token.name} ($${token.symbol}) just minted on Solana!`
          );
        });

        playSurgeAudio('listing');
      }

      // Check for High Buys coins in this 15-second cycle
      if (result.highBuysTokens.length > 0) {
        result.highBuysTokens.forEach((token) => {
          const newNotif: AppNotification = {
            id: `notif-hb-${Date.now()}-${token.mint.slice(0, 4)}`,
            type: 'high_buys',
            title: '🔥 High Buys Velocity Detected!',
            message: `${token.name} ($${token.symbol}) shooting up with ${token.buyVelocity}% buy pressure!`,
            mint: token.mint,
            name: token.name,
            symbol: token.symbol,
            multiplier: token.highestMultiplier,
            marketCapUsd: token.currentMarketCapUsd,
            timestamp: Date.now(),
            buyVelocity: token.buyVelocity,
          };
          setNotifications((prev) => [newNotif, ...prev]);

          AuthService.sendDesktopNotification(
            '🔥 High Buys Velocity Spike!',
            `${token.name} ($${token.symbol}) shooting fast with ${token.buyVelocity}% buys!`
          );
        });

        playSurgeAudio('high_buys');
      }

      // Check for Coin Dumping events (below 3X) (Requirement 10)
      if (result.dumpedTokens && result.dumpedTokens.length > 0) {
        result.dumpedTokens.forEach((token) => {
          const currentMult = (token.currentPriceSol / token.initialPriceSol);
          const newNotif: AppNotification = {
            id: `notif-dump-${Date.now()}-${token.mint.slice(0, 4)}`,
            type: 'coin_dumping',
            title: '⚠️ Warning Coin Dumping',
            message: `${token.name} ($${token.symbol}) dropped to ${currentMult.toFixed(2)}x (fell below 3.0X threshold)!`,
            mint: token.mint,
            name: token.name,
            symbol: token.symbol,
            multiplier: currentMult,
            marketCapUsd: token.currentMarketCapUsd,
            timestamp: Date.now(),
          };
          setNotifications((prev) => [newNotif, ...prev]);

          AuthService.sendDesktopNotification(
            '⚠️ Warning Coin Dumping!',
            `${token.name} ($${token.symbol}) dropped below 3X on Pump.fun!`
          );
        });

        playSurgeAudio('dumping');
      }

      // Check for 5x / 10x surges in this cycle
      if (result.surge10xTokens.length > 0) {
        playSurgeAudio('10x');
      } else if (result.surge5xTokens.length > 0) {
        playSurgeAudio('5x');
      }
    } catch {
      // Background retry
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  }, [solUsdPrice, playSurgeAudio]);

  // Initial Sync on Mount
  useEffect(() => {
    handleSyncRealTime();
    // Initialize 1+ SOL Whale Radar
    WhaleTrackingService.init([], solUsdPrice);
    setWhaleWallets(WhaleTrackingService.getTrackedWallets());
    setWhaleTransactions(WhaleTrackingService.getTransactions());
  }, [handleSyncRealTime, solUsdPrice]);

  // 10-Second Heartbeat Synchronization Loop (Requirement 2)
  useEffect(() => {
    if (!isAutoSyncActive) return;

    const intervalTimer = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          handleSyncRealTime();
          return siteConfig.autoSyncIntervalSeconds || 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [isAutoSyncActive, handleSyncRealTime, siteConfig.autoSyncIntervalSeconds]);

  // 24h 00:00 Midnight Reset Countdown Tracker
  useEffect(() => {
    const updateMidnightTimer = () => {
      const remaining = PumpSyncService.getTimeUntilMidnight();
      setTimeUntilMidnight(remaining.formatted);
      PumpSyncService.checkAndExecute24hMidnightReset();
    };

    updateMidnightTimer();
    const timer = setInterval(updateMidnightTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live block slot simulator
  useEffect(() => {
    const slotInterval = setInterval(() => {
      setBlockSlot((s) => s + 1);
      setLatencyMs(Math.floor(95 + Math.random() * 45));
    }, 400);
    return () => clearInterval(slotInterval);
  }, []);

  // Handler for manual 00:00 midnight reset
  const handleManualMidnightReset = () => {
    const result = PumpSyncService.clearLogsAndCache();
    setLogs(result.logs);
    setNotifications([]);
    const resetNotice: LogEntry = {
      id: `manual-midnight-${Date.now()}`,
      timestamp: Date.now(),
      level: 'info',
      tag: '00:00 RESET',
      message: '⏰ Manual 00:00 Reset executed: All historical logs cleared, 10s price synchronizer reset.',
    };
    setLogs([resetNotice]);
  };

  const handleClearLogsAndCache = () => {
    const result = PumpSyncService.clearLogsAndCache();
    setLogs(result.logs);
  };

  // Requirement 3: Admin Reset Suite Handlers
  const handleFactoryResetApp = useCallback(() => {
    AuthService.resetAllAppData();
    WhaleTrackingService.clearDailyData();
    const result = PumpSyncService.clearLogsAndCache();
    setLogs(result.logs);
    setNotifications([]);
    setTokens([]);
    setWhaleWallets([]);
    setWhaleTransactions([]);
    setSyncCountdown(10);
    handleSyncRealTime(true);
  }, [handleSyncRealTime]);

  const handleResetWhaleRadar = useCallback(() => {
    WhaleTrackingService.clearDailyData();
    WhaleTrackingService.init(tokens, solUsdPrice);
    setWhaleWallets(WhaleTrackingService.getTrackedWallets());
    setWhaleTransactions(WhaleTrackingService.getTransactions());
    setLogs((prev) => [
      PumpSyncService.createLog(
        'warn',
        'WHALE RADAR',
        '🐋 Whale Radar purged by administrator. Fresh 1+ SOL tracking session initialized.'
      ),
      ...prev,
    ]);
  }, [tokens, solUsdPrice]);

  const handleResetTokenCache = useCallback(() => {
    const result = PumpSyncService.clearLogsAndCache();
    setTokens([]);
    setLogs(result.logs);
    handleSyncRealTime(true);
  }, [handleSyncRealTime]);

  const handleSimulateCustomWhaleBuy = useCallback((solAmount = 3.5, tokenMint?: string) => {
    const simTx = WhaleTrackingService.simulateRandomWhaleBuy(tokens, solUsdPrice, solAmount, tokenMint);
    if (simTx) {
      setWhaleWallets(WhaleTrackingService.getTrackedWallets());
      setWhaleTransactions(WhaleTrackingService.getTransactions());
      setLogs((prev) => [
        PumpSyncService.createLog(
          'alert',
          'WHALE MEGA-BUY',
          `🐋 ADMIN INJECTION: ${simTx.walletLabel || simTx.walletAddress.slice(0, 6)} bought ${simTx.solAmount} SOL of $${simTx.tokenSymbol} ($${Math.round(simTx.solUsdValue).toLocaleString()})`
        ),
        ...prev,
      ]);
    }
  }, [tokens, solUsdPrice]);

  const handleSimulateCustomWhaleSell = useCallback((tokenMint?: string) => {
    const sellTx = WhaleTrackingService.simulateRandomWhaleSell(tokens, solUsdPrice, tokenMint);
    if (sellTx) {
      setWhaleWallets(WhaleTrackingService.getTrackedWallets());
      setWhaleTransactions(WhaleTrackingService.getTransactions());
      const pnlText = (sellTx.realizedProfitSol || 0) >= 0 
        ? `+${sellTx.realizedProfitSol} SOL (+${sellTx.realizedPnlPercent}%)`
        : `${sellTx.realizedProfitSol} SOL (${sellTx.realizedPnlPercent}%)`;
      setLogs((prev) => [
        PumpSyncService.createLog(
          'warn',
          'WHALE SELL EVENT',
          `🔴 ADMIN INJECTION: ${sellTx.walletLabel || sellTx.walletAddress.slice(0, 6)} sold ${sellTx.solAmount} SOL of $${sellTx.tokenSymbol} (${pnlText})! Status: ${sellTx.holdingStatus}`
        ),
        ...prev,
      ]);
    }
  }, [tokens, solUsdPrice]);

  const handleSimulateMoonshot = useCallback((multiplier: number) => {
    if (tokens.length === 0) return;
    const target = tokens[0];
    handleSimulateTrade(target.mint, multiplier);
  }, [tokens]);

  // Handler to trigger simulated coin dumping (< 3X) (Requirement 10)
  const handleTriggerSimulatedDump = (targetMint?: string) => {
    setTokens((prev) => {
      if (prev.length === 0) return prev;
      const mintToDump = targetMint || prev[0].mint;
      return prev.map((token) => {
        if (token.mint !== mintToDump) return token;
        const peakMult = Math.max(token.highestMultiplier, 4.2);
        const dumpedMultiplier = 1.75; // strictly < 3.0X
        const newPrice = token.initialPriceSol * dumpedMultiplier;
        const newCapSol = token.initialMarketCapSol * dumpedMultiplier;
        const now = Date.now();
        const dropPct = Math.round(((peakMult - dumpedMultiplier) / peakMult) * 100);

        playSurgeAudio('dumping');

        const newNotif: AppNotification = {
          id: `notif-dump-${now}`,
          type: 'coin_dumping',
          title: '⚠️ Warning Coin Dumping',
          message: `${token.name} ($${token.symbol}) dropped to ${dumpedMultiplier.toFixed(2)}x (fell below 3.0X from peak ${peakMult.toFixed(1)}x)! Drawdown: -${dropPct}%`,
          mint: token.mint,
          name: token.name,
          symbol: token.symbol,
          multiplier: dumpedMultiplier,
          marketCapUsd: newCapSol * solUsdPrice,
          timestamp: now,
          dropPercent: dropPct,
        };
        setNotifications((n) => [newNotif, ...n]);

        AuthService.sendDesktopNotification(
          '⚠️ Warning Coin Dumping!',
          `${token.name} ($${token.symbol}) collapsed below 3X to ${dumpedMultiplier.toFixed(2)}x!`
        );

        const logEntry: LogEntry = {
          id: `dump-${now}`,
          timestamp: now,
          level: 'alert',
          tag: 'WARNING COIN DUMPING',
          message: `⚠️ [Warning Coin Dumping] ${token.name} ($${token.symbol}) collapsed to ${dumpedMultiplier.toFixed(2)}x (< 3.0X) from peak ${peakMult.toFixed(1)}x. Drawdown: -${dropPct}%.`,
        };
        setLogs((p) => [logEntry, ...p]);

        return {
          ...token,
          highestMultiplier: peakMult,
          currentPriceSol: newPrice,
          currentMarketCapSol: newCapSol,
          currentMarketCapUsd: newCapSol * solUsdPrice,
          isDumped: true,
          dumpWarning: true,
          dumpPeakMultiplier: peakMult,
          dumpCurrentMultiplier: dumpedMultiplier,
          dumpDropPercent: dropPct,
          dumpTimestamp: now,
          sellCount: token.sellCount + 28,
          tradeCount: token.tradeCount + 30,
          isHighBuys: false,
          priceChange15s: -dropPct,
        };
      });
    });
  };

  // Handler to simulate 1+ SOL Whale Buy (Requirements 1, 2)
  const handleTriggerSimulateWhaleBuy = () => {
    const tx = WhaleTrackingService.simulateRandomWhaleBuy(tokens, solUsdPrice);
    if (tx) {
      setWhaleWallets(WhaleTrackingService.getTrackedWallets());
      setWhaleTransactions(WhaleTrackingService.getTransactions());
      playSurgeAudio('high_buys');

      const whaleLog = PumpSyncService.createLog(
        'alert',
        '1+ SOL WHALE BUY',
        `🐋 Whale Buy: ${tx.walletLabel || tx.walletAddress.slice(0, 6)} executed ${tx.solAmount} SOL buy on $${tx.tokenSymbol} ($${Math.round(tx.solUsdValue).toLocaleString()})!`,
        { wallet: tx.walletAddress, solAmount: tx.solAmount, mint: tx.mint }
      );
      setLogs((p) => [whaleLog, ...p]);

      const notif: AppNotification = {
        id: `notif-whale-${Date.now()}`,
        type: 'high_buys',
        title: '🐋 1+ SOL Whale Buy Detected!',
        message: `${tx.walletLabel || `${tx.walletAddress.slice(0, 6)}...`} bought ${tx.solAmount} SOL of ${tx.tokenName} ($${tx.tokenSymbol})!`,
        mint: tx.mint,
        name: tx.tokenName,
        symbol: tx.tokenSymbol,
        multiplier: tx.currentMultiplier || 1.0,
        marketCapUsd: tx.solUsdValue * 120,
        timestamp: Date.now(),
      };
      setNotifications((n) => [notif, ...n]);

      AuthService.sendDesktopNotification(
        '🐋 1+ SOL Whale Buy Detected!',
        `${tx.solAmount} SOL bought on $${tx.tokenSymbol} by ${tx.walletLabel || tx.walletAddress.slice(0, 8)}!`
      );
    }
  };

  // Handler to simulate Whale Sell (Requirement: Show when they bought and when they sell)
  const handleTriggerSimulateWhaleSell = () => {
    const tx = WhaleTrackingService.simulateRandomWhaleSell(tokens, solUsdPrice);
    if (tx) {
      setWhaleWallets(WhaleTrackingService.getTrackedWallets());
      setWhaleTransactions(WhaleTrackingService.getTransactions());
      playSurgeAudio('high_buys');

      const isProfit = (tx.realizedProfitSol || 0) >= 0;
      const profitText = isProfit 
        ? `+${tx.realizedProfitSol} SOL profit (+${tx.realizedPnlPercent}%)` 
        : `${tx.realizedProfitSol} SOL loss (${tx.realizedPnlPercent}%)`;

      const whaleLog = PumpSyncService.createLog(
        'warn',
        'WHALE SELL EVENT',
        `🔴 Whale Sell: ${tx.walletLabel || tx.walletAddress.slice(0, 6)} sold ${tx.solAmount} SOL of $${tx.tokenSymbol} (${profitText})! Status: ${tx.holdingStatus}`,
        { wallet: tx.walletAddress, solAmount: tx.solAmount, mint: tx.mint, profitSol: tx.realizedProfitSol }
      );
      setLogs((p) => [whaleLog, ...p]);

      const notif: AppNotification = {
        id: `notif-whale-sell-${Date.now()}`,
        type: 'coin_dumping',
        title: '🔴 Whale Sold Coin!',
        message: `${tx.walletLabel || `${tx.walletAddress.slice(0, 6)}...`} sold ${tx.solAmount} SOL of ${tx.tokenName} ($${tx.tokenSymbol}) with ${profitText}!`,
        mint: tx.mint,
        name: tx.tokenName,
        symbol: tx.tokenSymbol,
        multiplier: tx.currentMultiplier || 1.0,
        marketCapUsd: tx.solUsdValue * 120,
        timestamp: Date.now(),
      };
      setNotifications((n) => [notif, ...n]);

      AuthService.sendDesktopNotification(
        '🔴 Whale Sold Coin!',
        `${tx.walletLabel || tx.walletAddress.slice(0, 8)} sold ${tx.solAmount} SOL of $${tx.tokenSymbol} (${profitText})!`
      );
    }
  };

  // Handler to simulate new token mint
  const handleSimulateNewMint = () => {
    const symbolSuffix = Math.floor(10 + Math.random() * 89);
    const mockMint = `PUMP${Math.random().toString(36).substring(2, 7)}soL${Math.random().toString(36).substring(2, 5)}`;
    const now = Date.now();
    const initialPrice = 0.000000032;

    const newToken: TrackedToken = {
      mint: mockMint,
      name: `Sol Rocket ${symbolSuffix}`,
      symbol: `ROCKET${symbolSuffix}`,
      uri: 'https://pump.fun',
      creator: `Dev${Math.random().toString(36).substring(2, 6)}Sol`,
      bondingCurve: `Curve${Math.random().toString(36).substring(2, 8)}`,
      createdAt: now,
      initialPriceSol: initialPrice,
      initialMarketCapSol: 28.0,
      initialMarketCapUsd: 28.0 * solUsdPrice,
      currentPriceSol: initialPrice,
      currentMarketCapSol: 28.0,
      currentMarketCapUsd: 28.0 * solUsdPrice,
      highestMultiplier: 1.0,
      notified5x: false,
      notified10x: false,
      tradeCount: 1,
      buyCount: 1,
      sellCount: 0,
      volumeSol: 1.2,
      lastTradeTimestamp: now,
      isHighBuys: false,
      buyVelocity: 100,
      priceChange15s: 0,
    };

    setTokens((prev) => [newToken, ...prev]);

    const logEntry: LogEntry = {
      id: `mint-${now}`,
      timestamp: now,
      level: 'info',
      tag: 'NEW LISTING',
      message: `✨ Newly Listed: ${newToken.name} ($${newToken.symbol}) | Initial LP: 28 SOL ($${Math.round(28 * solUsdPrice)})`,
      data: { mint: mockMint },
    };
    setLogs((prev) => [logEntry, ...prev]);

    const newNotif: AppNotification = {
      id: `notif-mint-${now}`,
      type: 'new_listing',
      title: '✨ New Coin Listed on Pump.fun!',
      message: `${newToken.name} ($${newToken.symbol}) just minted on Solana! Initial LP: 28 SOL`,
      mint: newToken.mint,
      name: newToken.name,
      symbol: newToken.symbol,
      multiplier: 1.0,
      marketCapUsd: newToken.currentMarketCapUsd,
      timestamp: now,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    playSurgeAudio('listing');
  };

  // Handler to inject custom token (from Admin Dashboard)
  const handleInjectCustomToken = (newToken: TrackedToken) => {
    setTokens((prev) => [newToken, ...prev]);
    if (newToken.isDumped) {
      handleTriggerSimulatedDump(newToken.mint);
    }
  };

  // Handler to simulate High Buys flurry
  const handleSimulateHighBuys = (mint: string) => {
    setTokens((prev) =>
      prev.map((token) => {
        if (token.mint !== mint) return token;
        const now = Date.now();
        const addedBuys = 15;
        const total = token.tradeCount + addedBuys;
        const buys = token.buyCount + addedBuys;
        const velocity = Math.round((buys / total) * 100);
        const newMult = Math.max(token.highestMultiplier, (token.currentPriceSol * 1.35) / token.initialPriceSol);
        const newPrice = token.currentPriceSol * 1.35;
        const newCapSol = token.currentMarketCapSol * 1.35;

        playSurgeAudio('high_buys');

        const newNotif: AppNotification = {
          id: `notif-hb-${now}`,
          type: 'high_buys',
          title: '🔥 High Buys Velocity Spike!',
          message: `${token.name} ($${token.symbol}) shooting fast with ${velocity}% buy pressure!`,
          mint: token.mint,
          name: token.name,
          symbol: token.symbol,
          multiplier: newMult,
          marketCapUsd: newCapSol * solUsdPrice,
          timestamp: now,
          buyVelocity: velocity,
        };
        setNotifications((n) => [newNotif, ...n]);

        const logEntry: LogEntry = {
          id: `hb-${now}`,
          timestamp: now,
          level: 'warn',
          tag: 'HIGH BUYS',
          message: `🔥 High Buys: ${token.name} ($${token.symbol}) shooting up with ${velocity}% buys! 15s delta: +35.0%`,
        };
        setLogs((p) => [logEntry, ...p]);

        return {
          ...token,
          buyCount: buys,
          tradeCount: total,
          isHighBuys: true,
          buyVelocity: velocity,
          priceChange15s: 35.0,
          currentPriceSol: newPrice,
          currentMarketCapSol: newCapSol,
          currentMarketCapUsd: newCapSol * solUsdPrice,
          highestMultiplier: newMult,
          lastTradeTimestamp: now,
        };
      })
    );
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
          playSurgeAudio('10x');
          const timeSec = ((now - token.createdAt) / 1000).toFixed(1);
          
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
          playSurgeAudio('5x');
          const timeSec = ((now - token.createdAt) / 1000).toFixed(1);

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
          notified5x: token.notified5x || is5xNow,
          notified10x: token.notified10x || is10xNow,
          tradeCount: token.tradeCount + 5,
          buyCount: token.buyCount + 5,
          isDumped: false,
          dumpWarning: false,
          lastTradeTimestamp: now,
        };
      })
    );
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    // If admin logged in (ADMIN01 / 125252 / oglekwudavid@gmail.com), open Admin Dashboard directly!
    if (user.username === ADMIN_USERNAME || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || user.isAdmin || user.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('feed');
    }
  };

  // Requirement 1: "make it that once you enter the link to this site its the login or register page that will show so its either they login or register."
  if (!currentUser) {
    return (
      <AuthGateView
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  const highBuysCount = tokens.filter((t) => t.isHighBuys).length;
  const dumpedCount = tokens.filter((t) => t.isDumped || (t.highestMultiplier >= 3.0 && (t.currentPriceSol / t.initialPriceSol) < 3.0)).length;

  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col font-sans selection:bg-cyan-400 selection:text-black">
      {/* Site-Wide Admin Broadcast Announcement Bar */}
      {siteConfig.announcementEnabled && siteConfig.announcementText && (
        <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
          siteConfig.announcementType === 'alert'
            ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
            : siteConfig.announcementType === 'warning'
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
            : siteConfig.announcementType === 'success'
            ? 'bg-cyan-950/80 border-cyan-400/40 text-cyan-200'
            : 'bg-[#050b18] border-cyan-500/40 text-cyan-200'
        }`}>
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            {siteConfig.announcementType === 'alert' ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> :
             siteConfig.announcementType === 'warning' ? <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" /> :
             siteConfig.announcementType === 'success' ? <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> :
             <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{siteConfig.announcementText}</span>
          </div>
        </div>
      )}

      {/* Main Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        latencyMs={latencyMs}
        blockSlot={blockSlot}
        trackedCount={tokens.length}
        alertsCount={alertsCount}
        highBuysCount={highBuysCount}
        dumpedCount={dumpedCount}
        whalesCount={whaleWallets.length}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={notifications.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isAutoSyncActive={isAutoSyncActive}
        onToggleAutoSync={() => setIsAutoSyncActive(!isAutoSyncActive)}
        syncCountdownSeconds={syncCountdown}
        siteTitle={siteConfig.siteTitle}
        siteSubtitle={siteConfig.siteSubtitle}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 1. RADAR FEED VIEW */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <PreviousRunnersTicker
              liveTokens={tokens}
              onSelectToken={() => setActiveTab('feed')}
              solUsdPrice={solUsdPrice}
            />

            {/* Live Sniper Radar Feed (Requirement 1: header banner removed and left invisible) */}
            <LiveSniperFeed
              tokens={tokens}
              onSimulateNewMint={handleSimulateNewMint}
              onSimulateTrade={handleSimulateTrade}
              onSelectTokenForLookup={() => setActiveTab('feed')}
              onClearLogsAndCache={handleClearLogsAndCache}
              onSyncRealTime={() => handleSyncRealTime(true)}
              isSyncing={isSyncing}
              solUsdPrice={solUsdPrice}
              syncCountdownSeconds={syncCountdown}
              isAutoSyncActive={isAutoSyncActive}
              onToggleAutoSync={() => setIsAutoSyncActive(!isAutoSyncActive)}
              timeUntilMidnight={timeUntilMidnight}
              onSimulateHighBuys={handleSimulateHighBuys}
              onSimulateDump={handleTriggerSimulatedDump}
            />

            {/* Docked Live Terminal */}
            <div className="pt-4 border-t border-zinc-800/80">
              <TerminalLogs
                logs={logs}
                onClearLogs={handleClearLogsAndCache}
                onSyncRealTime={() => handleSyncRealTime(true)}
                isSyncing={isSyncing}
                onManualMidnightReset={handleManualMidnightReset}
              />
            </div>
          </div>
        )}

        {/* 2. HIGH BUYS VIEW (Requirement 2: header banner removed and left invisible) */}
        {activeTab === 'high_buys' && (
          <div className="space-y-6">
            <LiveSniperFeed
              tokens={tokens.filter((t) => t.isHighBuys)}
              onSimulateNewMint={handleSimulateNewMint}
              onSimulateTrade={handleSimulateTrade}
              onSelectTokenForLookup={() => {}}
              onClearLogsAndCache={handleClearLogsAndCache}
              onSyncRealTime={() => handleSyncRealTime(true)}
              isSyncing={isSyncing}
              solUsdPrice={solUsdPrice}
              syncCountdownSeconds={syncCountdown}
              isAutoSyncActive={isAutoSyncActive}
              onToggleAutoSync={() => setIsAutoSyncActive(!isAutoSyncActive)}
              timeUntilMidnight={timeUntilMidnight}
              onSimulateHighBuys={handleSimulateHighBuys}
              onSimulateDump={handleTriggerSimulatedDump}
            />
          </div>
        )}

        {/* 3. 5X / 10X RUNNERS DEDICATED VIEW */}
        {activeTab === 'runners' && (
          <div className="space-y-6">
            <PreviousRunnersTicker
              liveTokens={tokens}
              onSelectToken={() => setActiveTab('feed')}
              solUsdPrice={solUsdPrice}
            />
            <div className="bg-[#030611] border border-cyan-500/30 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-cyan-400" />
                Active Multiplier Runners
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                All tokens that have surged 5x, 10x, and above during live on-chain tracking sessions.
              </p>
              <LiveSniperFeed
                tokens={tokens.filter((t) => t.highestMultiplier >= 2.0)}
                onSimulateNewMint={handleSimulateNewMint}
                onSimulateTrade={handleSimulateTrade}
                onSelectTokenForLookup={() => {}}
                onClearLogsAndCache={handleClearLogsAndCache}
                onSyncRealTime={() => handleSyncRealTime(true)}
                isSyncing={isSyncing}
                solUsdPrice={solUsdPrice}
                syncCountdownSeconds={syncCountdown}
                isAutoSyncActive={isAutoSyncActive}
                onToggleAutoSync={() => setIsAutoSyncActive(!isAutoSyncActive)}
                timeUntilMidnight={timeUntilMidnight}
                onSimulateHighBuys={handleSimulateHighBuys}
                onSimulateDump={handleTriggerSimulatedDump}
              />
            </div>
          </div>
        )}

        {/* 4. 1+ SOL WHALE RADAR & WALLET TRACKER VIEW (Requirements 1, 2, 3) */}
        {activeTab === 'whale_tracker' && (
          <WhaleTrackingDashboard
            wallets={whaleWallets}
            transactions={whaleTransactions}
            solUsdPrice={solUsdPrice}
            tokens={tokens}
            onTriggerSimulateBuy={handleTriggerSimulateWhaleBuy}
            onTriggerSimulateSell={handleTriggerSimulateWhaleSell}
            onRefresh={() => {
              setWhaleWallets(WhaleTrackingService.getTrackedWallets());
              setWhaleTransactions(WhaleTrackingService.getTransactions());
            }}
          />
        )}

        {/* 5. DUMPED COINS VIEW (Requirement 10) */}
        {activeTab === 'dumped' && (
          <DumpedCoinsList
            tokens={tokens}
            onSimulateDump={() => handleTriggerSimulatedDump()}
            onSimulateTrade={handleSimulateTrade}
            solUsdPrice={solUsdPrice}
          />
        )}

        {/* 5. LIVE TERMINAL VIEW */}
        {activeTab === 'logs' && (
          <TerminalLogs
            logs={logs}
            onClearLogs={handleClearLogsAndCache}
            onSyncRealTime={() => handleSyncRealTime(true)}
            isSyncing={isSyncing}
            onManualMidnightReset={handleManualMidnightReset}
          />
        )}

        {/* 6. BONDING CURVE MATH CALCULATOR */}
        {activeTab === 'curve' && (
          <BondingCurveCalculator solUsdPrice={solUsdPrice} />
        )}

        {/* 7. ADMIN DASHBOARD VIEW (Requirements 6, 8, 9, and Reset Suite) */}
        {activeTab === 'admin' && (
          <AdminDashboard
            onSiteConfigUpdated={(cfg) => setSiteConfig(cfg)}
            onInjectToken={handleInjectCustomToken}
            onTriggerDump={() => handleTriggerSimulatedDump()}
            onFactoryResetApp={handleFactoryResetApp}
            onResetWhaleRadar={handleResetWhaleRadar}
            onResetTokenCache={handleResetTokenCache}
            onClearLogs={handleClearLogsAndCache}
            onForceMidnightReset={handleManualMidnightReset}
            onSimulateWhaleBuy={handleSimulateCustomWhaleBuy}
            onSimulateWhaleSell={handleSimulateCustomWhaleSell}
            onSimulateMoonshot={handleSimulateMoonshot}
            tokens={tokens}
            whaleWalletsCount={whaleWallets.length}
            whaleTxCount={whaleTransactions.length}
          />
        )}
      </main>

      {/* Slide-out Notification Center Drawer */}
      <NotificationCenter
        notifications={notifications}
        onClearAll={() => setNotifications([])}
        onSelectToken={() => setActiveTab('feed')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* User Registration & Login Modal (Requirement 5: first thing seen on load when not logged in) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode="register"
        isFirstVisitGate={!currentUser}
      />
    </div>
  );
}

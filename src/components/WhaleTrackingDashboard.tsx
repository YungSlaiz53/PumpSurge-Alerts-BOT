/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Radar, 
  ExternalLink, 
  Copy, 
  Check, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Zap, 
  Search, 
  RefreshCw, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  History,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { TrackedWhaleWallet, WhaleTransaction, TrackedWalletHolding, TrackedToken, WhaleTradeEvent } from '../types';
import { WhaleTrackingService } from '../services/whaleTrackingService';

interface WhaleTrackingDashboardProps {
  wallets: TrackedWhaleWallet[];
  transactions: WhaleTransaction[];
  solUsdPrice: number;
  tokens: TrackedToken[];
  onTriggerSimulateBuy?: () => void;
  onTriggerSimulateSell?: () => void;
  onRefresh?: () => void;
}

export const WhaleTrackingDashboard: React.FC<WhaleTrackingDashboardProps> = ({
  wallets,
  transactions,
  solUsdPrice,
  tokens,
  onTriggerSimulateBuy,
  onTriggerSimulateSell,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'wallets' | 'stream'>('wallets');
  const [streamFilter, setStreamFilter] = useState<'all' | 'buys' | 'sells'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minSolFilter, setMinSolFilter] = useState<number>(1.0);
  const [expandedWalletAddress, setExpandedWalletAddress] = useState<string | null>(null);
  const [expandedTimelineMint, setExpandedTimelineMint] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [sortBy, setSortBy] = useState<'sol' | 'coins' | 'recent' | 'pnl'>('sol');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleToggleStar = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    WhaleTrackingService.toggleStarWallet(address);
    if (onRefresh) onRefresh();
  };

  const handleManualSellHolding = (walletAddress: string, mint: string, e: React.MouseEvent) => {
    e.stopPropagation();
    WhaleTrackingService.simulateSellForSpecificHolding(walletAddress, mint, 1.0, solUsdPrice);
    if (onRefresh) onRefresh();
  };

  // Helper to format exact date, time, and relative duration
  const formatTimeDetails = (timestamp: number) => {
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);

    let relativeStr = '';
    if (diffSec < 10) {
      relativeStr = 'just now';
    } else if (diffSec < 60) {
      relativeStr = `${diffSec}s ago`;
    } else if (diffSec < 3600) {
      relativeStr = `${Math.floor(diffSec / 60)}m ago`;
    } else {
      relativeStr = `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}m ago`;
    }

    return { dateStr, timeStr, relativeStr, full: `${dateStr} ${timeStr}` };
  };

  // Helper to format duration between buy and sell
  const formatDuration = (startMs: number, endMs: number) => {
    const diffSec = Math.max(1, Math.floor((endMs - startMs) / 1000));
    if (diffSec < 60) return `${diffSec}s`;
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  // Filtered & sorted wallets
  const filteredWallets = useMemo(() => {
    return wallets.filter((wallet) => {
      if (wallet.totalSolSpentToday < minSolFilter) return false;
      if (onlyStarred && !wallet.isStarred) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAddress = wallet.walletAddress.toLowerCase().includes(q);
        const matchesLabel = (wallet.label || '').toLowerCase().includes(q);
        const matchesCoin = wallet.holdingsToday.some(
          (h) => h.tokenSymbol.toLowerCase().includes(q) || h.tokenName.toLowerCase().includes(q) || h.mint.toLowerCase().includes(q)
        );
        return matchesAddress || matchesLabel || matchesCoin;
      }
      return true;
    }).sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;

      if (sortBy === 'sol') {
        return b.totalSolSpentToday - a.totalSolSpentToday;
      } else if (sortBy === 'coins') {
        return b.uniqueCoinsBoughtCountToday - a.uniqueCoinsBoughtCountToday;
      } else if (sortBy === 'pnl') {
        return (b.netRealizedPnlSol || 0) - (a.netRealizedPnlSol || 0);
      } else {
        return b.lastActiveToday - a.lastActiveToday;
      }
    });
  }, [wallets, minSolFilter, onlyStarred, searchQuery, sortBy]);

  // Filtered transactions for the live stream (buys and sells)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (streamFilter === 'buys' && tx.type !== 'buy') return false;
      if (streamFilter === 'sells' && tx.type !== 'sell') return false;
      if (tx.solAmount < minSolFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAddress = tx.walletAddress.toLowerCase().includes(q);
        const matchesLabel = (tx.walletLabel || '').toLowerCase().includes(q);
        const matchesCoin = tx.tokenSymbol.toLowerCase().includes(q) || tx.tokenName.toLowerCase().includes(q) || tx.mint.toLowerCase().includes(q);
        return matchesAddress || matchesLabel || matchesCoin;
      }
      return true;
    });
  }, [transactions, streamFilter, minSolFilter, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    return WhaleTrackingService.getSummaryStats(solUsdPrice);
  }, [wallets, transactions, solUsdPrice]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner - Neon Blue & Black with Touch of White */}
      <div className="relative overflow-hidden rounded-2xl bg-black border border-cyan-500/40 p-5 md:p-6 shadow-[0_0_35px_rgba(0,240,255,0.15)]">
        {/* Neon blue radial glow in background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <Radar className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                    1+ SOL Whale Radar <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono tracking-normal lowercase">buy &amp; sell tracking</span>
                  </h2>
                </div>
                <p className="text-xs text-zinc-300 font-mono">
                  Autonomous radar tracking when whales <span className="text-cyan-400 font-bold">bought the coin</span> (&ge; 1.0 SOL) and <span className="text-red-400 font-bold">when they sell the coin</span> across Solana pump.fun.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onTriggerSimulateBuy && (
              <button
                onClick={onTriggerSimulateBuy}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                title="Simulate a real-time whale buy of 1+ SOL"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>+ Simulate Whale Buy</span>
              </button>
            )}

            {onTriggerSimulateSell && (
              <button
                onClick={onTriggerSimulateSell}
                className="px-3.5 py-2 rounded-xl bg-[#090d1a] hover:bg-red-950/80 text-red-400 border border-red-500/50 font-bold text-xs flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                title="Simulate a whale taking profit or selling their holding"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Simulate Whale Sell</span>
              </button>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-xl bg-black border border-white/20 text-zinc-300 hover:text-white hover:border-cyan-400 transition"
                title="Refresh tracking data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Key Metrics Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-4 border-t border-cyan-500/20">
          <div className="bg-[#040814] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Whales Active Today</div>
            <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1">
              <span>{summary.totalWalletsCount}</span>
              <span className="text-xs text-cyan-400 font-mono">addresses</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Tracked with &ge;1.0 SOL buys</div>
          </div>

          <div className="bg-[#040814] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Total SOL Bought</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
              {summary.totalSolDeployedToday} SOL
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">≈ ${summary.totalUsdDeployedToday.toLocaleString()} USD ({summary.totalBuysCountToday} buys)</div>
          </div>

          <div className="bg-[#040814] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Total SOL Sold</div>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">
              {summary.totalSolSoldToday} SOL
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{summary.totalSellsCountToday} sell transactions</div>
          </div>

          <div className="bg-[#040814] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Realized Whale PnL</div>
            <div className={`text-2xl font-black font-mono mt-1 flex items-center gap-1 ${
              summary.netRealizedPnlSol >= 0 ? 'text-cyan-300' : 'text-red-400'
            }`}>
              <span>{summary.netRealizedPnlSol >= 0 ? `+${summary.netRealizedPnlSol}` : summary.netRealizedPnlSol} SOL</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">From sold positions today</div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-[#040814] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Top Whale of Day</div>
            <div className="text-sm font-black text-white mt-1 truncate">
              {summary.topWhale ? (summary.topWhale.label || `${summary.topWhale.walletAddress.slice(0, 6)}...${summary.topWhale.walletAddress.slice(-4)}`) : 'None'}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5 font-bold">
              {summary.topWhale ? `${summary.topWhale.totalSolSpentToday} SOL (${summary.topWhale.uniqueCoinsBoughtCountToday} coins)` : '0 SOL'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Controls & SubTabs: Wallets & Holdings vs Live Buys/Sells Stream */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black border border-white/10 p-4 rounded-xl">
        {/* Navigation Subtabs */}
        <div className="flex items-center gap-1 bg-[#060a17] border border-cyan-500/30 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('wallets')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'wallets'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Tracked Wallets &amp; Coin Trades ({filteredWallets.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stream')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'stream'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Live Buy &amp; Sell Stream ({filteredTransactions.length})</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              placeholder="Search wallet, symbol, CA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050813] border border-white/10 focus:border-cyan-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
            />
          </div>

          {/* Min SOL Filter */}
          <div className="flex items-center gap-1 bg-[#050813] border border-white/10 p-1 rounded-lg text-xs font-mono">
            <span className="text-[10px] text-zinc-400 px-1 font-sans">Min:</span>
            {[1.0, 2.5, 5.0, 10.0].map((amt) => (
              <button
                key={amt}
                onClick={() => setMinSolFilter(amt)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  minSolFilter === amt
                    ? 'bg-cyan-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {amt}S+
              </button>
            ))}
          </div>

          {/* Starred Only Toggle */}
          <button
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${
              onlyStarred
                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                : 'bg-[#050813] border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Show only starred wallets"
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Sort Selector */}
          {activeSubTab === 'wallets' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#050813] border border-white/10 text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="sol">Sort: Highest SOL Bought</option>
              <option value="coins">Sort: Most Coins Bought</option>
              <option value="pnl">Sort: Highest Realized PnL</option>
              <option value="recent">Sort: Most Recent Active</option>
            </select>
          )}
        </div>
      </div>

      {/* 4. SUB-TAB 1: TRACKED WALLETS & DETAILED COIN BUY/SELL TIMINGS */}
      {activeSubTab === 'wallets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-1">
            <span>Showing {filteredWallets.length} whale wallet(s) active today</span>
            <span>Click any wallet to inspect when they bought &amp; when they sold each coin</span>
          </div>

          {filteredWallets.length === 0 ? (
            <div className="rounded-2xl bg-black border border-white/10 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mx-auto">
                <Radar className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-white font-bold text-sm">No Wallets Matched Current Filter</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Try lowering the minimum SOL filter or clearing your search term to view all tracked whale addresses.
              </p>
              {onTriggerSimulateBuy && (
                <button
                  onClick={onTriggerSimulateBuy}
                  className="mt-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Simulate 1+ SOL Whale Buy</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWallets.map((wallet) => {
                const isExpanded = expandedWalletAddress === wallet.walletAddress;
                const isCopied = copiedKey === wallet.walletAddress;
                const timeAgoMin = Math.round((Date.now() - wallet.lastActiveToday) / (60 * 1000));
                const timeAgoStr = timeAgoMin <= 0 ? 'just now' : `${timeAgoMin}m ago`;

                const soldHoldingsCount = wallet.holdingsToday.filter((h) => h.holdingStatus === 'sold').length;
                const partialSoldHoldingsCount = wallet.holdingsToday.filter((h) => h.holdingStatus === 'partially_sold').length;
                const activeHoldingCount = wallet.holdingsToday.filter((h) => h.holdingStatus === 'holding').length;

                return (
                  <div
                    key={wallet.walletAddress}
                    className={`rounded-2xl bg-black border transition-all ${
                      isExpanded
                        ? 'border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.2)]'
                        : 'border-white/10 hover:border-cyan-400/50'
                    }`}
                  >
                    {/* Wallet Header Card */}
                    <div
                      onClick={() => setExpandedWalletAddress(isExpanded ? null : wallet.walletAddress)}
                      className="p-4 md:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                    >
                      {/* Left: Identity & Badges */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleToggleStar(wallet.walletAddress, e)}
                          className="text-zinc-500 hover:text-amber-400 transition"
                          title={wallet.isStarred ? 'Unstar wallet' : 'Star wallet'}
                        >
                          <Star className={`w-4 h-4 ${wallet.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>

                        <div className="w-10 h-10 rounded-xl bg-[#060b17] border border-cyan-400/40 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                          {wallet.label ? wallet.label.slice(0, 2).toUpperCase() : '🐋'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm md:text-base">
                              {wallet.label || `${wallet.walletAddress.slice(0, 6)}...${wallet.walletAddress.slice(-4)}`}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                              {wallet.tier}
                            </span>
                            {wallet.netRealizedPnlSol !== 0 && (
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                wallet.netRealizedPnlSol > 0
                                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-400/40'
                                  : 'bg-red-950/60 text-red-300 border-red-500/40'
                              }`}>
                                Realized: {wallet.netRealizedPnlSol > 0 ? `+${wallet.netRealizedPnlSol}` : wallet.netRealizedPnlSol} SOL
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                            <span className="text-zinc-300">
                              {wallet.walletAddress.slice(0, 8)}...{wallet.walletAddress.slice(-8)}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(wallet.walletAddress, wallet.walletAddress);
                              }}
                              className="text-zinc-500 hover:text-white transition p-0.5"
                              title="Copy Solana wallet address"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <a
                              href={`https://solscan.io/account/${wallet.walletAddress}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-zinc-500 hover:text-cyan-400 transition p-0.5"
                              title="View on Solscan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <span className="text-zinc-600">·</span>
                            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              Active {timeAgoStr}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Core Trade Metrics (Coins Bought, Holdings, Sells) */}
                      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                        {/* NUMBER OF COINS BOUGHT IN THAT DAY & HOLDING STATUS */}
                        <div className="text-left md:text-right">
                          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Coins Bought Today</div>
                          <div className="text-base md:text-lg font-black text-white flex items-center md:justify-end gap-1.5">
                            <span className="text-cyan-400 font-mono">{wallet.uniqueCoinsBoughtCountToday}</span>
                            <span>Coins</span>
                            <span className="text-xs text-zinc-400 font-normal">({wallet.totalBuysCountToday} buys)</span>
                          </div>
                          <div className="text-[10px] font-mono flex items-center md:justify-end gap-1.5 mt-0.5">
                            <span className="text-cyan-300">{activeHoldingCount} holding</span>
                            <span className="text-zinc-500">·</span>
                            <span className="text-amber-300">{partialSoldHoldingsCount} partial</span>
                            <span className="text-zinc-500">·</span>
                            <span className="text-red-400">{soldHoldingsCount} sold</span>
                          </div>
                        </div>

                        {/* TOTAL SOL DEPLOYED & SOLD */}
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Bought &amp; Sold Volume</div>
                          <div className="text-base md:text-lg font-black text-cyan-400 font-mono">
                            {wallet.totalSolSpentToday} SOL
                          </div>
                          <div className="text-[10px] text-zinc-300 font-mono">
                            Sold: <span className="text-red-400 font-bold">{wallet.totalSolSoldToday || 0} SOL</span>
                          </div>
                        </div>

                        {/* Expand / Collapse Chevron */}
                        <div className="text-zinc-400 hover:text-white transition">
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED VIEW: Coins Bought and Sold with Timestamps (Requirement 1: Show when they bought and when they sell) */}
                    {isExpanded && (
                      <div className="border-t border-cyan-500/30 p-4 md:p-5 bg-[#030611] rounded-b-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Coin Purchases &amp; Sell Executions ({wallet.holdingsToday.length} Coins)</span>
                          </h4>
                          <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Showing exact buy and sell timestamps for each coin</span>
                          </span>
                        </div>

                        {/* Holdings & Sell Executions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {wallet.holdingsToday.map((holding) => {
                            const isHoldingCopied = copiedKey === holding.mint;
                            const isProfit = holding.unrealizedPnlPercent >= 0;
                            const buyTimeInfo = formatTimeDetails(holding.firstBuyTimeToday);
                            const sellTimeInfo = holding.lastSellTimeToday ? formatTimeDetails(holding.lastSellTimeToday) : null;
                            const isTimelineOpen = expandedTimelineMint === holding.mint;

                            // Hold Duration
                            let durationLabel = '';
                            if (holding.lastSellTimeToday) {
                              durationLabel = formatDuration(holding.firstBuyTimeToday, holding.lastSellTimeToday);
                            } else {
                              durationLabel = formatDuration(holding.firstBuyTimeToday, Date.now());
                            }

                            return (
                              <div
                                key={holding.mint}
                                className={`bg-black border rounded-xl p-3.5 space-y-3 transition flex flex-col justify-between ${
                                  holding.holdingStatus === 'sold'
                                    ? 'border-red-500/30 hover:border-red-400/60'
                                    : holding.holdingStatus === 'partially_sold'
                                    ? 'border-amber-400/30 hover:border-amber-400/60'
                                    : 'border-cyan-500/30 hover:border-cyan-400/70'
                                }`}
                              >
                                <div>
                                  {/* Header: Coin Symbol & Status Tag */}
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-white text-sm">${holding.tokenSymbol}</span>
                                        <span className="text-xs text-zinc-400 truncate max-w-[110px]">{holding.tokenName}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 mt-0.5">
                                        <span>CA: {holding.mint.slice(0, 6)}...{holding.mint.slice(-4)}</span>
                                        <button
                                          onClick={() => copyToClipboard(holding.mint, holding.mint)}
                                          className="hover:text-white p-0.5"
                                          title="Copy token contract address"
                                        >
                                          {isHoldingCopied ? <Check className="w-2.5 h-2.5 text-cyan-400" /> : <Copy className="w-2.5 h-2.5" />}
                                        </button>
                                        <a
                                          href={`https://pump.fun/${holding.mint}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="hover:text-cyan-400 p-0.5"
                                          title="View on Pump.fun"
                                        >
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="text-right">
                                      {holding.holdingStatus === 'sold' ? (
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-300 uppercase">
                                          100% Sold
                                        </span>
                                      ) : holding.holdingStatus === 'partially_sold' ? (
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300 uppercase">
                                          Partial Sold
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/50 text-cyan-300 uppercase">
                                          Holding
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* CORE FEATURE: WHEN THEY BOUGHT AND WHEN THEY SELL THE COIN */}
                                  <div className="mt-3 p-2.5 rounded-lg bg-[#060b17] border border-cyan-500/20 space-y-2 text-xs font-mono">
                                    {/* WHEN BOUGHT */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                        <span>Bought:</span>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-white font-bold">{buyTimeInfo.timeStr}</div>
                                        <div className="text-[10px] text-zinc-400">{buyTimeInfo.dateStr} ({buyTimeInfo.relativeStr})</div>
                                      </div>
                                    </div>

                                    {/* WHEN SOLD (OR STILL HOLDING) */}
                                    <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-white/5">
                                      <div className="flex items-center gap-1.5">
                                        {sellTimeInfo ? (
                                          <span className="flex items-center gap-1.5 text-red-400 font-bold">
                                            <span className="w-2 h-2 rounded-full bg-red-400" />
                                            <span>Sold:</span>
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                                            <span className="w-2 h-2 rounded-full bg-cyan-500/40" />
                                            <span>Sold:</span>
                                          </span>
                                        )}
                                      </div>

                                      <div className="text-right">
                                        {sellTimeInfo ? (
                                          <>
                                            <div className="text-red-300 font-bold">{sellTimeInfo.timeStr}</div>
                                            <div className="text-[10px] text-zinc-400">{sellTimeInfo.dateStr} ({sellTimeInfo.relativeStr})</div>
                                          </>
                                        ) : (
                                          <span className="text-[11px] text-cyan-300 font-mono italic">
                                            No sells yet (Still holding)
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* HOLD DURATION SUMMARY */}
                                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5">
                                      <span>Hold Duration:</span>
                                      <span className="text-white font-bold">
                                        {holding.holdingStatus === 'sold' ? `Held for ${durationLabel}` : `Holding for ${durationLabel}`}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Financial Metrics */}
                                  <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs font-mono">
                                    <div>
                                      <div className="text-[10px] text-zinc-400">Total Bought</div>
                                      <div className="text-cyan-400 font-bold">{holding.totalSolBoughtToday} SOL</div>
                                      <div className="text-[10px] text-zinc-400">({holding.buyCountToday} buys)</div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-[10px] text-zinc-400">Total Sold</div>
                                      <div className="text-red-400 font-bold">{holding.totalSolSoldToday || 0} SOL</div>
                                      <div className="text-[10px] text-zinc-400">({holding.sellCountToday || 0} sells)</div>
                                    </div>

                                    <div>
                                      <div className="text-[10px] text-zinc-400">Tokens Left</div>
                                      <div className="text-white font-bold">{holding.remainingTokens.toLocaleString()}</div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-[10px] text-zinc-400">Multiplier / PnL</div>
                                      <div className={`font-bold flex items-center justify-end gap-1 ${isProfit ? 'text-cyan-300' : 'text-red-400'}`}>
                                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        <span>{holding.currentMultiplier.toFixed(2)}x ({isProfit ? `+${holding.unrealizedPnlPercent}%` : `${holding.unrealizedPnlPercent}%`})</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions & Interactive Timeline Drawer Button */}
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                  <div className="flex items-center justify-between gap-2">
                                    {/* Toggle Trade Timeline */}
                                    <button
                                      onClick={() => setExpandedTimelineMint(isTimelineOpen ? null : holding.mint)}
                                      className="text-[11px] font-mono text-cyan-400 hover:text-white flex items-center gap-1 transition"
                                    >
                                      <History className="w-3 h-3" />
                                      <span>{isTimelineOpen ? 'Hide History' : `Trade Flow (${holding.tradeTimeline?.length || 1})`}</span>
                                      {isTimelineOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>

                                    {/* Simulate Sell on this holding */}
                                    {holding.remainingTokens > 0 && (
                                      <button
                                        onClick={(e) => handleManualSellHolding(wallet.walletAddress, holding.mint, e)}
                                        className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1 transition shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                                        title="Simulate this whale selling this coin right now"
                                      >
                                        <ArrowDownRight className="w-3 h-3" />
                                        <span>Sell Coin</span>
                                      </button>
                                    )}
                                  </div>

                                  {/* Detailed Chronological Timeline Drawer */}
                                  {isTimelineOpen && (
                                    <div className="mt-2 p-2.5 rounded-lg bg-[#02050e] border border-cyan-500/30 space-y-2">
                                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                        Audit Trail: When Whale Bought &amp; Sold ${holding.tokenSymbol}
                                      </div>
                                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {holding.tradeTimeline?.map((item, idx) => {
                                          const itemTime = formatTimeDetails(item.timestamp);
                                          const isBuy = item.type === 'buy';

                                          return (
                                            <div
                                              key={item.id || idx}
                                              className={`p-2 rounded border text-[11px] font-mono ${
                                                isBuy
                                                  ? 'bg-cyan-950/30 border-cyan-500/30 text-white'
                                                  : 'bg-red-950/30 border-red-500/30 text-white'
                                              }`}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 font-bold">
                                                  {isBuy ? (
                                                    <span className="text-cyan-400 flex items-center gap-1">
                                                      <ArrowUpRight className="w-3 h-3" /> BOUGHT
                                                    </span>
                                                  ) : (
                                                    <span className="text-red-400 flex items-center gap-1">
                                                      <ArrowDownRight className="w-3 h-3" /> SOLD
                                                    </span>
                                                  )}
                                                  <span>{item.solAmount} SOL</span>
                                                </div>
                                                <div className="text-zinc-400 text-[10px]">
                                                  {itemTime.timeStr}
                                                </div>
                                              </div>

                                              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                                                <span>{item.tokenAmount.toLocaleString()} tokens</span>
                                                <a
                                                  href={`https://solscan.io/tx/${item.signature}`}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-cyan-400 hover:underline flex items-center gap-0.5"
                                                >
                                                  <span>tx: {item.signature.slice(0, 6)}...</span>
                                                  <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                              </div>

                                              {!isBuy && item.profitSol !== undefined && (
                                                <div className="text-[10px] mt-1 pt-1 border-t border-red-500/20 text-right">
                                                  <span className={item.profitSol >= 0 ? 'text-cyan-300 font-bold' : 'text-red-400 font-bold'}>
                                                    PnL: {item.profitSol >= 0 ? `+${item.profitSol}` : item.profitSol} SOL ({item.pnlPercent || 0}%)
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 2: LIVE 1+ SOL BUYS & SELLS STREAM */}
      {activeSubTab === 'stream' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 font-mono px-1">
            <div className="flex items-center gap-2">
              <span>Filter Stream:</span>
              <div className="flex items-center gap-1 bg-[#050813] border border-white/10 p-0.5 rounded-lg">
                <button
                  onClick={() => setStreamFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                    streamFilter === 'all' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All Activity ({transactions.length})
                </button>
                <button
                  onClick={() => setStreamFilter('buys')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                    streamFilter === 'buys' ? 'bg-cyan-500 text-black' : 'text-cyan-300 hover:text-white'
                  }`}
                >
                  🟢 1+ SOL Buys ({transactions.filter((t) => t.type === 'buy').length})
                </button>
                <button
                  onClick={() => setStreamFilter('sells')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                    streamFilter === 'sells' ? 'bg-red-500 text-black' : 'text-red-400 hover:text-white'
                  }`}
                >
                  🔴 Whale Sells ({transactions.filter((t) => t.type === 'sell').length})
                </button>
              </div>
            </div>

            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Live On-Chain Radar: Buys &amp; Sells
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl bg-black border border-white/10 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mx-auto">
                <Radar className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-white font-bold text-sm">No Transactions in Current Filter</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No buy or sell transactions matched your filter. Click below to simulate live whale executions.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {onTriggerSimulateBuy && (
                  <button
                    onClick={onTriggerSimulateBuy}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>Simulate 1+ SOL Buy</span>
                  </button>
                )}
                {onTriggerSimulateSell && (
                  <button
                    onClick={onTriggerSimulateSell}
                    className="px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 font-bold text-xs inline-flex items-center gap-1.5"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Simulate Whale Sell</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => {
                const isCopied = copiedKey === tx.id;
                const isBuy = tx.type === 'buy';
                const isMega = tx.solAmount >= 10.0;
                const timeInfo = formatTimeDetails(tx.timestamp);

                return (
                  <div
                    key={tx.id}
                    className={`rounded-xl bg-black border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isBuy
                        ? isMega
                          ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                          : 'border-cyan-500/30 hover:border-cyan-400/60'
                        : 'border-red-500/40 hover:border-red-400/70 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    }`}
                  >
                    {/* Left: Trade Direction, SOL Amount, Coin info */}
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-mono font-bold text-xs flex flex-col items-center justify-center min-w-[65px] ${
                        isBuy
                          ? isMega
                            ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-400/50'
                          : 'bg-red-950 text-red-300 border border-red-500/50'
                      }`}>
                        <div className="flex items-center gap-0.5 text-[9px] uppercase font-black">
                          {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{isBuy ? 'BOUGHT' : 'SOLD'}</span>
                        </div>
                        <span className="text-sm font-black">{tx.solAmount}</span>
                        <span className="text-[8px]">SOL</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">${tx.tokenSymbol}</span>
                          <span className="text-xs text-zinc-400">{tx.tokenName}</span>

                          {isBuy && isMega && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400 text-black font-black uppercase">
                              MEGA WHALE BUY
                            </span>
                          )}

                          {!isBuy && tx.realizedProfitSol !== undefined && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                              tx.realizedProfitSol >= 0
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-400/40'
                                : 'bg-red-950 text-red-400 border-red-500/40'
                            }`}>
                              {tx.realizedProfitSol >= 0 ? `+${tx.realizedProfitSol} SOL (+${tx.realizedPnlPercent}%)` : `${tx.realizedProfitSol} SOL (${tx.realizedPnlPercent}%)`}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
                          <span>Wallet:</span>
                          <span className="text-cyan-300 font-bold">
                            {tx.walletLabel || `${tx.walletAddress.slice(0, 6)}...${tx.walletAddress.slice(-4)}`}
                          </span>

                          <button
                            onClick={() => copyToClipboard(tx.walletAddress, tx.id)}
                            className="hover:text-white p-0.5"
                            title="Copy wallet address"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                          </button>

                          <a
                            href={`https://solscan.io/account/${tx.walletAddress}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-cyan-400 p-0.5"
                            title="View wallet on Solscan"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          {/* Reference to original buy time if this is a sell */}
                          {!isBuy && tx.initialBuyTimestamp && (
                            <>
                              <span className="text-zinc-600">·</span>
                              <span className="text-[10px] text-zinc-400">
                                (Initial Buy: {new Date(tx.initialBuyTimestamp).toLocaleTimeString()})
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Tokens Transacted, Execution Timestamp, Solscan */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 text-right font-mono text-xs">
                      <div>
                        <div className="text-white font-bold">{tx.tokenAmount.toLocaleString()} tokens</div>
                        <div className="text-[10px] text-zinc-400">≈ ${(tx.solAmount * solUsdPrice).toLocaleString()} USD</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className={isBuy ? 'text-cyan-300 font-bold' : 'text-red-300 font-bold'}>
                            {timeInfo.timeStr}
                          </div>
                          <div className="text-[10px] text-zinc-500">{timeInfo.relativeStr}</div>
                        </div>

                        <a
                          href={`https://solscan.io/tx/${tx.signature}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 p-1.5 rounded bg-[#060b17] border border-cyan-500/30"
                          title="View on Solscan Explorer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

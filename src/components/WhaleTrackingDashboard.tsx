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
  Zap, 
  Search, 
  Filter, 
  RefreshCw, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Clock, 
  ArrowUpRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { TrackedWhaleWallet, WhaleBuyTransaction, TrackedWalletHolding, TrackedToken } from '../types';
import { WhaleTrackingService } from '../services/whaleTrackingService';

interface WhaleTrackingDashboardProps {
  wallets: TrackedWhaleWallet[];
  transactions: WhaleBuyTransaction[];
  solUsdPrice: number;
  tokens: TrackedToken[];
  onTriggerSimulateBuy?: () => void;
  onRefresh?: () => void;
}

export const WhaleTrackingDashboard: React.FC<WhaleTrackingDashboardProps> = ({
  wallets,
  transactions,
  solUsdPrice,
  tokens,
  onTriggerSimulateBuy,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'wallets' | 'stream'>('wallets');
  const [searchQuery, setSearchQuery] = useState('');
  const [minSolFilter, setMinSolFilter] = useState<number>(1.0);
  const [expandedWalletAddress, setExpandedWalletAddress] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [sortBy, setSortBy] = useState<'sol' | 'coins' | 'recent'>('sol');

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

  // Filtered & sorted wallets
  const filteredWallets = useMemo(() => {
    return wallets.filter((wallet) => {
      // Min SOL filter
      if (wallet.totalSolSpentToday < minSolFilter) return false;
      // Starred filter
      if (onlyStarred && !wallet.isStarred) return false;
      // Search query (wallet address, label, or token symbols)
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
      } else {
        return b.lastActiveToday - a.lastActiveToday;
      }
    });
  }, [wallets, minSolFilter, onlyStarred, searchQuery, sortBy]);

  // Filtered transactions for the live stream
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
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
  }, [transactions, minSolFilter, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalWallets = wallets.length;
    const totalSol = +wallets.reduce((acc, w) => acc + w.totalSolSpentToday, 0).toFixed(2);
    const totalUsd = Math.round(totalSol * solUsdPrice);
    const totalBuys = wallets.reduce((acc, w) => acc + w.totalBuysCountToday, 0);
    const topWhale = [...wallets].sort((a, b) => b.totalSolSpentToday - a.totalSolSpentToday)[0] || null;

    return {
      totalWallets,
      totalSol,
      totalUsd,
      totalBuys,
      topWhale,
    };
  }, [wallets, solUsdPrice]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner - Neon Blue & Black with Touch of White */}
      <div className="relative overflow-hidden rounded-2xl bg-black border border-cyan-500/40 p-5 md:p-6 shadow-[0_0_30px_rgba(0,240,255,0.12)]">
        {/* Neon blue radial glow in background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.35)]">
                <Radar className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                    1+ SOL Whale Radar <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono tracking-normal lowercase">live stream</span>
                  </h2>
                </div>
                <p className="text-xs text-zinc-300 font-mono">
                  Autonomous wallet tracking engine capturing all addresses executing <span className="text-cyan-300 font-bold">1.0 SOL and above</span> buys across Pump.fun on Solana.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onTriggerSimulateBuy && (
              <button
                onClick={onTriggerSimulateBuy}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>Simulate 1+ SOL Buy</span>
              </button>
            )}

            <button
              onClick={() => {
                WhaleTrackingService.clearDailyData();
                if (onRefresh) onRefresh();
              }}
              className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Reset today's tracking data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
              <span>Reset Day</span>
            </button>
          </div>
        </div>

        {/* 2. Key Metrics Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#050813] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Whales Tracked Today</div>
            <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1">
              <span>{summary.totalWallets}</span>
              <span className="text-xs text-cyan-400 font-mono">wallets</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">$\ge$ 1.0 SOL buys only</div>
          </div>

          <div className="bg-[#050813] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Total SOL Deployed</div>
            <div className="text-2xl font-black text-cyan-400 mt-1 flex items-baseline gap-1.5">
              <span>{summary.totalSol}</span>
              <span className="text-xs text-white font-mono">SOL</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">≈ ${summary.totalUsd.toLocaleString()} USD</div>
          </div>

          <div className="bg-[#050813] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">1+ SOL Buys Executed</div>
            <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1">
              <span>{summary.totalBuys}</span>
              <span className="text-xs text-cyan-400 font-mono">transactions</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Recorded in real-time</div>
          </div>

          <div className="bg-[#050813] border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Top Whale of the Day</div>
            <div className="text-sm font-black text-white mt-1 truncate">
              {summary.topWhale ? (summary.topWhale.label || `${summary.topWhale.walletAddress.slice(0, 6)}...${summary.topWhale.walletAddress.slice(-4)}`) : 'None'}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5 font-bold">
              {summary.topWhale ? `${summary.topWhale.totalSolSpentToday} SOL (${summary.topWhale.uniqueCoinsBoughtCountToday} coins)` : '0 SOL'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Controls & SubTabs: Wallets & Holdings vs Live Buys Stream */}
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
            <span>Tracked Wallets &amp; Daily Holdings ({filteredWallets.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stream')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'stream'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Live 1+ SOL Buys Stream ({filteredTransactions.length})</span>
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
              <option value="sol">Sort: Highest SOL</option>
              <option value="coins">Sort: Most Coins Bought</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
          )}
        </div>
      </div>

      {/* 4. SUB-TAB 1: TRACKED WALLETS & DAILY HOLDINGS (Requirement 1 & 2) */}
      {activeSubTab === 'wallets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-1">
            <span>Showing {filteredWallets.length} whale wallet(s) active today</span>
            <span>Click any wallet to inspect all coins bought &amp; holdings</span>
          </div>

          {filteredWallets.length === 0 ? (
            <div className="rounded-2xl bg-black border border-white/10 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mx-auto">
                <Radar className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-white font-bold text-sm">No Wallets Matched Current Filter</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Try lowering the minimum SOL filter (e.g. 1.0 SOL) or clearing your search term to see all tracked addresses.
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

                      {/* Right: Requirement 2 Core Stats - Coins bought today & Total SOL */}
                      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                        {/* NUMBER OF COINS BOUGHT IN THAT DAY / HOLDING */}
                        <div className="text-left md:text-right">
                          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Coins Bought Today</div>
                          <div className="text-base md:text-lg font-black text-white flex items-center md:justify-end gap-1.5">
                            <span className="text-cyan-400 font-mono">{wallet.uniqueCoinsBoughtCountToday}</span>
                            <span>Coins</span>
                            <span className="text-xs text-zinc-400 font-normal">({wallet.totalBuysCountToday} buys)</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {wallet.holdingsToday.filter((h) => h.holdingStatus === 'holding').length} currently holding
                          </div>
                        </div>

                        {/* TOTAL SOL DEPLOYED TODAY */}
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Deployed Today</div>
                          <div className="text-base md:text-lg font-black text-cyan-400 font-mono">
                            {wallet.totalSolSpentToday} SOL
                          </div>
                          <div className="text-[10px] text-zinc-300 font-mono">
                            ≈ ${(wallet.totalSolSpentToday * solUsdPrice).toLocaleString()} USD
                          </div>
                        </div>

                        {/* Expand / Collapse Chevron */}
                        <div className="text-zinc-400 hover:text-white transition">
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED VIEW: Coins Bought In That Day & Holding Breakdown (Requirement 2) */}
                    {isExpanded && (
                      <div className="border-t border-cyan-500/30 p-4 md:p-5 bg-[#030611] rounded-b-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Breakdown of Coins Bought &amp; Holdings Today ({wallet.holdingsToday.length} Coins)</span>
                          </h4>
                          <span className="text-[11px] font-mono text-cyan-300">
                            Aggregated across all &ge; 1.0 SOL transactions
                          </span>
                        </div>

                        {/* Holdings Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {wallet.holdingsToday.map((holding) => {
                            const isHoldingCopied = copiedKey === holding.mint;
                            const isProfit = holding.unrealizedPnlPercent >= 0;

                            return (
                              <div
                                key={holding.mint}
                                className="bg-black border border-white/10 hover:border-cyan-400/50 rounded-xl p-3.5 space-y-2.5 transition"
                              >
                                {/* Coin Symbol & Name */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-white text-sm">${holding.tokenSymbol}</span>
                                      <span className="text-xs text-zinc-400 truncate max-w-[120px]">{holding.tokenName}</span>
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

                                  {/* Status tag */}
                                  <div className="text-right">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/40 text-cyan-300 uppercase">
                                      {holding.holdingStatus}
                                    </span>
                                  </div>
                                </div>

                                {/* Financial Details */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                                  <div>
                                    <div className="text-[10px] text-zinc-400">Total SOL Bought</div>
                                    <div className="text-cyan-400 font-bold">{holding.totalSolBoughtToday} SOL</div>
                                    <div className="text-[10px] text-zinc-400">({holding.buyCountToday} buy txns)</div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-[10px] text-zinc-400">Tokens Received</div>
                                    <div className="text-white font-bold">{holding.totalTokensBoughtToday.toLocaleString()}</div>
                                    <div className="text-[10px] text-zinc-400">on bonding curve</div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] text-zinc-400">Avg Buy Price</div>
                                    <div className="text-zinc-200">{holding.averageBuyPriceSol.toFixed(9)} SOL</div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-[10px] text-zinc-400">Current Multiplier</div>
                                    <div className={`font-bold flex items-center justify-end gap-1 ${isProfit ? 'text-cyan-300' : 'text-red-400'}`}>
                                      <TrendingUp className="w-3 h-3" />
                                      <span>{holding.currentMultiplier.toFixed(2)}x ({isProfit ? `+${holding.unrealizedPnlPercent}%` : `${holding.unrealizedPnlPercent}%`})</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Recent Transactions by this whale */}
                        {wallet.transactionsToday.length > 0 && (
                          <div className="pt-2">
                            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                              Recent 1+ SOL Buy Transactions for this Wallet:
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {wallet.transactionsToday.map((tx) => (
                                <div
                                  key={tx.id}
                                  className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-black border border-white/5 hover:border-cyan-500/30"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-cyan-400 font-bold">{tx.solAmount} SOL</span>
                                    <span className="text-zinc-400">&rarr;</span>
                                    <span className="text-white font-bold">${tx.tokenSymbol}</span>
                                    <span className="text-zinc-400">({tx.tokenAmount.toLocaleString()} tokens)</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-400">
                                    <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                                    <a
                                      href={`https://solscan.io/tx/${tx.signature}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-cyan-400 hover:text-cyan-300 p-0.5"
                                      title="View Solana Transaction"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 2: LIVE 1+ SOL BUYS STREAM (Requirement 1) */}
      {activeSubTab === 'stream' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-1">
            <span>Showing {filteredTransactions.length} transaction(s) with &ge; {minSolFilter} SOL</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Live On-Chain Radar
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl bg-black border border-white/10 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mx-auto">
                <Radar className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-white font-bold text-sm">No 1+ SOL Buys in Current Filter</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No transactions matched your search or minimum SOL limit. Lower the filter or click below to simulate live whale buys.
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
            <div className="space-y-2">
              {filteredTransactions.map((tx) => {
                const isCopied = copiedKey === tx.id;
                const isMega = tx.solAmount >= 10.0;
                const isHigh = tx.solAmount >= 5.0;

                return (
                  <div
                    key={tx.id}
                    className={`rounded-xl bg-black border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isMega
                        ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                        : isHigh
                        ? 'border-cyan-500/50'
                        : 'border-white/10 hover:border-cyan-400/40'
                    }`}
                  >
                    {/* Left: Buy Amount & Coin Details */}
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-mono font-bold text-xs flex flex-col items-center justify-center ${
                        isMega
                          ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                          : isHigh
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50'
                          : 'bg-[#060b17] text-white border border-white/20'
                      }`}>
                        <span className="text-sm font-black">{tx.solAmount}</span>
                        <span className="text-[9px] uppercase">SOL</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">${tx.tokenSymbol}</span>
                          <span className="text-xs text-zinc-400">{tx.tokenName}</span>
                          {isMega && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-400 text-black font-black uppercase">
                              MEGA WHALE BUY
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-0.5">
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
                        </div>
                      </div>
                    </div>

                    {/* Right: Tokens Received & Timestamp */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 text-right font-mono text-xs">
                      <div>
                        <div className="text-white font-bold">{tx.tokenAmount.toLocaleString()} tokens</div>
                        <div className="text-[10px] text-zinc-400">≈ ${(tx.solAmount * solUsdPrice).toLocaleString()} USD</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                        <a
                          href={`https://solscan.io/tx/${tx.signature}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 p-1 rounded bg-[#060b17] border border-cyan-500/30"
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

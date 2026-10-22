/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pump.fun Protocol Core Constants
 */
export const PUMP_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
export const PUMP_FEE_RECIPIENT = 'CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM';

// Initial virtual reserves in lamports & raw token units (6 decimals)
// virtualSolReserves = 30 * 10^9 = 30 SOL
// virtualTokenReserves = 1,073,000,000 * 10^6
// total token supply = 1,000,000,000 * 10^6 (1 Billion tokens)
export const INITIAL_VIRTUAL_SOL_RESERVES = 30_000_000_000n;
export const INITIAL_VIRTUAL_TOKEN_RESERVES = 1_073_000_000_000_000n;
export const TOTAL_TOKEN_SUPPLY = 1_000_000_000_000_000n;
export const LAMPORTS_PER_SOL = 1_000_000_000;
export const TOKEN_DECIMALS = 6;

/**
 * Parsed Create Event emitted on new token creation
 */
export interface PumpCreateEvent {
  signature: string;
  slot: number;
  timestamp: number;
  name: string;
  symbol: string;
  uri: string;
  mint: string;
  bondingCurve: string;
  associatedBondingCurve?: string;
  user: string; // Dev creator wallet
  virtualSolReserves: bigint;
  virtualTokenReserves: bigint;
  initialPriceSol: number;
  initialMarketCapSol: number;
  initialMarketCapUsd: number;
}

/**
 * Parsed Trade Event emitted on bonding curve Buy/Sell
 */
export interface PumpTradeEvent {
  signature: string;
  slot: number;
  timestamp: number;
  mint: string;
  solAmount: bigint;
  tokenAmount: bigint;
  isBuy: boolean;
  user: string;
  virtualSolReserves: bigint;
  virtualTokenReserves: bigint;
  realSolReserves?: bigint;
  realTokenReserves?: bigint;
  priceSol: number;
  marketCapSol: number;
}

/**
 * Tracked token state stored in memory for real-time 5x/10x surge monitoring
 */
export interface TrackedToken {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  creator: string;
  bondingCurve: string;
  createdAt: number; // Unix epoch ms
  initialPriceSol: number;
  initialMarketCapSol: number;
  initialMarketCapUsd?: number;
  currentPriceSol: number;
  currentMarketCapSol: number;
  currentMarketCapUsd: number;
  highestMultiplier: number;
  notified5x: boolean;
  notified10x: boolean;
  surgeTime5x?: number; // ms elapsed until 5x
  surgeTime10x?: number; // ms elapsed until 10x
  tradeCount: number;
  buyCount: number;
  sellCount: number;
  volumeSol: number;
  lastTradeTimestamp: number;
  isHighBuys?: boolean;
  buyVelocity?: number; // buy dominance % or velocity rating
  priceChange10s?: number; // price % change in last 10s sync cycle
  priceChange15s?: number; // legacy backward compatibility
  prevPriceSol?: number;
  isDumped?: boolean; // Token fell below 3x threshold
  dumpPeakMultiplier?: number; // The peak multiplier it fell from
  dumpCurrentMultiplier?: number; // Current multiplier < 3x
  dumpDropPercent?: number; // Drawdown from peak %
  dumpTimestamp?: number;
  dumpWarning?: boolean; // Active "Warning Coin Dumping" alert
}

/**
 * User notification & app preferences stored in live database
 */
export interface UserPreferences {
  minLiquidityFilterSol: number;
  notify5x: boolean;
  notify10x: boolean;
  notify10sNewCoins: boolean;
  notify15sNewCoins?: boolean;
  notifyHighBuys: boolean;
  notifyDumpWarning?: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
  autoSyncIntervalSeconds: number; // default 10 seconds
  autoResetMidnight: boolean;
}

/**
 * Application & Solana Node Configuration
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  solanaRpcUrl: string;
  solanaWssUrl: string;
  solanaCommitment: 'processed' | 'confirmed' | 'finalized';
  pumpProgramId: string;
  priceSurgeWindowSeconds: number;
  minLiquiditySol: number;
  surgeMultiplier5x: number;
  surgeMultiplier10x: number;
  solUsdPrice: number;
}

/**
 * Real-time event log entry for live terminal display & synchronization
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'success' | 'alert' | 'error';
  tag: string;
  message: string;
  data?: any;
}

/**
 * Runtime telemetry and performance metrics
 */
export interface BotTelemetry {
  isConnected: boolean;
  activeWssUrl: string;
  startTime: number;
  totalTokensDetected: number;
  totalTradesProcessed: number;
  totalAlertsDispatched: number;
  surges5xCount: number;
  surges10xCount: number;
  lastBlockSlot: number;
  averageLatencyMs: number;
  trackedTokensActiveCount: number;
  recentTokens: TrackedToken[];
}

/**
 * Execution event type for Whale Radar
 */
export type WhaleTradeType = 'buy' | 'sell';

/**
 * Whale Transaction event (Buy or Sell)
 */
export interface WhaleTransaction {
  id: string;
  type: WhaleTradeType;
  signature: string;
  slot?: number;
  timestamp: number; // Exact execution time when bought or sold
  walletAddress: string;
  walletLabel?: string;
  mint: string;
  tokenSymbol: string;
  tokenName: string;
  solAmount: number; // For buy: SOL spent (>= 1.0 SOL). For sell: SOL received.
  solUsdValue: number;
  tokenAmount: number; // Tokens bought or sold
  priceSol: number;
  priceUsd: number;
  currentMultiplier?: number;
  realizedProfitSol?: number; // Profit or loss in SOL if this was a sell
  realizedPnlPercent?: number; // Percentage gain/loss on this sale
  initialBuyTimestamp?: number; // Reference to when the whale originally bought
  holdDurationMs?: number; // Time elapsed between initial buy and this sell
  holdingStatus: 'holding' | 'partially_sold' | 'sold';
}

/**
 * Backward compatibility alias
 */
export type WhaleBuyTransaction = WhaleTransaction;

/**
 * Chronological buy/sell order event in a token holding lifecycle
 */
export interface WhaleTradeEvent {
  id: string;
  type: WhaleTradeType;
  timestamp: number;
  solAmount: number;
  tokenAmount: number;
  priceSol: number;
  signature: string;
  profitSol?: number;
  pnlPercent?: number;
}

/**
 * Breakdown of a specific coin bought and/or sold today by a tracked wallet
 */
export interface TrackedWalletHolding {
  mint: string;
  tokenSymbol: string;
  tokenName: string;
  // BUY Execution Times & Data
  firstBuyTimeToday: number; // Exact timestamp of initial buy
  lastBuyTimeToday: number; // Exact timestamp of latest buy
  buyCountToday: number;
  totalSolBoughtToday: number;
  totalTokensBoughtToday: number;
  averageBuyPriceSol: number;

  // SELL Execution Times & Data (When they sold)
  firstSellTimeToday?: number; // Exact timestamp of initial sell (if any)
  lastSellTimeToday?: number; // Exact timestamp of latest sell (if any)
  sellCountToday: number;
  totalSolSoldToday: number;
  totalTokensSoldToday: number;
  remainingTokens: number;
  realizedPnlSol: number; // Realized profit/loss in SOL

  // Current market valuation & Status
  currentPriceSol: number;
  currentMultiplier: number;
  unrealizedPnlSol: number;
  unrealizedPnlPercent: number;
  holdingStatus: 'holding' | 'partially_sold' | 'sold';

  // Complete Chronological Audit Trail of Buys and Sells
  tradeTimeline: WhaleTradeEvent[];
}

/**
 * Aggregated whale wallet tracking profile for the day
 */
export interface TrackedWhaleWallet {
  walletAddress: string;
  label?: string;
  avatarSeed?: string;
  firstActiveToday: number;
  lastActiveToday: number;
  totalBuysCountToday: number; // Count of >= 1 SOL buy transactions executed today
  totalSellsCountToday: number; // Count of sell transactions executed today
  uniqueCoinsBoughtCountToday: number; // Number of distinct coins bought today
  totalSolSpentToday: number; // Cumulative SOL deployed across buys today
  totalSolSoldToday: number; // Cumulative SOL received from sales today
  netRealizedPnlSol: number; // Total realized PnL today
  holdingsToday: TrackedWalletHolding[]; // Detailed breakdown of coins bought and sold today
  transactionsToday: WhaleTransaction[];
  isStarred?: boolean;
  tier: 'Mega Whale (10+ SOL)' | 'High Roller (5+ SOL)' | 'Active Whale (1+ SOL)';
}

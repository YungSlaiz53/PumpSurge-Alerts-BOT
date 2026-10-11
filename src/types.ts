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
  channelMessageId?: number; // Telegram message ID of original alert for replies
  lastTradeTimestamp: number;
}

/**
 * User notification settings for interactive Telegram DM
 */
export interface UserPreferences {
  userId: number;
  username?: string;
  firstName?: string;
  notifyAllListings: boolean;
  notifySurgesOnly: boolean;
  minLiquidityFilterSol: number;
  joinedAt: number;
}

/**
 * Bot Environment Configuration interface
 */
export interface BotConfig {
  telegramBotToken: string;
  telegramChannelId: string;
  telegramAdminUserId?: string;
  solanaRpcUrl: string;
  solanaWssUrl: string;
  solanaCommitment: 'processed' | 'confirmed' | 'finalized';
  pumpProgramId: string;
  priceSurgeWindowSeconds: number;
  minLiquiditySol: number;
  surgeMultiplier5x: number;
  surgeMultiplier10x: number;
  affiliateRefs: {
    trojan: string;
    bonkbot: string;
    maestro: string;
    bullx: string;
  };
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

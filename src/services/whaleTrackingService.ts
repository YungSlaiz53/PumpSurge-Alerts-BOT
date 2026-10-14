/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrackedToken, TrackedWhaleWallet, WhaleBuyTransaction, TrackedWalletHolding } from '../types';

const STORAGE_WALLETS_KEY = 'pumpsurge_whale_wallets_v2';
const STORAGE_TXS_KEY = 'pumpsurge_whale_txs_v2';
const STORAGE_DATE_KEY = 'pumpsurge_whale_date_v2';

// Realistic sample whale wallets with Solana addresses
const KNOWN_WHALE_POOLS: Array<{ address: string; label: string }> = [
  { address: '5tzFkiKscmoV34hV8pQkQLxHgy6e7Xk93HqB9MvyBfD', label: 'AlphaSniper.sol' },
  { address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtXkP1', label: 'Whale_01 (Raydium Alpha)' },
  { address: '83hPqKzLMn3y8Vq7wXzB6QeH5T1vM4R8sK9jN2pD7uF', label: 'BondingCurveTitan' },
  { address: '4vM7Kq9LhF3t2pX8wQ6nR5mZ1sB4cV7jE8dY2uT9wA', label: 'DegenChad.sol' },
  { address: '6qW8PzLm1k4Rt9v2yX5Bc7N8sQ3jH6eD4uF1mA9zT2', label: 'SmartAccumulator' },
  { address: '2kR9Xp7mQ3v8T1y6wB5Nc4L8sD2jH9eF6uA1mZ4tY7', label: 'SolFrontRunner' },
  { address: '7mQ2kR9Xp8T1y6wB5Nc4L8sD2jH9eF6uA1mZ4tY9P3', label: 'PumpFunMaxi' },
  { address: '3yX5Bc7N8sQ3jH6eD4uF1mA9zT25tzFkiKscmoV34hV', label: 'MegaLiquidityWhale' },
];

export class WhaleTrackingService {
  private static wallets: Map<string, TrackedWhaleWallet> = new Map();
  private static transactions: WhaleBuyTransaction[] = [];
  private static isInitialized = false;

  /**
   * Initializes the whale tracking registry from localStorage or seeded demo data
   */
  public static init(tokens: TrackedToken[] = [], solUsdPrice: number = 150): void {
    if (this.isInitialized) return;

    // Check if day changed
    const todayStr = new Date().toISOString().slice(0, 10);
    let storedDate = '';
    try {
      storedDate = localStorage.getItem(STORAGE_DATE_KEY) || '';
    } catch {
      // ignore
    }

    if (storedDate && storedDate !== todayStr) {
      // Reset daily tracking for the new day
      this.clearDailyData();
      try {
        localStorage.setItem(STORAGE_DATE_KEY, todayStr);
      } catch {
        // ignore
      }
    } else if (!storedDate) {
      try {
        localStorage.setItem(STORAGE_DATE_KEY, todayStr);
      } catch {
        // ignore
      }
    }

    // Try loading from localStorage
    let loadedWallets: TrackedWhaleWallet[] = [];
    let loadedTxs: WhaleBuyTransaction[] = [];
    try {
      const rawW = localStorage.getItem(STORAGE_WALLETS_KEY);
      const rawT = localStorage.getItem(STORAGE_TXS_KEY);
      if (rawW) loadedWallets = JSON.parse(rawW);
      if (rawT) loadedTxs = JSON.parse(rawT);
    } catch (e) {
      console.warn('[WhaleTrackingService] Failed to load cached data:', e);
    }

    if (loadedWallets.length > 0) {
      this.wallets.clear();
      loadedWallets.forEach((w) => this.wallets.set(w.walletAddress, w));
      this.transactions = loadedTxs;
      this.isInitialized = true;
      return;
    }

    // Seed realistic initial whale buys using current or fallback tokens
    this.seedInitialWhaleData(tokens, solUsdPrice);
    this.isInitialized = true;
  }

  /**
   * Seed realistic initial whale data for the day
   */
  private static seedInitialWhaleData(tokens: TrackedToken[], solUsdPrice: number): void {
    this.wallets.clear();
    this.transactions = [];

    // Fallback sample tokens if tokens array is still loading
    const coinPool = tokens.length > 0 ? tokens : [
      {
        mint: '8YeBTPV58fH6tnzUAihMK1LixsGc1jsN7DAyBoiRpump',
        name: 'Zhunt',
        symbol: 'ZNT',
        currentPriceSol: 0.00000034,
        highestMultiplier: 12.1,
      },
      {
        mint: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
        name: 'SolPepe',
        symbol: 'PEPE',
        currentPriceSol: 0.00000015,
        highestMultiplier: 5.4,
      },
      {
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'BonkSurge',
        symbol: 'BONKS',
        currentPriceSol: 0.00000009,
        highestMultiplier: 3.2,
      },
      {
        mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        name: 'FartCoinPump',
        symbol: 'FART',
        currentPriceSol: 0.00000021,
        highestMultiplier: 7.5,
      },
      {
        mint: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump',
        name: 'GoatseMax',
        symbol: 'GOAT',
        currentPriceSol: 0.00000018,
        highestMultiplier: 6.4,
      },
    ];

    const now = Date.now();

    // Seed 6 distinct wallets with multiple 1+ SOL buys
    const sampleSetups = [
      {
        whale: KNOWN_WHALE_POOLS[0],
        buys: [
          { coinIdx: 0, sol: 12.5, timeAgoMs: 25 * 60 * 1000 },
          { coinIdx: 1, sol: 8.0, timeAgoMs: 18 * 60 * 1000 },
          { coinIdx: 2, sol: 5.5, timeAgoMs: 10 * 60 * 1000 },
          { coinIdx: 3, sol: 6.2, timeAgoMs: 4 * 60 * 1000 },
          { coinIdx: 4, sol: 4.8, timeAgoMs: 1 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[1],
        buys: [
          { coinIdx: 0, sol: 15.0, timeAgoMs: 45 * 60 * 1000 },
          { coinIdx: 2, sol: 9.2, timeAgoMs: 32 * 60 * 1000 },
          { coinIdx: 3, sol: 7.4, timeAgoMs: 14 * 60 * 1000 },
          { coinIdx: 1, sol: 3.5, timeAgoMs: 6 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[2],
        buys: [
          { coinIdx: 4, sol: 6.5, timeAgoMs: 50 * 60 * 1000 },
          { coinIdx: 1, sol: 4.2, timeAgoMs: 22 * 60 * 1000 },
          { coinIdx: 0, sol: 3.8, timeAgoMs: 11 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[3],
        buys: [
          { coinIdx: 3, sol: 10.0, timeAgoMs: 30 * 60 * 1000 },
          { coinIdx: 0, sol: 4.5, timeAgoMs: 15 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[4],
        buys: [
          { coinIdx: 1, sol: 8.5, timeAgoMs: 60 * 60 * 1000 },
          { coinIdx: 2, sol: 5.0, timeAgoMs: 35 * 60 * 1000 },
          { coinIdx: 4, sol: 4.0, timeAgoMs: 8 * 60 * 1000 },
          { coinIdx: 0, sol: 2.2, timeAgoMs: 2 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[5],
        buys: [
          { coinIdx: 2, sol: 3.5, timeAgoMs: 40 * 60 * 1000 },
          { coinIdx: 3, sol: 2.1, timeAgoMs: 12 * 60 * 1000 },
        ],
      },
    ];

    sampleSetups.forEach((setup) => {
      setup.buys.forEach((b) => {
        const coin = coinPool[b.coinIdx % coinPool.length];
        const priceSol = coin.currentPriceSol || 0.0000002;
        const tokensBought = Math.round((b.sol / priceSol) * 0.98); // bonding curve slip
        const txTimestamp = now - b.timeAgoMs;
        const sig = `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}pump5sol`;

        this.recordWhaleBuyInternal({
          signature: sig,
          timestamp: txTimestamp,
          walletAddress: setup.whale.address,
          walletLabel: setup.whale.label,
          mint: coin.mint,
          tokenSymbol: coin.symbol,
          tokenName: coin.name,
          solAmount: b.sol,
          solUsdValue: b.sol * solUsdPrice,
          tokenAmount: tokensBought,
          priceSol,
          priceUsd: priceSol * solUsdPrice,
          currentMultiplier: coin.highestMultiplier || 1.2,
          holdingStatus: 'holding',
        });
      });
    });

    this.persist();
  }

  /**
   * Internal recorder of a >= 1.0 SOL buy transaction
   */
  private static recordWhaleBuyInternal(txData: Omit<WhaleBuyTransaction, 'id'>): WhaleBuyTransaction {
    const id = `wb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tx: WhaleBuyTransaction = {
      id,
      ...txData,
    };

    // Add to transactions list (newest first)
    this.transactions.unshift(tx);
    if (this.transactions.length > 500) {
      this.transactions.pop();
    }

    // Update or create tracked wallet
    let wallet = this.wallets.get(tx.walletAddress);
    if (!wallet) {
      wallet = {
        walletAddress: tx.walletAddress,
        label: tx.walletLabel,
        firstActiveToday: tx.timestamp,
        lastActiveToday: tx.timestamp,
        totalBuysCountToday: 0,
        uniqueCoinsBoughtCountToday: 0,
        totalSolSpentToday: 0,
        holdingsToday: [],
        transactionsToday: [],
        tier: 'Active Whale (1+ SOL)',
      };
      this.wallets.set(tx.walletAddress, wallet);
    }

    // Update wallet stats
    wallet.lastActiveToday = Math.max(wallet.lastActiveToday, tx.timestamp);
    wallet.firstActiveToday = Math.min(wallet.firstActiveToday, tx.timestamp);
    wallet.totalBuysCountToday += 1;
    wallet.totalSolSpentToday = +(wallet.totalSolSpentToday + tx.solAmount).toFixed(3);
    wallet.transactionsToday.unshift(tx);

    // Update holdings breakdown for this coin
    const existingHolding = wallet.holdingsToday.find((h) => h.mint === tx.mint);
    if (existingHolding) {
      existingHolding.totalSolBoughtToday = +(existingHolding.totalSolBoughtToday + tx.solAmount).toFixed(3);
      existingHolding.totalTokensBoughtToday += tx.tokenAmount;
      existingHolding.lastBuyTimeToday = tx.timestamp;
      existingHolding.buyCountToday += 1;
      // Weighted average buy price
      existingHolding.averageBuyPriceSol = existingHolding.totalSolBoughtToday / existingHolding.totalTokensBoughtToday;
      existingHolding.currentPriceSol = tx.priceSol;
      existingHolding.currentMultiplier = tx.currentMultiplier || existingHolding.currentMultiplier;
      existingHolding.unrealizedPnlPercent = Math.round((existingHolding.currentMultiplier - 1) * 100);
      existingHolding.unrealizedPnlSol = +(existingHolding.totalSolBoughtToday * (existingHolding.currentMultiplier - 1)).toFixed(3);
    } else {
      wallet.holdingsToday.push({
        mint: tx.mint,
        tokenSymbol: tx.tokenSymbol,
        tokenName: tx.tokenName,
        totalSolBoughtToday: +tx.solAmount.toFixed(3),
        totalTokensBoughtToday: tx.tokenAmount,
        firstBuyTimeToday: tx.timestamp,
        lastBuyTimeToday: tx.timestamp,
        buyCountToday: 1,
        averageBuyPriceSol: tx.priceSol,
        currentPriceSol: tx.priceSol,
        currentMultiplier: tx.currentMultiplier || 1.0,
        unrealizedPnlSol: 0,
        unrealizedPnlPercent: 0,
        holdingStatus: 'holding',
      });
    }

    wallet.uniqueCoinsBoughtCountToday = wallet.holdingsToday.length;

    // Update tier based on total SOL spent today
    if (wallet.totalSolSpentToday >= 10.0) {
      wallet.tier = 'Mega Whale (10+ SOL)';
    } else if (wallet.totalSolSpentToday >= 5.0) {
      wallet.tier = 'High Roller (5+ SOL)';
    } else {
      wallet.tier = 'Active Whale (1+ SOL)';
    }

    return tx;
  }

  /**
   * Public API to record a 1+ SOL Whale Buy
   */
  public static recordWhaleBuy(txData: Omit<WhaleBuyTransaction, 'id'>): WhaleBuyTransaction | null {
    if (txData.solAmount < 1.0) {
      // Must be 1 SOL and above
      return null;
    }

    const tx = this.recordWhaleBuyInternal(txData);
    this.persist();
    return tx;
  }

  /**
   * Generates a realistic live whale buy with >= 1.0 SOL from active tokens
   */
  public static simulateRandomWhaleBuy(tokens: TrackedToken[], solUsdPrice: number = 150): WhaleBuyTransaction | null {
    if (tokens.length === 0) return null;

    // Pick a random token from the active list
    const token = tokens[Math.floor(Math.random() * tokens.length)];

    // Pick an existing whale or generate a new random Solana wallet
    const useKnown = Math.random() > 0.35;
    let walletAddress: string;
    let walletLabel: string | undefined;

    if (useKnown && KNOWN_WHALE_POOLS.length > 0) {
      const selected = KNOWN_WHALE_POOLS[Math.floor(Math.random() * KNOWN_WHALE_POOLS.length)];
      walletAddress = selected.address;
      walletLabel = selected.label;
    } else {
      walletAddress = `${Math.random().toString(36).substring(2, 6)}Sol${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}Whale`;
      walletLabel = `Whale_${Math.floor(Math.random() * 900 + 100)}`;
    }

    // Generate SOL buy amount >= 1.0 SOL (between 1.0 and 18.5 SOL)
    const solDistribution = Math.random();
    let solAmount = 1.0;
    if (solDistribution > 0.85) {
      solAmount = +(Math.random() * 10 + 10).toFixed(2); // 10.0 - 20.0 SOL Mega Buy
    } else if (solDistribution > 0.5) {
      solAmount = +(Math.random() * 4 + 3).toFixed(2); // 3.0 - 7.0 SOL Medium Whale
    } else {
      solAmount = +(Math.random() * 2 + 1).toFixed(2); // 1.0 - 3.0 SOL Standard 1+ SOL
    }

    const priceSol = token.currentPriceSol || 0.00000028;
    const tokensBought = Math.round((solAmount / priceSol) * 0.985);
    const multiplier = token.highestMultiplier || (token.currentPriceSol / token.initialPriceSol);

    const sig = `${Math.random().toString(36).substring(2, 11)}${Math.random().toString(36).substring(2, 11)}${Math.random().toString(36).substring(2, 11)}pump`;

    const tx = this.recordWhaleBuyInternal({
      signature: sig,
      timestamp: Date.now(),
      walletAddress,
      walletLabel,
      mint: token.mint,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      solAmount,
      solUsdValue: solAmount * solUsdPrice,
      tokenAmount: tokensBought,
      priceSol,
      priceUsd: priceSol * solUsdPrice,
      currentMultiplier: multiplier,
      holdingStatus: 'holding',
    });

    this.persist();
    return tx;
  }

  /**
   * Updates holding values using latest live prices from the 15-second sync cycle
   */
  public static updatePricesFromTokens(tokens: TrackedToken[]): void {
    const tokenMap = new Map<string, TrackedToken>();
    tokens.forEach((t) => tokenMap.set(t.mint, t));

    this.wallets.forEach((wallet) => {
      wallet.holdingsToday.forEach((holding) => {
        const liveToken = tokenMap.get(holding.mint);
        if (liveToken) {
          holding.currentPriceSol = liveToken.currentPriceSol;
          const liveMult = liveToken.currentPriceSol / holding.averageBuyPriceSol;
          holding.currentMultiplier = +liveMult.toFixed(2);
          holding.unrealizedPnlPercent = Math.round((liveMult - 1) * 100);
          holding.unrealizedPnlSol = +(holding.totalSolBoughtToday * (liveMult - 1)).toFixed(3);
        }
      });
    });

    this.persist();
  }

  /**
   * Toggles the starred/favorite status of a wallet
   */
  public static toggleStarWallet(walletAddress: string): boolean {
    const wallet = this.wallets.get(walletAddress);
    if (!wallet) return false;
    wallet.isStarred = !wallet.isStarred;
    this.persist();
    return !!wallet.isStarred;
  }

  /**
   * Returns all tracked whale wallets, sorted by isStarred, then totalSolSpentToday descending
   */
  public static getTrackedWallets(): TrackedWhaleWallet[] {
    return Array.from(this.wallets.values()).sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return b.totalSolSpentToday - a.totalSolSpentToday;
    });
  }

  /**
   * Returns recent 1+ SOL whale transactions
   */
  public static getTransactions(): WhaleBuyTransaction[] {
    return [...this.transactions];
  }

  /**
   * Summary metrics for the Whale Radar Dashboard
   */
  public static getSummaryStats(solUsdPrice: number = 150): {
    totalWalletsCount: number;
    totalSolDeployedToday: number;
    totalUsdDeployedToday: number;
    totalBuysCountToday: number;
    topWhale: TrackedWhaleWallet | null;
    mostBoughtCoinSymbol: string;
  } {
    const wallets = Array.from(this.wallets.values());
    const totalWalletsCount = wallets.length;
    const totalSolDeployedToday = +wallets.reduce((acc, w) => acc + w.totalSolSpentToday, 0).toFixed(2);
    const totalUsdDeployedToday = Math.round(totalSolDeployedToday * solUsdPrice);
    const totalBuysCountToday = wallets.reduce((acc, w) => acc + w.totalBuysCountToday, 0);

    const sortedBySol = [...wallets].sort((a, b) => b.totalSolSpentToday - a.totalSolSpentToday);
    const topWhale = sortedBySol.length > 0 ? sortedBySol[0] : null;

    // Find most bought coin
    const coinBuyCount = new Map<string, number>();
    this.transactions.forEach((tx) => {
      coinBuyCount.set(tx.tokenSymbol, (coinBuyCount.get(tx.tokenSymbol) || 0) + 1);
    });
    let mostBoughtCoinSymbol = 'PUMP';
    let maxCount = 0;
    coinBuyCount.forEach((count, symbol) => {
      if (count > maxCount) {
        maxCount = count;
        mostBoughtCoinSymbol = symbol;
      }
    });

    return {
      totalWalletsCount,
      totalSolDeployedToday,
      totalUsdDeployedToday,
      totalBuysCountToday,
      topWhale,
      mostBoughtCoinSymbol,
    };
  }

  /**
   * Clears daily data
   */
  public static clearDailyData(): void {
    this.wallets.clear();
    this.transactions = [];
    try {
      localStorage.removeItem(STORAGE_WALLETS_KEY);
      localStorage.removeItem(STORAGE_TXS_KEY);
    } catch {
      // ignore
    }
  }

  private static persist(): void {
    try {
      const walletsArr = Array.from(this.wallets.values());
      localStorage.setItem(STORAGE_WALLETS_KEY, JSON.stringify(walletsArr));
      localStorage.setItem(STORAGE_TXS_KEY, JSON.stringify(this.transactions.slice(0, 200)));
    } catch {
      // ignore quota errors
    }
  }
}

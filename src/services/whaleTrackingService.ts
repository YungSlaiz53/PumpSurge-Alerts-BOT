/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TrackedToken, 
  TrackedWhaleWallet, 
  WhaleTransaction, 
  TrackedWalletHolding,
  WhaleTradeEvent
} from '../types';

const STORAGE_WALLETS_KEY = 'pumpsurge_whale_wallets_v3';
const STORAGE_TXS_KEY = 'pumpsurge_whale_txs_v3';
const STORAGE_DATE_KEY = 'pumpsurge_whale_date_v3';

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
  private static transactions: WhaleTransaction[] = [];
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
    let loadedTxs: WhaleTransaction[] = [];
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
      // Hydrate holdings with trade timelines if missing
      loadedWallets.forEach((w) => {
        w.totalSellsCountToday = w.totalSellsCountToday || 0;
        w.totalSolSoldToday = w.totalSolSoldToday || 0;
        w.netRealizedPnlSol = w.netRealizedPnlSol || 0;
        w.holdingsToday.forEach((h) => {
          if (!h.tradeTimeline) {
            h.tradeTimeline = [];
            if (h.firstBuyTimeToday) {
              h.tradeTimeline.push({
                id: `seed-buy-${h.mint}`,
                type: 'buy',
                timestamp: h.firstBuyTimeToday,
                solAmount: h.totalSolBoughtToday,
                tokenAmount: h.totalTokensBoughtToday,
                priceSol: h.averageBuyPriceSol,
                signature: `tx-${h.mint.slice(0, 8)}`,
              });
            }
          }
          if (h.remainingTokens === undefined) {
            h.remainingTokens = Math.max(0, h.totalTokensBoughtToday - (h.totalTokensSoldToday || 0));
          }
          if (h.sellCountToday === undefined) {
            h.sellCountToday = h.firstSellTimeToday ? 1 : 0;
          }
          if (h.totalSolSoldToday === undefined) {
            h.totalSolSoldToday = 0;
          }
          if (h.totalTokensSoldToday === undefined) {
            h.totalTokensSoldToday = 0;
          }
          if (h.realizedPnlSol === undefined) {
            h.realizedPnlSol = 0;
          }
        });
        this.wallets.set(w.walletAddress, w);
      });
      this.transactions = loadedTxs;
      this.isInitialized = true;
      return;
    }

    // Seed realistic initial whale buys and sells using current or fallback tokens
    this.seedInitialWhaleData(tokens, solUsdPrice);
    this.isInitialized = true;
  }

  /**
   * Seed realistic initial whale data for the day: including WHEN THEY BOUGHT and WHEN THEY SOLD
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

    // Setup wallets with realistic Buy and Sell lifecycles
    const sampleSetups = [
      {
        whale: KNOWN_WHALE_POOLS[0], // AlphaSniper.sol
        actions: [
          // Coin 0 (ZNT): Bought 48m ago, Sold 60% at 20m ago with +120% profit!
          { type: 'buy', coinIdx: 0, sol: 12.5, timeAgoMs: 48 * 60 * 1000 },
          { type: 'sell', coinIdx: 0, sellRatio: 0.6, timeAgoMs: 20 * 60 * 1000, mult: 2.2 },
          // Coin 1 (PEPE): Bought 22m ago, still holding
          { type: 'buy', coinIdx: 1, sol: 8.0, timeAgoMs: 22 * 60 * 1000 },
          // Coin 2 (BONKS): Bought 12m ago, sold 100% at 4m ago with +85% profit!
          { type: 'buy', coinIdx: 2, sol: 5.5, timeAgoMs: 12 * 60 * 1000 },
          { type: 'sell', coinIdx: 2, sellRatio: 1.0, timeAgoMs: 4 * 60 * 1000, mult: 1.85 },
          // Coin 3 (FART): Bought 3m ago, still holding
          { type: 'buy', coinIdx: 3, sol: 4.8, timeAgoMs: 3 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[1], // Whale_01 (Raydium Alpha)
        actions: [
          // Coin 0: Bought 65m ago, Sold 100% 30m ago with 3.4x return
          { type: 'buy', coinIdx: 0, sol: 15.0, timeAgoMs: 65 * 60 * 1000 },
          { type: 'sell', coinIdx: 0, sellRatio: 1.0, timeAgoMs: 30 * 60 * 1000, mult: 3.4 },
          // Coin 2: Bought 35m ago, Sold 40% 15m ago
          { type: 'buy', coinIdx: 2, sol: 9.2, timeAgoMs: 35 * 60 * 1000 },
          { type: 'sell', coinIdx: 2, sellRatio: 0.4, timeAgoMs: 15 * 60 * 1000, mult: 1.6 },
          // Coin 4: Bought 8m ago, holding
          { type: 'buy', coinIdx: 4, sol: 6.4, timeAgoMs: 8 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[2], // BondingCurveTitan
        actions: [
          // Coin 4: Bought 55m ago, sold 50% 25m ago
          { type: 'buy', coinIdx: 4, sol: 6.5, timeAgoMs: 55 * 60 * 1000 },
          { type: 'sell', coinIdx: 4, sellRatio: 0.5, timeAgoMs: 25 * 60 * 1000, mult: 1.9 },
          // Coin 1: Bought 18m ago, holding
          { type: 'buy', coinIdx: 1, sol: 4.2, timeAgoMs: 18 * 60 * 1000 },
          // Coin 3: Bought 6m ago, holding
          { type: 'buy', coinIdx: 3, sol: 3.8, timeAgoMs: 6 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[3], // DegenChad.sol
        actions: [
          // Coin 3: Bought 40m ago, sold 100% 12m ago
          { type: 'buy', coinIdx: 3, sol: 10.0, timeAgoMs: 40 * 60 * 1000 },
          { type: 'sell', coinIdx: 3, sellRatio: 1.0, timeAgoMs: 12 * 60 * 1000, mult: 2.1 },
          // Coin 0: Bought 14m ago, holding
          { type: 'buy', coinIdx: 0, sol: 4.5, timeAgoMs: 14 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[4], // SmartAccumulator
        actions: [
          // Coin 1: Bought 75m ago, sold 70% 35m ago
          { type: 'buy', coinIdx: 1, sol: 8.5, timeAgoMs: 75 * 60 * 1000 },
          { type: 'sell', coinIdx: 1, sellRatio: 0.7, timeAgoMs: 35 * 60 * 1000, mult: 1.75 },
          // Coin 2: Bought 25m ago, holding
          { type: 'buy', coinIdx: 2, sol: 5.0, timeAgoMs: 25 * 60 * 1000 },
          // Coin 4: Bought 9m ago, holding
          { type: 'buy', coinIdx: 4, sol: 4.0, timeAgoMs: 9 * 60 * 1000 },
        ],
      },
      {
        whale: KNOWN_WHALE_POOLS[6], // PumpFunMaxi
        actions: [
          // Coin 2: Bought 50m ago, sold 100% 10m ago
          { type: 'buy', coinIdx: 2, sol: 7.2, timeAgoMs: 50 * 60 * 1000 },
          { type: 'sell', coinIdx: 2, sellRatio: 1.0, timeAgoMs: 10 * 60 * 1000, mult: 2.5 },
          // Coin 3: Bought 5m ago, holding
          { type: 'buy', coinIdx: 3, sol: 3.5, timeAgoMs: 5 * 60 * 1000 },
        ],
      },
    ];

    sampleSetups.forEach((setup) => {
      setup.actions.forEach((act) => {
        const coin = coinPool[act.coinIdx % coinPool.length];
        const basePrice = coin.currentPriceSol || 0.0000002;
        const txTimestamp = now - act.timeAgoMs;
        const sig = `${Math.random().toString(36).substring(2, 9)}${Math.random().toString(36).substring(2, 9)}pump`;

        if (act.type === 'buy') {
          const solAmount = act.sol || 1.5;
          const tokensBought = Math.round((solAmount / basePrice) * 0.98);

          this.recordWhaleBuyInternal({
            signature: sig,
            timestamp: txTimestamp,
            walletAddress: setup.whale.address,
            walletLabel: setup.whale.label,
            mint: coin.mint,
            tokenSymbol: coin.symbol,
            tokenName: coin.name,
            solAmount,
            solUsdValue: solAmount * solUsdPrice,
            tokenAmount: tokensBought,
            priceSol: basePrice,
            priceUsd: basePrice * solUsdPrice,
            currentMultiplier: coin.highestMultiplier || 1.3,
            holdingStatus: 'holding',
          });
        } else if (act.type === 'sell') {
          this.recordWhaleSellInternal({
            walletAddress: setup.whale.address,
            walletLabel: setup.whale.label,
            mint: coin.mint,
            tokenSymbol: coin.symbol,
            tokenName: coin.name,
            sellRatio: act.sellRatio || 0.5,
            multiplierAtSell: act.mult || 1.8,
            timestamp: txTimestamp,
            signature: sig,
            solUsdPrice,
          });
        }
      });
    });

    this.persist();
  }

  /**
   * Internal recorder of a >= 1.0 SOL buy transaction
   */
  private static recordWhaleBuyInternal(txData: Omit<WhaleTransaction, 'id' | 'type'>): WhaleTransaction {
    const id = `wb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tx: WhaleTransaction = {
      id,
      type: 'buy',
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
        totalSellsCountToday: 0,
        uniqueCoinsBoughtCountToday: 0,
        totalSolSpentToday: 0,
        totalSolSoldToday: 0,
        netRealizedPnlSol: 0,
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
    let existingHolding = wallet.holdingsToday.find((h) => h.mint === tx.mint);
    if (existingHolding) {
      existingHolding.totalSolBoughtToday = +(existingHolding.totalSolBoughtToday + tx.solAmount).toFixed(3);
      existingHolding.totalTokensBoughtToday += tx.tokenAmount;
      existingHolding.remainingTokens += tx.tokenAmount;
      existingHolding.lastBuyTimeToday = tx.timestamp;
      existingHolding.buyCountToday += 1;
      // Weighted average buy price
      existingHolding.averageBuyPriceSol = existingHolding.totalSolBoughtToday / existingHolding.totalTokensBoughtToday;
      existingHolding.currentPriceSol = tx.priceSol;
      existingHolding.currentMultiplier = tx.currentMultiplier || existingHolding.currentMultiplier;
      existingHolding.unrealizedPnlPercent = Math.round((existingHolding.currentMultiplier - 1) * 100);
      existingHolding.unrealizedPnlSol = +(existingHolding.totalSolBoughtToday * (existingHolding.currentMultiplier - 1)).toFixed(3);

      if (existingHolding.holdingStatus === 'sold' && existingHolding.remainingTokens > 0) {
        existingHolding.holdingStatus = 'holding';
      }

      // Add to trade timeline
      existingHolding.tradeTimeline.push({
        id: tx.id,
        type: 'buy',
        timestamp: tx.timestamp,
        solAmount: tx.solAmount,
        tokenAmount: tx.tokenAmount,
        priceSol: tx.priceSol,
        signature: tx.signature,
      });
    } else {
      const newHolding: TrackedWalletHolding = {
        mint: tx.mint,
        tokenSymbol: tx.tokenSymbol,
        tokenName: tx.tokenName,
        // BUY Timestamps
        firstBuyTimeToday: tx.timestamp,
        lastBuyTimeToday: tx.timestamp,
        buyCountToday: 1,
        totalSolBoughtToday: +tx.solAmount.toFixed(3),
        totalTokensBoughtToday: tx.tokenAmount,
        averageBuyPriceSol: tx.priceSol,

        // SELL Timestamps (initially none)
        firstSellTimeToday: undefined,
        lastSellTimeToday: undefined,
        sellCountToday: 0,
        totalSolSoldToday: 0,
        totalTokensSoldToday: 0,
        remainingTokens: tx.tokenAmount,
        realizedPnlSol: 0,

        // Valuation
        currentPriceSol: tx.priceSol,
        currentMultiplier: tx.currentMultiplier || 1.0,
        unrealizedPnlSol: 0,
        unrealizedPnlPercent: 0,
        holdingStatus: 'holding',

        // Chronological order timeline
        tradeTimeline: [
          {
            id: tx.id,
            type: 'buy',
            timestamp: tx.timestamp,
            solAmount: tx.solAmount,
            tokenAmount: tx.tokenAmount,
            priceSol: tx.priceSol,
            signature: tx.signature,
          },
        ],
      };
      wallet.holdingsToday.push(newHolding);
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
   * Internal recorder of a Whale Sell transaction (capturing WHEN they sell and how much profit)
   */
  private static recordWhaleSellInternal(options: {
    walletAddress: string;
    walletLabel?: string;
    mint: string;
    tokenSymbol?: string;
    tokenName?: string;
    sellRatio?: number; // 0.1 to 1.0 (e.g. 0.5 for 50%, 1.0 for 100%)
    exactTokenAmount?: number;
    multiplierAtSell?: number;
    timestamp?: number;
    signature?: string;
    solUsdPrice?: number;
  }): WhaleTransaction | null {
    const wallet = this.wallets.get(options.walletAddress);
    if (!wallet) return null;

    const holding = wallet.holdingsToday.find((h) => h.mint === options.mint);
    if (!holding || holding.remainingTokens <= 0) return null;

    const timestamp = options.timestamp || Date.now();
    const usdRate = options.solUsdPrice || 150;
    const ratio = options.sellRatio ? Math.min(1.0, Math.max(0.1, options.sellRatio)) : 1.0;

    const tokensToSell = options.exactTokenAmount
      ? Math.min(holding.remainingTokens, options.exactTokenAmount)
      : Math.round(holding.remainingTokens * ratio);

    if (tokensToSell <= 0) return null;

    const multiplier = options.multiplierAtSell || holding.currentMultiplier || 1.5;
    const sellPriceSol = holding.averageBuyPriceSol * multiplier;
    const solReceived = +(tokensToSell * sellPriceSol).toFixed(3);
    const costBasisSol = +(tokensToSell * holding.averageBuyPriceSol).toFixed(3);
    const profitSol = +(solReceived - costBasisSol).toFixed(3);
    const pnlPercent = Math.round(((sellPriceSol - holding.averageBuyPriceSol) / holding.averageBuyPriceSol) * 100);

    const sig = options.signature || `${Math.random().toString(36).substring(2, 9)}${Math.random().toString(36).substring(2, 9)}pumpSell`;
    const id = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Update holding sell fields
    holding.remainingTokens = Math.max(0, holding.remainingTokens - tokensToSell);
    holding.totalTokensSoldToday += tokensToSell;
    holding.totalSolSoldToday = +(holding.totalSolSoldToday + solReceived).toFixed(3);
    holding.sellCountToday += 1;
    holding.firstSellTimeToday = holding.firstSellTimeToday || timestamp;
    holding.lastSellTimeToday = timestamp;
    holding.realizedPnlSol = +(holding.realizedPnlSol + profitSol).toFixed(3);

    // Holding Status update
    if (holding.remainingTokens <= 0) {
      holding.holdingStatus = 'sold';
    } else {
      holding.holdingStatus = 'partially_sold';
    }

    const tradeEvent: WhaleTradeEvent = {
      id,
      type: 'sell',
      timestamp,
      solAmount: solReceived,
      tokenAmount: tokensToSell,
      priceSol: sellPriceSol,
      signature: sig,
      profitSol,
      pnlPercent,
    };
    holding.tradeTimeline.push(tradeEvent);

    const tx: WhaleTransaction = {
      id,
      type: 'sell',
      signature: sig,
      timestamp,
      walletAddress: wallet.walletAddress,
      walletLabel: wallet.label || options.walletLabel,
      mint: holding.mint,
      tokenSymbol: holding.tokenSymbol,
      tokenName: holding.tokenName,
      solAmount: solReceived,
      solUsdValue: solReceived * usdRate,
      tokenAmount: tokensToSell,
      priceSol: sellPriceSol,
      priceUsd: sellPriceSol * usdRate,
      currentMultiplier: multiplier,
      realizedProfitSol: profitSol,
      realizedPnlPercent: pnlPercent,
      initialBuyTimestamp: holding.firstBuyTimeToday,
      holdDurationMs: Math.max(0, timestamp - holding.firstBuyTimeToday),
      holdingStatus: holding.holdingStatus,
    };

    // Update wallet stats
    wallet.lastActiveToday = Math.max(wallet.lastActiveToday, timestamp);
    wallet.totalSellsCountToday = (wallet.totalSellsCountToday || 0) + 1;
    wallet.totalSolSoldToday = +((wallet.totalSolSoldToday || 0) + solReceived).toFixed(3);
    wallet.netRealizedPnlSol = +((wallet.netRealizedPnlSol || 0) + profitSol).toFixed(3);
    wallet.transactionsToday.unshift(tx);

    // Add to global transactions list
    this.transactions.unshift(tx);
    if (this.transactions.length > 500) {
      this.transactions.pop();
    }

    return tx;
  }

  /**
   * Public API to record a 1+ SOL Whale Buy
   */
  public static recordWhaleBuy(txData: Omit<WhaleTransaction, 'id' | 'type'>): WhaleTransaction | null {
    if (txData.solAmount < 1.0) {
      return null;
    }

    const tx = this.recordWhaleBuyInternal(txData);
    this.persist();
    return tx;
  }

  /**
   * Public API to record a Whale Sell
   */
  public static recordWhaleSell(options: {
    walletAddress: string;
    mint: string;
    sellRatio?: number;
    exactTokenAmount?: number;
    solUsdPrice?: number;
  }): WhaleTransaction | null {
    const tx = this.recordWhaleSellInternal(options);
    if (tx) {
      this.persist();
    }
    return tx;
  }

  /**
   * Generates a realistic live whale buy with >= 1.0 SOL from active tokens
   */
  public static simulateRandomWhaleBuy(tokens: TrackedToken[], solUsdPrice: number = 150): WhaleTransaction | null {
    if (tokens.length === 0) return null;

    const token = tokens[Math.floor(Math.random() * tokens.length)];

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
   * Simulates a live Whale Sell (when they sell the coin)
   */
  public static simulateRandomWhaleSell(tokens: TrackedToken[] = [], solUsdPrice: number = 150): WhaleTransaction | null {
    // Find all wallets that currently have an active holding (not 100% sold)
    const eligibleWallets = Array.from(this.wallets.values()).filter((w) =>
      w.holdingsToday.some((h) => h.remainingTokens > 0)
    );

    if (eligibleWallets.length === 0) return null;

    // Pick a random wallet
    const wallet = eligibleWallets[Math.floor(Math.random() * eligibleWallets.length)];
    const activeHoldings = wallet.holdingsToday.filter((h) => h.remainingTokens > 0);
    if (activeHoldings.length === 0) return null;

    const holding = activeHoldings[Math.floor(Math.random() * activeHoldings.length)];

    // Check if token exists in live list for real price
    const liveToken = tokens.find((t) => t.mint === holding.mint);
    const multiplier = liveToken?.highestMultiplier || holding.currentMultiplier || 1.85;

    // Sell either 50% or 100%
    const isFullSell = Math.random() > 0.45;
    const sellRatio = isFullSell ? 1.0 : +(Math.random() * 0.4 + 0.3).toFixed(2); // 30% - 70% or 100%

    const tx = this.recordWhaleSellInternal({
      walletAddress: wallet.walletAddress,
      walletLabel: wallet.label,
      mint: holding.mint,
      tokenSymbol: holding.tokenSymbol,
      tokenName: holding.tokenName,
      sellRatio,
      multiplierAtSell: multiplier,
      timestamp: Date.now(),
      solUsdPrice,
    });

    if (tx) {
      this.persist();
    }
    return tx;
  }

  /**
   * Simulates a sell for a specific holding directly (triggered by user button in UI)
   */
  public static simulateSellForSpecificHolding(
    walletAddress: string,
    mint: string,
    sellRatio: number = 1.0,
    solUsdPrice: number = 150
  ): WhaleTransaction | null {
    const tx = this.recordWhaleSellInternal({
      walletAddress,
      mint,
      sellRatio,
      timestamp: Date.now(),
      solUsdPrice,
    });

    if (tx) {
      this.persist();
    }
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
   * Returns recent 1+ SOL whale transactions (buys and sells)
   */
  public static getTransactions(): WhaleTransaction[] {
    return [...this.transactions];
  }

  /**
   * Summary metrics for the Whale Radar Dashboard
   */
  public static getSummaryStats(solUsdPrice: number = 150): {
    totalWalletsCount: number;
    totalSolDeployedToday: number;
    totalSolSoldToday: number;
    netRealizedPnlSol: number;
    totalUsdDeployedToday: number;
    totalBuysCountToday: number;
    totalSellsCountToday: number;
    topWhale: TrackedWhaleWallet | null;
    mostBoughtCoinSymbol: string;
  } {
    const wallets = Array.from(this.wallets.values());
    const totalWalletsCount = wallets.length;
    const totalSolDeployedToday = +wallets.reduce((acc, w) => acc + w.totalSolSpentToday, 0).toFixed(2);
    const totalSolSoldToday = +wallets.reduce((acc, w) => acc + (w.totalSolSoldToday || 0), 0).toFixed(2);
    const netRealizedPnlSol = +wallets.reduce((acc, w) => acc + (w.netRealizedPnlSol || 0), 0).toFixed(2);
    const totalUsdDeployedToday = Math.round(totalSolDeployedToday * solUsdPrice);
    const totalBuysCountToday = wallets.reduce((acc, w) => acc + w.totalBuysCountToday, 0);
    const totalSellsCountToday = wallets.reduce((acc, w) => acc + (w.totalSellsCountToday || 0), 0);

    const sortedBySol = [...wallets].sort((a, b) => b.totalSolSpentToday - a.totalSolSpentToday);
    const topWhale = sortedBySol.length > 0 ? sortedBySol[0] : null;

    // Find most bought coin
    const coinBuyCount = new Map<string, number>();
    this.transactions.filter((t) => t.type === 'buy').forEach((tx) => {
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
      totalSolSoldToday,
      netRealizedPnlSol,
      totalUsdDeployedToday,
      totalBuysCountToday,
      totalSellsCountToday,
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

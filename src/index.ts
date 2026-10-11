/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';
dotenv.config();

import { PumpListener } from './pumpListener.ts';
import { AppDatabase } from './db/database.ts';
import { AppConfig, TrackedToken } from './types.ts';

// Load and validate application environment variables
function loadConfiguration(): AppConfig {
  const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const solanaWssUrl = process.env.SOLANA_WSS_URL || solanaRpcUrl.replace(/^http/, 'ws');

  return {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'production',
    solanaRpcUrl,
    solanaWssUrl,
    solanaCommitment: (process.env.SOLANA_COMMITMENT as any) || 'processed',
    pumpProgramId: process.env.PUMP_PROGRAM_ID || '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
    priceSurgeWindowSeconds: Number(process.env.PRICE_SURGE_WINDOW_SECONDS) || 90,
    minLiquiditySol: Number(process.env.MIN_LIQUIDITY_SOL) || 0,
    surgeMultiplier5x: Number(process.env.ALERT_SURGE_MULTIPLIER_5X) || 5.0,
    surgeMultiplier10x: Number(process.env.ALERT_SURGE_MULTIPLIER_10X) || 10.0,
    solUsdPrice: Number(process.env.DEFAULT_SOL_USD_PRICE) || 180.0,
  };
}

async function main() {
  console.log('================================================================');
  console.log('🚀 PUMPSURGE SOLANA APP - BACKGROUND ENGINE & LIVE DB LINK');
  console.log('================================================================');

  const config = loadConfiguration();
  const db = AppDatabase.getInstance();

  console.log(`[ENGINE] Solana RPC: ${config.solanaRpcUrl}`);
  console.log(`[ENGINE] Solana WSS: ${config.solanaWssUrl}`);
  console.log(`[ENGINE] Program ID: ${config.pumpProgramId}`);
  console.log(`[ENGINE] Surge Thresholds: 5x (${config.surgeMultiplier5x}x) | 10x (${config.surgeMultiplier10x}x)`);
  console.log(`[ENGINE] Live Database: Connected (Ready for persistence)`);

  const activeTokens = new Map<string, TrackedToken>();

  // Initialize Solana Pump.fun WebSocket Listener
  const listener = new PumpListener({
    rpcUrl: config.solanaRpcUrl,
    wssUrl: config.solanaWssUrl,
    commitment: config.solanaCommitment,
    programId: config.pumpProgramId,
    solUsdPrice: config.solUsdPrice,
  });

  listener.on('connected', (info) => {
    console.log(`🟢 [SOLANA] WebSocket active! (Slot: ${info.slot}, Program: ${info.programId})`);
  });

  listener.on('disconnected', (err) => {
    console.error('🔴 [SOLANA] WebSocket disconnected:', err);
  });

  listener.on('error', (err) => {
    console.error('⚠️ [SOLANA] Listener runtime warning:', err);
  });

  // Track new mint creations
  listener.on('create', (event) => {
    console.log(`✨ [NEW MINT] ${event.name} ($${event.symbol}) | CA: ${event.mint}`);

    const tracked: TrackedToken = {
      mint: event.mint,
      name: event.name,
      symbol: event.symbol,
      uri: event.uri,
      creator: event.user,
      bondingCurve: event.bondingCurve,
      createdAt: event.timestamp || Date.now(),
      initialPriceSol: event.initialPriceSol,
      initialMarketCapSol: event.initialMarketCapSol,
      initialMarketCapUsd: event.initialMarketCapUsd,
      currentPriceSol: event.initialPriceSol,
      currentMarketCapSol: event.initialMarketCapSol,
      currentMarketCapUsd: event.initialMarketCapUsd,
      highestMultiplier: 1.0,
      notified5x: false,
      notified10x: false,
      tradeCount: 0,
      buyCount: 0,
      sellCount: 0,
      volumeSol: 0,
      lastTradeTimestamp: Date.now(),
    };

    activeTokens.set(event.mint, tracked);

    // Keep map bounded to prevent memory leakage
    if (activeTokens.size > 2000) {
      const oldestKey = activeTokens.keys().next().value;
      if (oldestKey) activeTokens.delete(oldestKey);
    }
  });

  // Monitor trades for 5x and 10x velocity spikes and persist to live database
  listener.on('trade', (event) => {
    const token = activeTokens.get(event.mint);
    if (!token) return;

    token.tradeCount += 1;
    if (event.isBuy) token.buyCount += 1;
    else token.sellCount += 1;
    token.volumeSol += Number(event.solAmount) / 1e9;
    token.currentPriceSol = event.priceSol;
    token.currentMarketCapSol = event.marketCapSol;
    token.currentMarketCapUsd = event.marketCapSol * config.solUsdPrice;
    token.lastTradeTimestamp = Date.now();

    const multiplier = token.initialPriceSol > 0 ? token.currentPriceSol / token.initialPriceSol : 1.0;

    if (multiplier > token.highestMultiplier) {
      token.highestMultiplier = multiplier;
    }

    const elapsedSeconds = (Date.now() - token.createdAt) / 1000;

    // Check 10x Spike
    if (multiplier >= config.surgeMultiplier10x && !token.notified10x) {
      token.notified10x = true;
      token.surgeTime10x = Date.now() - token.createdAt;

      console.log(`💥💥 [10X MOONSHOT] ${token.name} ($${token.symbol}) hit ${multiplier.toFixed(2)}x in ${elapsedSeconds.toFixed(1)}s! Persisting to database.`);

      db.recordSurgeAlert({
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
        multiplier: Number(multiplier.toFixed(2)),
        targetMultiplier: 10,
        timeElapsedSeconds: Number(elapsedSeconds.toFixed(1)),
        marketCapUsd: Math.round(token.currentMarketCapUsd),
        marketCapSol: Number(token.currentMarketCapSol.toFixed(2)),
      });
    }
    // Check 5x Spike
    else if (multiplier >= config.surgeMultiplier5x && !token.notified5x) {
      token.notified5x = true;
      token.surgeTime5x = Date.now() - token.createdAt;

      console.log(`🚀 [5X SURGE] ${token.name} ($${token.symbol}) hit ${multiplier.toFixed(2)}x in ${elapsedSeconds.toFixed(1)}s! Persisting to database.`);

      db.recordSurgeAlert({
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
        multiplier: Number(multiplier.toFixed(2)),
        targetMultiplier: 5,
        timeElapsedSeconds: Number(elapsedSeconds.toFixed(1)),
        marketCapUsd: Math.round(token.currentMarketCapUsd),
        marketCapSol: Number(token.currentMarketCapSol.toFixed(2)),
      });
    }
  });

  // Start Listener
  try {
    await listener.start();
    console.log('⚡ Background Pump.fun Sniper Engine running successfully.');
  } catch (error) {
    console.error('💥 Error launching background listener:', error);
  }

  // Graceful shutdown handling
  const shutdown = async () => {
    console.log('\n🛑 Gracefully shutting down PumpSurge engine...');
    await listener.stop();
    console.log('👋 Engine shutdown complete.');
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

// Execute main if run directly
if (import.meta.url === `file://${process.argv[1]}` || !process.env.VITE) {
  main().catch((err) => {
    console.error('Fatal unhandled error:', err);
  });
}

export { main, loadConfiguration };

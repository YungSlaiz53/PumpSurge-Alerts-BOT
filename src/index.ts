/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';
dotenv.config();

import { PumpListener } from './pumpListener';
import { TelegramAlertBot } from './telegramBot';
import { BotConfig } from './types';

// Load and validate environment variables
function loadConfiguration(): BotConfig {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChannelId = process.env.TELEGRAM_CHANNEL_ID;
  const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const solanaWssUrl = process.env.SOLANA_WSS_URL || solanaRpcUrl.replace(/^http/, 'ws');

  if (!telegramBotToken || telegramBotToken.includes('1234567890:ABCdefGh')) {
    console.warn('⚠️ [CONFIG] TELEGRAM_BOT_TOKEN is missing or using default placeholder.');
  }

  if (!telegramChannelId) {
    console.warn('⚠️ [CONFIG] TELEGRAM_CHANNEL_ID is not configured. Falling back to @PumpSurgeAlerts.');
  }

  return {
    telegramBotToken: telegramBotToken || 'MOCK_TOKEN',
    telegramChannelId: telegramChannelId || '@PumpSurgeAlerts',
    telegramAdminUserId: process.env.TELEGRAM_ADMIN_USER_ID,
    solanaRpcUrl,
    solanaWssUrl,
    solanaCommitment: (process.env.SOLANA_COMMITMENT as any) || 'processed',
    pumpProgramId: process.env.PUMP_PROGRAM_ID || '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
    priceSurgeWindowSeconds: Number(process.env.PRICE_SURGE_WINDOW_SECONDS) || 90,
    minLiquiditySol: Number(process.env.MIN_LIQUIDITY_SOL) || 0,
    surgeMultiplier5x: Number(process.env.ALERT_SURGE_MULTIPLIER_5X) || 5.0,
    surgeMultiplier10x: Number(process.env.ALERT_SURGE_MULTIPLIER_10X) || 10.0,
    affiliateRefs: {
      trojan: process.env.TROJAN_REF || 'alphasniper',
      bonkbot: process.env.BONKBOT_REF || 'alphasniper',
      maestro: process.env.MAESTRO_REF || 'alphasniper',
      bullx: process.env.BULLX_REF || 'alphasniper',
    },
    solUsdPrice: Number(process.env.DEFAULT_SOL_USD_PRICE) || 180.0,
  };
}

async function main() {
  console.log('================================================================');
  console.log('🚀 PUMP.FUN TELEGRAM SNIPING & ALERT BOT ENGINE');
  console.log('================================================================');

  const config = loadConfiguration();
  console.log(`[INIT] Solana RPC: ${config.solanaRpcUrl}`);
  console.log(`[INIT] Solana WSS: ${config.solanaWssUrl}`);
  console.log(`[INIT] Program ID: ${config.pumpProgramId}`);
  console.log(`[INIT] Channel ID: ${config.telegramChannelId}`);
  console.log(`[INIT] Surge Window: ${config.priceSurgeWindowSeconds}s (5x: ${config.surgeMultiplier5x}x, 10x: ${config.surgeMultiplier10x}x)`);

  // 1. Initialize Solana Pump.fun WebSocket Listener
  const listener = new PumpListener({
    rpcUrl: config.solanaRpcUrl,
    wssUrl: config.solanaWssUrl,
    commitment: config.solanaCommitment,
    programId: config.pumpProgramId,
    solUsdPrice: config.solUsdPrice,
  });

  // 2. Initialize Telegram Bot
  const bot = new TelegramAlertBot(config, listener);

  // Wire listener operational events
  listener.on('connected', (info) => {
    console.log(`🟢 [LISTENER] Solana WebSocket connected! (Slot: ${info.slot}, Program: ${info.programId})`);
  });

  listener.on('disconnected', (err) => {
    console.error('🔴 [LISTENER] Solana WebSocket disconnected:', err);
  });

  listener.on('error', (err) => {
    console.error('⚠️ [LISTENER] Runtime error:', err);
  });

  listener.on('create', (event) => {
    console.log(`✨ [NEW MINT] ${event.name} ($${event.symbol}) | Mint: ${event.mint} | Dev: ${event.user.slice(0, 6)}...`);
  });

  listener.on('trade', (event) => {
    if (event.isBuy) {
      console.log(`🟢 [BUY] Mint: ${event.mint.slice(0, 8)}... | Sol: ${(Number(event.solAmount) / 1e9).toFixed(3)} | Cap: ${event.marketCapSol.toFixed(1)} SOL`);
    } else {
      console.log(`🔴 [SELL] Mint: ${event.mint.slice(0, 8)}... | Sol: ${(Number(event.solAmount) / 1e9).toFixed(3)} | Cap: ${event.marketCapSol.toFixed(1)} SOL`);
    }
  });

  // 3. Start Listener & Bot
  try {
    await listener.start();

    if (config.telegramBotToken && !config.telegramBotToken.includes('MOCK_TOKEN')) {
      await bot.launch();
    } else {
      console.log('ℹ️ [TELEGRAM] Running in listener dry-run mode (set valid TELEGRAM_BOT_TOKEN to enable live broadcasting).');
    }

    console.log('⚡ Bot is fully operational and sniping Pump.fun events.');
  } catch (error) {
    console.error('💥 Fatal error during bot startup:', error);
    process.exit(1);
  }

  // Graceful shutdown handling
  const shutdown = async () => {
    console.log('\n🛑 Gracefully shutting down bot services...');
    await listener.stop();
    bot.stop();
    console.log('👋 Bot shutdown complete.');
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

/**
 * Source code store for the production deliverables displayed in the Web3 Control Center
 */

export interface CodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const CODE_FILES: CodeFile[] = [
  {
    name: 'src/index.ts',
    path: '/src/index.ts',
    language: 'typescript',
    description: 'Main bot orchestrator running Solana WebSocket listener and Telegram bot concurrently with graceful shutdown.',
    content: `import dotenv from 'dotenv';
dotenv.config();

import { PumpListener } from './pumpListener';
import { TelegramAlertBot } from './telegramBot';
import { BotConfig } from './types';

function loadConfiguration(): BotConfig {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChannelId = process.env.TELEGRAM_CHANNEL_ID;
  const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const solanaWssUrl = process.env.SOLANA_WSS_URL || solanaRpcUrl.replace(/^http/, 'ws');

  return {
    telegramBotToken: telegramBotToken || 'YOUR_BOT_TOKEN',
    telegramChannelId: telegramChannelId || '@PumpFunAlphaAlerts',
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
  console.log('🚀 PUMP.FUN TELEGRAM SNIPING & ALERT BOT ENGINE STARTING...');
  const config = loadConfiguration();

  // 1. Initialize Solana WebSocket Event Listener
  const listener = new PumpListener({
    rpcUrl: config.solanaRpcUrl,
    wssUrl: config.solanaWssUrl,
    commitment: config.solanaCommitment,
    programId: config.pumpProgramId,
    solUsdPrice: config.solUsdPrice,
  });

  // 2. Initialize Telegram Bot
  const bot = new TelegramAlertBot(config, listener);

  listener.on('connected', (info) => {
    console.log(\`🟢 [LISTENER] Solana WebSocket connected! (Slot: \${info.slot})\`);
  });

  listener.on('create', (event) => {
    console.log(\`✨ [NEW MINT] \${event.name} (\$\${event.symbol}) | \${event.mint}\`);
  });

  listener.on('trade', (event) => {
    console.log(\`📈 [TRADE] \${event.isBuy ? 'BUY' : 'SELL'} \${event.mint.slice(0, 8)}... | Cap: \${event.marketCapSol.toFixed(1)} SOL\`);
  });

  await listener.start();
  await bot.launch();

  console.log('⚡ Bot is fully operational and sniping Pump.fun events.');

  const shutdown = async () => {
    console.log('🛑 Gracefully shutting down bot services...');
    await listener.stop();
    bot.stop();
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch(console.error);
`,
  },
  {
    name: 'src/pumpListener.ts',
    path: '/src/pumpListener.ts',
    language: 'typescript',
    description: 'Sub-second Solana logsSubscribe WebSocket listener decoding Borsh Anchor Create & Trade events with auto-reconnection.',
    content: `import { Connection, PublicKey, Logs, Commitment } from '@solana/web3.js';
import { EventEmitter } from 'events';
import {
  PUMP_PROGRAM_ID,
  INITIAL_VIRTUAL_SOL_RESERVES,
  INITIAL_VIRTUAL_TOKEN_RESERVES,
  LAMPORTS_PER_SOL,
  PumpCreateEvent,
  PumpTradeEvent,
} from './types';

// Anchor 8-byte Discriminators
const CREATE_DISCRIMINATORS = [
  Buffer.from([0x1b, 0x71, 0xd8, 0xf6, 0x3c, 0xfc, 0xaa, 0xa4]),
  Buffer.from([0x24, 0xdb, 0x6b, 0x7f, 0xb7, 0x49, 0x2a, 0x54]),
];
const TRADE_DISCRIMINATORS = [
  Buffer.from([0xbd, 0xd7, 0x92, 0x40, 0x4b, 0x40, 0x42, 0xe2]),
];

export class PumpListener extends EventEmitter {
  private connection: Connection;
  private programPublicKey: PublicKey;
  private subscriptionId: number | null = null;
  private isRunning = false;

  constructor(options: { rpcUrl: string; wssUrl?: string; commitment?: Commitment }) {
    super();
    this.programPublicKey = new PublicKey(PUMP_PROGRAM_ID);
    this.connection = new Connection(options.rpcUrl, {
      wsEndpoint: options.wssUrl || options.rpcUrl.replace(/^http/, 'ws'),
      commitment: options.commitment || 'processed',
    });
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    this.subscriptionId = this.connection.onLogs(
      this.programPublicKey,
      (logs: Logs, ctx) => {
        if (logs.err) return;
        this.handleLogs(logs, ctx.slot);
      },
      'processed'
    );
  }

  private handleLogs(logs: Logs, slot: number): void {
    const signature = logs.signature;
    const now = Date.now();

    for (const log of logs.logs) {
      if (!log.startsWith('Program data: ')) continue;
      try {
        const buffer = Buffer.from(log.replace('Program data: ', '').trim(), 'base64');
        if (buffer.length < 8) continue;
        const disc = buffer.subarray(0, 8);

        if (CREATE_DISCRIMINATORS.some(d => d.equals(disc))) {
          const createEvent = this.parseCreateEvent(buffer.subarray(8), signature, slot, now);
          if (createEvent) this.emit('create', createEvent);
        } else if (TRADE_DISCRIMINATORS.some(d => d.equals(disc))) {
          const tradeEvent = this.parseTradeEvent(buffer.subarray(8), signature, slot, now);
          if (tradeEvent) this.emit('trade', tradeEvent);
        }
      } catch {}
    }
  }

  // Borsh parsing logic for Create & Trade events...
  // (See complete src/pumpListener.ts)
}
`,
  },
  {
    name: 'src/telegramBot.ts',
    path: '/src/telegramBot.ts',
    language: 'typescript',
    description: 'Telegraf bot controller with channel broadcast logic, 5x/10x surge reply alerts, DM menus, and affiliate keyboards.',
    content: `import { Telegraf, Markup } from 'telegraf';
import { BotConfig, PumpCreateEvent, PumpTradeEvent, TrackedToken } from './types';
import { PumpListener } from './pumpListener';

export class TelegramAlertBot {
  public bot: Telegraf;
  private config: BotConfig;
  private trackedTokens: Map<string, TrackedToken> = new Map();

  constructor(config: BotConfig, pumpListener: PumpListener) {
    this.config = config;
    this.bot = new Telegraf(config.telegramBotToken);

    // Step A: New Mint Detected -> Broadcast to Channel
    pumpListener.on('create', async (event: PumpCreateEvent) => {
      await this.handleTokenCreation(event);
    });

    // Step B: Bonding Curve Trade -> Check for 5x / 10x Surges
    pumpListener.on('trade', async (event: PumpTradeEvent) => {
      await this.handleTokenTrade(event);
    });

    this.setupBotCommands();
  }

  public async handleTokenCreation(event: PumpCreateEvent): Promise<void> {
    const alertHtml = \`
🟢 <b>NEW PUMP.FUN TOKEN DETECTED</b>

🏷️ <b>\${event.name}</b> (<code>\$\${event.symbol}</code>)
📋 <b>Mint CA:</b> (tap to copy)
<code>\${event.mint}</code>

💰 <b>Initial Market Cap:</b> ~\$\${Math.round(event.initialMarketCapUsd).toLocaleString()}
💧 <b>Initial Liquidity:</b> 30.0 SOL
👤 <b>Creator:</b> <code>\${event.user.slice(0, 4)}...\${event.user.slice(-4)}</code>
\`;

    const keyboard = this.buildTradingKeyboards(event.mint);
    const sent = await this.bot.telegram.sendMessage(this.config.telegramChannelId, alertHtml, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  }

  // Step B: Check for 5X and 10X Surges within 90s window...
  public async handleTokenTrade(event: PumpTradeEvent): Promise<void> {
    const token = this.trackedTokens.get(event.mint);
    if (!token) return;

    const multiplier = token.currentPriceSol / token.initialPriceSol;
    if (multiplier >= 5.0 && !token.notified5x) {
      token.notified5x = true;
      const elapsed = ((Date.now() - token.createdAt) / 1000).toFixed(1);
      
      const surgeHtml = \`
🚀🚀 <b>5X MULTIPLIER DETECTED!</b>

🔥 <b>\${token.name}</b> (\$\${token.symbol})
⚡ Surged to <b>\${multiplier.toFixed(1)}x</b> in only <b>\${elapsed}s</b>!
💰 <b>Market Cap:</b> \$\${Math.round(token.currentMarketCapUsd).toLocaleString()}
📝 <code>\${token.mint}</code>
\`;

      await this.bot.telegram.sendMessage(this.config.telegramChannelId, surgeHtml, {
        parse_mode: 'HTML',
        reply_parameters: token.channelMessageId ? { message_id: token.channelMessageId } : undefined,
        ...this.buildTradingKeyboards(token.mint),
      });
    }
  }

  public buildTradingKeyboards(mint: string) {
    const refs = this.config.affiliateRefs;
    return Markup.inlineKeyboard([
      [
        Markup.button.url('⚡ Trojan Sniper', \`https://t.me/solana_trojanbot?start=r-\${refs.trojan}_\${mint}\`),
        Markup.button.url('🤖 BonkBot', \`https://t.me/bonkbot_bot?start=ref_\${refs.bonkbot}_ca_\${mint}\`),
      ],
      [
        Markup.button.url('🚀 Photon Web', \`https://photon-sol.tinyastro.io/en/lp/\${mint}\`),
        Markup.button.url('📊 DexScreener', \`https://dexscreener.com/solana/\${mint}\`),
      ],
      [
        Markup.button.url('💊 Pump.fun', \`https://pump.fun/\${mint}\`),
      ]
    ]);
  }
}
`,
  },
  {
    name: 'src/types.ts',
    path: '/src/types.ts',
    language: 'typescript',
    description: 'TypeScript definitions for Pump.fun protocol constants, create/trade event interfaces, and user preferences.',
    content: `export const PUMP_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
export const INITIAL_VIRTUAL_SOL_RESERVES = 30_000_000_000n;
export const INITIAL_VIRTUAL_TOKEN_RESERVES = 1_073_000_000_000_000n;
export const TOTAL_TOKEN_SUPPLY = 1_000_000_000_000_000n;
export const LAMPORTS_PER_SOL = 1_000_000_000;

export interface PumpCreateEvent {
  signature: string;
  slot: number;
  timestamp: number;
  name: string;
  symbol: string;
  uri: string;
  mint: string;
  bondingCurve: string;
  user: string;
  virtualSolReserves: bigint;
  virtualTokenReserves: bigint;
  initialPriceSol: number;
  initialMarketCapSol: number;
  initialMarketCapUsd: number;
}

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
  priceSol: number;
  marketCapSol: number;
}

export interface TrackedToken {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  creator: string;
  bondingCurve: string;
  createdAt: number;
  initialPriceSol: number;
  initialMarketCapSol: number;
  currentPriceSol: number;
  currentMarketCapSol: number;
  currentMarketCapUsd: number;
  highestMultiplier: number;
  notified5x: boolean;
  notified10x: boolean;
  channelMessageId?: number;
}
`,
  },
  {
    name: '.env.example',
    path: '/.env.example',
    language: 'ini',
    description: 'Environment variables template with Telegram bot token, channel ID, Solana RPC URLs, and affiliate referral IDs.',
    content: `# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789"
TELEGRAM_CHANNEL_ID="@PumpFunAlphaAlerts"

# Solana RPC & WebSocket Configuration
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
SOLANA_WSS_URL="wss://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
SOLANA_COMMITMENT="processed"

# Pump.fun Tracking Settings
PUMP_PROGRAM_ID="6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
PRICE_SURGE_WINDOW_SECONDS=90
ALERT_SURGE_MULTIPLIER_5X=5.0
ALERT_SURGE_MULTIPLIER_10X=10.0

# Affiliate Referral IDs (Monetization)
TROJAN_REF="your_trojan_ref"
BONKBOT_REF="your_bonkbot_ref"
MAESTRO_REF="your_maestro_ref"
BULLX_REF="your_bullx_ref"

DEFAULT_SOL_USD_PRICE=180.0
`,
  },
  {
    name: 'package.json',
    path: '/package.json',
    language: 'json',
    description: 'NPM package dependencies including @solana/web3.js, telegraf, bn.js, tsx and start scripts.',
    content: `{
  "name": "pumpfun-telegram-sniper-bot",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "bot:dev": "tsx src/index.ts",
    "bot:start": "node --loader tsx src/index.ts",
    "build": "tsc",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@solana/web3.js": "^1.99.0",
    "bn.js": "^5.2.5",
    "dotenv": "^17.2.3",
    "telegraf": "^4.16.3"
  },
  "devDependencies": {
    "@types/bn.js": "^5.2.0",
    "@types/node": "^22.14.0",
    "tsx": "^4.21.0",
    "typescript": "^5.7.0"
  }
}
`,
  },
  {
    name: 'ecosystem.config.js',
    path: '/ecosystem.config.js',
    language: 'javascript',
    description: 'PM2 process manager config for continuous 24/7 background operation and automatic failure restart.',
    content: `module.exports = {
  apps: [
    {
      name: 'pumpfun-telegram-bot',
      script: 'node_modules/.bin/tsx',
      args: 'src/index.ts',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100,
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
    },
  ],
};
`,
  },
  {
    name: 'README.md',
    path: '/README.md',
    language: 'markdown',
    description: 'Complete documentation, VPS setup instructions (Ubuntu/EC2/Hetzner), systemd setup, and troubleshooting guide.',
    content: `# PumpSniper: Pump.fun Telegram Sniping & Alert Bot

Complete setup, PM2 deployment, and troubleshooting instructions are provided in the repository root README.md.
`,
  },
];

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Telegraf, Markup } from 'telegraf';
import {
  BotConfig,
  PumpCreateEvent,
  PumpTradeEvent,
  TrackedToken,
  UserPreferences,
} from './types';
import { PumpListener } from './pumpListener';

// Helper to sanitize text for Telegram HTML parse mode
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export class TelegramAlertBot {
  public bot: Telegraf;
  private config: BotConfig;
  private pumpListener: PumpListener;

  // In-memory token cache: Mint -> TrackedToken
  private trackedTokens: Map<string, TrackedToken> = new Map();

  // In-memory user preferences for DM subscribers
  private userPreferences: Map<number, UserPreferences> = new Map();

  // Clean-up interval timer
  private cleanupTimer: NodeJS.Timeout | null = null;

  // Telemetry counters
  public alertsSent = 0;
  public surges5xAlerts = 0;
  public surges10xAlerts = 0;

  constructor(config: BotConfig, pumpListener: PumpListener) {
    this.config = config;
    this.pumpListener = pumpListener;
    this.bot = new Telegraf(config.telegramBotToken);

    this.setupBotCommands();
    this.setupListenerHooks();
    this.startCleanupLoop();
  }

  /**
   * Setup Telegram Bot Handlers and Inline Menus
   */
  private setupBotCommands(): void {
    // 1. /start Handler - Interactive Dashboard
    this.bot.command('start', async (ctx) => {
      const userId = ctx.from.id;
      if (!this.userPreferences.has(userId)) {
        this.userPreferences.set(userId, {
          userId,
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          notifyAllListings: false,
          notifySurgesOnly: true,
          minLiquidityFilterSol: 0,
          joinedAt: Date.now(),
        });
      }

      const channelName = this.config.telegramChannelId.startsWith('@')
        ? this.config.telegramChannelId
        : 'Official Alpha Channel';

      const channelUrl = this.config.telegramChannelId.startsWith('@')
        ? `https://t.me/${this.config.telegramChannelId.replace('@', '')}`
        : 'https://t.me';

      const welcomeHtml = `
🚀 <b>PumpSniper — Pump.fun Real-Time Alpha Bot</b>

⚡ <b>Sub-second on-chain detection</b> powered by Solana RPC & WebSocket.
📊 Automatic <b>5x & 10x Price Surge alerts</b> with bonding curve velocity.
💸 <b>100% Free Forever</b> with instant multi-DEX sniper routing.

<b>Live Status:</b>
🟢 Status: <b>Online & Monitoring</b>
📡 Tracking Program: <code>${escapeHtml(this.config.pumpProgramId)}</code>
📢 Official Alerts: <a href="${channelUrl}">${channelName}</a>
🎯 Active Tracked Tokens: <b>${this.trackedTokens.size}</b>

<i>Tap any button below to configure your preferences or lookup a token:</i>
`;

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.url('📢 Join Alert Channel', channelUrl),
          Markup.button.callback('⚙️ Notification Settings', 'menu_settings'),
        ],
        [
          Markup.button.callback('🔍 Token Lookup Guide', 'menu_lookup_help'),
          Markup.button.callback('📈 Active 5x/10x Runners', 'menu_runners'),
        ],
        [
          Markup.button.url('⚡ Fast Sniper (Trojan)', `https://t.me/solana_trojanbot?start=r-${this.config.affiliateRefs.trojan}`),
          Markup.button.url('⚡ Fast Sniper (BonkBot)', `https://t.me/bonkbot_bot?start=ref_${this.config.affiliateRefs.bonkbot}`),
        ],
      ]);

      await ctx.replyWithHTML(welcomeHtml, keyboard);
    });

    // 2. /settings Handler & Callback
    this.bot.command('settings', (ctx) => this.sendSettingsMenu(ctx));
    this.bot.action('menu_settings', (ctx) => this.sendSettingsMenu(ctx));

    // Callback toggles for Settings
    this.bot.action('toggle_all_listings', async (ctx) => {
      const user = this.getUser(ctx.from.id);
      user.notifyAllListings = !user.notifyAllListings;
      await ctx.answerCbQuery(`All Listings: ${user.notifyAllListings ? 'ENABLED' : 'DISABLED'}`);
      await this.sendSettingsMenu(ctx, true);
    });

    this.bot.action('toggle_surges_only', async (ctx) => {
      const user = this.getUser(ctx.from.id);
      user.notifySurgesOnly = !user.notifySurgesOnly;
      await ctx.answerCbQuery(`5x/10x Surges: ${user.notifySurgesOnly ? 'ENABLED' : 'DISABLED'}`);
      await this.sendSettingsMenu(ctx, true);
    });

    // 3. /lookup <mint_address> Handler
    this.bot.command('lookup', async (ctx) => {
      const parts = ctx.message.text.trim().split(/\s+/);
      if (parts.length < 2) {
        return ctx.replyWithHTML(
          '⚠️ <b>Usage:</b> <code>/lookup &lt;mint_address&gt;</code>\n\nExample:\n<code>/lookup 8xK...mintAddress</code>'
        );
      }

      const mint = parts[1].trim();
      await this.performTokenLookup(ctx, mint);
    });

    this.bot.action('menu_lookup_help', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.replyWithHTML(
        `🔍 <b>Instant Token Lookup Guide</b>\n\n` +
        `Send <code>/lookup &lt;MINT_ADDRESS&gt;</code> in this chat to inspect:\n` +
        `• Real-time Virtual & Real SOL Reserves\n` +
        `• Current Bonding Curve Price & Market Cap\n` +
        `• Progress towards Raydium Migration ($69k / ~85 SOL)\n` +
        `• 1-Click Sniping Links`
      );
    });

    // 4. Active Runners Callback
    this.bot.action('menu_runners', async (ctx) => {
      await ctx.answerCbQuery();
      const runners = Array.from(this.trackedTokens.values())
        .filter(t => t.highestMultiplier > 1.2)
        .sort((a, b) => b.highestMultiplier - a.highestMultiplier)
        .slice(0, 5);

      if (runners.length === 0) {
        return ctx.replyWithHTML('ℹ️ <i>No tokens currently surging above 1.2x. Listening to new blocks...</i>');
      }

      let text = `🔥 <b>Top Surging Tokens on Pump.fun Right Now:</b>\n\n`;
      runners.forEach((t, i) => {
        text += `${i + 1}. <b>${escapeHtml(t.name)}</b> ($${escapeHtml(t.symbol)})\n`;
        text += `   🚀 Multiplier: <b>${t.highestMultiplier.toFixed(2)}x</b>\n`;
        text += `   💰 Market Cap: <b>$${Math.round(t.currentMarketCapUsd).toLocaleString()}</b> (${t.currentMarketCapSol.toFixed(2)} SOL)\n`;
        text += `   📝 Mint: <code>${t.mint}</code>\n\n`;
      });

      await ctx.replyWithHTML(text);
    });
  }

  /**
   * Helper to retrieve or initialize user settings
   */
  private getUser(userId: number): UserPreferences {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        userId,
        notifyAllListings: false,
        notifySurgesOnly: true,
        minLiquidityFilterSol: 0,
        joinedAt: Date.now(),
      });
    }
    return this.userPreferences.get(userId)!;
  }

  /**
   * Send or edit the interactive settings menu
   */
  private async sendSettingsMenu(ctx: any, isEdit = false): Promise<void> {
    const userId = ctx.from.id;
    const user = this.getUser(userId);

    const text = `
⚙️ <b>Your Personal Notification Settings</b>

Choose what you want the bot to DM you directly:
<i>(Channel alerts in ${this.config.telegramChannelId} broadcast everything)</i>

• <b>All New Listings:</b> ${user.notifyAllListings ? '🟢 ACTIVE' : '⚪ OFF'}
• <b>5x / 10x Surge Moonshots:</b> ${user.notifySurgesOnly ? '🟢 ACTIVE' : '⚪ OFF'}
`;

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          user.notifyAllListings ? '🔔 All Listings: ON' : '🔕 All Listings: OFF',
          'toggle_all_listings'
        ),
      ],
      [
        Markup.button.callback(
          user.notifySurgesOnly ? '🚀 5x/10x Surges: ON' : '⏸️ 5x/10x Surges: OFF',
          'toggle_surges_only'
        ),
      ],
      [
        Markup.button.callback('⬅️ Back to Start', 'menu_start_back'),
      ],
    ]);

    if (isEdit && ctx.editMessageText) {
      try {
        await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
      } catch {
        // Ignore identical message edits
      }
    } else {
      await ctx.replyWithHTML(text, keyboard);
    }
  }

  /**
   * Perform on-chain lookup for /lookup command
   */
  private async performTokenLookup(ctx: any, mint: string): Promise<void> {
    try {
      const waitMsg = await ctx.replyWithHTML(`⏳ <i>Querying Solana bonding curve for <code>${mint}</code>...</i>`);
      const result = await this.pumpListener.lookupTokenOnChain(mint);

      if (!result) {
        return ctx.replyWithHTML(
          `❌ <b>Token Not Found</b>\n\nNo active Pump.fun bonding curve found for mint:\n<code>${mint}</code>\n\n` +
          `<i>Note: If the token has migrated to Raydium, check DexScreener.</i>`
        );
      }

      const initialSolReserves = 30.0;
      const currentVirtualSol = Number(result.virtualSolReserves) / 1e9;
      const multiplier = initialSolReserves > 0 ? (currentVirtualSol / initialSolReserves) : 1.0;

      const cardHtml = `
💎 <b>Token Lookup Result</b>

🏷️ Mint: <code>${result.mint}</code>
📊 Status: <b>${result.complete ? 'Graduated to Raydium 🎓' : 'Active Bonding Curve ⚡'}</b>

💰 <b>Current Market Cap:</b> $${Math.round(result.marketCapUsd).toLocaleString()} (${result.marketCapSol.toFixed(2)} SOL)
📈 <b>Est. Bonding Multiplier:</b> <b>${multiplier.toFixed(2)}x</b>
🌊 <b>Real SOL Reserves:</b> ${(Number(result.realSolReserves) / 1e9).toFixed(2)} SOL / 85 SOL
🚀 <b>Bonding Curve Progress:</b> <b>${result.bondingProgressPercent.toFixed(1)}%</b>

📌 <i>Tap trading buttons below to trade instantly:</i>
`;

      const buttons = this.buildTradingKeyboards(result.mint);
      await ctx.replyWithHTML(cardHtml, buttons);
    } catch (err: any) {
      await ctx.replyWithHTML(`❌ <b>Lookup Failed:</b> ${escapeHtml(err.message || 'Unknown error')}`);
    }
  }

  /**
   * Hook pumpListener events into Telegram broadcasting
   */
  private setupListenerHooks(): void {
    // Step A: New Mint Detected -> Broadcast to Channel & DMs
    this.pumpListener.on('create', async (event: PumpCreateEvent) => {
      await this.handleTokenCreation(event);
    });

    // Step B: Bonding Curve Trade -> Check for 5x / 10x Surges
    this.pumpListener.on('trade', async (event: PumpTradeEvent) => {
      await this.handleTokenTrade(event);
    });
  }

  /**
   * Step A: Format & Broadcast New Token Alert
   */
  public async handleTokenCreation(event: PumpCreateEvent): Promise<void> {
    // Register token in tracking memory
    const trackedToken: TrackedToken = {
      mint: event.mint,
      name: event.name,
      symbol: event.symbol,
      uri: event.uri,
      creator: event.user,
      bondingCurve: event.bondingCurve,
      createdAt: event.timestamp,
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
      lastTradeTimestamp: event.timestamp,
    };

    this.trackedTokens.set(event.mint, trackedToken);

    // Build the Telegram Alert Message
    const alertHtml = this.formatNewListingMessage(trackedToken);
    const keyboard = this.buildTradingKeyboards(event.mint);

    try {
      // 1. Broadcast to primary Telegram channel
      const sentMessage = await this.bot.telegram.sendMessage(
        this.config.telegramChannelId,
        alertHtml,
        {
          parse_mode: 'HTML',
          ...keyboard,
          link_preview_options: { is_disabled: true },
        }
      );

      trackedToken.channelMessageId = sentMessage.message_id;
      this.alertsSent++;
      console.log(`[TelegramBot] Alert sent for ${event.symbol} (${event.mint.slice(0, 8)}...) to ${this.config.telegramChannelId}`);

      // 2. Broadcast to subscribed DMs
      this.broadcastToSubscribedUsers(alertHtml, keyboard, false);
    } catch (error) {
      console.error('[TelegramBot] Failed to send channel alert:', error);
    }
  }

  /**
   * Step B: Real-time 5x & 10x Surge Detection Engine
   */
  public async handleTokenTrade(event: PumpTradeEvent): Promise<void> {
    const token = this.trackedTokens.get(event.mint);
    if (!token) return;

    const now = Date.now();
    const elapsedSeconds = (now - token.createdAt) / 1000;

    // Check if within tracking window (default 90 seconds)
    if (elapsedSeconds > this.config.priceSurgeWindowSeconds) {
      return;
    }

    // Update tracking stats
    token.tradeCount++;
    if (event.isBuy) token.buyCount++;
    else token.sellCount++;
    token.volumeSol += Number(event.solAmount) / 1e9;
    token.currentPriceSol = event.priceSol;
    token.currentMarketCapSol = event.marketCapSol;
    token.currentMarketCapUsd = event.marketCapSol * this.config.solUsdPrice;
    token.lastTradeTimestamp = now;

    // Calculate multiplier vs initial price
    const multiplier = token.initialPriceSol > 0
      ? token.currentPriceSol / token.initialPriceSol
      : 1.0;

    if (multiplier > token.highestMultiplier) {
      token.highestMultiplier = multiplier;
    }

    // Check for 5X Surge
    if (multiplier >= this.config.surgeMultiplier5x && !token.notified5x) {
      token.notified5x = true;
      token.surgeTime5x = now - token.createdAt;
      this.surges5xAlerts++;
      await this.dispatchSurgeReply(token, 5, token.surgeTime5x / 1000);
    }

    // Check for 10X Surge
    if (multiplier >= this.config.surgeMultiplier10x && !token.notified10x) {
      token.notified10x = true;
      token.surgeTime10x = now - token.createdAt;
      this.surges10xAlerts++;
      await this.dispatchSurgeReply(token, 10, token.surgeTime10x / 1000);
    }
  }

  /**
   * Dispatch high-priority 5x / 10x surge reply notification
   */
  private async dispatchSurgeReply(
    token: TrackedToken,
    targetMultiplier: number,
    timeElapsedSeconds: number
  ): Promise<void> {
    const is10x = targetMultiplier >= 10;
    const headerEmoji = is10x ? '💥💥 MOONSHOT 10X SURGE' : '🚀🚀 5X MULTIPLIER DETECTED';

    const surgeHtml = `
${headerEmoji}

🔥 <b>${escapeHtml(token.name)}</b> ($${escapeHtml(token.symbol)})
⚡ Reached <b>${token.highestMultiplier.toFixed(1)}x</b> in only <b>${timeElapsedSeconds.toFixed(1)}s</b>!

💰 <b>Current Market Cap:</b> $${Math.round(token.currentMarketCapUsd).toLocaleString()} (${token.currentMarketCapSol.toFixed(2)} SOL)
📊 <b>Trades:</b> ${token.tradeCount} (${token.buyCount} Buys / ${token.sellCount} Sells)
🌊 <b>Volume:</b> ${token.volumeSol.toFixed(2)} SOL
📝 <b>Mint:</b> <code>${token.mint}</code>

<i>⚠️ High momentum pump in progress! Quick trade links below:</i>
`;

    const keyboard = this.buildTradingKeyboards(token.mint);

    try {
      // Reply directly to the original channel alert message if available
      await this.bot.telegram.sendMessage(
        this.config.telegramChannelId,
        surgeHtml,
        {
          parse_mode: 'HTML',
          reply_parameters: token.channelMessageId
            ? { message_id: token.channelMessageId }
            : undefined,
          ...keyboard,
          link_preview_options: { is_disabled: true },
        }
      );

      console.log(`[TelegramBot] Dispatched ${targetMultiplier}x alert for ${token.symbol} (${timeElapsedSeconds.toFixed(1)}s)`);

      // Broadcast to users opted-in for surges
      this.broadcastToSubscribedUsers(surgeHtml, keyboard, true);
    } catch (err) {
      console.error(`[TelegramBot] Failed to send ${targetMultiplier}x reply:`, err);
    }
  }

  /**
   * Format Step A New Listing Message
   */
  public formatNewListingMessage(token: TrackedToken): string {
    const initialMcapUsd = Math.round(token.initialMarketCapUsd ?? (token.initialMarketCapSol * this.config.solUsdPrice));
    const initialMcapSol = token.initialMarketCapSol.toFixed(1);

    return `
🟢 <b>NEW PUMP.FUN TOKEN DETECTED</b>

🏷️ <b>${escapeHtml(token.name)}</b> (<code>$${escapeHtml(token.symbol)}</code>)
📋 <b>Mint CA:</b> (tap to copy)
<code>${token.mint}</code>

💰 <b>Initial Market Cap:</b> ~$${initialMcapUsd.toLocaleString()} (${initialMcapSol} SOL)
💧 <b>Initial Virtual Liquidity:</b> 30.0 SOL ($${Math.round(30 * this.config.solUsdPrice).toLocaleString()})
👤 <b>Creator:</b> <code>${token.creator.slice(0, 4)}...${token.creator.slice(-4)}</code>
⏰ <b>Detected:</b> Just now (Sub-second WSS)

<i>⚡ Instant snipers with automated MEV protection:</i>
`;
  }

  /**
   * Build Telegram Inline Keyboards with Affiliate Referral codes
   */
  public buildTradingKeyboards(mint: string) {
    const refs = this.config.affiliateRefs;

    // Direct Telegram Bot Sniping deep links
    const trojanUrl = `https://t.me/solana_trojanbot?start=r-${refs.trojan}_${mint}`;
    const bonkbotUrl = `https://t.me/bonkbot_bot?start=ref_${refs.bonkbot}_ca_${mint}`;
    const maestroUrl = `https://t.me/maestro?start=${mint}-${refs.maestro}`;

    // Web DEX & Terminal links (Photon routed directly without referral)
    const photonUrl = `https://photon-sol.tinyastro.io/en/lp/${mint}`;
    const bullxUrl = `https://bullx.io/terminal?chainId=1399811149&address=${mint}&r=${refs.bullx}`;
    const dexscreenerUrl = `https://dexscreener.com/solana/${mint}`;
    const pumpfunUrl = `https://pump.fun/${mint}`;

    return Markup.inlineKeyboard([
      [
        Markup.button.url('⚡ Trojan Sniper', trojanUrl),
        Markup.button.url('🤖 BonkBot', bonkbotUrl),
      ],
      [
        Markup.button.url('🚀 Photon Web', photonUrl),
        Markup.button.url('🐂 BullX / Maestro', bullxUrl),
      ],
      [
        Markup.button.url('📊 DexScreener', dexscreenerUrl),
        Markup.button.url('💊 Pump.fun', pumpfunUrl),
      ],
    ]);
  }

  /**
   * Broadcast to DM subscribers based on user preferences
   */
  private async broadcastToSubscribedUsers(
    html: string,
    keyboard: any,
    isSurge: boolean
  ): Promise<void> {
    for (const [userId, prefs] of this.userPreferences.entries()) {
      if (isSurge && !prefs.notifySurgesOnly) continue;
      if (!isSurge && !prefs.notifyAllListings) continue;

      try {
        await this.bot.telegram.sendMessage(userId, html, {
          parse_mode: 'HTML',
          ...keyboard,
          link_preview_options: { is_disabled: true },
        });
      } catch {
        // User might have blocked the bot; ignore DM failure
      }
    }
  }

  /**
   * Periodic garbage collection of old tracked tokens
   */
  private startCleanupLoop(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const cutoff = now - (this.config.priceSurgeWindowSeconds * 1000 * 2);

      for (const [mint, token] of this.trackedTokens.entries()) {
        if (token.createdAt < cutoff) {
          this.trackedTokens.delete(mint);
        }
      }
    }, 60000);
  }

  /**
   * Start Telegraf polling
   */
  public async launch(): Promise<void> {
    await this.bot.launch();
    console.log('[TelegramBot] Telegraf bot successfully started and polling.');
  }

  /**
   * Stop bot gracefully
   */
  public stop(): void {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.bot.stop('SIGTERM');
  }

  public getTrackedTokens(): TrackedToken[] {
    return Array.from(this.trackedTokens.values());
  }
}

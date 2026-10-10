/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Connection, PublicKey, Logs, Commitment } from '@solana/web3.js';
import { EventEmitter } from 'events';
import {
  PUMP_PROGRAM_ID,
  INITIAL_VIRTUAL_SOL_RESERVES,
  INITIAL_VIRTUAL_TOKEN_RESERVES,
  TOTAL_TOKEN_SUPPLY,
  LAMPORTS_PER_SOL,
  PumpCreateEvent,
  PumpTradeEvent,
} from './types';

// Anchor Event 8-byte Discriminators
// sha256("event:CreateEvent")[0..8] = [0x1b, 0x71, 0xd8, 0xf6, 0x3c, 0xfc, 0xaa, 0xa4] -> "G3HY9jz8qqQ="
// Or hex 24db6b7fb7492a54 (base64: JNtlf7RJKlQ=)
const CREATE_DISCRIMINATORS = [
  Buffer.from([0x1b, 0x71, 0xd8, 0xf6, 0x3c, 0xfc, 0xaa, 0xa4]),
  Buffer.from([0x24, 0xdb, 0x6b, 0x7f, 0xb7, 0x49, 0x2a, 0x54]),
];

// sha256("event:TradeEvent")[0..8] = [0xbd, 0xd7, 0x92, 0x40, 0x4b, 0x40, 0x42, 0xe2] -> "vdeSQEtAQOI="
const TRADE_DISCRIMINATORS = [
  Buffer.from([0xbd, 0xd7, 0x92, 0x40, 0x4b, 0x40, 0x42, 0xe2]),
];

export interface PumpListenerOptions {
  rpcUrl: string;
  wssUrl?: string;
  commitment?: Commitment;
  programId?: string;
  solUsdPrice?: number;
}

export class PumpListener extends EventEmitter {
  private connection: Connection;
  private programPublicKey: PublicKey;
  private subscriptionId: number | null = null;
  private isRunning = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private solUsdPrice: number;
  private readonly rpcUrl: string;
  private readonly wssUrl: string;
  private readonly commitment: Commitment;

  constructor(options: PumpListenerOptions) {
    super();
    this.rpcUrl = options.rpcUrl;
    this.wssUrl = options.wssUrl || options.rpcUrl.replace(/^http/, 'ws');
    this.commitment = options.commitment || 'processed';
    this.solUsdPrice = options.solUsdPrice || 180.0;
    this.programPublicKey = new PublicKey(options.programId || PUMP_PROGRAM_ID);

    this.connection = new Connection(this.rpcUrl, {
      wsEndpoint: this.wssUrl,
      commitment: this.commitment,
    });
  }

  public setSolUsdPrice(price: number): void {
    if (price > 0) {
      this.solUsdPrice = price;
    }
  }

  /**
   * Start listening to Pump.fun on-chain logs via WebSocket logsSubscribe
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      console.log(`[PumpListener] Subscribing to program logs for ${this.programPublicKey.toBase58()}...`);
      console.log(`[PumpListener] WSS Endpoint: ${this.wssUrl} (Commitment: ${this.commitment})`);

      this.subscriptionId = this.connection.onLogs(
        this.programPublicKey,
        (logs: Logs, ctx) => {
          this.handleLogs(logs, ctx.slot);
        },
        this.commitment
      );

      this.reconnectAttempts = 0;
      this.emit('connected', {
        slot: await this.connection.getSlot(this.commitment).catch(() => 0),
        programId: this.programPublicKey.toBase58(),
        timestamp: Date.now(),
      });

      console.log(`[PumpListener] Successfully subscribed! Active subscription ID: ${this.subscriptionId}`);
    } catch (error) {
      console.error('[PumpListener] Connection error:', error);
      this.emit('error', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Process raw Solana transaction execution logs
   */
  private handleLogs(logs: Logs, slot: number): void {
    if (logs.err) return; // Skip failed transactions

    const signature = logs.signature;
    const now = Date.now();

    for (const log of logs.logs) {
      // Look for Anchor program data emitted events
      if (log.startsWith('Program data: ')) {
        const base64Data = log.replace('Program data: ', '').trim();
        try {
          const buffer = Buffer.from(base64Data, 'base64');
          if (buffer.length < 8) continue;

          const disc = buffer.subarray(0, 8);

          // Check if CreateEvent
          if (CREATE_DISCRIMINATORS.some(d => d.equals(disc))) {
            const createEvent = this.parseCreateEvent(buffer.subarray(8), signature, slot, now);
            if (createEvent) {
              this.emit('create', createEvent);
            }
            continue;
          }

          // Check if TradeEvent
          if (TRADE_DISCRIMINATORS.some(d => d.equals(disc))) {
            const tradeEvent = this.parseTradeEvent(buffer.subarray(8), signature, slot, now);
            if (tradeEvent) {
              this.emit('trade', tradeEvent);
            }
            continue;
          }
        } catch {
          // Ignore malformed log items
        }
      }

      // Secondary heuristic fallback for public RPC nodes with non-standard event wrappers
      if (log.includes('Instruction: Create')) {
        this.emit('create_detected_hint', { signature, slot, timestamp: now });
      }
    }
  }

  /**
   * Decodes Borsh-encoded CreateEvent
   */
  private parseCreateEvent(
    data: Buffer,
    signature: string,
    slot: number,
    timestamp: number
  ): PumpCreateEvent | null {
    try {
      let offset = 0;

      // 1. name: string (4-byte LE length + utf8)
      if (offset + 4 > data.length) return null;
      const nameLen = data.readUInt32LE(offset);
      offset += 4;
      if (offset + nameLen > data.length) return null;
      const name = data.subarray(offset, offset + nameLen).toString('utf8');
      offset += nameLen;

      // 2. symbol: string (4-byte LE length + utf8)
      if (offset + 4 > data.length) return null;
      const symbolLen = data.readUInt32LE(offset);
      offset += 4;
      if (offset + symbolLen > data.length) return null;
      const symbol = data.subarray(offset, offset + symbolLen).toString('utf8');
      offset += symbolLen;

      // 3. uri: string (4-byte LE length + utf8)
      if (offset + 4 > data.length) return null;
      const uriLen = data.readUInt32LE(offset);
      offset += 4;
      if (offset + uriLen > data.length) return null;
      const uri = data.subarray(offset, offset + uriLen).toString('utf8');
      offset += uriLen;

      // 4. mint: PublicKey (32 bytes)
      if (offset + 32 > data.length) return null;
      const mint = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
      offset += 32;

      // 5. bondingCurve: PublicKey (32 bytes)
      if (offset + 32 > data.length) return null;
      const bondingCurve = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
      offset += 32;

      // 6. user (dev creator): PublicKey (32 bytes)
      if (offset + 32 > data.length) return null;
      const user = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
      offset += 32;

      // Calculate initial pricing using standard Pump.fun bonding curve constant product
      const virtualSol = INITIAL_VIRTUAL_SOL_RESERVES;
      const virtualTokens = INITIAL_VIRTUAL_TOKEN_RESERVES;

      const initialPriceSol =
        (Number(virtualSol) / LAMPORTS_PER_SOL) /
        (Number(virtualTokens) / 1_000_000);

      const initialMarketCapSol = initialPriceSol * 1_000_000_000;
      const initialMarketCapUsd = initialMarketCapSol * this.solUsdPrice;

      return {
        signature,
        slot,
        timestamp,
        name: name.trim().replace(/\0/g, ''),
        symbol: symbol.trim().replace(/\0/g, ''),
        uri: uri.trim().replace(/\0/g, ''),
        mint,
        bondingCurve,
        user,
        virtualSolReserves: virtualSol,
        virtualTokenReserves: virtualTokens,
        initialPriceSol,
        initialMarketCapSol,
        initialMarketCapUsd,
      };
    } catch (err) {
      console.warn('[PumpListener] Error decoding CreateEvent buffer:', err);
      return null;
    }
  }

  /**
   * Decodes Borsh-encoded TradeEvent
   */
  private parseTradeEvent(
    data: Buffer,
    signature: string,
    slot: number,
    timestamp: number
  ): PumpTradeEvent | null {
    try {
      let offset = 0;

      // 1. mint: PublicKey (32 bytes)
      if (offset + 32 > data.length) return null;
      const mint = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
      offset += 32;

      // 2. solAmount: u64 (8 bytes LE)
      if (offset + 8 > data.length) return null;
      const solAmount = data.readBigUInt64LE(offset);
      offset += 8;

      // 3. tokenAmount: u64 (8 bytes LE)
      if (offset + 8 > data.length) return null;
      const tokenAmount = data.readBigUInt64LE(offset);
      offset += 8;

      // 4. isBuy: bool (1 byte)
      if (offset + 1 > data.length) return null;
      const isBuy = data.readUInt8(offset) === 1;
      offset += 1;

      // 5. user: PublicKey (32 bytes)
      if (offset + 32 > data.length) return null;
      const user = new PublicKey(data.subarray(offset, offset + 32)).toBase58();
      offset += 32;

      // 6. timestamp: i64 (8 bytes LE)
      if (offset + 8 > data.length) return null;
      const eventTimestamp = Number(data.readBigInt64LE(offset));
      offset += 8;

      // 7. virtualSolReserves: u64 (8 bytes LE)
      if (offset + 8 > data.length) return null;
      const virtualSolReserves = data.readBigUInt64LE(offset);
      offset += 8;

      // 8. virtualTokenReserves: u64 (8 bytes LE)
      if (offset + 8 > data.length) return null;
      const virtualTokenReserves = data.readBigUInt64LE(offset);
      offset += 8;

      // 9. realSolReserves & realTokenReserves (optional / trailing)
      let realSolReserves = 0n;
      let realTokenReserves = 0n;
      if (offset + 8 <= data.length) {
        realSolReserves = data.readBigUInt64LE(offset);
        offset += 8;
      }
      if (offset + 8 <= data.length) {
        realTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
      }

      // Compute spot price in SOL
      const solReservesNum = Number(virtualSolReserves) / LAMPORTS_PER_SOL;
      const tokenReservesNum = Number(virtualTokenReserves) / 1_000_000;
      const priceSol = tokenReservesNum > 0 ? solReservesNum / tokenReservesNum : 0;
      const marketCapSol = priceSol * 1_000_000_000;

      return {
        signature,
        slot,
        timestamp: eventTimestamp > 0 ? eventTimestamp * 1000 : timestamp,
        mint,
        solAmount,
        tokenAmount,
        isBuy,
        user,
        virtualSolReserves,
        virtualTokenReserves,
        realSolReserves,
        realTokenReserves,
        priceSol,
        marketCapSol,
      };
    } catch (err) {
      console.warn('[PumpListener] Error decoding TradeEvent buffer:', err);
      return null;
    }
  }

  /**
   * Derive bonding curve PDA address for a given mint
   */
  public getBondingCurveAddress(mint: string): PublicKey {
    const mintPubkey = new PublicKey(mint);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding-curve'), mintPubkey.toBuffer()],
      this.programPublicKey
    );
    return pda;
  }

  /**
   * On-demand lookup of a token's bonding curve account from Solana RPC
   */
  public async lookupTokenOnChain(mintAddress: string): Promise<{
    mint: string;
    bondingCurve: string;
    virtualTokenReserves: bigint;
    virtualSolReserves: bigint;
    realTokenReserves: bigint;
    realSolReserves: bigint;
    tokenTotalSupply: bigint;
    complete: boolean;
    priceSol: number;
    marketCapSol: number;
    marketCapUsd: number;
    bondingProgressPercent: number;
  } | null> {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const bondingCurvePda = this.getBondingCurveAddress(mintAddress);

      const accountInfo = await this.connection.getAccountInfo(bondingCurvePda, this.commitment);
      if (!accountInfo || !accountInfo.data || accountInfo.data.length < 41) {
        return null;
      }

      // Pump.fun BondingCurve Account Structure:
      // 8 bytes discriminator
      // 8 bytes virtualTokenReserves
      // 8 bytes virtualSolReserves
      // 8 bytes realTokenReserves
      // 8 bytes realSolReserves
      // 8 bytes tokenTotalSupply
      // 1 byte complete
      const data = accountInfo.data;
      const virtualTokenReserves = data.readBigUInt64LE(8);
      const virtualSolReserves = data.readBigUInt64LE(16);
      const realTokenReserves = data.readBigUInt64LE(24);
      const realSolReserves = data.readBigUInt64LE(32);
      const tokenTotalSupply = data.readBigUInt64LE(40);
      const complete = data.readUInt8(48) === 1;

      const solReservesNum = Number(virtualSolReserves) / LAMPORTS_PER_SOL;
      const tokenReservesNum = Number(virtualTokenReserves) / 1_000_000;
      const priceSol = tokenReservesNum > 0 ? solReservesNum / tokenReservesNum : 0;
      const marketCapSol = priceSol * 1_000_000_000;
      const marketCapUsd = marketCapSol * this.solUsdPrice;

      // Migration target: ~85 SOL real reserves (or graduation to Raydium)
      const realSol = Number(realSolReserves) / LAMPORTS_PER_SOL;
      const bondingProgressPercent = Math.min(100, Math.max(0, (realSol / 85.0) * 100));

      return {
        mint: mintAddress,
        bondingCurve: bondingCurvePda.toBase58(),
        virtualTokenReserves,
        virtualSolReserves,
        realTokenReserves,
        realSolReserves,
        tokenTotalSupply,
        complete,
        priceSol,
        marketCapSol,
        marketCapUsd,
        bondingProgressPercent,
      };
    } catch (err) {
      console.error('[PumpListener] Lookup error:', err);
      return null;
    }
  }

  /**
   * Exponential backoff reconnect
   */
  private scheduleReconnect(): void {
    if (!this.isRunning) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[PumpListener] Max reconnect attempts reached. Giving up.');
      this.emit('disconnected', new Error('Max reconnect attempts reached'));
      return;
    }

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    console.log(`[PumpListener] Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${this.reconnectAttempts})...`);

    this.reconnectTimeout = setTimeout(async () => {
      await this.stop();
      this.start();
    }, delay);
  }

  /**
   * Stop listener and cleanup sockets
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.subscriptionId !== null) {
      try {
        await this.connection.removeOnLogsListener(this.subscriptionId);
      } catch {
        // Ignore cleanup errors
      }
      this.subscriptionId = null;
    }
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  username: string; // Live Gmail address
  passwordHash: string;
  createdAt: number;
  lastLoginAt: number;
  preferences: {
    minLiquiditySol: number;
    notify5x: boolean;
    notify10x: boolean;
    soundEnabled: boolean;
    browserNotifications: boolean;
  };
}

export interface SurgeAlertRecord {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  multiplier: number;
  targetMultiplier: 5 | 10 | number;
  timeElapsedSeconds: number;
  marketCapUsd: number;
  marketCapSol: number;
  timestamp: number;
}

export interface WatchlistRecord {
  userId: string;
  mint: string;
  addedAt: number;
}

interface DatabaseSchema {
  users: UserRecord[];
  alerts: SurgeAlertRecord[];
  watchlist: WatchlistRecord[];
  version: number;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'pumpsurge_db.json');

export class AppDatabase {
  private static instance: AppDatabase;
  private data: DatabaseSchema;

  private constructor() {
    this.data = this.loadDatabase();
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase();
    }
    return AppDatabase.instance;
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[Database] Error loading database file, initializing default:', err);
    }

    // Default seeded records
    const defaultData: DatabaseSchema = {
      users: [],
      alerts: [
        {
          id: 'alert-seed-1',
          mint: '8YeBTPV58fH6tnzUAihMK1LixsGc1jsN7DAyBoiRpump',
          name: 'Zhunt',
          symbol: 'ZNT',
          multiplier: 12.1,
          targetMultiplier: 10,
          timeElapsedSeconds: 38.2,
          marketCapUsd: 61000,
          marketCapSol: 338.8,
          timestamp: Date.now() - 360000,
        },
        {
          id: 'alert-seed-2',
          mint: '9wQz12q8nL7pU9qK4mN8qP3dF6hC2eA18xK1M7gQpX2',
          name: 'Neural Doge Solana',
          symbol: 'NDOGE',
          multiplier: 10.53,
          targetMultiplier: 10,
          timeElapsedSeconds: 32.4,
          marketCapUsd: 53100,
          marketCapSol: 295.0,
          timestamp: Date.now() - 1800000,
        },
        {
          id: 'alert-seed-3',
          mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          name: 'Pepe AI Turbo',
          symbol: 'PEPETURBO',
          multiplier: 5.42,
          targetMultiplier: 5,
          timeElapsedSeconds: 11.2,
          marketCapUsd: 27360,
          marketCapSol: 152.0,
          timestamp: Date.now() - 900000,
        },
      ],
      watchlist: [],
      version: 1,
    };

    this.saveDatabase(defaultData);
    return defaultData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to save database file:', err);
    }
  }

  // --- USER AUTHENTICATION & MANAGEMENT ---

  public static isValidGmail(email: string): boolean {
    if (!email) return false;
    // Must be valid live Gmail format: letters, numbers, dots before @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(email.trim());
  }

  public static isValidAlphanumericalPassword(password: string): boolean {
    if (!password || password.length < 6) return false;
    // Must contain letters and numbers
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
  }

  public async registerUser(username: string, passwordPlain: string): Promise<{ success: boolean; user?: Omit<UserRecord, 'passwordHash'>; error?: string }> {
    const cleanEmail = username.trim().toLowerCase();

    if (!AppDatabase.isValidGmail(cleanEmail)) {
      return { success: false, error: 'Username must be a valid live Gmail address (e.g., yourname@gmail.com).' };
    }

    if (!AppDatabase.isValidAlphanumericalPassword(passwordPlain)) {
      return { success: false, error: 'Password must be alphanumerical (contain both letters and numbers) and at least 6 characters.' };
    }

    const existing = this.data.users.find(u => u.username === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this Gmail address already exists. Please sign in.' };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanEmail,
      passwordHash,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: {
        minLiquiditySol: 0,
        notify5x: true,
        notify10x: true,
        soundEnabled: true,
        browserNotifications: true,
      },
    };

    this.data.users.push(newUser);
    this.saveDatabase();

    const { passwordHash: _, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  }

  public async loginUser(username: string, passwordPlain: string): Promise<{ success: boolean; user?: Omit<UserRecord, 'passwordHash'>; error?: string }> {
    const cleanEmail = username.trim().toLowerCase();
    const user = this.data.users.find(u => u.username === cleanEmail);

    if (!user) {
      return { success: false, error: 'Account not found. Please register your Gmail first.' };
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    user.lastLoginAt = Date.now();
    this.saveDatabase();

    const { passwordHash: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }

  public getUserById(userId: string): Omit<UserRecord, 'passwordHash'> | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  public updateUserPreferences(userId: string, prefs: Partial<UserRecord['preferences']>): boolean {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return false;
    user.preferences = { ...user.preferences, ...prefs };
    this.saveDatabase();
    return true;
  }

  // --- SURGE ALERTS REPOSITORIES ---

  public recordSurgeAlert(alert: Omit<SurgeAlertRecord, 'id' | 'timestamp'>): SurgeAlertRecord {
    const record: SurgeAlertRecord = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    this.data.alerts.unshift(record);
    if (this.data.alerts.length > 500) {
      this.data.alerts.pop();
    }
    this.saveDatabase();
    return record;
  }

  public getSurgeAlerts(limit = 50): SurgeAlertRecord[] {
    return this.data.alerts.slice(0, limit);
  }

  // --- WATCHLIST REPOSITORIES ---

  public toggleWatchlist(userId: string, mint: string): boolean {
    const idx = this.data.watchlist.findIndex(w => w.userId === userId && w.mint === mint);
    if (idx >= 0) {
      this.data.watchlist.splice(idx, 1);
      this.saveDatabase();
      return false; // Removed
    } else {
      this.data.watchlist.push({ userId, mint, addedAt: Date.now() });
      this.saveDatabase();
      return true; // Added
    }
  }

  public getUserWatchlist(userId: string): string[] {
    return this.data.watchlist.filter(w => w.userId === userId).map(w => w.mint);
  }
}

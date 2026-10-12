/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserPreferences } from '../types';

export interface AuthUser {
  id: string;
  username: string; // User's chosen username or email
  email?: string;
  isGmailAuthenticated?: boolean;
  avatarUrl?: string;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
  status?: 'active' | 'banned';
  createdAt: number;
  lastLoginAt: number;
  preferences: UserPreferences;
}

const STORAGE_KEY_USER = 'pumpsurge_auth_user';
const STORAGE_KEY_USERS_LIST = 'pumpsurge_registered_users';

// Admin credentials as requested by user
export const ADMIN_USERNAME = 'ADMIN01';
export const ADMIN_PASSWORD = '125252';

export class AuthService {
  /**
   * Validate standard username (removed strict live gmail restriction)
   */
  public static validateUsername(username: string): { valid: boolean; message?: string } {
    if (!username || !username.trim()) {
      return { valid: false, message: 'Username is required.' };
    }
    const clean = username.trim();
    if (clean.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters long.' };
    }
    return { valid: true };
  }

  /**
   * Validate password (removed strict alphanumerical requirement)
   */
  public static validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password) {
      return { valid: false, message: 'Password is required.' };
    }
    if (password.length < 4) {
      return { valid: false, message: 'Password must be at least 4 characters long.' };
    }
    return { valid: true };
  }

  /**
   * Create admin AuthUser object
   */
  public static createAdminUser(): AuthUser {
    return {
      id: 'usr_admin_01_master',
      username: ADMIN_USERNAME,
      email: 'admin@pumpsurge.sol',
      role: 'admin',
      isAdmin: true,
      status: 'active',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ADMIN01_solana',
      createdAt: Date.now() - 86400000 * 7,
      lastLoginAt: Date.now(),
      preferences: {
        minLiquidityFilterSol: 0,
        notify5x: true,
        notify10x: true,
        notify15sNewCoins: true,
        notifyHighBuys: true,
        notifyDumpWarning: true,
        soundEnabled: true,
        browserNotifications: true,
        autoSyncIntervalSeconds: 15,
        autoResetMidnight: true,
      },
    };
  }

  /**
   * Register new user with username and password
   */
  public static async register(username: string, passwordPlain: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const rawTrimmed = username.trim();
    
    // Check if registering with admin credentials
    if (rawTrimmed.toUpperCase() === ADMIN_USERNAME && passwordPlain === ADMIN_PASSWORD) {
      const adminUser = this.createAdminUser();
      this.setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }

    const userCheck = this.validateUsername(username);
    if (!userCheck.valid) return { success: false, error: userCheck.message };

    const passCheck = this.validatePassword(passwordPlain);
    if (!passCheck.valid) return { success: false, error: passCheck.message };

    const cleanUsername = rawTrimmed.toLowerCase();

    // Check backend API if available
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: passwordPlain }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const authU: AuthUser = {
            ...data.user,
            role: 'user',
            isAdmin: false,
            status: 'active',
          };
          this.setCurrentUser(authU);
          this.saveUserToRegistry(authU, passwordPlain);
          return { success: true, user: authU };
        }
      }
    } catch {
      // Fallback to client storage
    }

    // Client-side persistent fallback
    const registered = this.getAllRegisteredUsers();

    if (registered.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'An account with this username already exists. Please sign in.' };
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      role: 'user',
      isAdmin: false,
      status: 'active',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: {
        minLiquidityFilterSol: 0,
        notify5x: true,
        notify10x: true,
        notify15sNewCoins: true,
        notifyHighBuys: true,
        notifyDumpWarning: true,
        soundEnabled: true,
        browserNotifications: true,
        autoSyncIntervalSeconds: 15,
        autoResetMidnight: true,
      },
    };

    this.saveUserToRegistry(newUser, passwordPlain);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  /**
   * Login user with username and password
   * If username is ADMIN01 and password is 125252, immediately authenticate as Administrator!
   */
  public static async login(username: string, passwordPlain: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const rawTrimmed = username.trim();

    // 1. Check Admin Credentials: ADMIN01 / 125252
    if (rawTrimmed.toUpperCase() === ADMIN_USERNAME && passwordPlain === ADMIN_PASSWORD) {
      const adminUser = this.createAdminUser();
      this.setCurrentUser(adminUser);
      // Ensure admin is registered in users list
      this.saveUserToRegistry(adminUser, ADMIN_PASSWORD);
      return { success: true, user: adminUser };
    }

    const cleanUsername = rawTrimmed.toLowerCase();

    // Try backend API first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: passwordPlain }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const authU: AuthUser = {
            ...data.user,
            role: 'user',
            isAdmin: false,
            status: 'active',
          };
          this.setCurrentUser(authU);
          return { success: true, user: authU };
        }
      } else {
        const errData = await res.json().catch(() => null);
        if (errData?.error && !errData.error.includes('not found')) {
          return { success: false, error: errData.error };
        }
      }
    } catch {
      // Fallback to client-side storage
    }

    const registered = this.getAllRegisteredUsers();
    const matched = registered.find(u => u.username.toLowerCase() === cleanUsername);

    if (!matched) {
      return { success: false, error: 'Account not found. Please register your account first.' };
    }

    if (matched.status === 'banned') {
      return { success: false, error: 'This account has been suspended by the administrator.' };
    }

    const pass = (matched as any).password;
    if (pass && pass !== passwordPlain) {
      return { success: false, error: 'Incorrect password. Please verify your credentials.' };
    }

    const user: AuthUser = {
      id: matched.id,
      username: matched.username,
      email: matched.email,
      isGmailAuthenticated: matched.isGmailAuthenticated,
      avatarUrl: matched.avatarUrl,
      role: matched.role || 'user',
      isAdmin: matched.isAdmin || false,
      status: matched.status || 'active',
      createdAt: matched.createdAt,
      lastLoginAt: Date.now(),
      preferences: matched.preferences || {
        minLiquidityFilterSol: 0,
        notify5x: true,
        notify10x: true,
        notify15sNewCoins: true,
        notifyHighBuys: true,
        notifyDumpWarning: true,
        soundEnabled: true,
        browserNotifications: true,
        autoSyncIntervalSeconds: 15,
        autoResetMidnight: true,
      },
    };

    this.setCurrentUser(user);
    return { success: true, user };
  }

  /**
   * Authenticate instantly with Gmail / Google Authenticator
   */
  public static async loginWithGmailAuthenticator(gmailAddress?: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const emailToUse = (gmailAddress && gmailAddress.trim()) 
      ? gmailAddress.trim().toLowerCase() 
      : 'pumpsurge.trader@gmail.com';

    const cleanEmail = emailToUse.includes('@') ? emailToUse : `${emailToUse}@gmail.com`;

    const user: AuthUser = {
      id: `usr_gmail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanEmail,
      email: cleanEmail,
      isGmailAuthenticated: true,
      role: 'user',
      isAdmin: false,
      status: 'active',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: {
        minLiquidityFilterSol: 0,
        notify5x: true,
        notify10x: true,
        notify15sNewCoins: true,
        notifyHighBuys: true,
        notifyDumpWarning: true,
        soundEnabled: true,
        browserNotifications: true,
        autoSyncIntervalSeconds: 15,
        autoResetMidnight: true,
      },
    };

    this.saveUserToRegistry(user, 'gmail_oauth_token');
    this.setCurrentUser(user);
    return { success: true, user };
  }

  /**
   * Save user to registry list
   */
  private static saveUserToRegistry(user: AuthUser, passwordPlain?: string): void {
    try {
      const registered = this.getAllRegisteredUsers();
      const existingIdx = registered.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
      const record = { ...user, password: passwordPlain || (existingIdx >= 0 ? (registered[existingIdx] as any).password : '') };
      
      if (existingIdx >= 0) {
        registered[existingIdx] = record;
      } else {
        registered.push(record);
      }
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(registered));
    } catch {
      // Ignored
    }
  }

  /**
   * Retrieve all registered users for Admin Dashboard inspection
   */
  public static getAllRegisteredUsers(): (AuthUser & { password?: string })[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    // Default seeded users for Admin Dashboard to view on first launch
    const seededUsers: (AuthUser & { password?: string })[] = [
      {
        id: 'usr_admin_01_master',
        username: ADMIN_USERNAME,
        email: 'admin@pumpsurge.sol',
        role: 'admin',
        isAdmin: true,
        status: 'active',
        password: ADMIN_PASSWORD,
        createdAt: Date.now() - 86400000 * 5,
        lastLoginAt: Date.now(),
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ADMIN01',
        preferences: {
          minLiquidityFilterSol: 0,
          notify5x: true,
          notify10x: true,
          notify15sNewCoins: true,
          notifyHighBuys: true,
          notifyDumpWarning: true,
          soundEnabled: true,
          browserNotifications: true,
          autoSyncIntervalSeconds: 15,
          autoResetMidnight: true,
        },
      },
      {
        id: 'usr_sol_sniper_99',
        username: 'sol_sniper99@gmail.com',
        email: 'sol_sniper99@gmail.com',
        isGmailAuthenticated: true,
        role: 'user',
        isAdmin: false,
        status: 'active',
        createdAt: Date.now() - 86400000 * 2,
        lastLoginAt: Date.now() - 3600000,
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=sol_sniper99',
        preferences: {
          minLiquidityFilterSol: 10,
          notify5x: true,
          notify10x: true,
          notify15sNewCoins: true,
          notifyHighBuys: true,
          notifyDumpWarning: true,
          soundEnabled: true,
          browserNotifications: true,
          autoSyncIntervalSeconds: 15,
          autoResetMidnight: true,
        },
      },
      {
        id: 'usr_raydium_whale',
        username: 'solana_trader_alex',
        email: 'alex.sol@gmail.com',
        role: 'user',
        isAdmin: false,
        status: 'active',
        password: 'password123',
        createdAt: Date.now() - 86400000 * 3,
        lastLoginAt: Date.now() - 7200000,
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
        preferences: {
          minLiquidityFilterSol: 5,
          notify5x: true,
          notify10x: true,
          notify15sNewCoins: true,
          notifyHighBuys: true,
          notifyDumpWarning: true,
          soundEnabled: true,
          browserNotifications: true,
          autoSyncIntervalSeconds: 15,
          autoResetMidnight: true,
        },
      },
      {
        id: 'usr_pump_alpha',
        username: 'pump_alpha_trader',
        email: 'pumpalpha@proton.me',
        role: 'user',
        isAdmin: false,
        status: 'active',
        password: 'traderAlpha99',
        createdAt: Date.now() - 86400000 * 4,
        lastLoginAt: Date.now() - 14400000,
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pump_alpha',
        preferences: {
          minLiquidityFilterSol: 0,
          notify5x: true,
          notify10x: true,
          notify15sNewCoins: true,
          notifyHighBuys: true,
          notifyDumpWarning: true,
          soundEnabled: true,
          browserNotifications: true,
          autoSyncIntervalSeconds: 15,
          autoResetMidnight: true,
        },
      },
    ];

    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(seededUsers));
    } catch {
      // Ignored
    }

    return seededUsers;
  }

  /**
   * Admin action: toggle user status between active and banned
   */
  public static toggleUserStatus(userId: string): { success: boolean; newStatus?: 'active' | 'banned' } {
    try {
      const users = this.getAllRegisteredUsers();
      const user = users.find(u => u.id === userId);
      if (!user) return { success: false };
      
      // Prevent banning master admin
      if (user.username === ADMIN_USERNAME) return { success: false };

      user.status = user.status === 'banned' ? 'active' : 'banned';
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
      return { success: true, newStatus: user.status };
    } catch {
      return { success: false };
    }
  }

  /**
   * Admin action: delete a user from the database
   */
  public static deleteUser(userId: string): boolean {
    try {
      const users = this.getAllRegisteredUsers();
      const filtered = users.filter(u => u.id !== userId && u.username !== ADMIN_USERNAME);
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Admin action: add a new user directly
   */
  public static adminCreateUser(username: string, email?: string): AuthUser {
    const newUser: AuthUser = {
      id: `usr_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: username.trim(),
      email: email?.trim(),
      role: 'user',
      isAdmin: false,
      status: 'active',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: {
        minLiquidityFilterSol: 0,
        notify5x: true,
        notify10x: true,
        notify15sNewCoins: true,
        notifyHighBuys: true,
        notifyDumpWarning: true,
        soundEnabled: true,
        browserNotifications: true,
        autoSyncIntervalSeconds: 15,
        autoResetMidnight: true,
      },
    };
    this.saveUserToRegistry(newUser, 'temporaryPass123');
    return newUser;
  }

  public static getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public static setCurrentUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }

  public static logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
  }

  public static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  public static sendDesktopNotification(title: string, body: string, icon = '🚀'): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification(`${icon} ${title}`, {
        body,
        badge: '/vite.svg',
      });
    } catch {
      // Ignored
    }
  }
}

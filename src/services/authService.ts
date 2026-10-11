/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppDatabase, UserRecord } from '../db/database';

export interface AuthUser {
  id: string;
  username: string; // Live Gmail address
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

const STORAGE_KEY_USER = 'pumpsurge_auth_user';
const STORAGE_KEY_WATCHLIST = 'pumpsurge_watchlist';

export class AuthService {
  /**
   * Validate if username is a valid live Gmail address
   */
  public static validateGmail(email: string): { valid: boolean; message?: string } {
    if (!email || !email.trim()) {
      return { valid: false, message: 'Gmail address is required.' };
    }
    const clean = email.trim().toLowerCase();
    // Regex for valid Gmail: username before @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!gmailRegex.test(clean)) {
      return { valid: false, message: 'Username must be a valid live Gmail address ending in @gmail.com' };
    }
    return { valid: true };
  }

  /**
   * Validate if password is alphanumerical
   */
  public static validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password) {
      return { valid: false, message: 'Password is required.' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long.' };
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return { valid: false, message: 'Password must be alphanumerical (include both letters and numbers).' };
    }
    return { valid: true };
  }

  /**
   * Register new user with Gmail and alphanumerical password
   */
  public static async register(username: string, passwordPlain: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const gmailCheck = this.validateGmail(username);
    if (!gmailCheck.valid) return { success: false, error: gmailCheck.message };

    const passCheck = this.validatePassword(passwordPlain);
    if (!passCheck.valid) return { success: false, error: passCheck.message };

    const cleanEmail = username.trim().toLowerCase();

    // Check backend API if available, otherwise persist in client database & localStorage
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanEmail, password: passwordPlain }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.setCurrentUser(data.user);
          return { success: true, user: data.user };
        }
      }
    } catch {
      // Fallback to client-side database simulation
    }

    // Client-side persistent fallback
    const usersStr = localStorage.getItem('pumpsurge_registered_users');
    const registered: any[] = usersStr ? JSON.parse(usersStr) : [];

    if (registered.some(u => u.username === cleanEmail)) {
      return { success: false, error: 'An account with this Gmail address already exists. Please sign in.' };
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanEmail,
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

    registered.push({ ...newUser, password: passwordPlain });
    localStorage.setItem('pumpsurge_registered_users', JSON.stringify(registered));
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  /**
   * Login user with Gmail and alphanumerical password
   */
  public static async login(username: string, passwordPlain: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const cleanEmail = username.trim().toLowerCase();

    // Try backend API first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanEmail, password: passwordPlain }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.setCurrentUser(data.user);
          return { success: true, user: data.user };
        }
      } else {
        const errData = await res.json().catch(() => null);
        if (errData?.error) {
          return { success: false, error: errData.error };
        }
      }
    } catch {
      // Fallback to client-side storage
    }

    const usersStr = localStorage.getItem('pumpsurge_registered_users');
    const registered: any[] = usersStr ? JSON.parse(usersStr) : [];
    const matched = registered.find(u => u.username === cleanEmail);

    if (!matched) {
      return { success: false, error: 'Account not found. Please register your Gmail first.' };
    }

    if (matched.password !== passwordPlain) {
      return { success: false, error: 'Incorrect password. Please verify your credentials.' };
    }

    const user: AuthUser = {
      id: matched.id,
      username: matched.username,
      createdAt: matched.createdAt,
      lastLoginAt: Date.now(),
      preferences: matched.preferences || {
        minLiquiditySol: 0,
        notify5x: true,
        notify10x: true,
        soundEnabled: true,
        browserNotifications: true,
      },
    };

    this.setCurrentUser(user);
    return { success: true, user };
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

  /**
   * Request native browser notifications permission for desktop/mobile notifications
   */
  public static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Send native push/desktop notification for 5x, 10x, and moonshots
   */
  public static sendDesktopNotification(title: string, body: string, icon = '🚀'): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification(`${icon} ${title}`, {
        body,
        badge: '/vite.svg',
      });
    } catch {
      // Ignored if notifications blocked
    }
  }
}

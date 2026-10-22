/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Settings, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Save, 
  RefreshCw, 
  Search, 
  Mail, 
  Lock, 
  Globe, 
  Bell, 
  Sparkles,
  Zap,
  TrendingDown,
  RotateCcw,
  Flame,
  Radio,
  Download,
  Database,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  Activity
} from 'lucide-react';
import { 
  AuthService, 
  AuthUser, 
  ADMIN_USERNAME, 
  ADMIN_PASSWORD,
  ADMIN_EMAIL 
} from '../services/authService';
import { SiteConfigService, SiteConfig } from '../services/siteConfigService';
import { TrackedToken } from '../types';

interface AdminDashboardProps {
  onSiteConfigUpdated?: (config: SiteConfig) => void;
  onInjectToken?: (token: any) => void;
  onTriggerDump?: () => void;
  onFactoryResetApp?: () => void;
  onResetWhaleRadar?: () => void;
  onResetTokenCache?: () => void;
  onClearLogs?: () => void;
  onForceMidnightReset?: () => void;
  onSimulateWhaleBuy?: (solAmount?: number, tokenMint?: string) => void;
  onSimulateWhaleSell?: (tokenMint?: string) => void;
  onSimulateMoonshot?: (multiplier: number) => void;
  tokens?: TrackedToken[];
  whaleWalletsCount?: number;
  whaleTxCount?: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSiteConfigUpdated,
  onInjectToken,
  onTriggerDump,
  onFactoryResetApp,
  onResetWhaleRadar,
  onResetTokenCache,
  onClearLogs,
  onForceMidnightReset,
  onSimulateWhaleBuy,
  onSimulateWhaleSell,
  onSimulateMoonshot,
  tokens = [],
  whaleWalletsCount = 0,
  whaleTxCount = 0,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'app_reset' | 'whale_controls' | 'site_edits' | 'token_injector'>('app_reset');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState<SiteConfig>(SiteConfigService.getConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // New user modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);

  // Token injector fields
  const [injectName, setInjectName] = useState('CYBER SURGE');
  const [injectSymbol, setInjectSymbol] = useState('CYBERSURGE');
  const [injectMultiplier, setInjectMultiplier] = useState(5.5);

  // Whale buy injection fields
  const [customWhaleBuySol, setCustomWhaleBuySol] = useState(3.5);
  const [selectedWhaleTokenMint, setSelectedWhaleTokenMint] = useState('');

  const loadUsers = () => {
    const list = AuthService.getAllRegisteredUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
    setConfig(SiteConfigService.getConfig());
  }, []);

  const handleToggleBan = (userId: string) => {
    AuthService.toggleUserStatus(userId);
    loadUsers();
  };

  const handleToggleRole = (userId: string) => {
    const res = AuthService.toggleUserRole(userId);
    if (res.success) {
      loadUsers();
      setResetFeedback(`User role changed to ${res.newRole === 'admin' ? 'Administrator' : 'Trader'}.`);
      setTimeout(() => setResetFeedback(null), 3000);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Delete this user from the system registry?')) {
      AuthService.deleteUser(userId);
      loadUsers();
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    const u = AuthService.adminCreateUser(newUsername, newUserEmail);
    if (newUserIsAdmin && u.id) {
      AuthService.toggleUserRole(u.id);
    }
    setNewUsername('');
    setNewUserEmail('');
    setNewUserIsAdmin(false);
    setShowAddUser(false);
    loadUsers();
  };

  const handleSaveConfig = () => {
    const updated = SiteConfigService.saveConfig(config);
    setConfig(updated);
    if (onSiteConfigUpdated) onSiteConfigUpdated(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all site customizations to default 10-second sync settings?')) {
      const def = SiteConfigService.resetToDefault();
      setConfig(def);
      if (onSiteConfigUpdated) onSiteConfigUpdated(def);
    }
  };

  // 1. Factory Reset App Handler
  const handleExecuteFactoryReset = () => {
    const confirmPrompt = window.confirm(
      '⚠️ WARNING: Are you sure you want to perform a FULL FACTORY RESET of the app?\n\n' +
      'This will:\n' +
      '• Wipe all cached tokens & live price histories\n' +
      '• Clear 1+ SOL whale wallets & buy/sell records\n' +
      '• Reset terminal logs & notifications feed\n' +
      '• Restore default 10s sync intervals and site configuration\n\n' +
      'Proceed with factory reset?'
    );
    if (!confirmPrompt) return;

    if (onFactoryResetApp) {
      onFactoryResetApp();
    } else {
      AuthService.resetAllAppData();
      window.location.reload();
    }
    setResetFeedback('⚡ Factory Reset Complete! App refreshed to initial clean state.');
    setTimeout(() => setResetFeedback(null), 4000);
  };

  // 2. Reset Whale Radar Only
  const handleExecuteResetWhaleRadar = () => {
    if (window.confirm('Clear all tracked 1+ SOL whale wallets, transactions, and holdings timelines?')) {
      if (onResetWhaleRadar) {
        onResetWhaleRadar();
      }
      setResetFeedback('🐋 Whale Radar Reset! Fresh 1+ SOL tracker session initialized.');
      setTimeout(() => setResetFeedback(null), 3000);
    }
  };

  // 3. Reset Live Token Cache Only
  const handleExecuteResetTokenCache = () => {
    if (onResetTokenCache) {
      onResetTokenCache();
      setResetFeedback('🔄 Token Cache Purged! Forcing immediate 10s real-time Solana DEX sync.');
      setTimeout(() => setResetFeedback(null), 3000);
    }
  };

  // 4. Clear Logs & Notifications
  const handleExecuteClearLogs = () => {
    if (onClearLogs) {
      onClearLogs();
      setResetFeedback('🧹 Terminal Event Logs & Notification Inbox Cleared.');
      setTimeout(() => setResetFeedback(null), 3000);
    }
  };

  // 5. Force Midnight Reset
  const handleExecuteMidnightReset = () => {
    if (onForceMidnightReset) {
      onForceMidnightReset();
      setResetFeedback('⏰ Manual 00:00 Midnight Rotation Executed: All daily tickers refreshed.');
      setTimeout(() => setResetFeedback(null), 3000);
    }
  };

  // 6. Export Database Backup
  const handleExportSystemBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        siteConfig: config,
        registeredUsers: AuthService.getAllRegisteredUsers().map(u => ({ ...u, password: '[REDACTED]' })),
        tokensCount: tokens.length,
        tokensSample: tokens.slice(0, 15),
        whaleWalletsCount,
        whaleTxCount,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pumpsurge-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setResetFeedback('💾 Database snapshot exported to JSON.');
      setTimeout(() => setResetFeedback(null), 3000);
    } catch (e: any) {
      alert('Export failed: ' + e.message);
    }
  };

  const handleInjectTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectName.trim() || !injectSymbol.trim()) return;

    const mockMint = `${injectSymbol.slice(0, 4)}Pump${Math.random().toString(36).substring(2, 8)}SoL`;
    const initialPrice = 0.000000032;
    const currentPrice = initialPrice * injectMultiplier;
    const isDump = injectMultiplier < config.dumpThresholdMultiplier;

    const newToken: any = {
      mint: mockMint,
      name: injectName.trim(),
      symbol: injectSymbol.trim().toUpperCase(),
      uri: 'https://pump.fun',
      creator: 'ADMIN_INJECTOR',
      bondingCurve: 'AdminCurve11111111111111111111111111111111',
      createdAt: Date.now() - 30000,
      initialPriceSol: initialPrice,
      initialMarketCapSol: 28,
      initialMarketCapUsd: 4200,
      currentPriceSol: currentPrice,
      currentMarketCapSol: 28 * injectMultiplier,
      currentMarketCapUsd: 4200 * injectMultiplier,
      highestMultiplier: Math.max(injectMultiplier, 4.2),
      notified5x: injectMultiplier >= 5.0,
      notified10x: injectMultiplier >= 10.0,
      tradeCount: 42,
      buyCount: isDump ? 12 : 36,
      sellCount: isDump ? 30 : 6,
      volumeSol: 18.5,
      lastTradeTimestamp: Date.now(),
      isHighBuys: !isDump && injectMultiplier >= 1.5,
      buyVelocity: isDump ? 28 : 88,
      priceChange10s: isDump ? -45 : 62,
      priceChange15s: isDump ? -45 : 62,
      isDumped: isDump,
      dumpWarning: isDump,
      dumpPeakMultiplier: 4.2,
      dumpCurrentMultiplier: injectMultiplier,
      dumpDropPercent: isDump ? Math.round(((4.2 - injectMultiplier) / 4.2) * 100) : 0,
      dumpTimestamp: isDump ? Date.now() : undefined,
    };

    if (onInjectToken) {
      onInjectToken(newToken);
    }
    setResetFeedback(`Token "${injectName}" ($${injectSymbol}) injected into live feed!`);
    setTimeout(() => setResetFeedback(null), 3000);
  };

  const filteredUsers = users.filter((u) => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = users.filter(u => u.status !== 'banned').length;
  const adminCount = users.filter(u => u.role === 'admin' || u.isAdmin).length;
  const gmailCount = users.filter(u => u.isGmailAuthenticated).length;
  const bannedCount = users.filter(u => u.status === 'banned').length;

  return (
    <div className="space-y-6">
      {/* Admin Top Command Center Banner - Neon Blue and Black */}
      <div className="bg-black border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.35)]">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Admin Master Console</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-black text-[11px] font-mono font-black shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                  SUPER ADMIN
                </span>
                <span className="hidden sm:inline-block text-zinc-500 text-xs font-mono">
                  {ADMIN_EMAIL}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full app control: Reset the app, test live whale simulations, manage users &amp; broadcast urgent announcements.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExecuteFactoryReset}
              className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              title="Full App Factory Reset"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Reset App</span>
            </button>

            <button
              onClick={handleExportSystemBackup}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Export Snapshot JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backup</span>
            </button>

            <button
              onClick={loadUsers}
              className="px-3 py-2 rounded-xl bg-black hover:bg-zinc-900 border border-cyan-500/30 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Refresh Registry"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {resetFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-mono">{resetFeedback}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('app_reset')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeAdminTab === 'app_reset'
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-[#030611] text-zinc-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>App Reset &amp; Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('whale_controls')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeAdminTab === 'whale_controls'
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-[#030611] text-zinc-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Whale Radar Simulator</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeAdminTab === 'users'
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-[#030611] text-zinc-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users &amp; Roles ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('site_edits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeAdminTab === 'site_edits'
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-[#030611] text-zinc-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>10s Sync &amp; Customizer</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('token_injector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeAdminTab === 'token_injector'
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-[#030611] text-zinc-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Token Injector</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: APP RESET & DIAGNOSTICS SUITE                     */}
      {/* ======================================================== */}
      {activeAdminTab === 'app_reset' && (
        <div className="space-y-6">
          {/* Diagnostic Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,240,255,0.06)]">
              <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold font-mono">Sync Interval</div>
              <div className="text-2xl font-black text-white mt-1 font-mono">10 SECONDS</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">High-frequency Solana DEX loop</div>
            </div>

            <div className="bg-black border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,240,255,0.06)]">
              <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-mono">Active Tokens</div>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{tokens.length} COINS</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Cached in local storage</div>
            </div>

            <div className="bg-black border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,240,255,0.06)]">
              <div className="text-[11px] uppercase tracking-wider text-cyan-300 font-bold font-mono">Whale Wallets</div>
              <div className="text-2xl font-black text-cyan-300 mt-1 font-mono">{whaleWalletsCount} WALLETS</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Wallets with &gt;= 1 SOL buys today</div>
            </div>

            <div className="bg-black border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,240,255,0.06)]">
              <div className="text-[11px] uppercase tracking-wider text-blue-400 font-bold font-mono">Whale Trades</div>
              <div className="text-2xl font-black text-blue-400 mt-1 font-mono">{whaleTxCount} EXECUTIONS</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Total buys and sells logged</div>
            </div>
          </div>

          {/* Reset App Action Matrix */}
          <div className="bg-black border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,240,255,0.1)] space-y-6">
            <div className="pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-cyan-400" />
                Administrative Reset Controls
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Execute granular or global resets on the application state, caches, whale tracking histories, and event logs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Full Factory Reset */}
              <div className="p-5 rounded-2xl bg-[#030611] border border-red-500/40 space-y-3 relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30 font-bold uppercase">
                    Destructive Action
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Full Factory Reset Entire App</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Purges all browser storage, clears cached tokens, wipes whale tracking data, resets the 10-second sync cadence, and returns the app to pristine state.
                  </p>
                </div>
                <button
                  onClick={handleExecuteFactoryReset}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Execute Full Factory Reset</span>
                </button>
              </div>

              {/* Option 2: Reset Whale Radar */}
              <div className="p-5 rounded-2xl bg-[#030611] border border-cyan-500/30 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold uppercase">
                    Whale Radar
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Reset Whale Radar &amp; Holdings</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Clears all accumulated 1+ SOL whale wallets, transaction logs, and buy/sell chronological timelines without affecting app accounts.
                  </p>
                </div>
                <button
                  onClick={handleExecuteResetWhaleRadar}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Whale Radar Data</span>
                </button>
              </div>

              {/* Option 3: Reset Token Cache & Force 10s Sync */}
              <div className="p-5 rounded-2xl bg-[#030611] border border-cyan-500/30 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 font-bold uppercase">
                    10s Stream
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Flush Token Cache &amp; Force Sync</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Wipes the in-memory Solana DEX coin list and triggers an immediate on-chain fetch across pump.fun trading pools.
                  </p>
                </div>
                <button
                  onClick={handleExecuteResetTokenCache}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Flush Tokens &amp; Force Sync</span>
                </button>
              </div>

              {/* Option 4: Purge Terminal Logs & Alerts */}
              <div className="p-5 rounded-2xl bg-[#030611] border border-cyan-500/30 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/20 text-zinc-300">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 font-bold uppercase">
                    Event Logs
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Purge Terminal Logs &amp; Notifications</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Clears the docked terminal logs stream and empties the notification drawer feed.
                  </p>
                </div>
                <button
                  onClick={handleExecuteClearLogs}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Logs &amp; Alerts Feed</span>
                </button>
              </div>
            </div>

            {/* Daily 00:00 Midnight Trigger */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-white/5">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>Force 00:00 Midnight Daily Rotation</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Simulates the automated 24h midnight clock rotation, clearing historical daily logs and resetting 24-hour buy tracking.
                </p>
              </div>
              <button
                onClick={handleExecuteMidnightReset}
                className="px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-300 text-xs font-bold font-mono transition shrink-0"
              >
                Trigger 00:00 Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: WHALE RADAR INJECTIONS & SIMULATOR                */}
      {/* ======================================================== */}
      {activeAdminTab === 'whale_controls' && (
        <div className="space-y-6">
          <div className="bg-black border border-cyan-500/40 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                Live 1+ SOL Whale Simulator &amp; Event Injector
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Inject whale buys (&gt;= 1 SOL) and whale sells into the live Whale Radar to test on-chain timeline tracking, realized PnL calculations, and duration holding analytics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buy Injection Card */}
              <div className="p-5 rounded-2xl bg-[#030611] border border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Simulate 1+ SOL Whale Buy</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Execute a buy order of 1.0 SOL or greater. The radar records the exact timestamp, tokens purchased, and adds the coin to the whale&apos;s daily breakdown.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex justify-between">
                      <span>SOL Amount Spent:</span>
                      <strong className="text-cyan-400 font-mono">{customWhaleBuySol.toFixed(1)} SOL</strong>
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="25.0"
                      step="0.5"
                      value={customWhaleBuySol}
                      onChange={(e) => setCustomWhaleBuySol(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                      <span>1.0 SOL (Min Whale)</span>
                      <span>5.0 SOL (High Roller)</span>
                      <span>25.0 SOL (Mega Whale)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Target Coin (Optional)</label>
                    <select
                      value={selectedWhaleTokenMint}
                      onChange={(e) => setSelectedWhaleTokenMint(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-cyan-500/30 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-400 font-mono"
                    >
                      <option value="">Random Active Token from Stream</option>
                      {tokens.slice(0, 15).map(t => (
                        <option key={t.mint} value={t.mint}>
                          {t.name} (${t.symbol}) - {t.highestMultiplier.toFixed(1)}x
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (onSimulateWhaleBuy) {
                        onSimulateWhaleBuy(customWhaleBuySol, selectedWhaleTokenMint || undefined);
                        setResetFeedback(`🐋 Whale buy of ${customWhaleBuySol} SOL injected! Check Whale Radar.`);
                        setTimeout(() => setResetFeedback(null), 3000);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition active:scale-95"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Inject {customWhaleBuySol} SOL Whale Buy</span>
                  </button>
                </div>
              </div>

              {/* Sell / Dump Injection Card */}
              <div className="p-5 rounded-2xl bg-[#030611] border border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <TrendingDown className="w-4 h-4" />
                  <span>Simulate Whale Profit-Taking / Sell</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Simulates a whale selling off their accumulated position. The radar logs the sell execution time, calculates realized SOL profit/loss, and updates holding status to &apos;sold&apos; or &apos;partially_sold&apos;.
                </p>

                <div className="space-y-3 pt-4">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-300 space-y-1">
                    <div className="font-semibold text-white">Live Execution Highlights:</div>
                    <ul className="list-disc pl-4 text-zinc-400 space-y-0.5 text-[11px]">
                      <li>Records exact sell timestamp and execution slot</li>
                      <li>Computes hold duration from initial buy</li>
                      <li>Calculates realized PnL (+/- SOL and %)</li>
                      <li>Updates chronological trade timeline</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (onSimulateWhaleSell) {
                        onSimulateWhaleSell(selectedWhaleTokenMint || undefined);
                        setResetFeedback('🔴 Whale sell event simulated! Check Whale Radar timeline.');
                        setTimeout(() => setResetFeedback(null), 3000);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition active:scale-95"
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>Inject Whale Sell / Profit Taking</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Multiplier Surge Triggers */}
            <div className="pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
                Quick Multiplier Sentinels &amp; Moonshots
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    if (onSimulateMoonshot) onSimulateMoonshot(5.5);
                    setResetFeedback('🚀 5X Multiplier Surge triggered on live stream!');
                    setTimeout(() => setResetFeedback(null), 3000);
                  }}
                  className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-cyan-500/40 text-left transition"
                >
                  <div className="text-xs font-bold text-cyan-400">Trigger 5X Surge</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Dispatches 5X velocity alert</div>
                </button>

                <button
                  onClick={() => {
                    if (onSimulateMoonshot) onSimulateMoonshot(12.0);
                    setResetFeedback('💥 10X Moonshot Alert triggered on live stream!');
                    setTimeout(() => setResetFeedback(null), 3000);
                  }}
                  className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-cyan-500/40 text-left transition"
                >
                  <div className="text-xs font-bold text-white">Trigger 10X Moonshot</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Dispatches 10X audio &amp; alert</div>
                </button>

                <button
                  onClick={() => {
                    if (onTriggerDump) onTriggerDump();
                    setResetFeedback('⚠️ Warning Coin Dumping (&lt; 3X) alarm dispatched!');
                    setTimeout(() => setResetFeedback(null), 3000);
                  }}
                  className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-rose-500/40 text-left transition"
                >
                  <div className="text-xs font-bold text-rose-400">Trigger Dumping (&lt; 3X)</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Fires warning dumping siren</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: USER MANAGEMENT & ROLE CONTROLLER                 */}
      {/* ======================================================== */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black border border-cyan-500/30 rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Total Users</div>
              <div className="text-2xl font-black text-white mt-1 font-mono">{users.length}</div>
            </div>
            <div className="bg-black border border-cyan-500/30 rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold font-mono">Administrators</div>
              <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">{adminCount}</div>
            </div>
            <div className="bg-black border border-cyan-500/30 rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-mono">Active Traders</div>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{activeCount}</div>
            </div>
            <div className="bg-black border border-cyan-500/30 rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-rose-400 font-bold font-mono">Suspended</div>
              <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{bannedCount}</div>
            </div>
          </div>

          {/* Search bar and Add User */}
          <div className="bg-black border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search registered user by username, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-cyan-500/30 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create User Account</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-black border border-cyan-500/30 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#030611] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-cyan-500/20 font-mono">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Auth Method</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/60 font-mono">
                  {filteredUsers.map((u) => {
                    const isMaster = u.username === ADMIN_USERNAME || u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                    const isBanned = u.status === 'banned';
                    const isAdmin = u.role === 'admin' || u.isAdmin;

                    return (
                      <tr key={u.id} className="hover:bg-cyan-950/20 transition">
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-cyan-500/30 flex items-center justify-center overflow-hidden shrink-0">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-cyan-400">{u.username.slice(0, 1).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                                <span>{u.username}</span>
                                {isMaster && (
                                  <span className="px-1.5 py-0.2 bg-cyan-400 text-black font-black rounded text-[9px] font-mono">
                                    MASTER
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate">
                                {u.email || (u.username.includes('@') ? u.username : `${u.username}@sol.user`)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isAdmin
                              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/40'
                              : 'bg-zinc-900 text-zinc-400'
                          }`}>
                            {isAdmin ? 'Administrator' : 'Trader'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.isGmailAuthenticated ? (
                            <span className="text-cyan-400 flex items-center gap-1 font-sans text-xs">
                              <Mail className="w-3.5 h-3.5" />
                              <span>Google Auth</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400 flex items-center gap-1 font-sans text-xs">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Credentials</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          {isBanned ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isMaster ? (
                            <span className="text-zinc-500 text-[11px] italic font-sans">Protected Master</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5 font-sans">
                              {/* Toggle Admin Role */}
                              <button
                                onClick={() => handleToggleRole(u.id)}
                                className="px-2 py-1 rounded-lg text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/30 text-cyan-300 transition"
                                title="Toggle Admin / Trader Role"
                              >
                                {isAdmin ? 'Demote' : 'Make Admin'}
                              </button>

                              {/* Ban/Unban */}
                              <button
                                onClick={() => handleToggleBan(u.id)}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                                  isBanned
                                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                                }`}
                                title={isBanned ? 'Reactivate account' : 'Suspend account'}
                              >
                                {isBanned ? 'Unban' : 'Suspend'}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: 10S SYNC CADENCE & SITE CUSTOMIZER                */}
      {/* ======================================================== */}
      {activeAdminTab === 'site_edits' && (
        <div className="bg-black border border-cyan-500/40 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                10-Second Auto-Sync &amp; Site Customizer
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set real-time synchronization cadence, customize announcement banners, and edit branding.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition active:scale-95"
              >
                {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Changes Saved!' : 'Save Site Edits'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Sync Cadence Control */}
            <div className="space-y-4 bg-[#030611] border border-cyan-500/30 rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Auto-Synchronize Cadence
              </h4>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2 flex justify-between">
                  <span>Sync Interval (Seconds):</span>
                  <strong className="text-cyan-400 font-mono text-sm">{config.autoSyncIntervalSeconds}s</strong>
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[5, 10, 15, 30].map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setConfig({ ...config, autoSyncIntervalSeconds: sec })}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
                        config.autoSyncIntervalSeconds === sec
                          ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                          : 'bg-zinc-950 text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {sec}s {sec === 10 ? '(Default)' : ''}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Controls the heartbeat countdown timer and frequency at which new coins, prices, and whale trades are queried. Default is strictly <strong>10 seconds</strong>.
                </p>
              </div>
            </div>

            {/* 2. Dumping Threshold Alert Setting */}
            <div className="space-y-4 bg-[#030611] border border-cyan-500/30 rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                Coin Dumping Warning Threshold
              </h4>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-zinc-300">Warning Trigger Multiplier</span>
                  <span className="font-mono font-bold text-rose-400">{config.dumpThresholdMultiplier.toFixed(1)}X Multiplier</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.1"
                  value={config.dumpThresholdMultiplier}
                  onChange={(e) => setConfig({ ...config, dumpThresholdMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400 mt-2">
                  When any running coin falls below <strong>{config.dumpThresholdMultiplier.toFixed(1)}X</strong>, the site triggers the <code>⚠️ Warning Coin Dumping</code> alert.
                </p>
              </div>
            </div>

            {/* 3. Site Broadcast Announcement */}
            <div className="space-y-4 bg-[#030611] border border-cyan-500/30 rounded-2xl p-5 md:col-span-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Bell className="w-4 h-4" />
                  Site-Wide Announcement Notice
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={config.announcementEnabled}
                    onChange={(e) => setConfig({ ...config, announcementEnabled: e.target.checked })}
                    className="accent-cyan-400 w-4 h-4 rounded"
                  />
                  <span>Show Banner on Site</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Banner Message</label>
                <textarea
                  rows={2}
                  value={config.announcementText}
                  onChange={(e) => setConfig({ ...config, announcementText: e.target.value })}
                  placeholder="Type an announcement to broadcast to all traders..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-cyan-500/30 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-semibold">Banner Urgency:</span>
                {(['info', 'warning', 'alert', 'success'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setConfig({ ...config, announcementType: type })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition border ${
                      config.announcementType === type
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                        : 'bg-zinc-950 text-zinc-500 border-white/5 hover:text-zinc-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: TOKEN INJECTOR                                    */}
      {/* ======================================================== */}
      {activeAdminTab === 'token_injector' && (
        <div className="bg-black border border-cyan-500/40 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Inject Custom Token Into Live Radar
          </h3>
          <p className="text-xs text-zinc-400">
            Push custom tokens directly into the live Solana stream to test 5x/10x surges, High Buys flurries, or below-3X dumping behaviors.
          </p>

          <form onSubmit={handleInjectTokenSubmit} className="space-y-4 max-w-lg pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Coin Name</label>
              <input
                type="text"
                value={injectName}
                onChange={(e) => setInjectName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-cyan-500/30 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Ticker / Symbol</label>
              <input
                type="text"
                value={injectSymbol}
                onChange={(e) => setInjectSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-cyan-500/30 rounded-xl text-xs text-zinc-100 uppercase focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Current Multiplier: <strong className={injectMultiplier < 3.0 ? 'text-rose-400' : 'text-emerald-400'}>{injectMultiplier}x</strong>
              </label>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.1"
                value={injectMultiplier}
                onChange={(e) => setInjectMultiplier(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1 font-mono">
                <span>0.5x (Dumped)</span>
                <span>3.0x Threshold</span>
                <span>10.0x Moonshot</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition active:scale-95"
            >
              Push Token Into Radar Feed
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add New User */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-black border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-[0_0_35px_rgba(0,240,255,0.2)]">
            <h3 className="text-base font-bold text-white mb-1">Create Registered User</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Add a new trader or administrator to the database registry.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Username / Trader Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. solana_whale_pro"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-cyan-500/30 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. trader@gmail.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-cyan-500/30 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={newUserIsAdmin}
                    onChange={(e) => setNewUserIsAdmin(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4 rounded"
                  />
                  <span>Grant Administrator Privileges</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

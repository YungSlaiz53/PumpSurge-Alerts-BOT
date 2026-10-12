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
  RotateCcw
} from 'lucide-react';
import { AuthService, AuthUser, ADMIN_USERNAME } from '../services/authService';
import { SiteConfigService, SiteConfig } from '../services/siteConfigService';

interface AdminDashboardProps {
  onSiteConfigUpdated?: (config: SiteConfig) => void;
  onInjectToken?: (token: any) => void;
  onTriggerDump?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSiteConfigUpdated,
  onInjectToken,
  onTriggerDump,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'site_edits' | 'token_injector'>('users');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState<SiteConfig>(SiteConfigService.getConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // New user modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  // Token injector fields
  const [injectName, setInjectName] = useState('DUMP PROTOCOL');
  const [injectSymbol, setInjectSymbol] = useState('DUMPER');
  const [injectMultiplier, setInjectMultiplier] = useState(2.2);

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

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user from the live database?')) {
      AuthService.deleteUser(userId);
      loadUsers();
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    AuthService.adminCreateUser(newUsername, newUserEmail);
    setNewUsername('');
    setNewUserEmail('');
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
    if (window.confirm('Reset all site customizations to default settings?')) {
      const def = SiteConfigService.resetToDefault();
      setConfig(def);
      if (onSiteConfigUpdated) onSiteConfigUpdated(def);
    }
  };

  const handleInjectTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectName.trim() || !injectSymbol.trim()) return;

    const mockMint = `${injectSymbol.slice(0, 4)}Pump${Math.random().toString(36).substring(2, 8)}SoL`;
    const initialPrice = 0.000000032;
    const currentPrice = initialPrice * injectMultiplier;
    const isDump = injectMultiplier < config.dumpThresholdMultiplier;

    const newToken = {
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
      highestMultiplier: Math.max(injectMultiplier, 4.2), // was higher
      notified5x: false,
      notified10x: false,
      tradeCount: 42,
      buyCount: isDump ? 12 : 36,
      sellCount: isDump ? 30 : 6,
      volumeSol: 18.5,
      lastTradeTimestamp: Date.now(),
      isHighBuys: !isDump && injectMultiplier >= 1.5,
      buyVelocity: isDump ? 28 : 88,
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
    alert(`Token "${injectName}" (${injectSymbol}) injected successfully into live radar feed!`);
  };

  const filteredUsers = users.filter((u) => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = users.filter(u => u.status !== 'banned').length;
  const bannedCount = users.filter(u => u.status === 'banned').length;
  const gmailCount = users.filter(u => u.isGmailAuthenticated).length;

  return (
    <div className="space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Admin Dashboard</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-mono font-bold border border-indigo-500/30">
                  {ADMIN_USERNAME} MASTER SESSION
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage registered users, broadcast announcements, adjust dumping thresholds &amp; edit live site configurations.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Refresh User List"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddUser(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New User</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeAdminTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('site_edits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeAdminTab === 'site_edits'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site Edits &amp; Customizer</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('token_injector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeAdminTab === 'token_injector'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Live Token Injector</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USERS MANAGEMENT (Requirement 6, 9) */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold">Total Accounts</div>
              <div className="text-2xl font-black text-white mt-1">{users.length}</div>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">Active Status</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</div>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">Gmail Auth</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">{gmailCount}</div>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-rose-400 font-bold">Suspended / Banned</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{bannedCount}</div>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search registered user by username, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-zinc-400">
              Showing <strong>{filteredUsers.length}</strong> of {users.length} registered users
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Auth Method</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {filteredUsers.map((u) => {
                    const isMaster = u.username === ADMIN_USERNAME;
                    const isBanned = u.status === 'banned';

                    return (
                      <tr key={u.id} className="hover:bg-zinc-850/50 transition">
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-indigo-400">{u.username.slice(0, 1).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                                <span>{u.username}</span>
                                {isMaster && (
                                  <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-mono border border-indigo-500/40">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate">
                                {u.email || (u.username.includes('@') ? u.username : `${u.username}@sol.user`)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {u.role === 'admin' ? 'Administrator' : 'Trader'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.isGmailAuthenticated ? (
                            <span className="text-cyan-400 flex items-center gap-1 font-sans text-xs">
                              <Mail className="w-3.5 h-3.5" />
                              <span>Gmail OAuth</span>
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
                            <span className="text-zinc-500 text-[11px] italic font-sans">Protected</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1 font-sans">
                              <button
                                onClick={() => handleToggleBan(u.id)}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                                  isBanned
                                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                }`}
                                title={isBanned ? 'Reactivate account' : 'Suspend account'}
                              >
                                {isBanned ? 'Unban' : 'Suspend'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
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

      {/* TAB 2: SITE EDITS & LIVE CUSTOMIZER (Requirement 9) */}
      {activeAdminTab === 'site_edits' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                Live Site Customizer
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Edit branding, broadcast notices, and customize dumping thresholds for all users in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition active:scale-95"
              >
                {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Changes Saved!' : 'Save Site Edits'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Site Branding */}
            <div className="space-y-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                Site Branding &amp; Titles
              </h4>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">App Title</label>
                <input
                  type="text"
                  value={config.siteTitle}
                  onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Header Subtitle</label>
                <input
                  type="text"
                  value={config.siteSubtitle}
                  onChange={(e) => setConfig({ ...config, siteSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 2. Dumping Threshold Alert Setting (Requirement 10) */}
            <div className="space-y-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5">
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
                  When any running coin drops below <strong>{config.dumpThresholdMultiplier.toFixed(1)}X</strong>, the site triggers the <code>⚠️ Warning Coin Dumping</code> alert and pushes it to the Dumped Coins radar.
                </p>
              </div>

              {onTriggerDump && (
                <div className="pt-2">
                  <button
                    onClick={onTriggerDump}
                    className="w-full py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Test Instant Coin Dumping Alert (&lt; 3X)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Site Broadcast Announcement */}
            <div className="space-y-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5 md:col-span-2">
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
                    className="accent-indigo-500 w-4 h-4 rounded"
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
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-semibold">Banner Tone:</span>
                {(['info', 'warning', 'alert', 'success'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setConfig({ ...config, announcementType: type })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                      config.announcementType === type
                        ? 'bg-zinc-800 text-white border border-indigo-500 shadow'
                        : 'text-zinc-500 hover:text-zinc-300'
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

      {/* TAB 3: LIVE TOKEN INJECTOR (Admin special power) */}
      {activeAdminTab === 'token_injector' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Inject Custom Token Into Live Radar
          </h3>
          <p className="text-xs text-zinc-400">
            Admins can inject custom tokens directly into the live Solana stream to test 5x/10x surges, High Buys flurries, or below-3X dumping behaviors.
          </p>

          <form onSubmit={handleInjectTokenSubmit} className="space-y-4 max-w-lg pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Coin Name</label>
              <input
                type="text"
                value={injectName}
                onChange={(e) => setInjectName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Ticker / Symbol</label>
              <input
                type="text"
                value={injectSymbol}
                onChange={(e) => setInjectSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 uppercase focus:outline-none focus:border-indigo-500"
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
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>0.5x (Dumped)</span>
                <span>3.0x Threshold</span>
                <span>10.0x Moonshot</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition active:scale-95"
            >
              Push Token Into Radar Feed
            </button>
          </form>
        </div>
      )}

      {/* Modal: Add New User */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Create New Registered User</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Add a user account to the system registry.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. solana_whale"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. user@gmail.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  Flame, 
  Zap, 
  Volume2, 
  VolumeX, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';

export interface AppNotification {
  id: string;
  type: '5x' | '10x' | 'moonshot' | 'new_mint' | 'new_listing' | 'high_buys' | 'coin_dumping';
  title: string;
  message: string;
  mint: string;
  name: string;
  symbol: string;
  multiplier: number;
  marketCapUsd: number;
  timestamp: number;
  buyVelocity?: number;
  dropPercent?: number;
}

interface NotificationCenterProps {
  notifications: AppNotification[];
  onClearAll: () => void;
  onSelectToken: (mint: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onClearAll,
  onSelectToken,
  soundEnabled,
  onToggleSound,
  isOpen,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'surges' | 'high_buys' | 'new_listings' | 'dumping'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filterType === 'surges') return n.type === '5x' || n.type === '10x' || n.type === 'moonshot';
    if (filterType === 'high_buys') return n.type === 'high_buys';
    if (filterType === 'new_listings') return n.type === 'new_listing' || n.type === 'new_mint';
    if (filterType === 'dumping') return n.type === 'coin_dumping';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0f131d] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mt-12 sm:mt-14">
        {/* Header */}
        <div className="p-4 bg-[#141824] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">App Notification Center</h3>
              <p className="text-[11px] text-zinc-400">
                {notifications.length} real-time 15s alerts &amp; surges captured
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border text-xs transition ${
                soundEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-500'
              }`}
              title={soundEnabled ? 'Mute notification sound' : 'Enable notification audio chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-rose-400 transition"
                title="Clear all alerts"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-3 py-2 bg-zinc-950/90 border-b border-zinc-800/80 flex items-center gap-1.5 text-xs overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filterType === 'all'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('surges')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              filterType === 'surges'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            5x/10x Surges
          </button>
          <button
            onClick={() => setFilterType('high_buys')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              filterType === 'high_buys'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-orange-400" />
            High Buys
          </button>
          <button
            onClick={() => setFilterType('dumping')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              filterType === 'dumping'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-semibold'
                : 'text-red-400/70 hover:text-red-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            Dump Warnings
          </button>
          <button
            onClick={() => setFilterType('new_listings')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              filterType === 'new_listings'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            New Listings
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 animate-pulse" />
              <p className="text-xs font-semibold text-zinc-400">No active alerts in this category</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                New listings and surge alerts are captured every 15-second sync!
              </p>
            </div>
          ) : (
            filtered.map((notif) => {
              const isDump = notif.type === 'coin_dumping';
              const is10x = notif.type === '10x' || notif.multiplier >= 10.0;
              const is5x = notif.type === '5x' || (notif.multiplier >= 5.0 && !is10x && !isDump);
              const isHighBuys = notif.type === 'high_buys';
              const isNew = notif.type === 'new_listing' || notif.type === 'new_mint';
              const timeStr = new Date(notif.timestamp).toLocaleTimeString();

              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl border transition hover:border-zinc-700 relative overflow-hidden ${
                    isDump
                      ? 'bg-red-950/25 border-red-500/50 shadow-md shadow-red-950/20'
                      : is10x
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-950/20'
                      : is5x
                      ? 'bg-purple-950/20 border-purple-500/40'
                      : isHighBuys
                      ? 'bg-orange-950/20 border-orange-500/40'
                      : 'bg-zinc-900/70 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                        isDump
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : is10x
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : is5x
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : isHighBuys
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isDump ? (
                        <AlertTriangle className="w-4 h-4 fill-red-500 text-zinc-950" />
                      ) : is10x ? (
                        <Flame className="w-4 h-4 text-amber-400" />
                      ) : is5x ? (
                        <Zap className="w-4 h-4 text-purple-400" />
                      ) : isHighBuys ? (
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                          isDump ? 'text-red-400 font-black' : is10x ? 'text-amber-400' : is5x ? 'text-purple-400' : isHighBuys ? 'text-orange-400' : 'text-emerald-400'
                        }`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">{timeStr}</span>
                      </div>

                      <p className="text-xs text-zinc-200 mt-0.5 leading-snug">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">
                          ${notif.symbol} • ${Math.round(notif.marketCapUsd).toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            onSelectToken(notif.mint);
                            onClose();
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          View Token &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

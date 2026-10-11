/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Bell, 
  Trash2, 
  Flame, 
  Zap, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';

export interface AppNotification {
  id: string;
  type: '5x' | '10x' | 'moonshot' | 'new_mint';
  title: string;
  message: string;
  mint: string;
  name: string;
  symbol: string;
  multiplier: number;
  marketCapUsd: number;
  timestamp: number;
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
  if (!isOpen) return null;

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
                {notifications.length} real-time surge alerts captured
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border text-xs transition ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-500'
              }`}
              title="Toggle Audio Chime"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                title="Clear notifications"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>
            )}

            <button
              onClick={onClose}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 animate-pulse" />
              <p className="text-xs font-semibold text-zinc-400">No active alerts yet</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Notifications will appear when tokens surge to 5x or 10x+ on Solana!
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const is10x = notif.multiplier >= 10.0;
              const timeStr = new Date(notif.timestamp).toLocaleTimeString();

              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl border transition hover:border-zinc-700 relative overflow-hidden ${
                    is10x
                      ? 'bg-gradient-to-r from-amber-950/30 to-[#121622] border-amber-500/40'
                      : 'bg-gradient-to-r from-purple-950/30 to-[#121622] border-purple-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      {is10x ? (
                        <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-white">
                        {notif.name} (<span className="text-emerald-400 font-mono">${notif.symbol}</span>)
                      </span>
                    </div>

                    <span className="text-[10px] text-zinc-500 font-mono">{timeStr}</span>
                  </div>

                  <p className="text-xs text-zinc-300 mt-0.5">{notif.message}</p>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono text-zinc-400 font-semibold">
                      Cap: ${Math.round(notif.marketCapUsd).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://pump.fun/coin/${notif.mint}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 transition"
                      >
                        💊 Pump.fun
                      </a>
                      <a
                        href={`https://photon-sol.tinyastro.io/en/lp/${notif.mint}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-cyan-400 transition"
                      >
                        🚀 Photon
                      </a>
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

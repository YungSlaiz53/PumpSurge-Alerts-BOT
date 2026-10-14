/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Check, 
  Flame, 
  AlertCircle, 
  Timer,
  TrendingUp,
  Sparkles,
  Radar
} from 'lucide-react';
import { LogEntry } from '../types';
import { PumpSyncService } from '../services/pumpSyncService';

interface TerminalLogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onSyncRealTime: () => void;
  isSyncing: boolean;
  onManualMidnightReset?: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({
  logs,
  onClearLogs,
  onSyncRealTime,
  isSyncing,
  onManualMidnightReset,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCountdown = () => {
      setTimeUntilMidnight(PumpSyncService.getTimeUntilMidnight().formatted);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] [${l.tag}] ${l.message}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((l) => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'whales') return l.tag.includes('WHALE');
    if (filterLevel === 'alert') return l.level === 'alert' || l.tag.includes('SURGE') || l.tag.includes('MOONSHOT');
    if (filterLevel === 'high_buys') return l.tag.includes('HIGH BUYS');
    if (filterLevel === 'dumped') return l.tag.includes('DUMPING') || l.tag.includes('DUMP');
    if (filterLevel === 'new_listings') return l.tag.includes('NEW MINT') || l.tag.includes('NEW LISTING');
    if (filterLevel === 'system') return l.tag === 'SYSTEM' || l.tag.includes('RESET') || l.tag.includes('DATABASE');
    return true;
  });

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'alert':
        return <span className="px-1.5 py-0.2 rounded bg-cyan-400 text-black font-black">ALERT</span>;
      case 'success':
        return <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-medium border border-cyan-400/40">OK</span>;
      case 'warn':
        return <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30">WARN</span>;
      case 'error':
        return <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">ERR</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">INFO</span>;
    }
  };

  return (
    <div className="bg-black border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.1)] flex flex-col h-[520px]">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-[#030611] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
            <span className="w-3 h-3 rounded-full bg-white/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>PumpSurge Real-Time Event &amp; Price Terminal</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#060b17] border border-cyan-500/30 text-cyan-300 font-normal">
              {logs.length} logs
            </span>
          </div>
        </div>

        {/* 24h / 00:00 Reset Status Pill */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1">
            <Timer className="w-3 h-3 text-cyan-400" />
            <span>00:00 Daily Reset in: <strong className="text-cyan-300">{timeUntilMidnight}</strong></span>
          </span>

          {onManualMidnightReset && (
            <button
              onClick={onManualMidnightReset}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition"
              title="Force execute 00:00 daily log purge now"
            >
              Reset at 00:00 Now
            </button>
          )}
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
              autoScroll 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
            title="Copy all logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onSyncRealTime}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition disabled:opacity-50"
            title="Trigger 15s price sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition"
            title="Clear Terminal Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs Sub-Bar */}
      <div className="px-4 py-1.5 bg-[#0e1017] border-b border-zinc-800/80 flex items-center gap-2 text-xs font-mono">
        <span className="text-zinc-500 text-[11px]">Filter:</span>
        <button
          onClick={() => setFilterLevel('all')}
          className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
            filterLevel === 'all' ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,240,255,0.4)]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          All ({logs.length})
        </button>
        <button
          onClick={() => setFilterLevel('whales')}
          className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition ${
            filterLevel === 'whales' ? 'bg-cyan-400 text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]' : 'text-cyan-400 hover:text-white'
          }`}
        >
          <Radar className="w-3 h-3 text-cyan-400" />
          1+ SOL Whales
        </button>
        <button
          onClick={() => setFilterLevel('alert')}
          className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition ${
            filterLevel === 'alert' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-3 h-3 text-cyan-400" />
          5x/10x Surges
        </button>
        <button
          onClick={() => setFilterLevel('high_buys')}
          className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition ${
            filterLevel === 'high_buys' ? 'bg-orange-500 text-black font-bold' : 'text-orange-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3 h-3 text-orange-400" />
          High Buys
        </button>
        <button
          onClick={() => setFilterLevel('new_listings')}
          className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition ${
            filterLevel === 'new_listings' ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          New Listings
        </button>
        <button
          onClick={() => setFilterLevel('dumped')}
          className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition ${
            filterLevel === 'dumped' ? 'bg-red-600 text-white font-bold' : 'text-red-400 hover:text-white'
          }`}
        >
          <AlertCircle className="w-3 h-3 text-red-400" />
          Dump Warnings
        </button>
        <button
          onClick={() => setFilterLevel('system')}
          className={`px-2 py-0.5 rounded text-[11px] transition ${
            filterLevel === 'system' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          System / 00:00 Reset
        </button>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 select-text bg-[#020408]">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600">
            <span>No log entries match the selected filter.</span>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const isAlert = log.level === 'alert';
            const isHighBuys = log.tag.includes('HIGH BUYS');
            const is00Reset = log.tag.includes('RESET');

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2.5 leading-relaxed p-1 rounded transition hover:bg-zinc-900/60 ${
                  isAlert
                    ? 'bg-amber-950/20 border-l-2 border-amber-500 text-amber-200'
                    : isHighBuys
                    ? 'bg-orange-950/20 border-l-2 border-orange-500 text-orange-200'
                    : is00Reset
                    ? 'bg-cyan-950/20 border-l-2 border-cyan-500 text-cyan-200'
                    : 'text-zinc-300'
                }`}
              >
                <span className="text-zinc-600 shrink-0 text-[11px]">[{time}]</span>
                <span className="shrink-0 text-[10px]">{getLevelBadge(log.level)}</span>
                <span className="text-cyan-400 font-bold shrink-0">[{log.tag}]</span>
                <span className="break-all flex-1">{log.message}</span>
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Terminal Command Line Footer */}
      <div className="px-4 py-2 bg-[#0c0e15] border-t border-zinc-800 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">❯</span>
          <span>solana-cluster://mainnet-beta/pump.fun (auto-poll 15s interval)</span>
        </div>
        <span className="text-zinc-600">UTF-8 • 24h Purge Active</span>
      </div>
    </div>
  );
};

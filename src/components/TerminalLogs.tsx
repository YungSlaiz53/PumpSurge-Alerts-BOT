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
  Filter, 
  Radio, 
  Flame, 
  AlertCircle, 
  CheckCircle2, 
  ArrowDownCircle 
} from 'lucide-react';
import { LogEntry } from '../types';

interface TerminalLogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onSyncRealTime: () => void;
  isSyncing: boolean;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({
  logs,
  onClearLogs,
  onSyncRealTime,
  isSyncing,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

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
    if (filterLevel === 'alert') return l.level === 'alert';
    if (filterLevel === 'info') return l.level === 'info' || l.level === 'success';
    if (filterLevel === 'warn') return l.level === 'warn' || l.level === 'error';
    return true;
  });

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'alert':
        return <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">ALERT</span>;
      case 'success':
        return <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">OK</span>;
      case 'warn':
        return <span className="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-medium border border-yellow-500/30">WARN</span>;
      case 'error':
        return <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">ERR</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">INFO</span>;
    }
  };

  return (
    <div className="bg-[#0b0d13] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[480px]">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-[#11141e] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-zinc-200">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>PumpSniper Real-Time Event Console</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">
              {logs.length} logs
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Logs</option>
            <option value="alert">Surge Alerts Only</option>
            <option value="info">Info / Success</option>
            <option value="warn">Warnings / Errors</option>
          </select>

          {/* Sync Button */}
          <button
            onClick={onSyncRealTime}
            disabled={isSyncing}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            title="Synchronize live coins from Pump.fun"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Pump.fun'}</span>
          </button>

          {/* Clear Logs Button */}
          <button
            onClick={onClearLogs}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition"
            title="Clear all logs and cache"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Clear Logs &amp; Cache</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyLogs}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-3.5 font-mono text-[11px] overflow-y-auto space-y-1.5 bg-[#090b10] text-zinc-300">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
            <Radio className="w-6 h-6 mb-2 animate-pulse text-zinc-600" />
            <p>Waiting for incoming Solana block events...</p>
            <p className="text-[10px] text-zinc-600 mt-1">
              Click "Sync Pump.fun" above to pull real-time coins from the network.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 py-0.5 px-1.5 rounded transition ${
                  log.level === 'alert'
                    ? 'bg-amber-950/20 border-l-2 border-amber-500 text-amber-200'
                    : log.level === 'error'
                    ? 'bg-rose-950/20 border-l-2 border-rose-500 text-rose-200'
                    : 'hover:bg-zinc-850/40'
                }`}
              >
                <span className="text-zinc-600 shrink-0 select-none">[{timeStr}]</span>
                <span className="shrink-0">{getLevelBadge(log.level)}</span>
                <span className="text-emerald-400 font-bold shrink-0">[{log.tag}]</span>
                <span className="text-zinc-200 break-all">{log.message}</span>
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Bottom Status bar */}
      <div className="px-4 py-1.5 bg-[#10131d] border-t border-zinc-800/80 text-[10px] text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE PUMP.FUN STREAM
          </span>
          <span>Program: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P</span>
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1 font-mono hover:text-zinc-300 transition ${
            autoScroll ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <ArrowDownCircle className="w-3 h-3" />
          <span>Auto-scroll: {autoScroll ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};

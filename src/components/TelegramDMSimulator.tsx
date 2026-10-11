/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  Sliders, 
  Search, 
  Flame, 
  RotateCcw, 
  Bot, 
  User, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { TrackedToken, UserPreferences } from '../types';

interface TelegramDMSimulatorProps {
  tokens: TrackedToken[];
  solUsdPrice: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  textHtml: string;
  buttons?: Array<Array<{ text: string; action: string; url?: string }>>;
}

export const TelegramDMSimulator: React.FC<TelegramDMSimulatorProps> = ({
  tokens,
  solUsdPrice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    userId: 987654321,
    username: 'sol_trader_anon',
    notifyAllListings: false,
    notifySurgesOnly: true,
    minLiquidityFilterSol: 0,
    joinedAt: Date.now(),
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with /start response on first mount
  useEffect(() => {
    executeBotCommand('/start');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTimeString = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const executeBotCommand = (cmd: string) => {
    const cleanCmd = cmd.trim();
    const time = getTimeString();

    // Append user message if not initial
    if (messages.length > 0) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'user',
          timestamp: time,
          textHtml: cleanCmd,
        },
      ]);
    }

    setTimeout(() => {
      handleBotResponse(cleanCmd);
    }, 250);
  };

  const handleBotResponse = (cmd: string) => {
    const time = getTimeString();
    const lower = cmd.toLowerCase();

    if (lower === '/start') {
      const html = `
🚀 <b>PumpSniper — Pump.fun Real-Time Alpha Bot</b>

⚡ <b>Sub-second on-chain detection</b> powered by Solana RPC & WebSocket.
📊 Automatic <b>5x & 10x Price Surge alerts</b> with bonding curve velocity.
💸 <b>100% Free Forever</b> with instant multi-DEX sniper routing.

<b>Live Status:</b>
🟢 Status: <b>Online & Monitoring</b>
📡 Tracking Program: <code>6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P</code>
📢 Official Alerts: <a href="https://t.me/PumpSurgeAlerts">@PumpSurgeAlerts</a>
🎯 Active Tracked Tokens: <b>${tokens.length || 12}</b>

<i>Tap any button below to configure your preferences or lookup a token:</i>
      `;

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          timestamp: time,
          textHtml: html,
          buttons: [
            [
              { text: '📢 Join Alert Channel', action: 'url', url: 'https://t.me/PumpSurgeAlerts' },
              { text: '⚙️ Notification Settings', action: 'cmd:/settings' },
            ],
            [
              { text: '🔍 Token Lookup Guide', action: 'cmd:/help_lookup' },
              { text: '📈 Active 5x/10x Runners', action: 'cmd:/runners' },
            ],
            [
              { text: '⚡ Fast Sniper (Trojan)', action: 'url', url: 'https://t.me/solana_trojanbot' },
              { text: '🤖 BonkBot', action: 'url', url: 'https://t.me/bonkbot_bot' },
            ],
          ],
        },
      ]);
    } else if (lower.startsWith('/settings')) {
      sendSettingsCard(time);
    } else if (lower.startsWith('/lookup')) {
      const parts = cmd.split(/\s+/);
      const mint = parts[1] || (tokens[0]?.mint ?? '8xK1M7gQpX2bJ9W9uL4rZ7tV1kS5mN8qP3dF6hC2eA1');
      const targetToken = tokens.find(t => t.mint === mint) || tokens[0];

      const mcapUsd = targetToken ? Math.round(targetToken.currentMarketCapUsd) : 24800;
      const mcapSol = targetToken ? targetToken.currentMarketCapSol.toFixed(2) : '138.0';
      const mult = targetToken ? targetToken.highestMultiplier.toFixed(2) : '4.90';

      const html = `
💎 <b>Token Lookup Result</b>

🏷️ Mint: <code>${mint}</code>
📊 Status: <b>Active Bonding Curve ⚡</b>

💰 <b>Current Market Cap:</b> $${mcapUsd.toLocaleString()} (${mcapSol} SOL)
📈 <b>Est. Bonding Multiplier:</b> <b>${mult}x</b>
🌊 <b>Real SOL Reserves:</b> 28.4 SOL / 85 SOL
🚀 <b>Bonding Curve Progress:</b> <b>33.4%</b>

📌 <i>Tap trading buttons below to trade instantly:</i>
      `;

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          timestamp: time,
          textHtml: html,
          buttons: [
            [
              { text: '⚡ Trojan Sniper', action: 'url', url: `https://t.me/solana_trojanbot?start=r-alphasniper_${mint}` },
              { text: '🤖 BonkBot', action: 'url', url: `https://t.me/bonkbot_bot?start=ref_alphasniper_ca_${mint}` },
            ],
            [
              { text: '🚀 Photon Web', action: 'url', url: `https://photon-sol.tinyastro.io/en/lp/${mint}` },
              { text: '📊 DexScreener', action: 'url', url: `https://dexscreener.com/solana/${mint}` },
            ],
          ],
        },
      ]);
    } else if (lower.startsWith('/runners')) {
      // Find historical and active runners from tokens
      const activeHigh = tokens.filter(t => t.highestMultiplier >= 2.0);
      const defaultPrevious = [
        { name: 'Zhunt', symbol: 'ZNT', mult: 12.1, time: '38.2s', mcap: '$61,000 (338.8 SOL)', mint: '8YeBTPV58fH6tnzUAihMK1LixsGc1jsN7DAyBoiRpump' },
        { name: 'Neural Doge Solana', symbol: 'NDOGE', mult: 10.53, time: '32.4s', mcap: '$53,100 (295.0 SOL)', mint: '9wQz12q8nL7pU9qK4mN8qP3dF6hC2eA18xK1M7gQpX2' },
        { name: 'Pepe AI Turbo', symbol: 'PEPETURBO', mult: 5.42, time: '11.2s', mcap: '$27,360 (152.0 SOL)', mint: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
      ];

      let runnersHtml = `🏆 <b>PREVIOUS 5X / 10X RUNNERS HALL OF FAME:</b>\n`;
      runnersHtml += `📢 Broadcasted via <a href="https://t.me/PumpSurgeAlerts">@PumpSurgeAlerts</a>\n\n`;

      defaultPrevious.forEach((item, idx) => {
        const icon = item.mult >= 10 ? '💥' : '🚀';
        runnersHtml += `${idx + 1}. ${icon} <b>${item.name}</b> (<code>$${item.symbol}</code>)\n`;
        runnersHtml += `   🔥 Peak Multiplier: <b>${item.mult.toFixed(2)}x</b> in ${item.time}\n`;
        runnersHtml += `   💰 Market Cap: <b>${item.mcap}</b>\n`;
        runnersHtml += `   📋 Mint: <code>${item.mint}</code>\n\n`;
      });

      if (activeHigh.length > 0) {
        runnersHtml += `⚡ <b>Current Active Session Surges:</b>\n`;
        activeHigh.slice(0, 3).forEach((token, idx) => {
          runnersHtml += `• <b>${token.name}</b> ($${token.symbol}): <b>${token.highestMultiplier.toFixed(2)}x</b> | <code>${token.mint.slice(0, 12)}...</code>\n`;
        });
      }

      runnersHtml += `\n<i>Tap any contract address above to copy into your trading bot!</i>`;

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          timestamp: time,
          textHtml: runnersHtml,
          buttons: [
            [
              { text: '📢 Join @PumpSurgeAlerts', action: 'url', url: 'https://t.me/PumpSurgeAlerts' },
              { text: '⚡ Fast Trojan Sniper', action: 'url', url: 'https://t.me/solana_trojanbot' },
            ],
            [
              { text: '⬅️ Back to Menu', action: 'cmd:/start' },
            ]
          ]
        },
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          timestamp: time,
          textHtml: `ℹ️ Unknown command. Available commands: <code>/start</code>, <code>/settings</code>, <code>/lookup &lt;mint&gt;</code>, <code>/runners</code>.`,
        },
      ]);
    }
  };

  const sendSettingsCard = (time: string) => {
    const html = `
⚙️ <b>Your Personal Notification Settings</b>

Choose what you want the bot to DM you directly:
<i>(Channel alerts broadcast everything)</i>

• <b>All New Listings:</b> ${userPrefs.notifyAllListings ? '🟢 ACTIVE' : '⚪ OFF'}
• <b>5x / 10x Surge Moonshots:</b> ${userPrefs.notifySurgesOnly ? '🟢 ACTIVE' : '⚪ OFF'}
    `;

    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'bot',
        timestamp: time,
        textHtml: html,
        buttons: [
          [
            {
              text: userPrefs.notifyAllListings ? '🔔 All Listings: ON' : '🔕 All Listings: OFF',
              action: 'toggle_all',
            },
          ],
          [
            {
              text: userPrefs.notifySurgesOnly ? '🚀 5x/10x Surges: ON' : '⏸️ 5x/10x Surges: OFF',
              action: 'toggle_surges',
            },
          ],
          [
            { text: '⬅️ Back to /start', action: 'cmd:/start' },
          ],
        ],
      },
    ]);
  };

  const handleButtonClick = (action: string, url?: string) => {
    if (url) {
      window.open(url, '_blank');
      return;
    }

    if (action.startsWith('cmd:')) {
      const cmd = action.replace('cmd:', '');
      executeBotCommand(cmd);
      return;
    }

    if (action === 'toggle_all') {
      const next = !userPrefs.notifyAllListings;
      setUserPrefs(prev => ({ ...prev, notifyAllListings: next }));
      executeBotCommand('/settings');
    }

    if (action === 'toggle_surges') {
      const next = !userPrefs.notifySurgesOnly;
      setUserPrefs(prev => ({ ...prev, notifySurgesOnly: next }));
      executeBotCommand('/settings');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    executeBotCommand(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Terminal className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-zinc-100">Interactive Telegram DM Menu Simulator</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Test the direct message user experience: dashboard menu, preference toggles, and on-chain token lookups built with Telegraf.
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([]);
            executeBotCommand('/start');
          }}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Telegram Chat Window */}
      <div className="max-w-3xl mx-auto bg-[#17212b] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden font-sans flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="bg-[#242f3d] px-5 py-3.5 border-b border-black/20 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-zinc-950 font-black text-lg">
            🤖
          </div>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              PumpSniper Bot
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium">bot</span>
            </div>
            <div className="text-[11px] text-[#7f91a4]">@PumpSniperAlpha_bot • online</div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-[#0e1621]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-md leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#2b5278] text-white rounded-tr-none'
                    : 'bg-[#182533] text-zinc-200 border border-[#2b3a4a] rounded-tl-none'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: msg.textHtml }}
                  className="space-y-2 whitespace-pre-line"
                />

                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-[#7f91a4]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Inline Keyboards */}
              {msg.buttons && (
                <div className="mt-2 space-y-1.5 w-full max-w-[85%]">
                  {msg.buttons.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-2 gap-1.5">
                      {row.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleButtonClick(btn.action, btn.url)}
                          className="bg-[#2b3a4a] hover:bg-[#384b60] text-[#64b5f6] text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 active:scale-98"
                        >
                          {btn.text}
                          {btn.url && <ExternalLink className="w-3 h-3 text-[#64b5f6]/70 ml-1" />}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Command Suggestions */}
        <div className="px-4 py-2 bg-[#121c27] border-t border-[#242f3d] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] text-zinc-500 font-medium">Quick:</span>
          <button
            onClick={() => executeBotCommand('/start')}
            className="px-2.5 py-1 rounded-lg bg-[#242f3d] hover:bg-[#2e3b4d] text-zinc-300 font-mono text-[11px] shrink-0"
          >
            /start
          </button>
          <button
            onClick={() => executeBotCommand('/settings')}
            className="px-2.5 py-1 rounded-lg bg-[#242f3d] hover:bg-[#2e3b4d] text-zinc-300 font-mono text-[11px] shrink-0"
          >
            /settings
          </button>
          <button
            onClick={() => executeBotCommand(`/lookup ${tokens[0]?.mint || '8xK1M7gQpX2bJ9W9uL4rZ7tV1kS5mN8qP3dF6hC2eA1'}`)}
            className="px-2.5 py-1 rounded-lg bg-[#242f3d] hover:bg-[#2e3b4d] text-zinc-300 font-mono text-[11px] shrink-0"
          >
            /lookup (Top Mint)
          </button>
          <button
            onClick={() => executeBotCommand('/runners')}
            className="px-2.5 py-1 rounded-lg bg-[#242f3d] hover:bg-[#2e3b4d] text-zinc-300 font-mono text-[11px] shrink-0"
          >
            /runners
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-[#242f3d] flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Type a command (/start, /settings, /lookup <mint>)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-[#17212b] border border-[#2b3a4a] rounded-xl px-4 py-2 text-xs text-white placeholder-[#7f91a4] focus:outline-none focus:border-[#64b5f6]"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

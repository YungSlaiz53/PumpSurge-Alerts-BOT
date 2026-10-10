/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  HelpCircle,
  Zap
} from 'lucide-react';

export const DeploymentDocs: React.FC = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Server className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-zinc-100">24/7 Linux VPS Deployment &amp; Troubleshooting Guide</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Production deployment blueprint using <b>PM2</b> and <b>systemd</b> on Ubuntu/Debian (AWS EC2, Hetzner, Oracle Cloud, or DigitalOcean) with resilient auto-restarts.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Production Ready (Node 20+)</span>
        </div>
      </div>

      {/* Deployment Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1 & 2 */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              1
            </span>
            <h3 className="font-bold text-sm text-zinc-100">Provision Linux Server &amp; Install Node.js 20</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Connect to your Linux VPS via SSH and install the latest Node.js LTS (v20+) runtime along with essential build tools:
          </p>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 relative group font-mono text-xs text-zinc-300">
            <button
              onClick={() => copyToClipboard(
`sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v # Should be v20.x or higher`,
                'step1'
              )}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              {copiedSnippet === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <pre className="overflow-x-auto text-zinc-300">
              <code>{`sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs`}</code>
            </pre>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              2
            </span>
            <h3 className="font-bold text-sm text-zinc-100">Install PM2 Process Manager Globally</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            PM2 ensures your bot recovers immediately from network dropouts, memory leaks, and server reboots:
          </p>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 relative group font-mono text-xs text-zinc-300">
            <button
              onClick={() => copyToClipboard(`sudo npm install -g pm2`, 'step2')}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              {copiedSnippet === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <pre className="overflow-x-auto text-zinc-300">
              <code>{`sudo npm install -g pm2`}</code>
            </pre>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              3
            </span>
            <h3 className="font-bold text-sm text-zinc-100">Clone Repository &amp; Configure .env</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Set up the codebase on your server and inject your Telegram Bot Token and dedicated Solana RPC/WSS endpoints:
          </p>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 relative group font-mono text-xs text-zinc-300">
            <button
              onClick={() => copyToClipboard(
`git clone <YOUR_REPO_URL> /opt/pumpfun-bot
cd /opt/pumpfun-bot
npm install
cp .env.example .env
nano .env # Enter your TELEGRAM_BOT_TOKEN & RPC URL`,
                'step3'
              )}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              {copiedSnippet === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <pre className="overflow-x-auto text-zinc-300">
              <code>{`git clone <YOUR_REPO_URL> /opt/pumpfun-bot
cd /opt/pumpfun-bot
npm install
cp .env.example .env
nano .env`}</code>
            </pre>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              4
            </span>
            <h3 className="font-bold text-sm text-zinc-100">Launch 24/7 with PM2 &amp; Enable Startup Hook</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Start the application process using <code className="text-emerald-400">ecosystem.config.js</code> and lock it into the systemd supervisor:
          </p>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 relative group font-mono text-xs text-zinc-300">
            <button
              onClick={() => copyToClipboard(
`pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup`,
                'step4'
              )}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              {copiedSnippet === 'step4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <pre className="overflow-x-auto text-zinc-300">
              <code>{`pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Troubleshooting Matrix */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Troubleshooting: Common Error Codes &amp; Network Solutions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                <th className="py-2.5 px-3">Error / Status Code</th>
                <th className="py-2.5 px-3">Root Cause</th>
                <th className="py-2.5 px-3">Production Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              <tr className="hover:bg-zinc-800/20">
                <td className="py-3 px-3 text-rose-400 font-bold">429 Too Many Requests (RPC)</td>
                <td className="py-3 px-3 text-zinc-300 font-sans">Public Solana RPC rate-limits exceeded on logsSubscribe.</td>
                <td className="py-3 px-3 text-emerald-400 font-sans">Use dedicated RPC/WSS provider (Helius, Shyft, Triton, QuickNode). Public endpoints are throttled.</td>
              </tr>
              <tr className="hover:bg-zinc-800/20">
                <td className="py-3 px-3 text-rose-400 font-bold">400 Bad Request: chat not found</td>
                <td className="py-3 px-3 text-zinc-300 font-sans">Bot was not invited to Telegram Channel or lacks Post permissions.</td>
                <td className="py-3 px-3 text-emerald-400 font-sans">Add bot as Administrator to your Telegram channel and grant "Post Messages" permission.</td>
              </tr>
              <tr className="hover:bg-zinc-800/20">
                <td className="py-3 px-3 text-rose-400 font-bold">400 Bad Request: can't parse entities</td>
                <td className="py-3 px-3 text-zinc-300 font-sans">Markdown parsing error caused by unescaped characters in token names.</td>
                <td className="py-3 px-3 text-emerald-400 font-sans">The bot uses strict HTML formatting with <code>escapeHtml()</code> sanitization to prevent Telegram parse errors.</td>
              </tr>
              <tr className="hover:bg-zinc-800/20">
                <td className="py-3 px-3 text-rose-400 font-bold">429 RetryAfter: 30 (Telegram)</td>
                <td className="py-3 px-3 text-zinc-300 font-sans">Telegram channel limit of ~20 msgs/minute exceeded during high volume.</td>
                <td className="py-3 px-3 text-emerald-400 font-sans">Set <code>MIN_LIQUIDITY_SOL=0.5</code> in .env to filter low-liquidity spam and keep broadcasts under the threshold.</td>
              </tr>
              <tr className="hover:bg-zinc-800/20">
                <td className="py-3 px-3 text-rose-400 font-bold">WebSocket connection closed</td>
                <td className="py-3 px-3 text-zinc-300 font-sans">RPC provider socket timeout or network blip.</td>
                <td className="py-3 px-3 text-emerald-400 font-sans"><code>PumpListener</code> automatically executes exponential backoff and reconnects within milliseconds.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

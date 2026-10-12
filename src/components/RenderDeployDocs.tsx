/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Server, 
  Copy, 
  Check, 
  CheckCircle2, 
  ExternalLink, 
  FileCode,
  Globe,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';

export const RenderDeployDocs: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'vercel' | 'render'>('vercel');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Platform Switcher Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#101524] to-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">Live Hosting Configuration (Vercel &amp; Render)</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            This codebase is optimized for 1-click hosting on <b>Vercel (vercel.app)</b> as well as full-stack Node.js hosting on <b>Render.com</b>. Pre-configured files <code className="text-cyan-400 font-mono">vercel.json</code> and <code className="text-cyan-400 font-mono">render.yaml</code> are already included.
          </p>
        </div>

        {/* Switcher Toggle */}
        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shrink-0">
          <button
            onClick={() => setActivePlatform('vercel')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activePlatform === 'vercel'
                ? 'bg-white text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 22.525H0l12-21.05 12 21.05z" />
            </svg>
            <span>Vercel (vercel.app)</span>
          </button>
          <button
            onClick={() => setActivePlatform('render')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activePlatform === 'render'
                ? 'bg-cyan-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Render.com</span>
          </button>
        </div>
      </div>

      {/* VERCEL DEPLOYMENT VIEW */}
      {activePlatform === 'vercel' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Step 1: Vercel Settings */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">1</span>
                  <h3>Vercel Project Setup (vercel.app)</h3>
                </div>
                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300 flex items-center gap-1 transition"
                >
                  <span>Open Vercel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-zinc-400">
                To host this app on <b>your-project.vercel.app</b>:
              </p>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Push to GitHub &amp; Import to Vercel</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline">vercel.com/new</a> and select your GitHub repository.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Framework Preset &amp; Output</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Framework Preset: <b>Vite</b> (automatically detected). Output Directory: <code className="text-emerald-400">dist</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zero Configuration Required</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    The included <code className="text-cyan-400">vercel.json</code> handles all routing rewrites and sub-second 15s synchronization automatically!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: vercel.json File */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <h3>vercel.json (Already Generated)</h3>
                </div>

                <button
                  onClick={() => copyToClipboard(
`{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`,
                    'vercel'
                  )}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  {copiedSnippet === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'vercel' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                <pre>{`{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`}</pre>
              </div>

              <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Client-Ready: Runs instantly on Vercel Edge CDN with global low latency.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DEPLOYMENT VIEW */}
      {activePlatform === 'render' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Step 1: Render Settings Checklist */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">1</span>
                <h3>Render Web Service Configuration Settings</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody className="divide-y divide-zinc-800 font-mono">
                    <tr>
                      <td className="py-2.5 text-zinc-500 font-medium font-sans">Runtime</td>
                      <td className="py-2.5 text-emerald-400 font-bold">Node</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-zinc-500 font-medium font-sans">Build Command</td>
                      <td className="py-2.5 text-cyan-300">npm install &amp;&amp; npm run build</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-zinc-500 font-medium font-sans">Start Command</td>
                      <td className="py-2.5 text-amber-300">npm start</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-zinc-500 font-medium font-sans">Auto-Deploy</td>
                      <td className="py-2.5 text-emerald-400">Yes (on git push)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-zinc-500 font-medium font-sans">Health Check</td>
                      <td className="py-2.5 text-zinc-300">/api/health</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 2: Environment Variables */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
                <h3>Environment Variables on Render</h3>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500">NODE_ENV: </span>
                    <span className="text-emerald-400 font-bold">production</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500">PORT: </span>
                    <span className="text-cyan-400 font-bold">10000</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-zinc-500">SOLANA_RPC_URL: </span>
                    <span className="text-zinc-300">https://api.mainnet-beta.solana.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

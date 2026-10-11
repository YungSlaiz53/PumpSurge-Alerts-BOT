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
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Terminal, 
  FileCode,
  Zap
} from 'lucide-react';

export const RenderDeployDocs: React.FC = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#101524] to-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Server className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">Live Render.com Deployment Configuration</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Everything is pre-configured to deploy this full-stack application live on <b>Render.com</b> (Free tier or Production) using the included <code className="text-cyan-400 font-mono">render.yaml</code> blueprint and Express server.
          </p>
        </div>

        <a
          href="https://dashboard.render.com"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950/40 transition active:scale-95 shrink-0"
        >
          <span>Open Render Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Deployment Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Step 1: Render Settings Checklist */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">1</span>
            <h3>Render Web Service Configuration Settings</h3>
          </div>

          <p className="text-xs text-zinc-400">
            Create a new <b>Web Service</b> on Render and set the following parameters:
          </p>

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
                  <td className="py-2.5 text-zinc-500 font-medium font-sans">Health Check Path</td>
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

          <p className="text-xs text-zinc-400">
            Add these environment variables under the <b>Environment</b> tab in Render:
          </p>

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
                <span className="text-[10px] text-zinc-500 font-sans ml-2">(Set automatically by Render)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="truncate">
                <span className="text-zinc-500">SOLANA_RPC_URL: </span>
                <span className="text-zinc-300">https://api.mainnet-beta.solana.com</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="truncate">
                <span className="text-zinc-500">PUMP_PROGRAM_ID: </span>
                <span className="text-zinc-300">6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render.yaml Blueprint Code */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Pre-configured render.yaml Blueprint (Included)</h3>
          </div>

          <button
            onClick={() => copyToClipboard(
`services:
  - type: web
    name: pumpsurge-solana-app
    runtime: node
    plan: free
    region: oregon
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SOLANA_RPC_URL
        value: https://api.mainnet-beta.solana.com
      - key: PUMP_PROGRAM_ID
        value: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`,
              'yaml'
            )}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            {copiedSnippet === 'yaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSnippet === 'yaml' ? 'Copied' : 'Copy render.yaml'}</span>
          </button>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
          <pre>{`services:
  - type: web
    name: pumpsurge-solana-app
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SOLANA_RPC_URL
        value: https://api.mainnet-beta.solana.com
      - key: PUMP_PROGRAM_ID
        value: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`}</pre>
        </div>
      </div>
    </div>
  );
};

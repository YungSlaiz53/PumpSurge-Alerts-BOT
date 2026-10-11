# 🚀 PumpSurge: Solana Pump.fun Token Sniper & 5x/10x Surge App

A high-performance, full-stack Web & Mobile application for sub-second token detection, bonding curve liquidity tracking, and **instant 5x/10x multiplier surge push alerts** for **Pump.fun** on the Solana blockchain.

Built with **Node.js, Express, React 19, TypeScript, `@solana/web3.js`, Tailwind CSS**, and a persistent live database. Ready to deploy live on **Render.com**.

---

## ⚡ Core Application Features

1. **Sub-Second Token Detection**:
   - Real-time Solana RPC WebSocket stream (`logsSubscribe` with `processed` commitment).
   - Monitors Pump.fun program ID (`6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`) on Solana mainnet.
   - Decodes Anchor `Create` mints, bonding curve PDAs, dev wallets, and initial reserves.

2. **In-App & Desktop 5x / 10x Surge Notifications**:
   - In-app notification center drawer with unread badge counter.
   - Native browser desktop push notifications (`Notification.requestPermission()`).
   - Synthesized retro Web Audio synthesizer chimes when a token surges 5x or 10x in velocity.
   - Hall of Fame runner cards with historical 5x/10x velocity spikes and market caps.

3. **User Registration & Login Portal**:
   - Built-in authentication portal for **live Gmail addresses** (`@gmail.com`).
   - Secure alphanumerical password validation (letters + numbers, 6+ characters).
   - Server-side bcrypt password hashing with persistent profile storage.

4. **Live Persistent Database**:
   - Backed by persistent database storage (`/api/alerts`, `/api/auth`, `/api/watchlist`).
   - Stores users, personal watchlist tokens, and 5x/10x surge alert history across sessions.

5. **Render.com 1-Click Live Deployment**:
   - Complete `render.yaml` infrastructure-as-code blueprint included.
   - Express backend serves both REST API endpoints and static Vite frontend bundle.
   - Zero-config auto-deploy on git push.

---

## 🛠️ Project Structure

```
├── server.ts               # Production Express server (API routes + Vite frontend serving)
├── render.yaml             # Render.com Web Service blueprint configuration
├── .env.example            # Environment variables template
├── ecosystem.config.js     # PM2 configuration for VPS deployments
├── package.json            # Scripts & dependencies
├── src/
│   ├── types.ts            # TypeScript interfaces for tokens, events, app config
│   ├── pumpListener.ts     # Real-time Solana WebSocket event listener & log parser
│   ├── index.ts            # Standalone background sniper worker & DB sync engine
│   ├── db/
│   │   └── database.ts     # Persistent database manager with bcrypt user authentication
│   ├── services/
│   │   ├── authService.ts  # Client-side authentication service & push notifications
│   │   └── pumpSyncService.ts # Real-time coin synchronizer & terminal log generator
│   ├── components/
│   │   ├── Navbar.tsx      # App header with live Solana slot, latency, and auth status
│   │   ├── LiveSniperFeed.tsx # Real-time radar feed with 5x/10x trigger buttons & DEX links
│   │   ├── PreviousRunnersTicker.tsx # 5x/10x Hall of Fame runners
│   │   ├── WatchlistPanel.tsx # User saved tokens stored in live database
│   │   ├── NotificationCenter.tsx # In-app notification drawer with sound toggles
│   │   ├── AuthModal.tsx   # Gmail registration & login dialog
│   │   ├── TerminalLogs.tsx # On-chain transaction console
│   │   ├── BondingCurveCalculator.tsx # Constant-product mathematical visualizer
│   │   └── RenderDeployDocs.tsx # Render deployment checklist and settings
│   ├── App.tsx             # Main application orchestrator
│   └── main.tsx            # React entry point
└── README.md               # Complete application documentation
```

---

## 🌐 Deploy Live on Render.com

### Option A: Using `render.yaml` (Recommended)
1. Fork or push this repository to GitHub or GitLab.
2. Log into [Render.com Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint** and select this repository.
4. Render will automatically read `render.yaml` and provision your Web Service!

### Option B: Manual Web Service Setup
1. On Render, click **New +** > **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `SOLANA_RPC_URL` = `https://api.mainnet-beta.solana.com`
   - `SOLANA_WSS_URL` = `wss://api.mainnet-beta.solana.com`
   - `PUMP_PROGRAM_ID` = `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`
5. Click **Create Web Service**.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or test full-stack Express server
npm start
```

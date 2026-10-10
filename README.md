# 🚀 PumpSniper: Telegram Sniping & Alert Bot for Pump.fun on Solana

A high-performance, production-ready Telegram Sniping and 5x/10x Moonshot Alert Bot engine for **Pump.fun** on the Solana blockchain.

Built with **Node.js, TypeScript, `@solana/web3.js`, and `telegraf`**.

---

## ⚡ Core Features

- **Sub-Second On-Chain Detection**: Subscribes directly to Solana RPC WebSocket (`logsSubscribe` with `processed` commitment) targeting Pump.fun program `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`.
- **Instant Telegram Channel Broadcasts**: Formats new mint alerts with tap-to-copy mint contract addresses, initial bonding curve liquidity, dev wallet links, and trading buttons.
- **Real-Time 5x / 10x Price Surge Engine**: Continuously tracks new listings within a configurable time window (e.g. 5–90s) and fires a high-priority reply notification whenever a token explodes 5x or 10x.
- **Monetization via Embedded Affiliate Keyboards**: Integrates affiliate referral parameters directly into fast sniper buttons (Trojan, BonkBot, Photon, BullX, Maestro) to cover infrastructure costs.
- **Interactive DM Control Center**: Complete `/start`, `/settings` (toggle all listings vs 5x/10x surges), and instant on-chain `/lookup <mint>` command.

---

## 🛠️ Project Structure

```
├── .env.example            # Environment template (RPC URLs, Telegram tokens, Affiliate IDs)
├── ecosystem.config.js     # PM2 configuration for 24/7 background VPS deployment
├── package.json            # Scripts & dependencies
├── src/
│   ├── types.ts            # Data models, Anchor discriminators, bonding curve math constants
│   ├── pumpListener.ts     # Real-time WebSocket event listener & Borsh log parser
│   ├── telegramBot.ts      # Telegraf bot controller, inline keyboard builder, channel broadcaster
│   ├── index.ts            # Main application runner & graceful shutdown handler
│   ├── App.tsx             # Interactive Web3 Bot Control Terminal & Simulator UI
│   └── main.tsx            # Web app entry point
└── README.md               # Architecture documentation & VPS deployment guide
```

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/pumpfun-telegram-sniper.git
cd pumpfun-telegram-sniper
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```ini
TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
TELEGRAM_CHANNEL_ID="@YourTelegramChannel"
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY"
SOLANA_WSS_URL="wss://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY"
TROJAN_REF="your_trojan_affiliate_id"
BONKBOT_REF="your_bonkbot_affiliate_id"
```

### 3. Start the Bot
```bash
# Run in development mode with tsx auto-reloading
npm run bot:dev

# Or run the web terminal dashboard
npm run dev
```

---

## 🌐 24/7 VPS Deployment Guide (Ubuntu / Debian / AWS EC2 / Hetzner)

Follow these step-by-step instructions to run the bot 24/7 on a persistent Linux VPS.

### Step 1: VPS Initial Setup & Node.js 20+
Connect to your server:
```bash
ssh root@YOUR_SERVER_IP
```

Update system packages and install Node.js:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential

# Install Node.js v20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v   # v20.x.x
npm -v    # 10.x.x
```

### Step 2: Install PM2 Globally
```bash
sudo npm install -g pm2
```

### Step 3: Clone Project & Configure
```bash
cd /opt
git clone https://github.com/your-username/pumpfun-telegram-sniper.git
cd pumpfun-telegram-sniper
npm install

# Create production .env
cp .env.example .env
nano .env   # Enter your TELEGRAM_BOT_TOKEN and RPC endpoints
```

### Step 4: Launch Bot with PM2
```bash
# Start via ecosystem file
pm2 start ecosystem.config.js --env production

# Check bot logs in real time
pm2 logs pumpfun-telegram-bot

# Save PM2 process list so it survives server reboots
pm2 save
pm2 startup
```
*(Copy and execute the `sudo env PATH=...` command printed by `pm2 startup`)*

### Useful PM2 Commands
```bash
pm2 status                       # Check CPU/memory usage
pm2 logs pumpfun-telegram-bot   # Stream live logs
pm2 restart pumpfun-telegram-bot # Restart bot
pm2 stop pumpfun-telegram-bot    # Stop bot
```

---

## 📡 Upgrading to gRPC Geyser (Helius / Triton / Shyft)

For competitive sub-50ms latency, replace standard Solana RPC WebSocket with Yellowstone gRPC Geyser:
1. Connect via `@triton-one/yellowstone-grpc` or Helius Laserstream.
2. Filter for account updates belonging to program `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`.
3. Pipe the decoded events directly into `pumpListener.emit('create', ...)` and `pumpListener.emit('trade', ...)`. Because `pumpListener` uses an event-driven architecture, zero changes are required to `telegramBot.ts`!

---

## 🩺 Troubleshooting & Common Error Codes

| Error / Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`429 Too Many Requests`** | Free/public Solana RPC rate limits exceeded. | Switch to a dedicated RPC provider (Helius, Shyft, QuickNode, Triton) with custom API keys. |
| **`400 Bad Request: chat not found`** | Bot has not been added to the Telegram Channel or Channel username is misspelled. | 1. Add bot as Administrator in channel.<br>2. Grant "Post Messages" permission.<br>3. Verify channel ID in `.env` starts with `@` or `-100`. |
| **`400 Bad Request: can't parse entities`** | Unescaped Markdown special characters in token symbols (e.g. `_`, `*`, `[`). | The bot uses strict HTML formatting with `escapeHtml()` sanitization to prevent Telegram parse errors. |
| **`429 RetryAfter: 30` (Telegram Rate Limit)** | Telegram limits broadcasts to ~30 msgs/sec globally and ~20 msgs/min per channel. | In high-volume market surges, configure `MIN_LIQUIDITY_SOL` or `PRICE_SURGE_WINDOW_SECONDS` to filter low-liquidity spam. |
| **`WebSocket connection closed unexpectedly`** | Network hiccup or idle socket timeout on RPC node. | Built-in exponential backoff in `PumpListener` automatically reconnects within seconds. |
| **`Cannot read properties of null (reading 'data')`** | Querying a mint address that does not exist or has already migrated to Raydium. | Use `/lookup` error handling which informs users that token graduated. |

---

## ⚖️ License
MIT License. Free for open-source and commercial use.

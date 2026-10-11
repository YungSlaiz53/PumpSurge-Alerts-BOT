/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { AppDatabase } from './src/db/database.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const db = AppDatabase.getInstance();

app.use(express.json());

// --- REST API ENDPOINTS ---

// Health check for Render
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: Date.now(),
    service: 'pumpsurge-solana-app',
    database: 'connected',
  });
});

// 1. User Registration Portal (Gmail + Alphanumerical password)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username (Gmail) and password are required.' });
    }

    const result = await db.registerUser(username, password);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      message: 'Account successfully registered.',
      user: result.user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// 2. User Sign-in Portal
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const result = await db.loginUser(username, password);
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json({
      message: 'Logged in successfully.',
      user: result.user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// 3. Surge Alerts API (Retrieves persistent historical 5x, 10x, and moonshot runners)
app.get('/api/alerts', (_req, res) => {
  const alerts = db.getSurgeAlerts(50);
  res.json({ alerts, count: alerts.length });
});

// 4. Record new surge alert into database
app.post('/api/alerts', (req, res) => {
  try {
    const { mint, name, symbol, multiplier, targetMultiplier, timeElapsedSeconds, marketCapUsd, marketCapSol } = req.body;
    if (!mint || !multiplier) {
      return res.status(400).json({ error: 'Mint and multiplier are required.' });
    }

    const record = db.recordSurgeAlert({
      mint,
      name: name || 'Unknown',
      symbol: symbol || 'PUMP',
      multiplier: Number(multiplier),
      targetMultiplier: Number(targetMultiplier) || 5,
      timeElapsedSeconds: Number(timeElapsedSeconds) || 0,
      marketCapUsd: Number(marketCapUsd) || 0,
      marketCapSol: Number(marketCapSol) || 0,
    });

    res.status(201).json({ alert: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Watchlist API
app.get('/api/watchlist/:userId', (req, res) => {
  const watchlist = db.getUserWatchlist(req.params.userId);
  res.json({ watchlist });
});

app.post('/api/watchlist/toggle', (req, res) => {
  const { userId, mint } = req.body;
  if (!userId || !mint) {
    return res.status(400).json({ error: 'userId and mint required.' });
  }
  const isAdded = db.toggleWatchlist(userId, mint);
  res.json({ added: isAdded, mint });
});

// --- SERVING VITE APP IN DEV & PROD (RENDER READY) ---

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode (e.g. on Render): Serve built files from dist/
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 [PumpSurge App] Server running on port ${PORT} (Environment: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});

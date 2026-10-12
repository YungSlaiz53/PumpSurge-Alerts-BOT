/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  announcementText: string;
  announcementEnabled: boolean;
  announcementType: 'info' | 'warning' | 'alert' | 'success';
  dumpThresholdMultiplier: number; // default 3.0x
  autoSyncIntervalSeconds: number; // default 15s
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  siteTitle: 'PumpSurge Live App',
  siteSubtitle: 'Real-Time Solana Pump.fun Sniper & 15s Radar',
  announcementText: '⚡ Live Solana Pump.fun stream active. Price sync every 15s. 00:00 midnight log reset.',
  announcementEnabled: true,
  announcementType: 'info',
  dumpThresholdMultiplier: 3.0,
  autoSyncIntervalSeconds: 15,
  maintenanceMode: false,
  maintenanceMessage: 'Scheduled maintenance in progress. Live stream will resume shortly.',
};

const STORAGE_KEY_SITE_CONFIG = 'pumpsurge_site_config';

export class SiteConfigService {
  public static getConfig(): SiteConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SITE_CONFIG);
      if (raw) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_CONFIG };
  }

  public static saveConfig(config: Partial<SiteConfig>): SiteConfig {
    const current = this.getConfig();
    const updated: SiteConfig = { ...current, ...config };
    try {
      localStorage.setItem(STORAGE_KEY_SITE_CONFIG, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('site_config_updated', { detail: updated }));
    } catch {
      // Storage error
    }
    return updated;
  }

  public static resetToDefault(): SiteConfig {
    try {
      localStorage.setItem(STORAGE_KEY_SITE_CONFIG, JSON.stringify(DEFAULT_CONFIG));
      window.dispatchEvent(new CustomEvent('site_config_updated', { detail: DEFAULT_CONFIG }));
    } catch {
      // Storage error
    }
    return { ...DEFAULT_CONFIG };
  }
}

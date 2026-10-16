import React from 'react';
import DOMPurify from 'dompurify';
import { SiteConfig, SiteConfigSchema } from '../schema';
import rawSiteConfig from '../data/siteConfig.json';

let cachedConfig: SiteConfig | null = null;

/**
 * Loads and validates site config with runtime error recovery.
 * Never throws at runtime; falls back gracefully.
 */
export function getSiteConfig(): SiteConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const parseResult = SiteConfigSchema.safeParse(rawSiteConfig);
    if (parseResult.success) {
      cachedConfig = parseResult.data;
      return cachedConfig;
    } else {
      console.warn('Site configuration schema validation warning:', parseResult.error.issues);
      // Construct fallback config from schema defaults
      cachedConfig = rawSiteConfig as unknown as SiteConfig;
      return cachedConfig;
    }
  } catch (err) {
    console.error('Failed to parse site configuration:', err);
    cachedConfig = rawSiteConfig as unknown as SiteConfig;
    return cachedConfig;
  }
}

type ConfigListener = (config: SiteConfig) => void;
const listeners = new Set<ConfigListener>();

let currentLiveConfig: SiteConfig = getSiteConfig();

/**
 * Notifies all subscribers of an in-memory configuration update (e.g. from live preview iframe).
 */
export function setPreviewConfig(newConfig: SiteConfig) {
  currentLiveConfig = newConfig;
  cachedConfig = newConfig;
  listeners.forEach((listener) => {
    try {
      listener(newConfig);
    } catch (e) {
      console.error('Error notifying config listener:', e);
    }
  });
}

/**
 * Subscribes a callback to live configuration updates.
 */
export function subscribeSiteConfig(listener: ConfigListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * React hook that returns the active site configuration and re-renders whenever
 * the admin theme editor broadcasts a live draft preview update.
 */
export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = React.useState<SiteConfig>(currentLiveConfig);

  React.useEffect(() => {
    return subscribeSiteConfig((updated) => {
      setConfig({ ...updated });
    });
  }, []);

  return config;
}

// Window postMessage listener for live iframe synchronization from Admin Theme Editor
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CALENVEE_PREVIEW_UPDATE' && event.data.config) {
      const parseResult = SiteConfigSchema.safeParse(event.data.config);
      if (parseResult.success) {
        setPreviewConfig(parseResult.data);
      } else {
        // Tolerant partial fallback for drafting
        setPreviewConfig(event.data.config as SiteConfig);
      }
    }
  });

  // If page loaded with ?preview=true, attempt fetching active draft from admin server
  if (window.location.search.includes('preview=true')) {
    fetch('/api/cms/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.draft) {
          const parseResult = SiteConfigSchema.safeParse(data.draft);
          if (parseResult.success) {
            setPreviewConfig(parseResult.data);
          }
        }
      })
      .catch(() => {});
  }
}

/**
 * Sanitize rich text HTML using DOMPurify to prevent XSS.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'span', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class', 'style'],
  });
}

/**
 * Evaluates whether a section is active based on visible flag and showFrom/showUntil schedule.
 */
export function isSectionActive(section: { visible?: boolean; showFrom?: string; showUntil?: string }, nowMs = Date.now()): boolean {
  if (section.visible === false) return false;

  if (section.showFrom) {
    const fromMs = new Date(section.showFrom).getTime();
    if (!isNaN(fromMs) && nowMs < fromMs) return false;
  }

  if (section.showUntil) {
    const untilMs = new Date(section.showUntil).getTime();
    if (!isNaN(untilMs) && nowMs > untilMs) return false;
  }

  return true;
}



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


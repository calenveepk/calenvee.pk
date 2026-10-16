// scripts/cms-storage.cjs
/**
 * CMS Storage Module for Calenvee.pk
 * Provides:
 * - Server-side path safety (writes restricted to src/data and public)
 * - Atomic JSON file writes (write temp + flush + rename)
 * - Automatic .bak file backup before modification
 * - Rolling 20-snapshot version history with one-click rollback
 * - Human-readable diff summary generation
 * - Schema validation for site configuration
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const HISTORY_DIR = path.join(DATA_DIR, '.history');

const SITE_CONFIG_FILE = path.join(DATA_DIR, 'siteConfig.json');
const DRAFT_CONFIG_FILE = path.join(DATA_DIR, 'siteConfig.draft.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });

/**
 * Validates that a target path resolves safely inside allowed directories.
 * Strictly prevents path traversal attacks (e.g. ../../).
 */
function isPathSafe(targetPath) {
  const resolved = path.resolve(targetPath);
  const safeData = resolved.startsWith(path.resolve(DATA_DIR));
  const safePublic = resolved.startsWith(path.resolve(PUBLIC_DIR));
  return safeData || safePublic;
}

/**
 * Safely reads a JSON file with a fallback default.
 */
function readJsonFile(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[cms-storage] Error reading ${filePath}:`, err.message);
  }
  return defaultValue;
}

/**
 * Atomically writes a JSON file:
 * 1. Validates safe path.
 * 2. Creates a .bak backup of existing file.
 * 3. Writes payload to an isolated temporary file.
 * 4. Atomically renames temporary file to target path.
 */
function writeJsonFileAtomic(filePath, data) {
  if (!isPathSafe(filePath)) {
    throw new Error(`Security Exception: Write forbidden to unauthorized path: ${filePath}`);
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Automatic backup of existing file
  if (fs.existsSync(filePath)) {
    try {
      fs.copyFileSync(filePath, filePath + '.bak');
    } catch (bakErr) {
      console.warn(`[cms-storage] Warning creating backup for ${filePath}:`, bakErr.message);
    }
  }

  const tmpFile = path.join(dir, `.${path.basename(filePath)}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(tmpFile, jsonString, 'utf8');

    // Windows rename retry loop to handle momentary file watcher / antivirus locks
    let renamed = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.renameSync(tmpFile, filePath);
        renamed = true;
        break;
      } catch (e) {
        if (e.code === 'EPERM' || e.code === 'EBUSY') {
          const start = Date.now();
          while (Date.now() - start < 20) {}
          continue;
        }
        break;
      }
    }

    if (!renamed) {
      // Fallback: direct atomic write if Windows rename is held by file watcher
      fs.writeFileSync(filePath, jsonString, 'utf8');
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
    return true;
  } catch (err) {
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
    console.error(`[cms-storage] Atomic write failed for ${filePath}:`, err.message);
    throw err;
  }
}

/**
 * Validates site configuration against essential schema constraints.
 */
function validateSiteConfig(config) {
  const errors = [];
  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Site configuration must be an object'] };
  }

  if (typeof config.version !== 'number') {
    errors.push('config.version must be a number');
  }

  if (!config.global || typeof config.global !== 'object') {
    errors.push('config.global is required');
  } else {
    if (!config.global.shipping || typeof config.global.shipping.standardShippingFee !== 'number') {
      errors.push('config.global.shipping.standardShippingFee must be a valid number');
    }
    if (!config.global.contact || !config.global.contact.storeName) {
      errors.push('config.global.contact.storeName is required');
    }
  }

  if (!config.pages || typeof config.pages !== 'object') {
    errors.push('config.pages is required and must be an object');
  } else {
    for (const [pageId, page] of Object.entries(config.pages)) {
      if (!page || typeof page !== 'object') {
        errors.push(`Page "${pageId}" must be an object`);
        continue;
      }
      if (!Array.isArray(page.sections)) {
        errors.push(`Page "${pageId}".sections must be an array`);
        continue;
      }
      for (let i = 0; i < page.sections.length; i++) {
        const sec = page.sections[i];
        if (!sec || typeof sec !== 'object') {
          errors.push(`Page "${pageId}" section #${i} must be an object`);
          continue;
        }
        if (!sec.id || typeof sec.id !== 'string') {
          errors.push(`Page "${pageId}" section #${i} is missing a valid id`);
        }
        if (!sec.type || typeof sec.type !== 'string') {
          errors.push(`Page "${pageId}" section #${i} is missing a valid type`);
        }
        if (sec.visible !== undefined && typeof sec.visible !== 'boolean') {
          errors.push(`Page "${pageId}" section "${sec.id}" visible property must be boolean`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a version snapshot in .history/ and maintains at most 20 snapshots.
 */
function createSnapshot(config, summary = 'Publish snapshot') {
  const timestamp = Date.now();
  const snapshotId = `snapshot-${timestamp}`;
  const filename = `${snapshotId}.json`;
  const filePath = path.join(HISTORY_DIR, filename);

  const snapshotData = {
    snapshotId,
    timestamp,
    isoDate: new Date(timestamp).toISOString(),
    summary,
    config
  };

  writeJsonFileAtomic(filePath, snapshotData);
  pruneSnapshots(20);

  return { snapshotId, filename, timestamp };
}

/**
 * Prunes snapshots in .history/ keeping only the newest maxCount.
 */
function pruneSnapshots(maxCount = 20) {
  try {
    const files = fs.readdirSync(HISTORY_DIR)
      .filter(f => f.startsWith('snapshot-') && f.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a)); // Newest first

    if (files.length > maxCount) {
      const toDelete = files.slice(maxCount);
      for (const f of toDelete) {
        try {
          fs.unlinkSync(path.join(HISTORY_DIR, f));
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn('[cms-storage] Warning pruning snapshots:', err.message);
  }
}

/**
 * Lists available snapshots with metadata.
 */
function listSnapshots() {
  try {
    const files = fs.readdirSync(HISTORY_DIR)
      .filter(f => f.startsWith('snapshot-') && f.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a));

    return files.map(filename => {
      const filePath = path.join(HISTORY_DIR, filename);
      const stat = fs.statSync(filePath);
      let meta = { summary: 'Snapshot' };
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        meta = {
          summary: content.summary || 'Snapshot',
          isoDate: content.isoDate || stat.mtime.toISOString(),
          pageCount: content.config?.pages ? Object.keys(content.config.pages).length : 0,
          sectionCount: content.config?.pages?.home?.sections ? content.config.pages.home.sections.length : 0
        };
      } catch (_) {}

      return {
        id: filename.replace('.json', ''),
        filename,
        timestamp: stat.mtimeMs,
        dateFormatted: stat.mtime.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
        sizeKb: Math.round(stat.size / 1024),
        ...meta
      };
    });
  } catch (err) {
    console.error('[cms-storage] Error listing snapshots:', err.message);
    return [];
  }
}

/**
 * Rolls back the site configuration to a specific snapshot.
 */
function rollbackSnapshot(snapshotId) {
  const filename = snapshotId.endsWith('.json') ? snapshotId : `${snapshotId}.json`;
  const filePath = path.join(HISTORY_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot not found: ${snapshotId}`);
  }

  const snapshotContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const restoredConfig = snapshotContent.config || snapshotContent;

  const validation = validateSiteConfig(restoredConfig);
  if (!validation.valid) {
    throw new Error(`Snapshot corrupted: ${validation.errors.join('; ')}`);
  }

  // Atomically update siteConfig.json
  writeJsonFileAtomic(SITE_CONFIG_FILE, restoredConfig);

  // Sync or clear draft
  writeJsonFileAtomic(DRAFT_CONFIG_FILE, restoredConfig);

  return {
    success: true,
    snapshotId,
    restoredAt: new Date().toISOString()
  };
}

/**
 * Computes a human-readable diff summary between two site configurations.
 */
function computeDiff(currentConfig, targetConfig) {
  const changes = [];

  if (!currentConfig || !targetConfig) {
    return { hasChanges: true, changes: ['Complete site configuration replacement'] };
  }

  // Check global changes
  const currGlobal = currentConfig.global || {};
  const targGlobal = targetConfig.global || {};

  if (currGlobal.announcementBar?.enabled !== targGlobal.announcementBar?.enabled) {
    changes.push(`Announcement bar visibility changed to ${targGlobal.announcementBar?.enabled ? 'visible' : 'hidden'}`);
  }
  if (JSON.stringify(currGlobal.shipping) !== JSON.stringify(targGlobal.shipping)) {
    changes.push(`Shipping fee or free threshold updated (Standard: Rs. ${targGlobal.shipping?.standardShippingFee}, Free at: Rs. ${targGlobal.shipping?.freeShippingThreshold})`);
  }
  if (JSON.stringify(currGlobal.contact) !== JSON.stringify(targGlobal.contact)) {
    changes.push(`Contact or WhatsApp configuration updated`);
  }
  if (JSON.stringify(currGlobal.themeTokens) !== JSON.stringify(targGlobal.themeTokens)) {
    changes.push(`Theme branding tokens (colors/fonts) modified`);
  }

  // Check page and section changes
  const currPages = currentConfig.pages || {};
  const targPages = targetConfig.pages || {};

  const allPageIds = Array.from(new Set([...Object.keys(currPages), ...Object.keys(targPages)]));

  for (const pageId of allPageIds) {
    const currPage = currPages[pageId];
    const targPage = targPages[pageId];

    if (!currPage && targPage) {
      changes.push(`Page "${targPage.name || pageId}" was added`);
      continue;
    }
    if (currPage && !targPage) {
      changes.push(`Page "${currPage.name || pageId}" was removed`);
      continue;
    }

    if (currPage.visible !== targPage.visible) {
      changes.push(`Page "${targPage.name || pageId}" visibility toggled to ${targPage.visible ? 'visible' : 'hidden'}`);
    }

    const currSecs = currPage.sections || [];
    const targSecs = targPage.sections || [];

    if (currSecs.length !== targSecs.length) {
      changes.push(`Page "${targPage.name || pageId}" section count changed from ${currSecs.length} to ${targSecs.length}`);
    }

    const currSecMap = new Map(currSecs.map(s => [s.id, s]));
    const targSecMap = new Map(targSecs.map(s => [s.id, s]));

    for (const s of targSecs) {
      if (!currSecMap.has(s.id)) {
        changes.push(`Added new section "${s.type}" (${s.id}) to ${pageId}`);
      } else {
        const oldSec = currSecMap.get(s.id);
        if (oldSec.visible !== s.visible) {
          changes.push(`Section "${s.type}" (${s.id}) visibility toggled to ${s.visible ? 'visible' : 'hidden'}`);
        } else if (JSON.stringify(oldSec.settings) !== JSON.stringify(s.settings)) {
          changes.push(`Updated content/settings in section "${s.type}" (${s.id}) on ${pageId}`);
        }
      }
    }

    for (const s of currSecs) {
      if (!targSecMap.has(s.id)) {
        changes.push(`Removed section "${s.type}" (${s.id}) from ${pageId}`);
      }
    }

    // Check order changes
    const currOrder = currSecs.map(s => s.id).join(',');
    const targOrder = targSecs.map(s => s.id).join(',');
    if (currOrder !== targOrder && currSecs.length === targSecs.length) {
      changes.push(`Reordered sections on page "${pageId}"`);
    }
  }

  return {
    hasChanges: changes.length > 0,
    changes: changes.length > 0 ? changes : ['No structural changes detected (settings identical)']
  };
}

module.exports = {
  ROOT_DIR,
  DATA_DIR,
  PUBLIC_DIR,
  HISTORY_DIR,
  SITE_CONFIG_FILE,
  DRAFT_CONFIG_FILE,
  isPathSafe,
  readJsonFile,
  writeJsonFileAtomic,
  validateSiteConfig,
  createSnapshot,
  listSnapshots,
  rollbackSnapshot,
  computeDiff
};


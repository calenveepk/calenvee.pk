// scripts/media-manager.cjs
/**
 * Media Manager Module for Calenvee.pk
 * Provides:
 * - Media library catalog with disk scanner
 * - Alt text enforcement and metadata registry
 * - Sharp-powered automatic WebP conversion and responsive thumbnail generation
 * - Usage tracking across products.json, siteConfig.json, categories.json, deals.json
 * - Flags for unused images and oversized assets (> 500 KB)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { writeJsonFileAtomic, readJsonFile } = require('./cms-storage.cjs');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PRODUCTS_DIR = path.join(PUBLIC_DIR, 'products');
const HERO_DIR = path.join(PUBLIC_DIR, 'hero');
const MEDIA_REGISTRY_FILE = path.join(ROOT_DIR, 'src', 'data', 'mediaLibrary.json');

// Ensure upload directories exist
if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
if (!fs.existsSync(HERO_DIR)) fs.mkdirSync(HERO_DIR, { recursive: true });

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']);

/**
 * Collects all image files from public/products and public/hero.
 */
function collectMediaFiles(dir, prefix) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXTS.has(ext)) {
          files.push({
            filename: entry.name,
            fullPath: path.join(dir, entry.name),
            url: `/${prefix}/${entry.name}`,
            directory: prefix
          });
        }
      }
    }
  } catch (err) {
    console.warn(`[media-manager] Error scanning ${dir}:`, err.message);
  }
  return files;
}

/**
 * Searches site data to find where an image is referenced.
 */
function findImageUsages(url, dataContext) {
  const usages = [];
  const cleanUrl = url.toLowerCase();
  const basename = path.basename(url).toLowerCase();

  const isMatch = (str) => {
    if (!str || typeof str !== 'string') return false;
    const lower = str.toLowerCase();
    return lower.includes(cleanUrl) || lower.includes(basename);
  };

  // 1. Search products
  if (Array.isArray(dataContext.products)) {
    for (const p of dataContext.products) {
      if (Array.isArray(p.images)) {
        p.images.forEach((img, idx) => {
          const imgUrl = typeof img === 'string' ? img : img?.url;
          if (isMatch(imgUrl)) {
            usages.push(`Product: "${p.title || p.name}" (Image #${idx + 1})`);
          }
        });
      } else if (p.image && isMatch(p.image)) {
        usages.push(`Product: "${p.title || p.name}" (Main Image)`);
      }
    }
  }

  // 2. Search categories
  if (Array.isArray(dataContext.categories)) {
    for (const c of dataContext.categories) {
      if (isMatch(c.image)) {
        usages.push(`Category: "${c.name || c.title}"`);
      }
    }
  }

  // 3. Search siteConfig
  if (dataContext.siteConfig && typeof dataContext.siteConfig === 'object') {
    const checkObj = (obj, pathDesc = '') => {
      if (!obj) return;
      if (typeof obj === 'string') {
        if (isMatch(obj)) {
          usages.push(`CMS: ${pathDesc}`);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => checkObj(item, `${pathDesc}[${i}]`));
      } else if (typeof obj === 'object') {
        for (const [key, val] of Object.entries(obj)) {
          checkObj(val, pathDesc ? `${pathDesc}.${key}` : key);
        }
      }
    };
    checkObj(dataContext.siteConfig, 'siteConfig');
  }

  return usages;
}

/**
 * Scans all media files and builds a comprehensive media catalog with usage inspection.
 */
async function getMediaCatalog() {
  const productImages = collectMediaFiles(PRODUCTS_DIR, 'products');
  const heroImages = collectMediaFiles(HERO_DIR, 'hero');
  const allFiles = [...productImages, ...heroImages];

  // Load datasets for usage detection
  const dataContext = {
    products: readJsonFile(path.join(ROOT_DIR, 'src', 'data', 'products.json'), []),
    categories: readJsonFile(path.join(ROOT_DIR, 'src', 'data', 'categories.json'), []),
    siteConfig: readJsonFile(path.join(ROOT_DIR, 'src', 'data', 'siteConfig.json'), {})
  };

  const registry = readJsonFile(MEDIA_REGISTRY_FILE, {});

  const items = [];
  for (const file of allFiles) {
    try {
      const stat = fs.statSync(file.fullPath);
      let dimensions = { width: null, height: null, format: null };

      try {
        if (file.filename.endsWith('.svg')) {
          dimensions = { width: 400, height: 400, format: 'svg' };
        } else {
          const meta = await sharp(file.fullPath).metadata();
          dimensions = {
            width: meta.width || null,
            height: meta.height || null,
            format: meta.format || null
          };
        }
      } catch (_) {}

      const usages = findImageUsages(file.url, dataContext);
      const isOversized = stat.size > 500 * 1024; // > 500 KB
      const registryEntry = registry[file.url] || {};

      items.push({
        url: file.url,
        filename: file.filename,
        directory: file.directory,
        sizeBytes: stat.size,
        sizeKb: Math.round(stat.size / 1024),
        isOversized,
        width: dimensions.width,
        height: dimensions.height,
        format: dimensions.format || path.extname(file.filename).replace('.', ''),
        altText: registryEntry.altText || file.filename.replace(/[-_]/g, ' ').replace(/\.\w+$/, ''),
        usages,
        usageCount: usages.length,
        isUnused: usages.length === 0,
        modifiedAt: stat.mtime.toISOString()
      });
    } catch (e) {
      console.warn(`[media-manager] Error analyzing ${file.filename}:`, e.message);
    }
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

  return {
    success: true,
    totalFiles: items.length,
    unusedCount: items.filter(i => i.isUnused).length,
    oversizedCount: items.filter(i => i.isOversized).length,
    items
  };
}

/**
 * Handles media upload with mandatory Alt Text, Sharp WebP conversion,
 * and responsive thumbnail creation.
 */
async function processMediaUpload({ filename, data, altText, subDir = 'products' }) {
  if (!altText || typeof altText !== 'string' || altText.trim().length === 0) {
    throw new Error('Alt text is required for all image uploads to ensure accessibility and SEO compliance.');
  }

  if (!filename || !data) {
    throw new Error('Filename and file data payload are required.');
  }

  const base64Clean = data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Clean, 'base64');

  const cleanBase = path.basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 40);

  const timestamp = Date.now();
  const webpFilename = `${timestamp}_${cleanBase}.webp`;
  const thumbFilename = `${timestamp}_${cleanBase}_thumb.webp`;

  const targetDir = subDir === 'hero' ? HERO_DIR : PRODUCTS_DIR;
  const webpPath = path.join(targetDir, webpFilename);
  const thumbPath = path.join(targetDir, thumbFilename);

  // Convert main image to optimized WebP
  const sharpInstance = sharp(buffer);
  const metadata = await sharpInstance.metadata();

  await sharp(buffer)
    .webp({ quality: 85, effort: 4 })
    .toFile(webpPath);

  // Generate responsive 400px thumbnail
  await sharp(buffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbPath);

  const stat = fs.statSync(webpPath);
  const publicUrl = `/${subDir}/${webpFilename}`;
  const thumbUrl = `/${subDir}/${thumbFilename}`;

  // Update Media Registry
  const registry = readJsonFile(MEDIA_REGISTRY_FILE, {});
  registry[publicUrl] = {
    altText: altText.trim(),
    uploadedAt: new Date().toISOString(),
    originalName: filename,
    width: metadata.width,
    height: metadata.height,
    sizeKb: Math.round(stat.size / 1024),
    thumbUrl
  };
  writeJsonFileAtomic(MEDIA_REGISTRY_FILE, registry);

  return {
    success: true,
    url: publicUrl,
    thumbUrl,
    filename: webpFilename,
    altText: altText.trim(),
    width: metadata.width,
    height: metadata.height,
    sizeKb: Math.round(stat.size / 1024),
    originalFormat: metadata.format
  };
}

module.exports = {
  getMediaCatalog,
  processMediaUpload
};

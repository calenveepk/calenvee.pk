import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';

const cmsStorage = require('../scripts/cms-storage.cjs');
const mediaManager = require('../scripts/media-manager.cjs');

describe('Admin Server & CMS Core Modules', () => {
  it('reads published siteConfig cleanly', () => {
    const config = cmsStorage.readJsonFile(cmsStorage.SITE_CONFIG_FILE, null);
    expect(config).not.toBeNull();
    expect(config.version).toBe(1);
    expect(config.pages).toBeDefined();
    expect(config.pages.home).toBeDefined();
    expect(config.pages.home.sections.length).toBeGreaterThan(0);
  });

  it('verifies media catalog scans images with alt text', async () => {
    const catalog = await mediaManager.getMediaCatalog();
    expect(catalog.success).toBe(true);
    expect(catalog.totalFiles).toBeGreaterThan(0);
    expect(Array.isArray(catalog.items)).toBe(true);
    const first = catalog.items[0];
    expect(first.url).toBeDefined();
    expect(first.sizeKb).toBeGreaterThan(0);
    expect(first.altText).toBeDefined();
  });

  it('enforces mandatory alt text on media upload', async () => {
    await expect(mediaManager.processMediaUpload({
      filename: 'sample.png',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      altText: ''
    })).rejects.toThrow(/Alt text is required/);
  });

  it('converts uploaded image to WebP and generates responsive thumbnail', async () => {
    // 1x1 transparent PNG in base64
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const result = await mediaManager.processMediaUpload({
      filename: 'test_dot.png',
      data: pngBase64,
      altText: 'Test Dot Image'
    });

    expect(result.success).toBe(true);
    expect(result.url).toContain('.webp');
    expect(result.thumbUrl).toContain('_thumb.webp');
    expect(result.altText).toBe('Test Dot Image');

    // Clean up created test files
    const fullWebp = path.join(cmsStorage.PUBLIC_DIR, 'products', result.filename);
    const fullThumb = path.join(cmsStorage.PUBLIC_DIR, 'products', path.basename(result.thumbUrl));
    if (fs.existsSync(fullWebp)) fs.unlinkSync(fullWebp);
    if (fs.existsSync(fullThumb)) fs.unlinkSync(fullThumb);
  });
});

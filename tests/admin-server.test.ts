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

    // Clean up created test files and registry entry
    const fullWebp = path.join(cmsStorage.PUBLIC_DIR, 'products', result.filename);
    const fullThumb = path.join(cmsStorage.PUBLIC_DIR, 'products', path.basename(result.thumbUrl));
    if (fs.existsSync(fullWebp)) fs.unlinkSync(fullWebp);
    if (fs.existsSync(fullThumb)) fs.unlinkSync(fullThumb);

    const registryFile = path.join(cmsStorage.DATA_DIR, 'mediaLibrary.json');
    if (fs.existsSync(registryFile)) {
      const reg = cmsStorage.readJsonFile(registryFile, {});
      delete reg[result.url];
      cmsStorage.writeJsonFileAtomic(registryFile, reg);
    }
  });

  it('graphic designer AI agent composites raw images to exact section specifications', async () => {
    const graphicDesigner = require('../scripts/graphic-designer.cjs');
    expect(graphicDesigner.SECTION_SPECS.hero).toBeDefined();
    expect(graphicDesigner.SECTION_SPECS['deal-of-the-day']).toBeDefined();

    // 1x1 transparent PNG
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    
    // Generate Hero Visual (1920x800)
    const heroResult = await graphicDesigner.designSectionGraphic({
      image: pngBase64,
      targetSection: 'hero',
      styleTheme: 'luxury-studio',
      filename: 'test-unit-hero'
    });

    expect(heroResult.success).toBe(true);
    expect(heroResult.width).toBe(1920);
    expect(heroResult.height).toBe(800);
    expect(heroResult.aspect).toBe('2.4:1');
    expect(heroResult.url).toContain('/hero/');
    expect(fs.existsSync(heroResult.path)).toBe(true);
    fs.unlinkSync(heroResult.path);

    // Generate Deal of the Day Visual (800x800)
    const dealResult = await graphicDesigner.designSectionGraphic({
      image: pngBase64,
      targetSection: 'deal-of-the-day',
      styleTheme: 'warm-terracotta',
      filename: 'test-unit-deal'
    });

    expect(dealResult.success).toBe(true);
    expect(dealResult.width).toBe(800);
    expect(dealResult.height).toBe(800);
    expect(dealResult.aspect).toBe('1:1');
    expect(dealResult.url).toContain('/products/');
    expect(fs.existsSync(dealResult.path)).toBe(true);
    fs.unlinkSync(dealResult.path);
  });
});



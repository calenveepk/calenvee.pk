const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';
const SNAPSHOT_TYPE = process.env.SNAPSHOT_TYPE || 'baseline';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'tests', 'screenshots', SNAPSHOT_TYPE);

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'shop', path: '/shop' },
  { name: 'category', path: '/category/watches' },
  { name: 'product', path: '/product/calenvee-obsidian-chrono-edition' },
  { name: 'checkout', path: '/checkout' },
  { name: 'best-sellers', path: '/best-sellers' },
  { name: 'new-arrivals', path: '/new-arrivals' },
  { name: 'about', path: '/about' },
  { name: 'reviews', path: '/reviews' },
  { name: 'contact', path: '/contact' },
  { name: 'wishlist', path: '/wishlist' },
  { name: 'shipping-policy', path: '/shipping-policy' },
  { name: 'returns-refunds', path: '/returns-refunds' },
  { name: 'terms', path: '/terms-and-conditions' },
  { name: 'privacy-policy', path: '/privacy-policy' },
];

const VIEWPORTS = [
  { mode: 'desktop', width: 1440, height: 900 },
  { mode: 'mobile', width: 390, height: 844 },
];

async function main() {
  console.log(`[Screenshots] Launching Playwright to capture ${SNAPSHOT_TYPE} snapshots from ${BASE_URL}...`);
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const dir = path.join(OUTPUT_DIR, vp.mode);
    fs.mkdirSync(dir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.mode === 'mobile',
      hasTouch: vp.mode === 'mobile',
    });
    const page = await context.newPage();

    for (const p of PAGES) {
      try {
        await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 25000 });
        await page.waitForTimeout(600);
        const file = path.join(dir, `${p.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`[${vp.mode} - ${SNAPSHOT_TYPE}] ✓ ${p.name}`);
      } catch (err) {
        console.error(`[${vp.mode} - ${SNAPSHOT_TYPE}] ✗ ${p.name}:`, err.message);
      }
    }
    await context.close();
  }

  await browser.close();
  console.log(`[Screenshots] Done. All ${SNAPSHOT_TYPE} snapshots stored in: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});

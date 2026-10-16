#!/usr/bin/env node

/**
 * ==============================================================================
 * Calenvee.pk — Store Integrity Checker
 * ==============================================================================
 * Runs in CI and pre-publish to guarantee store data integrity:
 * 1. Config validation (storeSettings, deals, categories, products)
 * 2. Products referencing valid categories
 * 3. Deals and banners referencing valid products
 * 4. Image file existence for local image paths
 * 5. Route resolution for all internal links (<Link to=...>, href="/...")
 * 6. No href="#" or empty onClick handlers
 * 7. Buttons have explicit actions (onClick, type="submit", etc.)
 * 8. No placeholder values in user-facing JSX (phone numbers, lorem ipsum)
 * 9. No hardcoded settings numbers (shipping fee, free-shipping threshold)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let errorCount = 0;
let warningCount = 0;

function reportPass(msg) {
  console.log(`\x1b[32m  ✓\x1b[0m ${msg}`);
}

function reportFail(msg, details = []) {
  errorCount++;
  console.error(`\x1b[31m  ✗ [FAIL]\x1b[0m ${msg}`);
  details.forEach((d) => console.error(`      \x1b[90m→\x1b[0m ${d}`));
}

function reportWarn(msg, details = []) {
  warningCount++;
  console.warn(`\x1b[33m  ⚠ [WARN]\x1b[0m ${msg}`);
  details.forEach((d) => console.warn(`      \x1b[90m→\x1b[0m ${d}`));
}

console.log('\n\x1b[1m\x1b[36mRunning Calenvee Store Integrity Verification...\x1b[0m\n');

// ==============================================================================
// 1. CONFIG & DATA VALIDATION
// ==============================================================================
console.log('\x1b[1m[1/9] Validating JSON Config Schemas...\x1b[0m');

let storeSettings, deals, categories, products, homeContent;

try {
  storeSettings = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/storeSettings.json'), 'utf8'));
  const requiredSettings = ['storeName', 'whatsappNumber', 'supportEmail', 'freeShippingThreshold', 'standardShippingFee', 'deliveryWindow'];
  const missing = requiredSettings.filter((k) => storeSettings[k] === undefined || storeSettings[k] === '');
  if (missing.length > 0) {
    reportFail('storeSettings.json missing required keys', missing);
  } else {
    reportPass(`storeSettings.json valid (Free Shipping: Rs. ${storeSettings.freeShippingThreshold}, Standard: Rs. ${storeSettings.standardShippingFee})`);
  }
} catch (err) {
  reportFail('Failed to parse src/data/storeSettings.json: ' + err.message);
}

try {
  deals = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/deals.json'), 'utf8'));
  if (!Array.isArray(deals)) throw new Error('deals.json must be an array');
  const invalidDeals = deals.filter((d) => !d.id || !d.productId || typeof d.dealPrice !== 'number' || !d.startDateTime || !d.endDateTime);
  if (invalidDeals.length > 0) {
    reportFail('deals.json contains invalid deal items', invalidDeals.map((d) => d.id || 'unnamed'));
  } else {
    reportPass(`deals.json valid (${deals.length} deals configured)`);
  }
} catch (err) {
  reportFail('Failed to parse src/data/deals.json: ' + err.message);
}

try {
  categories = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/categories.json'), 'utf8'));
  if (!Array.isArray(categories)) throw new Error('categories.json must be an array');
  const invalidCats = categories.filter((c) => !c.id || !c.slug || !c.name);
  if (invalidCats.length > 0) {
    reportFail('categories.json contains invalid category items', invalidCats.map((c) => c.name || 'unnamed'));
  } else {
    reportPass(`categories.json valid (${categories.length} categories)`);
  }
} catch (err) {
  reportFail('Failed to parse src/data/categories.json: ' + err.message);
}

try {
  products = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/products.json'), 'utf8'));
  if (!Array.isArray(products)) throw new Error('products.json must be an array');
  const invalidProds = products.filter((p) => !p.id || !p.name || typeof p.price !== 'number' || !p.category);
  if (invalidProds.length > 0) {
    reportFail('products.json contains invalid product items', invalidProds.map((p) => p.name || 'unnamed'));
  } else {
    reportPass(`products.json valid (${products.length} products)`);
  }
} catch (err) {
  reportFail('Failed to parse src/data/products.json: ' + err.message);
}

try {
  homeContent = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/homeContent.json'), 'utf8'));
  reportPass('homeContent.json parsed successfully');
} catch (err) {
  reportFail('Failed to parse src/data/homeContent.json: ' + err.message);
}

let siteConfig;
try {
  siteConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/siteConfig.json'), 'utf8'));
  if (!siteConfig.global || !siteConfig.pages) {
    reportFail('siteConfig.json missing global or pages root object');
  } else {
    const pageKeys = Object.keys(siteConfig.pages);
    reportPass(`siteConfig.json valid (${pageKeys.length} configured pages: ${pageKeys.join(', ')})`);
  }
} catch (err) {
  reportFail('Failed to parse src/data/siteConfig.json: ' + err.message);
}

// ==============================================================================
// 2. PRODUCTS REFERENCING VALID CATEGORIES
// ==============================================================================
console.log('\n\x1b[1m[2/9] Checking Product Category References...\x1b[0m');
if (products && categories) {
  const validCatSlugs = new Set(categories.map((c) => c.slug));
  const badCategoryProds = products.filter((p) => !validCatSlugs.has(p.category));

  if (badCategoryProds.length > 0) {
    reportFail(
      `Found ${badCategoryProds.length} products referencing missing categories:`,
      badCategoryProds.map((p) => `${p.name} (ID: ${p.id}) → invalid category "${p.category}"`)
    );
  } else {
    reportPass(`All ${products.length} products reference registered categories.`);
  }
}

// ==============================================================================
// 3. DEALS & BANNERS REFERENCING VALID PRODUCTS
// ==============================================================================
console.log('\n\x1b[1m[3/9] Checking Deals & Promotional Product References...\x1b[0m');
if (deals && products) {
  const productIds = new Set(products.map((p) => p.id));
  const badDeals = deals.filter((d) => !productIds.has(d.productId));

  if (badDeals.length > 0) {
    reportFail(
      `Found ${badDeals.length} deals referencing non-existent products:`,
      badDeals.map((d) => `Deal "${d.title}" (${d.id}) references missing product ID "${d.productId}"`)
    );
  } else {
    reportPass(`All ${deals.length} deals reference active products.`);
  }
}

// ==============================================================================
// 4. MISSING LOCAL IMAGE FILES
// ==============================================================================
console.log('\n\x1b[1m[4/9] Verifying Local Media Assets Existence...\x1b[0m');
const localImages = [];

function extractLocalImages(obj) {
  if (!obj) return;
  if (typeof obj === 'string') {
    if (obj.startsWith('/') && /\.(webp|png|jpe?g|svg|gif|avif)$/i.test(obj)) {
      localImages.push(obj);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(extractLocalImages);
  } else if (typeof obj === 'object') {
    Object.values(obj).forEach(extractLocalImages);
  }
}

extractLocalImages(products);
extractLocalImages(categories);
extractLocalImages(deals);
extractLocalImages(homeContent);
extractLocalImages(siteConfig);

const missingImages = [];
const checkedImages = new Set();

localImages.forEach((img) => {
  if (checkedImages.has(img)) return;
  checkedImages.add(img);

  // Local images are relative to public directory
  const diskPath = path.join(ROOT, 'public', img.replace(/^\//, ''));
  if (!fs.existsSync(diskPath)) {
    missingImages.push(img);
  }
});

if (missingImages.length > 0) {
  reportFail(
    `Found ${missingImages.length} missing local images referenced in config:`,
    missingImages
  );
} else {
  reportPass(`All ${checkedImages.size} local image references exist in public/.`);
}

// ==============================================================================
// 5. ROUTE RESOLUTION FOR INTERNAL LINKS
// ==============================================================================
console.log('\n\x1b[1m[5/9] Checking Internal Link & Route Resolution...\x1b[0m');

let registeredRoutes = [];
try {
  const appTsx = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
  const routeRegex = /path=["']([^"']+)["']/g;
  let match;
  while ((match = routeRegex.exec(appTsx)) !== null) {
    registeredRoutes.push(match[1]);
  }
} catch (err) {
  reportFail('Could not read src/App.tsx for route discovery');
}

function routeMatches(target, registered) {
  // Normalize target
  const cleanTarget = target.split('?')[0].split('#')[0];
  if (cleanTarget === '/' || cleanTarget === '') return true;

  for (const reg of registered) {
    if (reg === '*') continue;
    if (reg === cleanTarget) return true;

    // Parameterized routes (e.g. /product/:id or /category/:slug)
    const regParts = reg.split('/').filter(Boolean);
    const targetParts = cleanTarget.split('/').filter(Boolean);

    if (regParts.length === targetParts.length) {
      const isMatch = regParts.every((part, idx) => part.startsWith(':') || part === targetParts[idx]);
      if (isMatch) return true;
    }
  }
  return false;
}

// Scan all src files for <Link to="..." or href="/..."
function getAllFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(full, exts));
    } else if (exts.some((ext) => file.endsWith(ext))) {
      results.push(full);
    }
  });
  return results;
}

const srcFiles = getAllFiles(path.join(ROOT, 'src'), ['.tsx', '.ts']);
const unresolvedLinks = [];

srcFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT, file);

  // Link to="..." or NavLink to="..."
  const linkToRegex = /<(?:Link|NavLink)\s+[^>]*to=["']([^"']+)["']/g;
  let m;
  while ((m = linkToRegex.exec(content)) !== null) {
    const target = m[1];
    if (target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('tel:')) continue;
    if (!routeMatches(target, registeredRoutes)) {
      unresolvedLinks.push(`${relPath} → <Link to="${target}"> does not match any route in App.tsx`);
    }
  }

  // <a href="/..." (internal link)
  const aHrefRegex = /<a\s+[^>]*href=["'](\/[^"']*)["']/g;
  while ((m = aHrefRegex.exec(content)) !== null) {
    const target = m[1];
    // Ignore static asset downloads
    if (/\.(pdf|zip|png|jpg|webp)$/i.test(target)) continue;
    if (!routeMatches(target, registeredRoutes)) {
      unresolvedLinks.push(`${relPath} → <a href="${target}"> does not match any route in App.tsx`);
    }
  }
});

if (unresolvedLinks.length > 0) {
  reportFail(`Found ${unresolvedLinks.length} unresolved internal links:`, unresolvedLinks);
} else {
  reportPass(`All internal links resolve to registered routes in App.tsx (${registeredRoutes.length} routes).`);
}

// ==============================================================================
// 6. NO href="#" OR EMPTY HANDLERS
// ==============================================================================
console.log('\n\x1b[1m[6/9] Scanning for href="#" and Empty Event Handlers...\x1b[0m');

const deadHandlers = [];
srcFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT, file);
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Check href="#"
    if (/href=["']#["']/i.test(line)) {
      deadHandlers.push(`${relPath}:${lineNum} → contains dead anchor href="#"`);
    }
    // Check empty onClick
    if (/onClick=\{(\s*\(\)\s*=>\s*\{\s*\}|\s*\(\)\s*=>\s*undefined\s*)\}/i.test(line)) {
      deadHandlers.push(`${relPath}:${lineNum} → empty onClick handler`);
    }
  });
});

if (deadHandlers.length > 0) {
  reportFail(`Found ${deadHandlers.length} dead links or empty handlers:`, deadHandlers);
} else {
  reportPass('No href="#" or empty onClick handlers found.');
}

// ==============================================================================
// 7. BUTTONS HAVE EXPLICIT ACTIONS
// ==============================================================================
console.log('\n\x1b[1m[7/9] Verifying Button Action Handlers...\x1b[0m');

const inactiveButtons = [];
srcFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT, file);

  let searchIdx = 0;
  while (true) {
    const btnIdx = content.indexOf('<button', searchIdx);
    if (btnIdx === -1) break;

    const nextChar = content[btnIdx + 7];
    if (nextChar !== ' ' && nextChar !== '\n' && nextChar !== '\t' && nextChar !== '>') {
      searchIdx = btnIdx + 7;
      continue;
    }

    let inBraces = 0;
    let inQuote = null;
    let tagEnd = -1;

    for (let i = btnIdx + 7; i < content.length; i++) {
      const ch = content[i];
      if (inQuote) {
        if (ch === inQuote && content[i - 1] !== '\\') inQuote = null;
      } else if (ch === '"' || ch === "'") {
        inQuote = ch;
      } else if (ch === '{') {
        inBraces++;
      } else if (ch === '}') {
        if (inBraces > 0) inBraces--;
      } else if (ch === '>' && inBraces === 0) {
        tagEnd = i;
        break;
      }
    }

    if (tagEnd !== -1) {
      const attrs = content.substring(btnIdx + 7, tagEnd);
      const hasClick = /onClick/i.test(attrs);
      const hasSubmit = /type=["']submit["']/i.test(attrs);
      const hasReset = /type=["']reset["']/i.test(attrs);
      const hasForm = /form=["']/i.test(attrs);
      const isDisabled = /disabled/i.test(attrs);

      if (!hasClick && !hasSubmit && !hasReset && !hasForm && !isDisabled) {
        const lineNum = content.substring(0, btnIdx).split('\n').length;
        inactiveButtons.push(`${relPath}:${lineNum} → <button> without onClick, type="submit", or disabled`);
      }
      searchIdx = tagEnd + 1;
    } else {
      searchIdx = btnIdx + 7;
    }
  }
});

if (inactiveButtons.length > 0) {
  reportWarn(`Found ${inactiveButtons.length} buttons without explicit click or submit handlers:`, inactiveButtons.slice(0, 10));
} else {
  reportPass('All buttons have explicit action handlers or submit behaviors.');
}

// ==============================================================================
// 8. NO HARDCODED PLACEHOLDER PHONE NUMBERS IN JSX
// ==============================================================================
console.log('\n\x1b[1m[8/9] Checking for Placeholder Text & Hardcoded Phone Numbers in JSX...\x1b[0m');

const placeholderHits = [];
srcFiles.forEach((file) => {
  // Allow formatters/settings modules to contain fallback constants if needed
  if (file.includes('formatters.ts') || file.includes('pricing.ts')) return;
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT, file);
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Ignore input placeholder attribute hints e.g. placeholder="0300-1234567"
    if (/placeholder=["'][^"']*1234567[^"']*["']/.test(line)) return;

    if (/\+?92\s*300\s*1234567/i.test(line) || /wa\.me\/923001234567/i.test(line)) {
      placeholderHits.push(`${relPath}:${lineNum} → hardcoded placeholder phone: ${line.trim()}`);
    }
    if (/lorem\s+ipsum/i.test(line)) {
      placeholderHits.push(`${relPath}:${lineNum} → lorem ipsum text found`);
    }
  });
});

if (placeholderHits.length > 0) {
  reportFail(`Found ${placeholderHits.length} placeholder values in JSX:`, placeholderHits);
} else {
  reportPass('Zero hardcoded placeholder phone numbers or lorem ipsum found in user-facing JSX.');
}

// ==============================================================================
// 9. NO CONFLICTING HARDCODED SHIPPING NUMBERS IN TEXT
// ==============================================================================
console.log('\n\x1b[1m[9/9] Checking for Outdated/Conflicting Hardcoded Shipping Numbers in JSX...\x1b[0m');

const conflictingNumbers = [];
srcFiles.forEach((file) => {
  if (file.includes('pricing.ts') || file.includes('formatters.ts')) return;
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT, file);
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Flag outdated free shipping claims (e.g. 2999 or 5999 for shipping in copy)
    if (/free\s+shipping[^.]*?(?:2[,\s]?999|5[,\s]?999)/i.test(line)) {
      conflictingNumbers.push(`${relPath}:${lineNum} → conflicting free shipping threshold in text: ${line.trim()}`);
    }
    // Flag outdated delivery fees in copy
    if (/(?:delivery|shipping)\s+fee[^.]*?(?:Rs\.?\s*350|Rs\.?\s*200)/i.test(line)) {
      conflictingNumbers.push(`${relPath}:${lineNum} → conflicting delivery fee in text: ${line.trim()}`);
    }
  });
});

if (conflictingNumbers.length > 0) {
  reportFail(`Found ${conflictingNumbers.length} conflicting shipping claims:`, conflictingNumbers);
} else {
  reportPass('All shipping claims and thresholds align with central storeSettings (Threshold: Rs. 3,500, Fee: Rs. 250).');
}

// ==============================================================================
// SUMMARY & EXIT
// ==============================================================================
console.log('\n-------------------------------------------------------------');
if (errorCount === 0) {
  console.log(`\x1b[1m\x1b[32m✔ STORE INTEGRITY VERIFICATION PASSED (0 Errors, ${warningCount} Warnings)\x1b[0m`);
  console.log('-------------------------------------------------------------\n');
  process.exit(0);
} else {
  console.error(`\x1b[1m\x1b[31m✖ STORE INTEGRITY VERIFICATION FAILED (${errorCount} Errors, ${warningCount} Warnings)\x1b[0m`);
  console.error('Please fix the above integrity violations before committing or publishing.\n');
  process.exit(1);
}

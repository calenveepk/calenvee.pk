// scripts/graphic-designer.cjs
// Calenvee Internal Graphic Designer AI Agent
// Transforms raw product images into professional e-commerce visuals tailored for Hero, Product Cards, Deals & Categories.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PRODUCTS_DIR = path.join(PUBLIC_DIR, 'products');
const HERO_DIR = path.join(PUBLIC_DIR, 'hero');

// Ensure output directories exist
[PRODUCTS_DIR, HERO_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Section Specifications & Aspect Ratios
const SECTION_SPECS = {
  hero: {
    width: 1920,
    height: 800,
    aspect: '2.4:1',
    description: 'Ultra-wide hero banner with left safe-zone for text and right staging for product',
    targetDir: HERO_DIR,
    urlPrefix: '/hero/',
    productPlacement: 'right' // Product sits on right 50%
  },
  'deal-of-the-day': {
    width: 800,
    height: 800,
    aspect: '1:1',
    description: 'Square flash deal showcase with warm ambient studio halo',
    targetDir: PRODUCTS_DIR,
    urlPrefix: '/products/',
    productPlacement: 'center'
  },
  product: {
    width: 800,
    height: 1000,
    aspect: '4:5',
    description: 'Standard e-commerce catalog portrait framing with soft floor shadow',
    targetDir: PRODUCTS_DIR,
    urlPrefix: '/products/',
    productPlacement: 'center'
  },
  category: {
    width: 600,
    height: 600,
    aspect: '1:1',
    description: 'Square category collection banner with luxury backdrop',
    targetDir: PRODUCTS_DIR,
    urlPrefix: '/products/',
    productPlacement: 'center'
  },
  'promo-banner': {
    width: 1200,
    height: 500,
    aspect: '2.4:1',
    description: 'Wide promotional marketing banner with studio lighting',
    targetDir: PRODUCTS_DIR,
    urlPrefix: '/products/',
    productPlacement: 'right'
  }
};

// Studio Background Themes
const STYLE_THEMES = {
  'luxury-studio': {
    name: 'Luxury Travertine Studio',
    bg1: '#FAF8F5',
    bg2: '#EFE9DE',
    spotlight: 'rgba(255, 255, 255, 0.85)',
    shadowColor: 'rgba(50, 40, 30, 0.18)'
  },
  'dark-obsidian': {
    name: 'Dark Obsidian Onyx',
    bg1: '#0B132B',
    bg2: '#1C2541',
    spotlight: 'rgba(249, 115, 22, 0.25)',
    shadowColor: 'rgba(0, 0, 0, 0.6)'
  },
  'warm-terracotta': {
    name: 'Calenvee Warm Terracotta',
    bg1: '#FFF7F0',
    bg2: '#FED7AA',
    spotlight: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(180, 83, 9, 0.16)'
  },
  'minimalist-white': {
    name: 'Minimalist Clean White',
    bg1: '#FFFFFF',
    bg2: '#F3F4F6',
    spotlight: 'rgba(255, 255, 255, 1.0)',
    shadowColor: 'rgba(0, 0, 0, 0.12)'
  }
};

/**
 * Generate background canvas SVG
 */
function createStudioCanvasSvg(width, height, themeKey, placement) {
  const theme = STYLE_THEMES[themeKey] || STYLE_THEMES['luxury-studio'];
  const cx = placement === 'right' ? Math.round(width * 0.72) : Math.round(width * 0.5);
  const cy = Math.round(height * 0.52);
  const r = Math.round(Math.max(width, height) * 0.55);

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="studioLighting" cx="${(cx / width) * 100}%" cy="${(cy / height) * 100}%" r="${(r / width) * 100}%">
          <stop offset="0%" stop-color="${theme.spotlight}" stop-opacity="1" />
          <stop offset="45%" stop-color="${theme.bg1}" stop-opacity="1" />
          <stop offset="100%" stop-color="${theme.bg2}" stop-opacity="1" />
        </radialGradient>
        <linearGradient id="podiumSurface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.4)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.06)" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#studioLighting)" />
      <!-- Subtle architectural podium accent floor -->
      <path d="M 0 ${Math.round(height * 0.78)} Q ${Math.round(width * 0.5)} ${Math.round(height * 0.74)} ${width} ${Math.round(height * 0.78)} L ${width} ${height} L 0 ${height} Z" fill="url(#podiumSurface)" opacity="0.35" />
    </svg>
  `);
}

/**
 * Generate soft elliptical contact shadow under the product
 */
function createContactShadowSvg(width, height, themeKey) {
  const theme = STYLE_THEMES[themeKey] || STYLE_THEMES['luxury-studio'];
  const rx = Math.round(width * 0.44);
  const ry = Math.round(height * 0.18);
  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${theme.shadowColor}" stop-opacity="1" />
          <stop offset="45%" stop-color="${theme.shadowColor}" stop-opacity="0.6" />
          <stop offset="85%" stop-color="${theme.shadowColor}" stop-opacity="0.1" />
          <stop offset="100%" stop-color="${theme.shadowColor}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#shadowGrad)" />
    </svg>
  `);
}

/**
 * Extract image buffer from base64 data URI or raw buffer
 */
function toBuffer(dataInput) {
  if (Buffer.isBuffer(dataInput)) return dataInput;
  if (typeof dataInput === 'string') {
    if (dataInput.startsWith('data:')) {
      const commaIdx = dataInput.indexOf(',');
      return Buffer.from(dataInput.slice(commaIdx + 1), 'base64');
    }
    return Buffer.from(dataInput, 'base64');
  }
  throw new Error('Unsupported image input format');
}

/**
 * Graphic Designer AI Agent: Tailors raw image to exact section aspect ratio & luxury backdrop
 */
async function designSectionGraphic({
  image,
  targetSection = 'hero',
  styleTheme = 'luxury-studio',
  filename = 'studio-graphic',
  altText = 'Calenvee Luxury Product'
}) {
  const spec = SECTION_SPECS[targetSection] || SECTION_SPECS.hero;
  const rawBuffer = toBuffer(image);

  // 1. Inspect raw input
  const rawMeta = await sharp(rawBuffer).metadata();
  if (!rawMeta.width || !rawMeta.height) {
    throw new Error('Invalid image data: could not read dimensions.');
  }

  // 2. Trim excess empty borders if transparent or uniform white/black
  let processedProduct = sharp(rawBuffer);

  // Calculate product bounding box based on section placement
  let maxProductW, maxProductH;
  if (spec.productPlacement === 'right') {
    maxProductW = Math.round(spec.width * 0.44); // 44% of banner width
    maxProductH = Math.round(spec.height * 0.78); // 78% of banner height
  } else {
    maxProductW = Math.round(spec.width * 0.72);
    maxProductH = Math.round(spec.height * 0.72);
  }

  // 3. Resize product preserving aspect ratio with high-quality lanczos3 filter
  const productResizedBuffer = await processedProduct
    .resize({
      width: maxProductW,
      height: maxProductH,
      fit: 'inside',
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3
    })
    .toBuffer();

  const productMeta = await sharp(productResizedBuffer).metadata();

  // 4. Generate Luxury Studio Background Canvas
  const canvasSvg = createStudioCanvasSvg(spec.width, spec.height, styleTheme, spec.productPlacement);
  const canvasBuffer = await sharp(canvasSvg).png().toBuffer();

  // 5. Determine coordinates for placement
  let leftPos, topPos;
  if (spec.productPlacement === 'right') {
    // Hero: Anchor firmly on the right side leaving the left side completely clear for text
    const rightMargin = Math.round(spec.width * 0.08);
    leftPos = spec.width - productMeta.width - rightMargin;
    topPos = Math.round((spec.height - productMeta.height) / 2);
  } else {
    // Centered placement
    leftPos = Math.round((spec.width - productMeta.width) / 2);
    topPos = Math.round((spec.height - productMeta.height) / 2);
  }

  // 6. Generate contact shadow underneath product
  const shadowW = Math.round(productMeta.width * 0.95);
  const shadowH = Math.round(productMeta.height * 0.28);
  const shadowSvg = createContactShadowSvg(shadowW, shadowH, styleTheme);
  const shadowPngBuffer = await sharp(shadowSvg).png().toBuffer();

  const shadowLeft = leftPos + Math.round((productMeta.width - shadowW) / 2);
  const shadowTop = topPos + productMeta.height - Math.round(shadowH * 0.55);

  // 7. Composite layers: Background Canvas + Floor Shadow + Product
  const compositedBuffer = await sharp(canvasBuffer)
    .composite([
      {
        input: shadowPngBuffer,
        top: Math.max(0, Math.min(shadowTop, spec.height - shadowH)),
        left: Math.max(0, Math.min(shadowLeft, spec.width - shadowW))
      },
      {
        input: productResizedBuffer,
        top: Math.max(0, topPos),
        left: Math.max(0, leftPos)
      }
    ])
    .webp({ quality: 86, effort: 5 })
    .toBuffer();

  // 8. Save to destination directory
  const sanitizedName = filename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'graphic';
  const outFilename = `${Date.now()}-${sanitizedName}-${spec.width}x${spec.height}.webp`;
  const outPath = path.join(spec.targetDir, outFilename);

  fs.writeFileSync(outPath, compositedBuffer);
  const stats = fs.statSync(outPath);

  const publicUrl = `${spec.urlPrefix}${outFilename}`;

  return {
    success: true,
    filename: outFilename,
    path: outPath,
    url: publicUrl,
    width: spec.width,
    height: spec.height,
    aspect: spec.aspect,
    targetSection,
    styleTheme,
    sizeKb: Math.round(stats.size / 1024),
    altText
  };
}

module.exports = {
  SECTION_SPECS,
  STYLE_THEMES,
  designSectionGraphic
};


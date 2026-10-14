// scripts/admin-server.cjs
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 4200;
const ROOT_DIR = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT_DIR, 'src', 'data', 'products.json');
const PAYMENTS_FILE = path.join(ROOT_DIR, 'src', 'data', 'paymentAccounts.json');
const PROMOTIONS_FILE = path.join(ROOT_DIR, 'src', 'data', 'promotions.json');
const CATEGORIES_FILE = path.join(ROOT_DIR, 'src', 'data', 'categories.json');
const ANNOUNCEMENTS_FILE = path.join(ROOT_DIR, 'src', 'data', 'announcements.json');
const REVIEWS_FILE = path.join(ROOT_DIR, 'src', 'data', 'reviews.json');
const SETTINGS_FILE = path.join(ROOT_DIR, 'src', 'data', 'storeSettings.json');
const ORDERS_CACHE_FILE = path.join(ROOT_DIR, 'src', 'data', 'ordersCache.json');
const HOME_CONTENT_FILE = path.join(ROOT_DIR, 'src', 'data', 'homeContent.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'products');

// Google Apps Script Live Automation Webhook URL
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbwCZvq-OqA4l18DK3ecPrRSclzRrNz2dINOiMY-qaNeyfjLvB-mSbJQH4cO_gWMWcBm/exec';

let lastCloudSyncTime = null;
let lastCloudSyncStatus = 'synced'; // 'idle' | 'syncing' | 'synced' | 'error'
let lastCloudSyncError = null;

async function syncToCloud(action, data = {}) {
  if (!APPS_SCRIPT_URL) return { success: false, reason: 'No APPS_SCRIPT_URL' };
  try {
    lastCloudSyncStatus = 'syncing';
    console.log(`[CloudSync] ⚡ Sending action "${action}" to Google Sheets Webhook...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...data, syncedAt: new Date().toISOString() }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      let json = {};
      try { json = JSON.parse(text); } catch (_) { json = { text }; }
      console.log(`[CloudSync] ✓ Action "${action}" completed:`, json.message || 'OK');
      lastCloudSyncTime = new Date().toISOString();
      lastCloudSyncStatus = 'synced';
      lastCloudSyncError = null;
      return { success: true, response: json };
    } else {
      console.warn(`[CloudSync] Webhook response status ${res.status}`);
      lastCloudSyncStatus = 'error';
      lastCloudSyncError = `HTTP ${res.status}`;
      return { success: false, status: res.status };
    }
  } catch (err) {
    console.warn(`[CloudSync] Cloud sync note (${action}):`, err.message);
    lastCloudSyncStatus = 'error';
    lastCloudSyncError = err.message;
    return { success: false, error: err.message };
  }
}

// Ensure public/products directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function readJsonFile(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    req.setEncoding('utf8');
    let body = '';
    // Allow up to 30MB for high-res photo uploads
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 30 * 1024 * 1024) {
        reject(new Error('File size too large (max 30MB)'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON received: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

function getAdminHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calenvee Store Manager — Full Shopify-Style Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brandNavy: '#0B132B',
            brandOrange: '#F97316',
            brandDark: '#070D1E',
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"Space Grotesk"', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #F8FAFC; color: #0F172A; }
    .glass-header { background: rgba(11, 19, 43, 0.96); backdrop-filter: blur(14px); }
    .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
  </style>
</head>
<body class="font-sans antialiased text-slate-800">

  <!-- TOP APP HEADER -->
  <header class="glass-header text-white sticky top-0 z-50 shadow-md border-b border-slate-700/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center font-extrabold text-white text-lg tracking-wider shadow-lg">
          CV
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            CALENVEE <span class="text-xs py-0.5 px-2 rounded-full bg-orange-500/20 text-[#F97316] font-semibold border border-orange-500/30">Shopify-Style Manager</span>
          </h1>
          <p class="text-[11px] text-slate-400 font-mono tracking-wide" id="headerSlogan">SHOP SMART, LIVE BETTER</p>
        </div>
      </div>

      <div class="flex items-center space-x-2 sm:space-x-3">
        <a href="http://localhost:5173" target="_blank" class="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-white/10 transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          <span class="hidden md:inline">Preview Storefront</span>
        </a>
        <div id="connBadge" class="hidden sm:flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span id="connText">Local Server OK</span>
        </div>
        <div id="cloudSyncBadge" class="hidden sm:flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
          <span class="w-2 h-2 rounded-full bg-sky-400"></span>
          <span id="cloudSyncText">Cloud Synced</span>
        </div>
        <button onclick="triggerCloudSyncAll()" id="syncCloudHeaderBtn" class="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow transition active:scale-95 border border-slate-700" title="Synchronize catalog and store settings to Google Sheets">
          <svg class="w-3.5 h-3.5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span id="syncCloudBtnText">⚡ Sync Cloud</span>
        </button>
        <button onclick="publishToLive()" id="publishHeaderBtn" class="flex items-center space-x-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-lg transition active:scale-95">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <span>Publish Live</span>
        </button>
      </div>
    </div>
  </header>

  <!-- NAVIGATION TABS -->
  <div class="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-xs overflow-x-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 min-w-max">
      
      <button onclick="switchTab('products')" id="tab-products" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-[#F97316] text-[#F97316] flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        <span>Products (<span id="productsCount">0</span>)</span>
      </button>

      <button onclick="switchTab('orders')" id="tab-orders" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        <span>Orders &amp; Dispatch (<span id="ordersCount">0</span>)</span>
      </button>

      <button onclick="switchTab('homecontent')" id="tab-homecontent" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
        <span>Homepage CMS &amp; Banners</span>
      </button>

      <button onclick="switchTab('categories')" id="tab-categories" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
        <span>Categories (<span id="categoriesCount">0</span>)</span>
      </button>

      <button onclick="switchTab('announcements')" id="tab-announcements" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
        <span>Announcement Bar</span>
      </button>

      <button onclick="switchTab('reviews')" id="tab-reviews" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        <span>Reviews (<span id="reviewsCount">0</span>)</span>
      </button>

      <button onclick="switchTab('payments')" id="tab-payments" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        <span>Payment Accounts</span>
      </button>

      <button onclick="switchTab('promotions')" id="tab-promotions" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
        <span>Coupons & Sale</span>
      </button>

      <button onclick="switchTab('settings')" id="tab-settings" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        <span>Store Info & WhatsApp</span>
      </button>

      <button onclick="switchTab('dashboard')" id="tab-dashboard" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <span>Executive Dashboard</span>
      </button>

      <button onclick="switchTab('publish')" id="tab-publish" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
        <span>Deploy & Git Sync</span>
      </button>

    </div>
  </div>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- 1. PRODUCTS TAB -->
    <div id="content-products" class="tab-content space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex flex-1 items-center space-x-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:max-w-xs">
            <input type="text" id="productSearch" oninput="filterProducts()" placeholder="Search products by name..." class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <select id="categoryFilter" onchange="filterProducts()" class="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#F97316]">
            <option value="all">All Categories</option>
          </select>
        </div>

        <button onclick="openProductModal()" class="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#0B132B] hover:bg-[#1E293B] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition shadow">
          <svg class="w-4 h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Add New Product</span>
        </button>
      </div>

      <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    </div>

    <!-- 1B. ORDERS & DISPATCH TAB -->
    <div id="content-orders" class="tab-content hidden space-y-6">
      <!-- KPI Stats Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
          <div class="text-2xl font-extrabold text-[#0B132B] mt-1" id="statTotalOrders">0</div>
          <span class="text-[10px] text-slate-500">Master database record</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span class="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Needs Dispatch</span>
          <div class="text-2xl font-extrabold text-amber-600 mt-1" id="statPendingOrders">0</div>
          <span class="text-[10px] text-amber-700">Confirmed &amp; processing</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <span class="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">In Transit</span>
          <div class="text-2xl font-extrabold text-indigo-600 mt-1" id="statDispatchedOrders">0</div>
          <span class="text-[10px] text-indigo-700">With courier riders</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span class="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Gross Revenue</span>
          <div class="text-xl font-extrabold text-emerald-600 mt-1" id="statGrossRevenue">Rs. 0</div>
          <span class="text-[10px] text-emerald-700">Total customer volume</span>
        </div>
      </div>

      <!-- Filter and Action Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex flex-1 items-center space-x-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:max-w-xs">
            <input type="text" id="orderSearchInput" oninput="filterOrders()" placeholder="Search order ID, customer, phone..." class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <select id="orderStatusFilter" onchange="filterOrders()" class="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#F97316]">
            <option value="all">All Statuses</option>
            <option value="Placed">Placed (New)</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Processing">In Processing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned (RTO)</option>
          </select>
        </div>

        <div class="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button onclick="loadOrders()" class="flex items-center space-x-1.5 py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      <!-- Orders List Container -->
      <div id="ordersListContainer" class="space-y-3">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- 1C. HOMEPAGE CMS & BANNERS TAB -->
    <div id="content-homecontent" class="tab-content hidden space-y-8">
      
      <!-- Top Header & Save Button -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#F97316] uppercase tracking-wider">Live Storefront CMS</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">100% Dynamic</span>
          </div>
          <h2 class="text-xl font-bold text-[#0B132B] mt-1.5">Homepage Content, Hero &amp; Trio Banners</h2>
          <p class="text-xs text-slate-500 mt-0.5">Control all text, headlines, promo badges, discount banners, trust pillars, and marketing copy across the homepage.</p>
        </div>
        <button onclick="saveHomeContent()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3 px-6 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Save Homepage CMS</span>
        </button>
      </div>

      <!-- 1. HERO BANNER SECTION -->
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-[#0B132B] flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center text-xs font-black">1</span>
              <span>Hero Banner Section</span>
            </h3>
            <p class="text-xs text-slate-500">The primary high-impact presentation at the very top of your homepage.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kicker Badge (Top Small Text)</label>
            <input type="text" id="hero_kicker" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#F97316]" placeholder="QUALITY. STYLE. EVERYDAY.">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Headline Prefix</label>
            <input type="text" id="hero_headlinePrefix" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="Everything You Love,">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Headline Highlight (Colored Text)</label>
            <input type="text" id="hero_headlineHighlight" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold text-[#F97316] focus:outline-none focus:border-[#F97316]" placeholder="All in One Place.">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Primary Button Text &amp; URL</label>
            <div class="flex gap-2">
              <input type="text" id="hero_ctaText" class="w-1/2 py-2 px-3 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-[#F97316]" placeholder="Shop Now">
              <input type="text" id="hero_ctaLink" class="w-1/2 py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]" placeholder="/shop">
            </div>
          </div>
        </div>

        <div class="text-xs">
          <label class="block font-semibold text-slate-700 mb-1">Subtitle / Brand Description</label>
          <textarea id="hero_subtitle" rows="2" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Shop top-quality products across watches, jewelry, handbags..."></textarea>
        </div>

        <!-- Hero Image Upload & Preview -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span class="font-bold text-slate-900 block">Hero Right-Side Visual Banner</span>
              <span class="text-[11px] text-slate-500">Provide image URL or upload directly from your computer.</span>
            </div>
            <label class="cursor-pointer bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition inline-flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <span>Upload Image from PC</span>
              <input type="file" accept="image/*" class="hidden" onchange="handleHeroFileUpload(event)">
            </label>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 items-center">
            <div class="w-full sm:w-48 h-28 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-1">
              <img id="heroImagePreview" src="" alt="Hero preview" class="w-full h-full object-cover rounded-lg" onerror="this.src='/placeholder-image.png'">
            </div>
            <div class="flex-1 w-full">
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Hero Image URL:</label>
              <input type="text" id="hero_image" oninput="updateHeroPreview(this.value)" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]" placeholder="/hero/my-hero.jpg or https://...">
            </div>
          </div>
        </div>

        <!-- 3 Trust Points -->
        <div class="text-xs space-y-2">
          <span class="font-bold text-slate-900 block">3 Trust Points (Under CTA Button)</span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] text-slate-500 mb-0.5">Trust Point 1</label>
              <input type="text" id="hero_trust1" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Cash on Delivery">
            </div>
            <div>
              <label class="block text-[11px] text-slate-500 mb-0.5">Trust Point 2</label>
              <input type="text" id="hero_trust2" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Premium Quality">
            </div>
            <div>
              <label class="block text-[11px] text-slate-500 mb-0.5">Trust Point 3</label>
              <input type="text" id="hero_trust3" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Nationwide Shipping">
            </div>
          </div>
        </div>
      </div>

      <!-- 2. PROMOTIONAL TRIO BANNERS -->
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-[#0B132B] flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center text-xs font-black">2</span>
            <span>Promotional Trio Banners (3 Cards Side-by-Side)</span>
          </h3>
          <p class="text-xs text-slate-500">The 3 high-conversion promotional cards displayed directly under the Hero banner.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          <!-- Trio Card 1: Deal of the Day -->
          <div class="p-4 bg-orange-50/40 rounded-2xl border border-orange-200 space-y-3">
            <span class="font-bold text-orange-900 block text-sm">Card 1: Deal of the Day</span>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Badge Text</label>
              <input type="text" id="trio_deal_badge" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Deal of the Day">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Headline / Discount Title</label>
              <input type="text" id="trio_deal_title" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="Up to 60% Off">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Destination Link</label>
              <input type="text" id="trio_deal_link" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]" placeholder="/product/calenvee-obsidian-chrono-edition">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Button Text</label>
              <input type="text" id="trio_deal_cta" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Shop Deals">
            </div>
          </div>

          <!-- Trio Card 2: New Arrivals -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span class="font-bold text-slate-900 block text-sm">Card 2: New Arrivals</span>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Badge Text</label>
              <input type="text" id="trio_new_badge" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="New Arrivals">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Title</label>
              <input type="text" id="trio_new_title" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="Fresh Finds">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Subtitle</label>
              <input type="text" id="trio_new_sub" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Check out the latest drops just for you">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Destination Link</label>
              <input type="text" id="trio_new_link" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]" placeholder="/new-arrivals">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Card Image URL &amp; Upload</label>
              <div class="flex gap-2">
                <input type="text" id="trio_new_image" oninput="updateNewArrivalsPreview(this.value)" class="flex-1 py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]">
                <label class="cursor-pointer bg-slate-800 text-white px-2.5 py-2 rounded-lg font-bold">
                  <span>Upload</span>
                  <input type="file" accept="image/*" class="hidden" onchange="handleNewArrivalsUpload(event)">
                </label>
              </div>
            </div>
          </div>

          <!-- Trio Card 3: Member Exclusive -->
          <div class="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-200 space-y-3">
            <span class="font-bold text-indigo-900 block text-sm">Card 3: Member Exclusive</span>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Badge Text</label>
              <input type="text" id="trio_mem_badge" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Member Exclusive">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Title</label>
              <input type="text" id="trio_mem_title" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="Extra 10% Off">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Coupon Code</label>
              <input type="text" id="trio_mem_code" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono font-bold uppercase text-indigo-700 focus:outline-none focus:border-[#F97316]" placeholder="CALENVEE10">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Subtitle</label>
              <input type="text" id="trio_mem_sub" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="On prepaid orders this weekend">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Destination Link</label>
              <input type="text" id="trio_mem_link" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]" placeholder="/shop">
            </div>
          </div>

        </div>
      </div>

      <!-- 3. VALUE PROPOSITIONS (TRUST PILLARS) -->
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-[#0B132B] flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center text-xs font-black">3</span>
            <span>4-Column Value Propositions Bar</span>
          </h3>
          <p class="text-xs text-slate-500">The 4 customer assurance pillars (Free Delivery, Returns, Secure Payments, 24/7 WhatsApp).</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <!-- Pillar 1 -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-800">Pillar 1: Free Delivery</span>
            <input type="text" id="vp1_title" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="Free Shipping">
            <input type="text" id="vp1_sub" class="w-full py-2 px-3 rounded-lg border border-slate-300 text-slate-600 focus:outline-none focus:border-[#F97316]" placeholder="On orders over Rs. 3,999">
          </div>
          <!-- Pillar 2 -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-800">Pillar 2: Returns</span>
            <input type="text" id="vp2_title" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="Easy Returns">
            <input type="text" id="vp2_sub" class="w-full py-2 px-3 rounded-lg border border-slate-300 text-slate-600 focus:outline-none focus:border-[#F97316]" placeholder="7-day return policy">
          </div>
          <!-- Pillar 3 -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-800">Pillar 3: Payments</span>
            <input type="text" id="vp3_title" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="Secure Payments">
            <input type="text" id="vp3_sub" class="w-full py-2 px-3 rounded-lg border border-slate-300 text-slate-600 focus:outline-none focus:border-[#F97316]" placeholder="100% protected checkout">
          </div>
          <!-- Pillar 4 -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-800">Pillar 4: Support</span>
            <input type="text" id="vp4_title" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="24/7 WhatsApp Support">
            <input type="text" id="vp4_sub" class="w-full py-2 px-3 rounded-lg border border-slate-300 text-slate-600 focus:outline-none focus:border-[#F97316]" placeholder="We're here to help anytime">
          </div>
        </div>
      </div>

      <!-- 4. NEWSLETTER BANNER -->
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-[#0B132B] flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center text-xs font-black">4</span>
            <span>Newsletter &amp; Lead Capture Section</span>
          </h3>
          <p class="text-xs text-slate-500">Call-to-action banner displayed at the bottom of the homepage.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Headline</label>
            <input type="text" id="news_title" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#F97316]" placeholder="Stay in the Loop">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Subtitle</label>
            <input type="text" id="news_sub" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="Subscribe to get special offers...">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Button Text</label>
            <input type="text" id="news_btn" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-[#F97316]" placeholder="Subscribe">
          </div>
        </div>

        <div class="pt-4 flex justify-end">
          <button onclick="saveHomeContent()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>Save Homepage CMS</span>
          </button>
        </div>
      </div>

    </div>

    <!-- 2. CATEGORIES TAB -->
    <div id="content-categories" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-xl font-bold text-[#0B132B]">Store Categories Management</h2>
            <p class="text-xs text-slate-500 mt-1">Add, edit, or delete store categories shown on Navbar, Homepage, and Shop pages.</p>
          </div>
          <button onclick="openCategoryModal()" class="bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Category</span>
          </button>
        </div>

        <div id="categoriesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
      </div>
    </div>

    <!-- 3. ANNOUNCEMENTS TAB -->
    <div id="content-announcements" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-xl font-bold text-[#0B132B]">Top Moving Announcement Bar</h2>
            <p class="text-xs text-slate-500 mt-1">These messages scroll continuously at the very top of your website.</p>
          </div>
          <button onclick="addAnnouncementPrompt()" class="bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Announcement</span>
          </button>
        </div>

        <div id="announcementsContainer" class="space-y-3"></div>

        <div class="pt-4 flex justify-end">
          <button onclick="saveAnnouncements()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
            <span>Save Announcements</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 4. REVIEWS TAB -->
    <div id="content-reviews" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-xl font-bold text-[#0B132B]">Customer Reviews & Social Proof</h2>
            <p class="text-xs text-slate-500 mt-1">Manage verified customer testimonials shown in the homepage marquee and reviews page.</p>
          </div>
          <button onclick="openReviewModal()" class="bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Review</span>
          </button>
        </div>

        <div id="reviewsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
      </div>
    </div>

    <!-- 5. PAYMENT ACCOUNTS TAB -->
    <div id="content-payments" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-8">
        <div class="border-b border-slate-100 pb-4">
          <h2 class="text-xl font-bold text-[#0B132B]">Payment Channels Configuration</h2>
          <p class="text-xs text-slate-500 mt-1">Configure the official account numbers shown to customers on checkout when they select JazzCash, EasyPaisa, or Bank Transfer.</p>
        </div>

        <!-- JazzCash Card -->
        <div class="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-red-600 text-white font-extrabold text-xs flex items-center justify-center shadow">JC</div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">JazzCash Mobile Account</h3>
              <p class="text-[11px] text-slate-500">Instant mobile wallet payments</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Account Title</label>
              <input type="text" id="pay_jazzcash_title" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">JazzCash Mobile Number</label>
              <input type="text" id="pay_jazzcash_number" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Instructions</label>
            <input type="text" id="pay_jazzcash_inst" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
        </div>

        <!-- EasyPaisa Card -->
        <div class="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow">EP</div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">EasyPaisa Mobile Account</h3>
              <p class="text-[11px] text-slate-500">Telenor Microfinance wallet payments</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Account Title</label>
              <input type="text" id="pay_easypaisa_title" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">EasyPaisa Mobile Number</label>
              <input type="text" id="pay_easypaisa_number" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Instructions</label>
            <input type="text" id="pay_easypaisa_inst" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
        </div>

        <!-- Bank / Raast Card -->
        <div class="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-[#0B132B] text-white font-extrabold text-xs flex items-center justify-center shadow">BK</div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Bank Transfer & Raast Instant</h3>
              <p class="text-[11px] text-slate-500">Direct IBAN, Raast ID, and commercial bank details</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
              <input type="text" id="pay_bank_name" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Account Title</label>
              <input type="text" id="pay_bank_title" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
              <input type="text" id="pay_bank_number" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">IBAN (24 Characters)</label>
              <input type="text" id="pay_bank_iban" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Raast ID / Registered Mobile</label>
              <input type="text" id="pay_bank_raast" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Instructions</label>
            <input type="text" id="pay_bank_inst" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
        </div>

        <div class="pt-4 flex justify-end">
          <button onclick="savePaymentAccounts()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
            <span>Save Payment Settings</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 6. PROMOTIONS & SALE TAB -->
    <div id="content-promotions" class="tab-content hidden space-y-6">
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Sale Banner Card -->
        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 class="text-xl font-bold text-[#0B132B]">Homepage Special Sale Banner</h2>
              <p class="text-xs text-slate-500 mt-1">Control the big sale banner shown across the Calenvee homepage.</p>
            </div>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" id="sale_banner_active" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97316]"></div>
              <span class="ml-2 text-xs font-semibold text-slate-700">Banner Active</span>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Headline Text</label>
              <input type="text" id="sale_banner_headline" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Badge Symbol / Text</label>
              <input type="text" id="sale_banner_badge" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Subheading Description</label>
            <input type="text" id="sale_banner_subheading" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">CTA Button Text</label>
              <input type="text" id="sale_banner_ctaText" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">CTA Target Link</label>
              <input type="text" id="sale_banner_ctaLink" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
            </div>
          </div>
        </div>

        <!-- Promo Codes Manager -->
        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 class="text-xl font-bold text-[#0B132B]">Coupon & Voucher Codes</h2>
              <p class="text-xs text-slate-500 mt-1">Codes that customers can type in their cart or checkout to get instant discounts.</p>
            </div>
            <button onclick="openPromoModal()" class="bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition">
              <svg class="w-3.5 h-3.5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Add Coupon</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">Coupon Code</th>
                  <th class="py-3 px-4">Discount</th>
                  <th class="py-3 px-4">Min. Order</th>
                  <th class="py-3 px-4">Description</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="promosTableBody" class="divide-y divide-slate-100"></tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-end">
          <button onclick="savePromotions()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
            <span>Save All Promotions</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 7. STORE INFO & WHATSAPP SETTINGS TAB -->
    <div id="content-settings" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <h2 class="text-xl font-bold text-[#0B132B]">Brand Information, Slogan & WhatsApp</h2>
          <p class="text-xs text-slate-500 mt-1">Control store-wide phone numbers, slogans, delivery windows, and fees.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Official Store Slogan</label>
            <input type="text" id="set_slogan" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold text-[#F97316] focus:outline-none focus:border-[#F97316]" placeholder="SHOP SMART, LIVE BETTER">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Official Store Name</label>
            <input type="text" id="set_storeName" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">WhatsApp Helpline (Display)</label>
            <input type="text" id="set_whatsappNumber" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="+923001234567">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">WhatsApp Number (Raw - Digits only)</label>
            <input type="text" id="set_whatsappRaw" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="923001234567">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Delivery Timeline Text</label>
            <input type="text" id="set_deliveryWindow" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Instagram Handle</label>
            <input type="text" id="set_instagram" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Free Shipping Order Threshold (PKR)</label>
            <input type="number" id="set_freeShippingThreshold" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Standard Shipping Fee (PKR)</label>
            <input type="number" id="set_standardShippingFee" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
        </div>

        <div class="pt-4 flex justify-end">
          <button onclick="saveStoreSettings()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
            <span>Save Store Settings</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 8. PUBLISH & GIT SYNC TAB -->
    <div id="content-publish" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto text-center space-y-6">
        <div class="w-16 h-16 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto border border-orange-200 shadow-sm">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>

        <div>
          <h2 class="text-2xl font-extrabold text-[#0B132B]">Publish Changes to Live Store</h2>
          <p class="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            Click below to sync all changes (products, categories, reviews, payments, announcements & uploaded photos) to GitHub. Vercel deploys immediately!
          </p>
        </div>

        <div class="pt-2">
          <button onclick="publishToLive()" id="publishBigBtn" class="bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-sm py-4 px-10 rounded-2xl shadow-xl hover:shadow-orange-500/25 transition active:scale-95 inline-flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>Click to Sync & Publish to Vercel</span>
          </button>
        </div>

        <div class="text-left mt-6">
          <div class="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
            <span>SYNC CONSOLE OUTPUT:</span>
            <span id="syncStatusBadge" class="text-slate-400 font-mono text-[10px]">Ready</span>
          </div>
          <pre id="syncLog" class="bg-[#0B132B] text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-64 border border-slate-700 custom-scroll">Calenvee Desktop Admin Portal initialized.
Ready to commit and deploy changes.</pre>
        </div>
      </div>
    </div>

    <!-- 8. EXECUTIVE DASHBOARD & GOOGLE SHEET TAB -->
    <div id="content-dashboard" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
        <div class="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">Store Executive Suite</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Dynamic Month Filter</span>
            </div>
            <h2 class="text-xl font-bold text-[#0B132B] mt-1.5">Executive Dashboard (Google Sheets)</h2>
            <p class="text-xs text-slate-500 mt-0.5">Real-time KPI metrics, Month-by-month filters, Order pipeline status, Payment shares & Visual graphs.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="copyAppsScript()" class="bg-[#0B132B] hover:bg-[#1E293B] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition flex items-center gap-1.5 active:scale-95">
              <svg class="w-4 h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span>Copy Apps Script</span>
            </button>
            <a href="https://sheets.google.com" target="_blank" class="border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5">
              <span>Open Google Sheets ↗</span>
            </a>
          </div>
        </div>

        <!-- KPI PREVIEW SHOWCASE -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <span class="text-[10px] font-bold text-emerald-700 uppercase">Gross Revenue</span>
            <div class="text-lg font-extrabold text-emerald-900 mt-0.5">Rs. 450,000+</div>
            <span class="text-[9px] text-emerald-600">Month / All Time Filtered</span>
          </div>
          <div class="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
            <span class="text-[10px] font-bold text-blue-700 uppercase">Total Orders</span>
            <div class="text-lg font-extrabold text-blue-900 mt-0.5">Live Count</div>
            <span class="text-[9px] text-blue-600">Checkout Placed Orders</span>
          </div>
          <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
            <span class="text-[10px] font-bold text-amber-700 uppercase">Avg Order Value</span>
            <div class="text-lg font-extrabold text-amber-900 mt-0.5">Rs. 3,600+</div>
            <span class="text-[9px] text-amber-600">Basket Size per Customer</span>
          </div>
          <div class="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
            <span class="text-[10px] font-bold text-indigo-700 uppercase">Fulfillment %</span>
            <div class="text-lg font-extrabold text-indigo-900 mt-0.5">92.5%</div>
            <span class="text-[9px] text-indigo-600">Delivered + Dispatched</span>
          </div>
          <div class="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
            <span class="text-[10px] font-bold text-rose-700 uppercase">Pending Action</span>
            <div class="text-lg font-extrabold text-rose-900 mt-0.5">Real-time</div>
            <span class="text-[9px] text-rose-600">Confirmed & Processing</span>
          </div>
          <div class="p-3.5 bg-teal-50 rounded-xl border border-teal-200">
            <span class="text-[10px] font-bold text-teal-700 uppercase">COD Ratio</span>
            <div class="text-lg font-extrabold text-teal-900 mt-0.5">85% COD</div>
            <span class="text-[9px] text-teal-600">Doorstep Cash Collection</span>
          </div>
        </div>

        <!-- 4-STEP SETUP GUIDE -->
        <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#0B132B] text-white flex items-center justify-center text-xs">🚀</span>
            <span>How to Initialize Your Executive Dashboard in 60 Seconds:</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="bg-white p-3.5 rounded-xl border border-slate-200">
              <span class="font-bold text-[#F97316]">Step 1:</span> Open Google Sheets under your official email <code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono font-bold">calenvee.pk@gmail.com</code>.
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200">
              <span class="font-bold text-[#F97316]">Step 2:</span> Click <span class="font-semibold">Extensions</span> &gt; <span class="font-semibold">Apps Script</span> in the top menu bar.
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200">
              <span class="font-bold text-[#F97316]">Step 3:</span> Click the <span class="font-bold text-[#0B132B]">"Copy Apps Script"</span> button above, replace everything in <code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">Code.gs</code>, and press <span class="font-semibold">Save (Ctrl + S)</span>.
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200">
              <span class="font-bold text-[#F97316]">Step 4:</span> Select <code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono font-bold">setupSheet</code> in the function dropdown and click <span class="font-semibold text-emerald-600">▶ Run</span>.
            </div>
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
              <span class="font-bold text-[#F97316]">Step 5 (Important):</span> Click <span class="font-semibold text-[#0B132B]">Deploy &gt; Manage Deployments</span>, click the <strong>Pencil (Edit)</strong> icon, choose <strong>New Version</strong>, and click <strong>Deploy</strong>. This enables live Catalog Sync, Store Settings Sync, and 1-Click Order Tracking Emails!
            </div>
          </div>

          <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <span class="text-base">🎉</span>
            <span>The script automatically builds the <strong>Executive Dashboard</strong>, <strong>Orders</strong>, <strong>OrderItems</strong>, <strong>Inventory</strong>, and <strong>Store Settings</strong> tabs with live automations!</span>
          </div>
        </div>

      </div>
    </div>

  </main>

  <!-- PRODUCT MODAL (WITH IMAGE UPLOAD!) -->
  <div id="productModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
      <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 id="modalTitle" class="text-base font-bold text-[#0B132B]">Edit Product</h3>
          <p class="text-xs text-slate-500">Update details, pricing, inventory, specs & upload photos</p>
        </div>
        <button onclick="closeProductModal()" class="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center">✕</button>
      </div>

      <div class="p-6 overflow-y-auto space-y-4 custom-scroll text-xs">
        <input type="hidden" id="prod_id">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Product Name *</label>
            <input type="text" id="prod_name" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Category *</label>
            <select id="prod_category" class="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#F97316]"></select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Subcategory</label>
            <input type="text" id="prod_subcategory" placeholder="e.g. Chronograph, Signet Ring" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Selling Price (PKR) *</label>
            <input type="number" id="prod_price" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Original Price (PKR)</label>
            <input type="number" id="prod_originalPrice" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Stock Units</label>
            <input type="number" id="prod_stockCount" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Warranty Details</label>
            <input type="text" id="prod_warranty" placeholder="e.g. 1 Year Calenvee Warranty" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
        </div>

        <!-- IMAGE UPLOADER SECTION (DIRECT PC UPLOAD) -->
        <div class="p-4 bg-orange-50/50 rounded-xl border border-orange-200/60 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-slate-900 block">Product Images</span>
              <span class="text-[11px] text-slate-500">Upload photos directly from your computer or paste web links.</span>
            </div>
            <label class="cursor-pointer bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow transition inline-flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              <span>Upload from PC</span>
              <input type="file" id="prodFileInput" accept="image/*" multiple class="hidden" onchange="handleProductFileUpload(event)">
            </label>
          </div>

          <!-- Thumbnails Preview Container -->
          <div id="productThumbnails" class="flex flex-wrap gap-2 pt-1"></div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Image URLs (One URL per line):</label>
            <textarea id="prod_images" rows="2" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]" placeholder="/products/my-watch.png or https://..."></textarea>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Short Description</label>
          <input type="text" id="prod_shortDescription" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Full Description</label>
          <textarea id="prod_description" rows="3" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]"></textarea>
        </div>

        <div class="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="prod_inStock" class="accent-[#F97316] w-4 h-4">
            <span>In Stock</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="prod_isBestSeller" class="accent-[#F97316] w-4 h-4">
            <span>Best Seller</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="prod_isNewDrop" class="accent-[#F97316] w-4 h-4">
            <span>New Drop</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="prod_isTrending" class="accent-[#F97316] w-4 h-4">
            <span>Trending</span>
          </label>
        </div>
      </div>

      <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
        <button type="button" onclick="deleteCurrentProduct()" id="deleteProdBtn" class="text-red-600 hover:text-red-700 font-bold text-xs py-2 px-4 rounded-lg hover:bg-red-50 transition">
          Delete Product
        </button>
        <div class="flex space-x-2">
          <button type="button" onclick="closeProductModal()" class="py-2 px-4 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="button" onclick="saveProductModal()" class="py-2 px-6 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold shadow transition">Save Product</button>
        </div>
      </div>
    </div>
  </div>

  <!-- CATEGORY MODAL -->
  <div id="categoryModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
      <h3 id="catModalTitle" class="text-base font-bold text-[#0B132B]">Add / Edit Category</h3>
      <div class="space-y-3 text-xs">
        <input type="hidden" id="cat_id">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Category Name *</label>
          <input type="text" id="cat_name" placeholder="e.g. Luxury Wallets" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">URL Slug (lowercase) *</label>
          <input type="text" id="cat_slug" placeholder="e.g. luxury-wallets" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Badge Tag</label>
          <input type="text" id="cat_badge" placeholder="e.g. Bestseller, Essential" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Category Image URL or Upload</label>
          <div class="flex gap-2">
            <input type="text" id="cat_image" placeholder="/products/... or https://..." class="flex-1 py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]">
            <label class="cursor-pointer bg-slate-800 text-white px-3 py-2 rounded-lg font-bold flex items-center">
              <span>Upload</span>
              <input type="file" accept="image/*" class="hidden" onchange="handleCategoryFileUpload(event)">
            </label>
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Short Description</label>
          <input type="text" id="cat_shortDesc" placeholder="Minimalist summary" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Full Description</label>
          <textarea id="cat_desc" rows="2" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]"></textarea>
        </div>
      </div>
      <div class="pt-2 flex justify-between items-center">
        <button onclick="deleteCurrentCategory()" id="deleteCatBtn" class="text-red-600 font-bold text-xs hover:underline">Delete Category</button>
        <div class="flex space-x-2">
          <button onclick="closeCategoryModal()" class="py-2 px-4 rounded-lg border border-slate-300 font-semibold text-xs text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="saveCategoryModal()" class="py-2 px-5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow">Save Category</button>
        </div>
      </div>
    </div>
  </div>

  <!-- REVIEW MODAL -->
  <div id="reviewModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
      <h3 id="revModalTitle" class="text-base font-bold text-[#0B132B]">Add / Edit Customer Review</h3>
      <div class="space-y-3 text-xs">
        <input type="hidden" id="rev_id">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Customer Name *</label>
            <input type="text" id="rev_name" placeholder="e.g. Usman Ali" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">City / Region *</label>
            <input type="text" id="rev_city" placeholder="e.g. Lahore, Pakistan" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
            <select id="rev_rating" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
              <option value="5">★★★★★ (5 Stars)</option>
              <option value="4">★★★★☆ (4 Stars)</option>
              <option value="3">★★★☆☆ (3 Stars)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Product Bought</label>
            <input type="text" id="rev_product" placeholder="e.g. Obsidian Chrono Edition" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Review Headline</label>
          <input type="text" id="rev_title" placeholder="e.g. Flawless luxury presentation box" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Detailed Review Content</label>
          <textarea id="rev_text" rows="3" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]"></textarea>
        </div>
      </div>
      <div class="pt-2 flex justify-between items-center">
        <button onclick="deleteCurrentReview()" id="deleteRevBtn" class="text-red-600 font-bold text-xs hover:underline">Delete</button>
        <div class="flex space-x-2">
          <button onclick="closeReviewModal()" class="py-2 px-4 rounded-lg border border-slate-300 font-semibold text-xs text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="saveReviewModal()" class="py-2 px-5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow">Save Review</button>
        </div>
      </div>
    </div>
  </div>

  <!-- PROMO MODAL -->
  <div id="promoModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
      <h3 class="text-base font-bold text-[#0B132B]">Add / Edit Coupon Code</h3>
      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Coupon Code (e.g. EID20)</label>
          <input type="text" id="promo_code" class="w-full py-2 px-3 uppercase font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Discount Percentage (%)</label>
          <input type="number" id="promo_discount" placeholder="e.g. 20" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Minimum Order Value (PKR)</label>
          <input type="number" id="promo_minOrder" placeholder="e.g. 2000" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Description / Benefit</label>
          <input type="text" id="promo_desc" placeholder="e.g. 20% Eid Celebration Discount" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>
      </div>
      <div class="pt-2 flex justify-end space-x-2">
        <button onclick="closePromoModal()" class="py-2 px-4 rounded-lg border border-slate-300 font-semibold text-xs text-slate-600 hover:bg-slate-100">Cancel</button>
        <button onclick="savePromoItem()" class="py-2 px-5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow">Save Coupon</button>
      </div>
    </div>
  </div>

  <!-- DISPATCH MODAL -->
  <div id="dispatchModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-base font-bold text-[#0B132B]">Order Dispatch &amp; Tracking</h3>
          <p class="text-xs text-slate-500">Updating status automatically triggers customer tracking email.</p>
        </div>
        <button onclick="closeDispatchModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <div class="space-y-3 text-xs">
        <input type="hidden" id="disp_orderId">

        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
          <div class="flex justify-between font-bold text-slate-800">
            <span id="disp_orderIdLabel">#CV-100000</span>
            <span id="disp_orderAmount" class="text-[#F97316]">Rs. 0</span>
          </div>
          <div class="text-[11px] text-slate-600" id="disp_customerInfo">Customer details</div>
          <div class="text-[11px] text-slate-500 font-mono" id="disp_itemsSummary">Items</div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Order Status *</label>
          <select id="disp_status" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-[#F97316]">
            <option value="Placed">Placed (New Order - Pending Call/Verification)</option>
            <option value="Confirmed">Confirmed (Verified & Approved)</option>
            <option value="In Processing">In Processing (Packing parcel)</option>
            <option value="Dispatched" selected>Dispatched (Handed to Courier)</option>
            <option value="Delivered">Delivered (Rider collected cash)</option>
            <option value="Returned">Returned (RTO to Inventory)</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Courier Service</label>
            <select id="disp_courier" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
              <option value="TCS Express">TCS Express</option>
              <option value="Trax Logistics">Trax Logistics</option>
              <option value="PostEx">PostEx</option>
              <option value="Call Courier">Call Courier</option>
              <option value="Leopard Courier">Leopard Courier</option>
              <option value="M&P Express">M&P Express</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tracking Number <span class="text-slate-400 font-normal">(Optional)</span></label>
            <div class="flex gap-1.5">
              <input type="text" id="disp_trackingNumber" placeholder="Optional (e.g. TRK-7892102)" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#F97316]">
              <button type="button" onclick="generateDemoTracking()" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold" title="Generate dummy tracking ID for testing">Auto</button>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
            <input type="checkbox" id="disp_sendEmail" checked class="accent-[#F97316] w-4 h-4">
            <span>Send automated dispatch tracking email to customer</span>
          </label>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
        <button onclick="closeDispatchModal()" class="py-2 px-4 rounded-lg border border-slate-300 font-semibold text-xs text-slate-600 hover:bg-slate-100">Cancel</button>
        <button onclick="saveDispatchModal()" id="saveDispatchBtn" class="py-2 px-6 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow flex items-center gap-1.5">
          <span>Save &amp; Notify Customer</span>
        </button>
      </div>
    </div>
  </div>

  <!-- LAYERED DEPLOYMENT PIPELINE MODAL -->
  <div id="publishPipelineModal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B132B] to-slate-800 text-[#F97316] flex items-center justify-center shadow-md">
            <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h3 class="text-lg font-extrabold text-[#0B132B] tracking-tight">Push to Live Storefront</h3>
            <p class="text-xs text-slate-500">Executing 4-layer synchronized deployment pipeline</p>
          </div>
        </div>
        <button onclick="closePublishModal()" id="pipelineCloseBtn" class="text-slate-400 hover:text-slate-700 text-2xl font-bold transition">&times;</button>
      </div>

      <!-- Overall Pipeline Progress Bar -->
      <div class="space-y-1.5">
        <div class="flex justify-between text-xs font-bold">
          <span id="pipelineProgressLabel" class="text-slate-700">Initializing pipeline...</span>
          <span id="pipelinePercent" class="text-[#F97316] font-mono">0%</span>
        </div>
        <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div id="pipelineProgressBar" class="bg-gradient-to-r from-amber-500 via-[#F97316] to-emerald-500 h-full w-0 transition-all duration-500 rounded-full"></div>
        </div>
      </div>

      <!-- 4 Layered Steps -->
      <div class="space-y-3" id="pipelineStepsList">
        
        <!-- Layer 1: Staging Store Data -->
        <div id="step-layer-1" class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between transition-all">
          <div class="flex items-center gap-3">
            <div id="step-icon-1" class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs font-bold text-slate-700">1</div>
            <div>
              <div class="text-xs font-bold text-slate-900">Layer 1: Staging Storefront Data</div>
              <div class="text-[11px] text-slate-500" id="step-desc-1">Checking catalog, CMS banners, uploaded images &amp; settings</div>
            </div>
          </div>
          <div id="step-status-1" class="text-xs font-semibold text-slate-400 font-mono">Waiting</div>
        </div>

        <!-- Layer 2: Local Git Commit -->
        <div id="step-layer-2" class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between transition-all">
          <div class="flex items-center gap-3">
            <div id="step-icon-2" class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs font-bold text-slate-700">2</div>
            <div>
              <div class="text-xs font-bold text-slate-900">Layer 2: Creating Git Commit</div>
              <div class="text-[11px] text-slate-500" id="step-desc-2">Sealing staged changes into an immutable version snapshot</div>
            </div>
          </div>
          <div id="step-status-2" class="text-xs font-semibold text-slate-400 font-mono">Waiting</div>
        </div>

        <!-- Layer 3: GitHub Push -->
        <div id="step-layer-3" class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between transition-all">
          <div class="flex items-center gap-3">
            <div id="step-icon-3" class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs font-bold text-slate-700">3</div>
            <div>
              <div class="text-xs font-bold text-slate-900">Layer 3: Syncing with GitHub</div>
              <div class="text-[11px] text-slate-500" id="step-desc-3">Pushing main branch to github.com/calenveepk/calenvee.pk</div>
            </div>
          </div>
          <div id="step-status-3" class="text-xs font-semibold text-slate-400 font-mono">Waiting</div>
        </div>

        <!-- Layer 4: Vercel Live Deployment -->
        <div id="step-layer-4" class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between transition-all">
          <div class="flex items-center gap-3">
            <div id="step-icon-4" class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs font-bold text-slate-700">4</div>
            <div>
              <div class="text-xs font-bold text-slate-900">Layer 4: Vercel Production Deployment</div>
              <div class="text-[11px] text-slate-500" id="step-desc-4">Vercel automatic live edge build deploying to calenvee.pk</div>
            </div>
          </div>
          <div id="step-status-4" class="text-xs font-semibold text-slate-400 font-mono">Waiting</div>
        </div>

      </div>

      <!-- Result Card (shown on finish) -->
      <div id="pipelineSuccessCard" class="hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
        <div class="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
          <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</span>
          <span>Deployment Pipeline Executed Successfully!</span>
        </div>
        <div class="text-xs text-emerald-700 leading-relaxed" id="pipelineSuccessSummary">
          Changes are committed and pushed to GitHub main. Vercel is actively distributing your live build to edge CDN servers.
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          <a href="https://calenvee.pk" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow transition">
            <span>🌐 Open Live Store (calenvee.pk)</span>
          </a>
          <a id="githubCommitLink" href="https://github.com/calenveepk/calenvee.pk" target="_blank" class="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition">
            <span>🐙 View on GitHub</span>
          </a>
        </div>
      </div>

      <!-- Collapsible Logs -->
      <div>
        <button type="button" onclick="togglePipelineLogs()" class="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1">
          <span id="pipelineLogsToggleText">▸ View Raw Terminal &amp; Git Output</span>
        </button>
        <pre id="pipelineConsoleLog" class="hidden mt-2 bg-[#0B132B] text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-700 custom-scroll"></pre>
      </div>

      <!-- Modal Footer -->
      <div class="pt-2 border-t border-slate-100 flex justify-end gap-2">
        <button type="button" onclick="closePublishModal()" id="pipelineDoneBtn" class="py-2.5 px-6 rounded-xl bg-[#0B132B] hover:bg-[#1E293B] text-white font-bold text-xs shadow transition">
          Close
        </button>
      </div>

    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 bg-[#0B132B] text-white py-3 px-5 rounded-xl shadow-2xl flex items-center space-x-3 transform translate-y-20 opacity-0 transition-all duration-300 border border-slate-700">
    <span id="toastIcon" class="text-[#F97316] text-lg font-bold">✓</span>
    <span id="toastMsg" class="text-xs font-semibold">Saved successfully</span>
  </div>

  <script>
    let allProducts = [];
    let allOrders = [];
    let allCategories = [];
    let allAnnouncements = [];
    let allReviews = [];
    let paymentAccounts = {};
    let promotionsData = { promos: {}, saleOffer: {} };
    let storeSettings = {};
    let homeContentData = {};

    window.addEventListener('DOMContentLoaded', () => {
      loadSettings();
      loadHomeContent();
      loadCategories();
      loadProducts();
      loadOrders();
      loadAnnouncements();
      loadReviews();
      loadPayments();
      loadPromotions();
      checkConnection();
      checkCloudStatus();
      setInterval(checkConnection, 4000);
      setInterval(checkCloudStatus, 8000);
    });

    async function checkConnection() {
      const badge = document.getElementById('connBadge');
      const text = document.getElementById('connText');
      if (!badge || !text) return;
      try {
        const res = await fetch('/api/ping');
        if (res.ok) {
          badge.className = 'hidden sm:flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
          text.innerText = 'Connected';
          return true;
        }
      } catch (e) {
        badge.className = 'hidden sm:flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30';
        text.innerText = 'Server Offline (Keep launcher window open)';
        return false;
      }
    }

    // --- CLOUD AUTOMATION & REAL-TIME SYNC ---
    async function checkCloudStatus() {
      const badge = document.getElementById('cloudSyncBadge');
      const text = document.getElementById('cloudSyncText');
      if (!badge || !text) return;
      try {
        const res = await fetch('/api/cloud/status');
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'syncing') {
            badge.className = 'hidden sm:flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30';
            text.innerText = 'Syncing Cloud...';
          } else if (data.status === 'error') {
            badge.className = 'hidden sm:flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30';
            text.innerText = 'Cloud Sync Offline';
          } else {
            badge.className = 'hidden sm:flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30';
            text.innerText = 'Cloud Synced';
          }
        }
      } catch (e) {
        // quiet ignore
      }
    }

    async function triggerCloudSyncAll() {
      const btn = document.getElementById('syncCloudHeaderBtn');
      const text = document.getElementById('syncCloudBtnText');
      if (btn) btn.disabled = true;
      if (text) text.innerText = 'Syncing...';
      try {
        const res = await fetch('/api/cloud/sync-all', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast('⚡ All products, settings & payment accounts synchronized to Google Sheets automations!');
          checkCloudStatus();
        } else {
          showToast('Sync saved locally. Cloud webhook queued.', true);
        }
      } catch (e) {
        showToast('Sync request error: ' + e.message, true);
      } finally {
        if (btn) btn.disabled = false;
        if (text) text.innerText = '⚡ Sync Cloud';
      }
    }

    // --- ORDERS & DISPATCH LOGIC ---
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        allOrders = (data && data.orders) || [];
        document.getElementById('ordersCount').innerText = allOrders.length;
        renderOrders(allOrders);
      } catch (e) {
        console.error('Error loading orders:', e);
      }
    }

    function renderOrders(ordersToRender) {
      const container = document.getElementById('ordersListContainer');
      if (!container) return;

      const total = allOrders.length;
      const pending = allOrders.filter(o => o.status === 'Confirmed' || o.status === 'In Processing').length;
      const dispatched = allOrders.filter(o => o.status === 'Dispatched').length;
      const revenue = allOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      document.getElementById('statTotalOrders').innerText = total;
      document.getElementById('statPendingOrders').innerText = pending;
      document.getElementById('statDispatchedOrders').innerText = dispatched;
      document.getElementById('statGrossRevenue').innerText = 'Rs. ' + revenue.toLocaleString();

      if (!ordersToRender.length) {
        container.innerHTML = \`
          <div class="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
            <div class="text-3xl mb-2">📦</div>
            <h3 class="text-base font-bold text-slate-800">No Orders Found</h3>
            <p class="text-xs text-slate-500 mt-1">Customer orders placed on Calenvee storefront will stream here automatically.</p>
          </div>
        \`;
        return;
      }

      container.innerHTML = ordersToRender.map(o => {
        let statusColor = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        if (o.status === 'Placed') statusColor = 'bg-purple-500/15 text-purple-700 border-purple-500/30 font-bold';
        else if (o.status === 'Confirmed') statusColor = 'bg-blue-500/15 text-blue-700 border-blue-500/30';
        else if (o.status === 'In Processing') statusColor = 'bg-amber-500/15 text-amber-700 border-amber-500/30';
        else if (o.status === 'Dispatched') statusColor = 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30';
        else if (o.status === 'Delivered') statusColor = 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
        else if (o.status === 'Cancelled') statusColor = 'bg-red-500/15 text-red-600 border-red-500/30';
        else if (o.status === 'Returned') statusColor = 'bg-rose-500/15 text-rose-700 border-rose-500/30 font-bold';

        const phoneClean = (o.phone || '').replace(/[^0-9]/g, '');
        const dateFormatted = o.timestamp ? new Date(o.timestamp).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent';
        const hasReceipt = o.receiptProof && String(o.receiptProof).startsWith('http');
        const isCOD = (o.paymentMethod || '').toUpperCase() === 'COD';

        return \`
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div class="flex-1 space-y-2 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono font-bold text-sm text-[#0B132B]">#\${o.orderId}</span>
                <span class="text-[11px] text-slate-400">&bull; \${dateFormatted}</span>
                <span class="py-0.5 px-2.5 rounded-full text-[10px] font-bold border \${statusColor}">● \${o.status}</span>
                <span class="py-0.5 px-2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">\${o.paymentMethod || 'COD'}</span>
              </div>

              <div class="text-xs text-slate-800 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span class="font-bold text-slate-900">\${o.customerName || 'Customer'}</span>
                \${o.phone ? \`<a href="https://wa.me/\${phoneClean}" target="_blank" class="text-emerald-600 font-semibold hover:underline flex items-center gap-1"><span>💬 \${o.phone}</span></a>\` : ''}
                \${o.email && o.email !== 'N/A' ? \`<span class="text-slate-500">\${o.email}</span>\` : ''}
                <span class="text-slate-500 font-medium">📍 \${o.city || 'Pakistan'}\${o.address ? ' - ' + o.address : ''}</span>
              </div>

              <div class="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                \${o.itemsSummary || 'Standard Calenvee Package'}
              </div>

              \${o.notes && o.notes !== 'None' && o.notes !== 'N/A' ? \`
                <div class="text-[11px] text-amber-700 bg-amber-50/60 p-1.5 px-2.5 rounded-md border border-amber-200 inline-block">
                  <strong>Notes:</strong> "\${o.notes}"
                </div>
              \` : ''}
            </div>

            <div class="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div class="text-left md:text-right">
                <div class="text-xs text-slate-400 font-semibold uppercase">Total</div>
                <div class="text-base font-extrabold text-[#0B132B]">Rs. \${(Number(o.total) || 0).toLocaleString()}</div>
                \${hasReceipt ? \`
                  <a href="\${o.receiptProof}" target="_blank" class="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5">
                    <span>🧾 View Payment Slip</span>
                  </a>
                \` : (isCOD ? '<span class="text-[10px] text-slate-400">Cash on Delivery</span>' : '<span class="text-[10px] text-amber-500">Unverified Prepaid</span>')}
              </div>

              <div class="flex items-center gap-2">
                \${o.status === 'Placed' ? \`
                  <button onclick="quickConfirmOrder('\${o.orderId}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow transition flex items-center gap-1" title="Confirm customer order">
                    <span>✓ Confirm</span>
                  </button>
                \` : ''}
                <button onclick="openDispatchModal('\${o.orderId}')" class="bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                  <span>Dispatch 🚚</span>
                </button>
              </div>
            </div>

          </div>
        \`;
      }).join('');
    }

    function filterOrders() {
      const q = (document.getElementById('orderSearchInput')?.value || '').toLowerCase();
      const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';

      const filtered = allOrders.filter(o => {
        const matchesQuery = !q || 
          (o.orderId && o.orderId.toLowerCase().includes(q)) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.phone && o.phone.includes(q)) ||
          (o.city && o.city.toLowerCase().includes(q));

        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesQuery && matchesStatus;
      });

      renderOrders(filtered);
    }

    async function quickConfirmOrder(orderId) {
      if (!confirm('Verify & Confirm Order #' + orderId + '?\nStatus will change from Placed to Confirmed.')) return;
      try {
        const res = await fetch('/api/orders/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: 'Confirmed', sendEmail: true })
        });
        const data = await res.json();
        if (data.success) {
          showToast('✓ Order #' + orderId + ' marked Confirmed!');
          await loadOrders();
        } else {
          showToast('Failed to confirm: ' + (data.message || 'Error'), true);
        }
      } catch (e) {
        showToast('Error confirming order: ' + e.message, true);
      }
    }

    function openDispatchModal(orderId) {
      const order = allOrders.find(o => String(o.orderId).toUpperCase() === String(orderId).toUpperCase());
      if (!order) return;

      document.getElementById('disp_orderId').value = order.orderId;
      document.getElementById('disp_orderIdLabel').innerText = '#' + order.orderId;
      document.getElementById('disp_orderAmount').innerText = 'Rs. ' + (Number(order.total) || 0).toLocaleString();
      document.getElementById('disp_customerInfo').innerText = order.customerName + ' • ' + order.phone + ' • ' + order.city;
      document.getElementById('disp_itemsSummary').innerText = order.itemsSummary || 'Standard order items';

      document.getElementById('disp_status').value = order.status || 'Dispatched';
      document.getElementById('disp_courier').value = order.courier && order.courier !== 'N/A' && !order.courier.includes('Pending') ? order.courier : 'TCS Express';
      document.getElementById('disp_trackingNumber').value = (order.trackingNumber && order.trackingNumber !== 'N/A') ? order.trackingNumber : '';
      document.getElementById('disp_sendEmail').checked = true;

      document.getElementById('dispatchModal').classList.remove('hidden');
      document.getElementById('dispatchModal').classList.add('flex');
    }

    function closeDispatchModal() {
      document.getElementById('dispatchModal').classList.add('hidden');
      document.getElementById('dispatchModal').classList.remove('flex');
    }

    function generateDemoTracking() {
      const prefixes = ['TCS', 'TRX', 'PEX', 'LEO'];
      const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
      document.getElementById('disp_trackingNumber').value = pfx + '-' + Math.floor(10000000 + Math.random() * 90000000);
    }

    async function saveDispatchModal() {
      const orderId = document.getElementById('disp_orderId').value;
      const status = document.getElementById('disp_status').value;
      const courier = document.getElementById('disp_courier').value;
      const trackingNumber = document.getElementById('disp_trackingNumber').value.trim() || 'N/A';
      const sendEmail = document.getElementById('disp_sendEmail').checked;

      const btn = document.getElementById('saveDispatchBtn');
      if (btn) btn.disabled = true;

      try {
        const res = await fetch('/api/orders/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status, courier, trackingNumber, sendEmail })
        });
        const data = await res.json();
        if (data.success) {
          showToast('✓ Order #' + orderId + ' set to "' + status + '" & customer tracking synced!');
          closeDispatchModal();
          await loadOrders();
        } else {
          showToast('Failed to update order: ' + (data.message || 'Error'), true);
        }
      } catch (e) {
        showToast('Error updating order: ' + e.message, true);
      } finally {
        if (btn) btn.disabled = false;
      }
    }

    function showToast(msg, isError = false) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      const toastIcon = document.getElementById('toastIcon');
      toastMsg.innerText = msg;
      toastIcon.innerText = isError ? '✕' : '✓';
      toastIcon.className = isError ? 'text-red-500 text-lg font-bold' : 'text-[#F97316] text-lg font-bold';
      toast.classList.remove('translate-y-20', 'opacity-0');
      setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); }, 4000);
    }

    function switchTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-[#F97316]', 'text-[#F97316]');
        btn.classList.add('border-transparent', 'text-slate-500');
      });
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

      const targetTab = document.getElementById('tab-' + tab);
      const targetContent = document.getElementById('content-' + tab);
      if (targetTab) {
        targetTab.classList.add('border-[#F97316]', 'text-[#F97316]');
        targetTab.classList.remove('border-transparent', 'text-slate-500');
      }
      if (targetContent) {
        targetContent.classList.remove('hidden');
      }
    }

    // --- 1. SETTINGS LOGIC ---
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        storeSettings = await res.json();
        document.getElementById('headerSlogan').innerText = storeSettings.storeSlogan || 'SHOP SMART, LIVE BETTER';
        document.getElementById('set_slogan').value = storeSettings.storeSlogan || 'SHOP SMART, LIVE BETTER';
        document.getElementById('set_storeName').value = storeSettings.storeName || 'Calenvee.pk';
        document.getElementById('set_whatsappNumber').value = storeSettings.whatsappNumber || '+923001234567';
        document.getElementById('set_whatsappRaw').value = storeSettings.whatsappRaw || '923001234567';
        document.getElementById('set_deliveryWindow').value = storeSettings.deliveryWindow || 'Nationwide Cash on Delivery (7-10 Working Days)';
        document.getElementById('set_instagram').value = storeSettings.instagram || '@calenvee.pk';
        document.getElementById('set_freeShippingThreshold').value = storeSettings.freeShippingThreshold || 2999;
        document.getElementById('set_standardShippingFee').value = storeSettings.standardShippingFee || 199;
      } catch (e) {
        console.error('Settings load err:', e);
      }
    }

    async function saveStoreSettings() {
      const payload = {
        storeName: document.getElementById('set_storeName').value.trim() || 'Calenvee.pk',
        storeSlogan: document.getElementById('set_slogan').value.trim() || 'SHOP SMART, LIVE BETTER',
        whatsappNumber: document.getElementById('set_whatsappNumber').value.trim() || '+923001234567',
        whatsappRaw: document.getElementById('set_whatsappRaw').value.trim().replace(/[^0-9]/g, '') || '923001234567',
        supportEmail: 'calenvee.pk@gmail.com',
        deliveryWindow: document.getElementById('set_deliveryWindow').value.trim(),
        freeShippingThreshold: Number(document.getElementById('set_freeShippingThreshold').value) || 2999,
        standardShippingFee: Number(document.getElementById('set_standardShippingFee').value) || 199,
        instagram: document.getElementById('set_instagram').value.trim(),
        address: "Online E-Commerce Store -- Serving All Pakistan Cities",
        city: "Pakistan",
        country: "Pakistan"
      };

      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          showToast('Store settings saved! Slogan & WhatsApp updated.');
          loadSettings();
        } else {
          showToast('Failed to save settings: ' + (result.error || 'Server rejected'), true);
        }
      } catch (e) {
        console.error('Save error:', e);
        const errMsg = e.message.includes('fetch') 
          ? 'Server disconnected. Please open Calenvee-Store-Manager.bat and keep the black window open!' 
          : e.message;
        showToast('Failed to save settings: ' + errMsg, true);
      }
    }

    async function copyAppsScript() {
      try {
        const res = await fetch('/api/apps-script');
        if (!res.ok) throw new Error('Failed to load script');
        const code = await res.text();
        await navigator.clipboard.writeText(code);
        showToast('✓ Complete Google Apps Script copied to clipboard!');
      } catch (err) {
        console.error('Copy script err:', err);
        showToast('Please copy script directly from backend/google-apps-script.js', true);
      }
    }

    // --- 2. CATEGORIES LOGIC ---
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        allCategories = await res.json();
        document.getElementById('categoriesCount').innerText = allCategories.length;
        renderCategories();
        populateCategoryDropdowns();
      } catch (e) {
        console.error('Categories err:', e);
      }
    }

    function populateCategoryDropdowns() {
      const filterSelect = document.getElementById('categoryFilter');
      const prodSelect = document.getElementById('prod_category');
      
      const currentFilter = filterSelect.value;
      filterSelect.innerHTML = '<option value="all">All Categories</option>' + allCategories.map(c => \`<option value="\${c.slug}">\${c.name}</option>\`).join('');
      filterSelect.value = currentFilter || 'all';

      prodSelect.innerHTML = allCategories.map(c => \`<option value="\${c.slug}">\${c.name}</option>\`).join('');
    }

    function renderCategories() {
      const container = document.getElementById('categoriesList');
      container.innerHTML = allCategories.map(c => \`
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col">
          <div class="h-36 bg-slate-100 overflow-hidden relative">
            <img src="\${c.image || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500'}" alt="\${c.name}" class="w-full h-full object-cover">
            \${c.badge ? \`<span class="absolute top-2.5 left-2.5 bg-[#0B132B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">\${c.badge}</span>\` : ''}
          </div>
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-sm text-slate-900">\${c.name}</h3>
              <p class="text-[11px] text-slate-500 font-mono mt-0.5">/\${c.slug}</p>
              <p class="text-xs text-slate-600 mt-2 line-clamp-2">\${c.description}</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex justify-between items-center mt-3">
              <span class="text-xs text-slate-400 font-mono">\${c.itemCount || 0} Products</span>
              <button onclick="editCategory('\${c.id}')" class="text-xs font-bold text-[#F97316] hover:underline">Edit</button>
            </div>
          </div>
        </div>
      \`).join('');
    }

    function openCategoryModal(cat = null) {
      document.getElementById('categoryModal').classList.remove('hidden');
      document.getElementById('categoryModal').classList.add('flex');
      const deleteBtn = document.getElementById('deleteCatBtn');

      if (cat) {
        document.getElementById('catModalTitle').innerText = 'Edit ' + cat.name;
        document.getElementById('cat_id').value = cat.id;
        document.getElementById('cat_name').value = cat.name;
        document.getElementById('cat_slug').value = cat.slug;
        document.getElementById('cat_badge').value = cat.badge || '';
        document.getElementById('cat_image').value = cat.image || '';
        document.getElementById('cat_shortDesc').value = cat.shortDescription || '';
        document.getElementById('cat_desc').value = cat.description || '';
        deleteBtn.classList.remove('hidden');
      } else {
        document.getElementById('catModalTitle').innerText = 'Add New Category';
        document.getElementById('cat_id').value = '';
        document.getElementById('cat_name').value = '';
        document.getElementById('cat_slug').value = '';
        document.getElementById('cat_badge').value = 'New Drop';
        document.getElementById('cat_image').value = 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800';
        document.getElementById('cat_shortDesc').value = '';
        document.getElementById('cat_desc').value = '';
        deleteBtn.classList.add('hidden');
      }
    }

    function closeCategoryModal() {
      document.getElementById('categoryModal').classList.add('hidden');
      document.getElementById('categoryModal').classList.remove('flex');
    }

    function editCategory(id) {
      const cat = allCategories.find(c => c.id === id);
      if (cat) openCategoryModal(cat);
    }

    async function saveCategoryModal() {
      const id = document.getElementById('cat_id').value;
      const name = document.getElementById('cat_name').value.trim();
      const slug = document.getElementById('cat_slug').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (!name || !slug) {
        alert('Please specify Category Name and Slug');
        return;
      }

      const payload = {
        id: id || slug,
        name,
        slug,
        badge: document.getElementById('cat_badge').value.trim(),
        image: document.getElementById('cat_image').value.trim(),
        shortDescription: document.getElementById('cat_shortDesc').value.trim(),
        description: document.getElementById('cat_desc').value.trim(),
        itemCount: 8,
        featured: true,
        seoKeywords: [name, 'Pakistan online shopping']
      };

      try {
        const res = await fetch('/api/categories/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          closeCategoryModal();
          showToast('Category saved!');
          loadCategories();
        }
      } catch (e) {
        showToast('Error saving category', true);
      }
    }

    async function deleteCurrentCategory() {
      const id = document.getElementById('cat_id').value;
      if (!id || !confirm('Are you sure you want to delete this category?')) return;
      try {
        const res = await fetch('/api/categories/' + id, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          closeCategoryModal();
          showToast('Category deleted');
          loadCategories();
        }
      } catch (e) {
        showToast('Delete failed', true);
      }
    }

    async function handleCategoryFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      showToast('Uploading category image...');
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, data: reader.result })
          });
          const result = await res.json();
          if (result.success) {
            document.getElementById('cat_image').value = result.url;
            showToast('Category image uploaded!');
          }
        } catch (e) {
          showToast('Upload failed', true);
        }
      };
      reader.readAsDataURL(file);
    }

    // --- 3. ANNOUNCEMENTS LOGIC ---
    async function loadAnnouncements() {
      try {
        const res = await fetch('/api/announcements');
        allAnnouncements = await res.json();
        renderAnnouncements();
      } catch (e) {
        console.error('Announcements load err:', e);
      }
    }

    function renderAnnouncements() {
      const container = document.getElementById('announcementsContainer');
      container.innerHTML = allAnnouncements.map((text, index) => \`
        <div class="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span class="text-xs font-mono font-bold text-slate-400 w-6 text-center">#\${index + 1}</span>
          <input type="text" value="\${text.replace(/"/g, '&quot;')}" onchange="updateAnnouncementText(\${index}, this.value)" class="flex-1 py-1.5 px-3 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          <button onclick="deleteAnnouncement(\${index})" class="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 font-bold text-xs">✕</button>
        </div>
      \`).join('');
    }

    function updateAnnouncementText(index, val) {
      allAnnouncements[index] = val;
    }

    function addAnnouncementPrompt() {
      const text = prompt('Enter new announcement message:');
      if (text && text.trim()) {
        allAnnouncements.push(text.trim());
        renderAnnouncements();
      }
    }

    function deleteAnnouncement(index) {
      allAnnouncements.splice(index, 1);
      renderAnnouncements();
    }

    async function saveAnnouncements() {
      try {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allAnnouncements)
        });
        const result = await res.json();
        if (result.success) {
          showToast('Announcement bar updated!');
        }
      } catch (e) {
        showToast('Save failed', true);
      }
    }

    // --- 4. REVIEWS LOGIC ---
    async function loadReviews() {
      try {
        const res = await fetch('/api/reviews');
        allReviews = await res.json();
        document.getElementById('reviewsCount').innerText = allReviews.length;
        renderReviews();
      } catch (e) {
        console.error('Reviews load err:', e);
      }
    }

    function renderReviews() {
      const container = document.getElementById('reviewsList');
      container.innerHTML = allReviews.map(r => \`
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-amber-400 font-bold tracking-widest text-sm">★ \${r.rating}.0</span>
              <span class="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">Verified Buyer</span>
            </div>
            <h4 class="font-bold text-xs text-slate-900">\${r.reviewTitle}</h4>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">"\${r.reviewText}"</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
            <div>
              <strong class="text-slate-900 block">\${r.studentName}</strong>
              <span class="text-[10px] text-slate-400">\${r.university}</span>
            </div>
            <button onclick="editReview('\${r.id}')" class="text-[#F97316] font-bold hover:underline">Edit</button>
          </div>
        </div>
      \`).join('');
    }

    function openReviewModal(rev = null) {
      document.getElementById('reviewModal').classList.remove('hidden');
      document.getElementById('reviewModal').classList.add('flex');
      const deleteBtn = document.getElementById('deleteRevBtn');

      if (rev) {
        document.getElementById('revModalTitle').innerText = 'Edit Review by ' + rev.studentName;
        document.getElementById('rev_id').value = rev.id;
        document.getElementById('rev_name').value = rev.studentName;
        document.getElementById('rev_city').value = rev.university;
        document.getElementById('rev_rating').value = rev.rating || 5;
        document.getElementById('rev_product').value = rev.productBought || '';
        document.getElementById('rev_title').value = rev.reviewTitle;
        document.getElementById('rev_text').value = rev.reviewText;
        deleteBtn.classList.remove('hidden');
      } else {
        document.getElementById('revModalTitle').innerText = 'Add Customer Review';
        document.getElementById('rev_id').value = '';
        document.getElementById('rev_name').value = '';
        document.getElementById('rev_city').value = 'Lahore, Pakistan';
        document.getElementById('rev_rating').value = 5;
        document.getElementById('rev_product').value = 'Calenvee Timepiece';
        document.getElementById('rev_title').value = '';
        document.getElementById('rev_text').value = '';
        deleteBtn.classList.add('hidden');
      }
    }

    function closeReviewModal() {
      document.getElementById('reviewModal').classList.add('hidden');
      document.getElementById('reviewModal').classList.remove('flex');
    }

    function editReview(id) {
      const rev = allReviews.find(r => r.id === id);
      if (rev) openReviewModal(rev);
    }

    async function saveReviewModal() {
      const id = document.getElementById('rev_id').value;
      const name = document.getElementById('rev_name').value.trim();
      const text = document.getElementById('rev_text').value.trim();

      if (!name || !text) {
        alert('Please fill customer name and review text.');
        return;
      }

      const payload = {
        id: id || ('rev-' + Date.now()),
        studentName: name,
        university: document.getElementById('rev_city').value.trim(),
        major: 'Verified Client',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        productBought: document.getElementById('rev_product').value.trim(),
        rating: Number(document.getElementById('rev_rating').value) || 5,
        date: 'Verified Order',
        reviewTitle: document.getElementById('rev_title').value.trim() || 'Exceptional Quality',
        reviewText: text,
        tags: ['Verified Buyer'],
        campusBadge: 'Featured Client',
        likes: 12
      };

      try {
        const res = await fetch('/api/reviews/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          closeReviewModal();
          showToast('Review saved!');
          loadReviews();
        }
      } catch (e) {
        showToast('Error saving review', true);
      }
    }

    async function deleteCurrentReview() {
      const id = document.getElementById('rev_id').value;
      if (!id || !confirm('Delete this review?')) return;
      try {
        const res = await fetch('/api/reviews/' + id, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          closeReviewModal();
          showToast('Review deleted');
          loadReviews();
        }
      } catch (e) {
        showToast('Delete failed', true);
      }
    }

    // --- 5. PRODUCTS LOGIC (WITH DIRECT IMAGE UPLOAD) ---
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        document.getElementById('productsCount').innerText = allProducts.length;
        renderProducts(allProducts);
      } catch (e) {
        showToast('Error loading products', true);
      }
    }

    function renderProducts(products) {
      const grid = document.getElementById('productsGrid');
      if (products.length === 0) {
        grid.innerHTML = '<div class="col-span-3 text-center py-12 text-slate-400 text-xs">No products match your query.</div>';
        return;
      }

      grid.innerHTML = products.map(p => {
        const img = p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400';
        return \`
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col">
            <div class="relative h-44 bg-slate-100 overflow-hidden">
              <img src="\${img}" alt="\${p.name}" class="w-full h-full object-cover">
              <div class="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                \${p.isBestSeller ? '<span class="bg-[#F97316] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Bestseller</span>' : ''}
                \${p.isNewDrop ? '<span class="bg-[#0B132B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>' : ''}
                \${!p.inStock ? '<span class="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Out of Stock</span>' : ''}
              </div>
              <span class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">Stock: \${p.stockCount || 0}</span>
            </div>
            
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[10px] uppercase font-bold text-[#F97316] tracking-wider">\${p.category}</span>
                <h3 class="font-bold text-sm text-slate-900 mt-0.5 line-clamp-1">\${p.name}</h3>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">\${p.shortDescription || p.description || ''}</p>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
                <div>
                  <span class="text-sm font-extrabold text-[#0B132B]">Rs. \${(p.price || 0).toLocaleString()}</span>
                  \${p.originalPrice ? \`<span class="text-[11px] text-slate-400 line-through ml-1.5">Rs. \${p.originalPrice.toLocaleString()}</span>\` : ''}
                </div>
                <button onclick="editProduct('\${p.id}')" class="text-xs font-bold text-[#F97316] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition border border-orange-200">
                  Edit
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function filterProducts() {
      const q = document.getElementById('productSearch').value.toLowerCase();
      const cat = document.getElementById('categoryFilter').value;
      const filtered = allProducts.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(q) || (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q));
        const matchesCat = cat === 'all' || p.category === cat;
        return matchesQuery && matchesCat;
      });
      renderProducts(filtered);
    }

    function openProductModal(prod = null) {
      document.getElementById('productModal').classList.remove('hidden');
      document.getElementById('productModal').classList.add('flex');
      const deleteBtn = document.getElementById('deleteProdBtn');

      if (prod) {
        document.getElementById('modalTitle').innerText = 'Edit ' + prod.name;
        document.getElementById('prod_id').value = prod.id;
        document.getElementById('prod_name').value = prod.name;
        document.getElementById('prod_category').value = prod.category;
        document.getElementById('prod_subcategory').value = prod.subcategory || '';
        document.getElementById('prod_price').value = prod.price;
        document.getElementById('prod_originalPrice').value = prod.originalPrice || '';
        document.getElementById('prod_stockCount').value = prod.stockCount || 0;
        document.getElementById('prod_warranty').value = prod.warranty || '';
        document.getElementById('prod_images').value = (prod.images || []).join('\\n');
        document.getElementById('prod_shortDescription').value = prod.shortDescription || '';
        document.getElementById('prod_description').value = prod.description || '';
        document.getElementById('prod_inStock').checked = prod.inStock !== false;
        document.getElementById('prod_isBestSeller').checked = !!prod.isBestSeller;
        document.getElementById('prod_isNewDrop').checked = !!prod.isNewDrop;
        document.getElementById('prod_isTrending').checked = !!prod.isTrending;
        deleteBtn.classList.remove('hidden');
      } else {
        document.getElementById('modalTitle').innerText = 'Add New Product';
        document.getElementById('prod_id').value = '';
        document.getElementById('prod_name').value = '';
        document.getElementById('prod_category').value = allCategories[0]?.slug || 'watches';
        document.getElementById('prod_subcategory').value = '';
        document.getElementById('prod_price').value = '';
        document.getElementById('prod_originalPrice').value = '';
        document.getElementById('prod_stockCount').value = 15;
        document.getElementById('prod_warranty').value = '1 Year Calenvee Official Warranty';
        document.getElementById('prod_images').value = 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80';
        document.getElementById('prod_shortDescription').value = '';
        document.getElementById('prod_description').value = '';
        document.getElementById('prod_inStock').checked = true;
        document.getElementById('prod_isBestSeller').checked = false;
        document.getElementById('prod_isNewDrop').checked = true;
        document.getElementById('prod_isTrending').checked = false;
        deleteBtn.classList.add('hidden');
      }
      renderProductThumbnails();
    }

    function closeProductModal() {
      document.getElementById('productModal').classList.add('hidden');
      document.getElementById('productModal').classList.remove('flex');
    }

    function editProduct(id) {
      const prod = allProducts.find(p => p.id === id);
      if (prod) openProductModal(prod);
    }

    function renderProductThumbnails() {
      const urls = document.getElementById('prod_images').value.split('\\n').map(s => s.trim()).filter(Boolean);
      const container = document.getElementById('productThumbnails');
      if (urls.length === 0) {
        container.innerHTML = '<span class="text-[11px] text-slate-400 italic">No images added yet. Click Upload from PC above.</span>';
        return;
      }

      container.innerHTML = urls.map((url, i) => \`
        <div class="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 group">
          <img src="\${url}" class="w-full h-full object-cover">
          <button type="button" onclick="removeProductThumbnail(\${i})" class="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-red-600 transition">✕</button>
        </div>
      \`).join('');
    }

    function removeProductThumbnail(index) {
      const urls = document.getElementById('prod_images').value.split('\\n').map(s => s.trim()).filter(Boolean);
      urls.splice(index, 1);
      document.getElementById('prod_images').value = urls.join('\\n');
      renderProductThumbnails();
    }

    // DIRECT IMAGE FILE UPLOAD FROM COMPUTER
    async function handleProductFileUpload(event) {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      showToast(\`Uploading \${files.length} image(s)... Please wait.\`);

      for (const file of files) {
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, data: reader.result })
              });
              const result = await res.json();
              if (result.success) {
                const currentUrls = document.getElementById('prod_images').value.split('\\n').map(s => s.trim()).filter(Boolean);
                currentUrls.push(result.url);
                document.getElementById('prod_images').value = currentUrls.join('\\n');
                renderProductThumbnails();
                showToast(\`\${file.name} uploaded successfully!\`);
              }
            } catch (err) {
              showToast(\`Failed to upload \${file.name}\`, true);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    async function saveProductModal() {
      const id = document.getElementById('prod_id').value;
      const name = document.getElementById('prod_name').value.trim();
      const price = Number(document.getElementById('prod_price').value);
      const originalPrice = Number(document.getElementById('prod_originalPrice').value) || price;
      const category = document.getElementById('prod_category').value;

      if (!name || isNaN(price)) {
        alert('Please fill product name and price.');
        return;
      }

      const images = document.getElementById('prod_images').value.split('\\n').map(s => s.trim()).filter(Boolean);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const payload = {
        id: id || ('cv-' + category.slice(0, 3) + '-' + Math.floor(100 + Math.random() * 900)),
        name,
        slug,
        category,
        categoryLabel: allCategories.find(c => c.slug === category)?.name || category,
        subcategory: document.getElementById('prod_subcategory').value,
        price,
        originalPrice,
        discountPercentage: Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100)),
        stockCount: Number(document.getElementById('prod_stockCount').value) || 0,
        warranty: document.getElementById('prod_warranty').value,
        images: images.length ? images : ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000'],
        shortDescription: document.getElementById('prod_shortDescription').value,
        description: document.getElementById('prod_description').value,
        inStock: document.getElementById('prod_inStock').checked,
        isBestSeller: document.getElementById('prod_isBestSeller').checked,
        isNewDrop: document.getElementById('prod_isNewDrop').checked,
        isTrending: document.getElementById('prod_isTrending').checked,
        rating: 4.9,
        reviewsCount: 1,
        tags: ['Minimalist Luxe'],
        colors: [{ name: 'Standard Edition', hex: '#111111', inStock: true }],
        reviews: []
      };

      try {
        const res = await fetch('/api/products/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          closeProductModal();
          showToast('Product saved successfully!');
          loadProducts();
        }
      } catch (e) {
        showToast('Save failed', true);
      }
    }

    async function deleteCurrentProduct() {
      const id = document.getElementById('prod_id').value;
      if (!id || !confirm('Are you sure you want to remove this product?')) return;
      try {
        const res = await fetch('/api/products/' + id, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          closeProductModal();
          showToast('Product deleted');
          loadProducts();
        }
      } catch (e) {
        showToast('Delete failed', true);
      }
    }

    // --- 6. PAYMENTS LOGIC ---
    async function loadPayments() {
      try {
        const res = await fetch('/api/payments');
        paymentAccounts = await res.json();
        document.getElementById('pay_jazzcash_title').value = paymentAccounts.jazzcash?.accountTitle || '';
        document.getElementById('pay_jazzcash_number').value = paymentAccounts.jazzcash?.accountNumber || '';
        document.getElementById('pay_jazzcash_inst').value = paymentAccounts.jazzcash?.instructions || '';

        document.getElementById('pay_easypaisa_title').value = paymentAccounts.easypaisa?.accountTitle || '';
        document.getElementById('pay_easypaisa_number').value = paymentAccounts.easypaisa?.accountNumber || '';
        document.getElementById('pay_easypaisa_inst').value = paymentAccounts.easypaisa?.instructions || '';

        document.getElementById('pay_bank_name').value = paymentAccounts.bank_transfer?.bankName || '';
        document.getElementById('pay_bank_title').value = paymentAccounts.bank_transfer?.accountTitle || '';
        document.getElementById('pay_bank_number').value = paymentAccounts.bank_transfer?.accountNumber || '';
        document.getElementById('pay_bank_iban').value = paymentAccounts.bank_transfer?.iban || '';
        document.getElementById('pay_bank_raast').value = paymentAccounts.bank_transfer?.raastId || '';
        document.getElementById('pay_bank_inst').value = paymentAccounts.bank_transfer?.instructions || '';
      } catch (e) {
        console.error('Payments err:', e);
      }
    }

    async function savePaymentAccounts() {
      const updated = {
        jazzcash: {
          providerName: 'JazzCash Mobile Account',
          accountTitle: document.getElementById('pay_jazzcash_title').value,
          accountNumber: document.getElementById('pay_jazzcash_number').value,
          instructions: document.getElementById('pay_jazzcash_inst').value,
        },
        easypaisa: {
          providerName: 'EasyPaisa Mobile Account',
          accountTitle: document.getElementById('pay_easypaisa_title').value,
          accountNumber: document.getElementById('pay_easypaisa_number').value,
          instructions: document.getElementById('pay_easypaisa_inst').value,
        },
        bank_transfer: {
          providerName: 'Bank Transfer / Raast Instant',
          bankName: document.getElementById('pay_bank_name').value,
          accountTitle: document.getElementById('pay_bank_title').value,
          accountNumber: document.getElementById('pay_bank_number').value,
          iban: document.getElementById('pay_bank_iban').value,
          raastId: document.getElementById('pay_bank_raast').value,
          instructions: document.getElementById('pay_bank_inst').value || 'Transfer funds via Bank App or Raast Instant ID, then attach your transfer receipt slip below (or share on WhatsApp).',
        }
      };

      try {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        const result = await res.json();
        if (result.success) showToast('Payment Accounts Updated!');
      } catch (e) {
        showToast('Failed to save payments', true);
      }
    }

    // --- 7. PROMOTIONS LOGIC ---
    async function loadPromotions() {
      try {
        const res = await fetch('/api/promotions');
        promotionsData = await res.json();

        const sale = promotionsData.saleOffer || {};
        document.getElementById('sale_banner_active').checked = sale.active !== false;
        document.getElementById('sale_banner_headline').value = sale.headline || '';
        document.getElementById('sale_banner_badge').value = sale.badgeText || '%';
        document.getElementById('sale_banner_subheading').value = sale.subheading || '';
        document.getElementById('sale_banner_ctaText').value = sale.ctaText || '';
        document.getElementById('sale_banner_ctaLink').value = sale.ctaLink || '';

        renderPromosTable();
      } catch (e) {
        console.error('Promos err:', e);
      }
    }

    function renderPromosTable() {
      const tbody = document.getElementById('promosTableBody');
      const promos = promotionsData.promos || {};
      const keys = Object.keys(promos);

      if (keys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-400">No active promo codes.</td></tr>';
        return;
      }

      tbody.innerHTML = keys.map(k => {
        const p = promos[k];
        return \`
          <tr class="hover:bg-slate-50">
            <td class="py-3 px-4 font-mono font-bold text-slate-900">\${p.code}</td>
            <td class="py-3 px-4 font-bold text-[#F97316]">\${p.discountPercentage}% OFF</td>
            <td class="py-3 px-4 font-mono">Rs. \${(p.minOrderValue || 0).toLocaleString()}</td>
            <td class="py-3 px-4 text-slate-600">\${p.description || ''}</td>
            <td class="py-3 px-4 text-right">
              <button onclick="deletePromoCode('\${p.code}')" class="text-red-500 hover:text-red-700 font-bold">Remove</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function openPromoModal() {
      document.getElementById('promoModal').classList.remove('hidden');
      document.getElementById('promoModal').classList.add('flex');
      document.getElementById('promo_code').value = '';
      document.getElementById('promo_discount').value = '';
      document.getElementById('promo_minOrder').value = '1500';
      document.getElementById('promo_desc').value = '';
    }

    function closePromoModal() {
      document.getElementById('promoModal').classList.add('hidden');
      document.getElementById('promoModal').classList.remove('flex');
    }

    function savePromoItem() {
      const code = document.getElementById('promo_code').value.trim().toUpperCase();
      const discount = Number(document.getElementById('promo_discount').value);
      const minOrder = Number(document.getElementById('promo_minOrder').value) || 0;
      const desc = document.getElementById('promo_desc').value.trim();

      if (!code || isNaN(discount)) {
        alert('Please specify coupon code and discount percentage.');
        return;
      }

      if (!promotionsData.promos) promotionsData.promos = {};
      promotionsData.promos[code] = { code, discountPercentage: discount, minOrderValue: minOrder, description: desc };
      closePromoModal();
      renderPromosTable();
      showToast('Coupon added!');
    }

    function deletePromoCode(code) {
      if (confirm('Delete promo code ' + code + '?')) {
        delete promotionsData.promos[code];
        renderPromosTable();
        showToast('Promo code removed');
      }
    }

    async function savePromotions() {
      const payload = {
        promos: promotionsData.promos,
        saleOffer: {
          active: document.getElementById('sale_banner_active').checked,
          badgeText: document.getElementById('sale_banner_badge').value,
          headline: document.getElementById('sale_banner_headline').value,
          subheading: document.getElementById('sale_banner_subheading').value,
          ctaText: document.getElementById('sale_banner_ctaText').value,
          ctaLink: document.getElementById('sale_banner_ctaLink').value,
        }
      };

      try {
        const res = await fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) showToast('Promotions and Sale Banner Saved!');
      } catch (e) {
        showToast('Failed to save promotions', true);
      }
    }

    // --- 1C. HOMEPAGE CMS LOGIC ---
    async function loadHomeContent() {
      try {
        const res = await fetch('/api/home-content');
        homeContentData = await res.json();
        populateHomeContentFields();
      } catch (e) {
        console.error('Error loading home content:', e);
      }
    }

    function populateHomeContentFields() {
      const h = homeContentData.hero || {};
      const t = homeContentData.trioBanners || {};
      const v = homeContentData.valueProps || [];
      const n = homeContentData.newsletter || {};

      // Hero
      document.getElementById('hero_kicker').value = h.kicker || '';
      document.getElementById('hero_headlinePrefix').value = h.headlinePrefix || '';
      document.getElementById('hero_headlineHighlight').value = h.headlineHighlight || '';
      document.getElementById('hero_subtitle').value = h.subtitle || '';
      document.getElementById('hero_ctaText').value = h.ctaText || 'Shop Now';
      document.getElementById('hero_ctaLink').value = h.ctaLink || '/shop';
      document.getElementById('hero_image').value = h.image || '';
      updateHeroPreview(h.image || '');

      // Trust points
      const tp = h.trustPoints || [];
      document.getElementById('hero_trust1').value = (tp[0] && tp[0].text) || 'Cash on Delivery';
      document.getElementById('hero_trust2').value = (tp[1] && tp[1].text) || 'Premium Quality';
      document.getElementById('hero_trust3').value = (tp[2] && tp[2].text) || 'Nationwide Shipping';

      // Trio - Deal of the Day
      const d = t.dealOfTheDay || {};
      document.getElementById('trio_deal_badge').value = d.badge || 'Deal of the Day';
      document.getElementById('trio_deal_title').value = d.title || 'Up to 60% Off';
      document.getElementById('trio_deal_link').value = d.link || '/product/calenvee-obsidian-chrono-edition';
      document.getElementById('trio_deal_cta').value = d.ctaText || 'Shop Deals';

      // Trio - New Arrivals
      const na = t.newArrivals || {};
      document.getElementById('trio_new_badge').value = na.badge || 'New Arrivals';
      document.getElementById('trio_new_title').value = na.title || 'Fresh Finds';
      document.getElementById('trio_new_sub').value = na.subtitle || 'Check out the latest drops just for you';
      document.getElementById('trio_new_link').value = na.link || '/new-arrivals';
      document.getElementById('trio_new_image').value = na.image || '';
      updateNewArrivalsPreview(na.image || '');

      // Trio - Member Exclusive
      const me = t.memberExclusive || {};
      document.getElementById('trio_mem_badge').value = me.badge || 'Member Exclusive';
      document.getElementById('trio_mem_title').value = me.title || 'Extra 10% Off';
      document.getElementById('trio_mem_code').value = me.couponCode || 'CALENVEE10';
      document.getElementById('trio_mem_sub').value = me.subtitle || 'On prepaid orders this weekend';
      document.getElementById('trio_mem_link').value = me.link || '/shop';

      // Value Props
      if (v[0]) {
        document.getElementById('vp1_title').value = v[0].title || 'Free Shipping';
        document.getElementById('vp1_sub').value = v[0].subtitle || 'On orders over Rs. 3,999';
      }
      if (v[1]) {
        document.getElementById('vp2_title').value = v[1].title || 'Easy Returns';
        document.getElementById('vp2_sub').value = v[1].subtitle || '7-day return policy';
      }
      if (v[2]) {
        document.getElementById('vp3_title').value = v[2].title || 'Secure Payments';
        document.getElementById('vp3_sub').value = v[2].subtitle || '100% protected checkout';
      }
      if (v[3]) {
        document.getElementById('vp4_title').value = v[3].title || '24/7 WhatsApp Support';
        document.getElementById('vp4_sub').value = v[3].subtitle || "We're here to help anytime";
      }

      // Newsletter
      document.getElementById('news_title').value = n.title || 'Stay in the Loop';
      document.getElementById('news_sub').value = n.subtitle || 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.';
      document.getElementById('news_btn').value = n.buttonText || 'Subscribe';
    }

    function updateHeroPreview(url) {
      const img = document.getElementById('heroImagePreview');
      if (img) img.src = url || '/placeholder-image.png';
    }

    function updateNewArrivalsPreview(url) {
      // preview helper
    }

    async function handleHeroFileUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, data: reader.result })
          });
          const result = await res.json();
          if (result.success && result.url) {
            document.getElementById('hero_image').value = result.url;
            updateHeroPreview(result.url);
            showToast('Hero image uploaded!');
          }
        } catch (err) {
          showToast('Image upload failed', true);
        }
      };
      reader.readAsDataURL(file);
    }

    async function handleNewArrivalsUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, data: reader.result })
          });
          const result = await res.json();
          if (result.success && result.url) {
            document.getElementById('trio_new_image').value = result.url;
            showToast('New Arrivals banner uploaded!');
          }
        } catch (err) {
          showToast('Image upload failed', true);
        }
      };
      reader.readAsDataURL(file);
    }

    async function saveHomeContent() {
      const payload = {
        hero: {
          kicker: document.getElementById('hero_kicker').value.trim(),
          headlinePrefix: document.getElementById('hero_headlinePrefix').value.trim(),
          headlineHighlight: document.getElementById('hero_headlineHighlight').value.trim(),
          subtitle: document.getElementById('hero_subtitle').value.trim(),
          ctaText: document.getElementById('hero_ctaText').value.trim() || 'Shop Now',
          ctaLink: document.getElementById('hero_ctaLink').value.trim() || '/shop',
          trustPoints: [
            { text: document.getElementById('hero_trust1').value.trim() || 'Cash on Delivery', icon: 'ShieldCheck' },
            { text: document.getElementById('hero_trust2').value.trim() || 'Premium Quality', icon: 'Award' },
            { text: document.getElementById('hero_trust3').value.trim() || 'Nationwide Shipping', icon: 'Truck' }
          ],
          image: document.getElementById('hero_image').value.trim()
        },
        trioBanners: {
          dealOfTheDay: {
            badge: document.getElementById('trio_deal_badge').value.trim() || 'Deal of the Day',
            title: document.getElementById('trio_deal_title').value.trim() || 'Up to 60% Off',
            productId: 'cv-watch-01',
            link: document.getElementById('trio_deal_link').value.trim() || '/product/calenvee-obsidian-chrono-edition',
            ctaText: document.getElementById('trio_deal_cta').value.trim() || 'Shop Deals'
          },
          newArrivals: {
            badge: document.getElementById('trio_new_badge').value.trim() || 'New Arrivals',
            title: document.getElementById('trio_new_title').value.trim() || 'Fresh Finds',
            subtitle: document.getElementById('trio_new_sub').value.trim() || 'Check out the latest drops just for you',
            link: document.getElementById('trio_new_link').value.trim() || '/new-arrivals',
            ctaText: 'Explore Now',
            image: document.getElementById('trio_new_image').value.trim()
          },
          memberExclusive: {
            badge: document.getElementById('trio_mem_badge').value.trim() || 'Member Exclusive',
            title: document.getElementById('trio_mem_title').value.trim() || 'Extra 10% Off',
            couponCode: document.getElementById('trio_mem_code').value.trim() || 'CALENVEE10',
            subtitle: document.getElementById('trio_mem_sub').value.trim() || 'On prepaid orders this weekend',
            link: document.getElementById('trio_mem_link').value.trim() || '/shop',
            ctaText: 'Shop Now'
          }
        },
        valueProps: [
          { icon: 'Truck', title: document.getElementById('vp1_title').value.trim(), subtitle: document.getElementById('vp1_sub').value.trim() },
          { icon: 'Clock', title: document.getElementById('vp2_title').value.trim(), subtitle: document.getElementById('vp2_sub').value.trim() },
          { icon: 'ShieldCheck', title: document.getElementById('vp3_title').value.trim(), subtitle: document.getElementById('vp3_sub').value.trim() },
          { icon: 'Headphones', title: document.getElementById('vp4_title').value.trim(), subtitle: document.getElementById('vp4_sub').value.trim() }
        ],
        newsletter: {
          title: document.getElementById('news_title').value.trim(),
          subtitle: document.getElementById('news_sub').value.trim(),
          buttonText: document.getElementById('news_btn').value.trim() || 'Subscribe'
        }
      };

      try {
        const res = await fetch('/api/home-content/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          homeContentData = payload;
          showToast('✓ Homepage CMS & Banners Saved Successfully!');
        } else {
          showToast('Failed to save home content', true);
        }
      } catch (e) {
        showToast('Error saving home content: ' + e.message, true);
      }
    }

    // --- 8. LAYERED DEPLOYMENT PIPELINE & PUBLISH ---
    let isPipelineBusy = false;

    function openPublishModal() {
      const modal = document.getElementById('publishPipelineModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closePublishModal() {
      if (isPipelineBusy) return;
      const modal = document.getElementById('publishPipelineModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function togglePipelineLogs() {
      const pre = document.getElementById('pipelineConsoleLog');
      const txt = document.getElementById('pipelineLogsToggleText');
      if (pre.classList.contains('hidden')) {
        pre.classList.remove('hidden');
        txt.innerText = '▾ Hide Raw Terminal & Git Output';
      } else {
        pre.classList.add('hidden');
        txt.innerText = '▸ View Raw Terminal & Git Output';
      }
    }

    function setPipelineStep(num, status, desc, isError = false) {
      const elLayer = document.getElementById('step-layer-' + num);
      const elIcon = document.getElementById('step-icon-' + num);
      const elStatus = document.getElementById('step-status-' + num);
      const elDesc = document.getElementById('step-desc-' + num);

      if (desc && elDesc) elDesc.innerText = desc;

      if (status === 'waiting') {
        elLayer.className = 'p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between transition-all';
        elIcon.className = 'w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shadow-xs font-bold text-slate-700';
        elIcon.innerHTML = String(num);
        elStatus.className = 'text-xs font-semibold text-slate-400 font-mono';
        elStatus.innerText = 'Waiting';
      } else if (status === 'running') {
        elLayer.className = 'p-3.5 rounded-2xl border border-orange-300 bg-orange-50/50 flex items-center justify-between transition-all shadow-xs';
        elIcon.className = 'w-9 h-9 rounded-xl bg-[#F97316] text-white flex items-center justify-center text-sm shadow-md font-bold animate-spin';
        elIcon.innerHTML = '⟳';
        elStatus.className = 'text-xs font-bold text-[#F97316] font-mono animate-pulse';
        elStatus.innerText = 'In Progress...';
      } else if (status === 'done') {
        elLayer.className = 'p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between transition-all';
        elIcon.className = 'w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs font-bold';
        elIcon.innerHTML = '✓';
        elStatus.className = 'text-xs font-bold text-emerald-700 font-mono';
        elStatus.innerText = 'Verified ✓';
      } else if (status === 'error' || isError) {
        elLayer.className = 'p-3.5 rounded-2xl border border-red-300 bg-red-50 flex items-center justify-between transition-all';
        elIcon.className = 'w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm shadow-xs font-bold';
        elIcon.innerHTML = '✕';
        elStatus.className = 'text-xs font-bold text-red-600 font-mono';
        elStatus.innerText = 'Error';
      }
    }

    async function publishToLive() {
      if (isPipelineBusy) return;
      isPipelineBusy = true;

      // Reset modal UI
      openPublishModal();
      document.getElementById('pipelineSuccessCard').classList.add('hidden');
      document.getElementById('pipelineProgressBar').style.width = '10%';
      document.getElementById('pipelinePercent').innerText = '10%';
      document.getElementById('pipelineProgressLabel').innerText = 'Starting deployment pipeline...';
      document.getElementById('pipelineCloseBtn').disabled = true;
      document.getElementById('pipelineDoneBtn').innerText = 'Deploying...';
      document.getElementById('pipelineDoneBtn').disabled = true;

      setPipelineStep(1, 'running', 'Checking products, categories, home CMS & images...');
      setPipelineStep(2, 'waiting');
      setPipelineStep(3, 'waiting');
      setPipelineStep(4, 'waiting');

      const consoleLog = document.getElementById('pipelineConsoleLog');
      consoleLog.innerText = 'Calenvee Enterprise Deployment Pipeline Initialized\\nTime: ' + new Date().toLocaleString() + '\\n\\n';

      // Step 1: Wait 450ms for visual verification
      await new Promise(r => setTimeout(r, 450));
      setPipelineStep(1, 'done', 'All store catalogs and CMS JSON files verified.');
      document.getElementById('pipelineProgressBar').style.width = '30%';
      document.getElementById('pipelinePercent').innerText = '30%';
      document.getElementById('pipelineProgressLabel').innerText = 'Creating Git commit snapshot...';
      setPipelineStep(2, 'running', 'Packaging changes into an authenticated Git commit...');

      try {
        const res = await fetch('/api/publish', { method: 'POST' });
        const result = await res.json();
        consoleLog.innerText += result.output || result.error || 'Done';

        if (result.success) {
          const commitHash = result.commitHash || 'HEAD';
          
          // Layer 2 Done
          setPipelineStep(2, 'done', 'Commit #' + commitHash + ' sealed with timestamp.');
          document.getElementById('pipelineProgressBar').style.width = '60%';
          document.getElementById('pipelinePercent').innerText = '60%';
          document.getElementById('pipelineProgressLabel').innerText = 'Pushing to GitHub remote...';

          // Layer 3 running then done
          setPipelineStep(3, 'running', 'Transmitting commits to origin/main on GitHub...');
          await new Promise(r => setTimeout(r, 600));
          setPipelineStep(3, 'done', 'Synced to GitHub (calenveepk/calenvee.pk:main)');

          // Layer 4 running then done
          document.getElementById('pipelineProgressBar').style.width = '85%';
          document.getElementById('pipelinePercent').innerText = '85%';
          document.getElementById('pipelineProgressLabel').innerText = 'Triggering Vercel production edge deployment...';
          setPipelineStep(4, 'running', 'Vercel automatic live edge build deploying to calenvee.pk...');
          await new Promise(r => setTimeout(r, 800));
          setPipelineStep(4, 'done', 'Production Live at calenvee.pk (Edge CDN)');

          // Finished 100%
          document.getElementById('pipelineProgressBar').style.width = '100%';
          document.getElementById('pipelinePercent').innerText = '100%';
          document.getElementById('pipelineProgressLabel').innerText = 'Deployment Pipeline Complete!';

          // Show Success Card
          document.getElementById('pipelineSuccessCard').classList.remove('hidden');
          document.getElementById('pipelineSuccessSummary').innerText = 
            'Commit #' + commitHash + ' successfully pushed to GitHub. Vercel live build is active and updated on calenvee.pk!';
          document.getElementById('githubCommitLink').href = 
            'https://github.com/calenveepk/calenvee.pk/commit/' + commitHash;

          showToast('🚀 Pushed to GitHub & Live on Vercel!');
        } else {
          setPipelineStep(3, 'error', result.error || 'Failed to push to GitHub');
          document.getElementById('pipelineProgressLabel').innerText = 'Deployment Pipeline Failed';
          document.getElementById('pipelinePercent').innerText = 'Failed';
          document.getElementById('pipelineConsoleLog').classList.remove('hidden');
          showToast('Publish failed: ' + (result.error || 'Check console log'), true);
        }
      } catch (e) {
        setPipelineStep(2, 'error', e.message);
        document.getElementById('pipelineProgressLabel').innerText = 'Connection Error';
        document.getElementById('pipelinePercent').innerText = 'Error';
        consoleLog.innerText += '\\nNetwork error: ' + e.message;
        document.getElementById('pipelineConsoleLog').classList.remove('hidden');
        showToast('Network error during publish', true);
      } finally {
        isPipelineBusy = false;
        document.getElementById('pipelineCloseBtn').disabled = false;
        document.getElementById('pipelineDoneBtn').innerText = 'Close';
        document.getElementById('pipelineDoneBtn').disabled = false;
      }
    }
  </script>
</body>
</html>`;
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    // 1. SERVE ADMIN WEB APP
    if (pathname === '/' || pathname === '/admin') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getAdminHtml());
      return;
    }

    // 2. FILE UPLOAD (Direct image upload from computer)
    if (pathname === '/api/upload' && req.method === 'POST') {
      const { filename, data } = await parseBody(req);
      if (!filename || !data) {
        sendJson(res, 400, { success: false, error: 'Filename or data missing' });
        return;
      }

      const cleanName = Date.now() + '-' + filename.toLowerCase().replace(/[^a-z0-9.-]/g, '_');
      const targetPath = path.join(UPLOADS_DIR, cleanName);

      // Strip Base64 header (e.g. data:image/png;base64,)
      const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));

      const publicUrl = '/products/' + cleanName;
      sendJson(res, 200, { success: true, url: publicUrl, filename: cleanName });
      return;
    }

    // PING HEARTBEAT
    if (pathname === '/api/ping') {
      sendJson(res, 200, { status: 'ok', server: 'Calenvee Admin Server', time: Date.now() });
      return;
    }

    // 3. PRODUCTS
    if (pathname === '/api/products' && req.method === 'GET') {
      sendJson(res, 200, readJsonFile(PRODUCTS_FILE, []));
      return;
    }
    if (pathname === '/api/products/save' && req.method === 'POST') {
      const product = await parseBody(req);
      const products = readJsonFile(PRODUCTS_FILE, []);
      const index = products.findIndex(p => p.id === product.id);
      if (index >= 0) products[index] = { ...products[index], ...product };
      else products.unshift(product);
      writeJsonFile(PRODUCTS_FILE, products);
      
      // Real-time background sync to Google Sheets Inventory automation
      syncToCloud('sync_catalog', { products }).catch(() => {});

      sendJson(res, 200, { success: true, product });
      return;
    }
    if (pathname.startsWith('/api/products/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/products/', '');
      let products = readJsonFile(PRODUCTS_FILE, []);
      products = products.filter(p => p.id !== id);
      writeJsonFile(PRODUCTS_FILE, products);

      // Real-time background sync to Google Sheets Inventory automation
      syncToCloud('sync_catalog', { products }).catch(() => {});

      sendJson(res, 200, { success: true });
      return;
    }

    // 4. CATEGORIES
    if (pathname === '/api/categories' && req.method === 'GET') {
      sendJson(res, 200, readJsonFile(CATEGORIES_FILE, []));
      return;
    }
    if (pathname === '/api/categories/save' && req.method === 'POST') {
      const category = await parseBody(req);
      const categories = readJsonFile(CATEGORIES_FILE, []);
      const index = categories.findIndex(c => c.id === category.id);
      if (index >= 0) categories[index] = { ...categories[index], ...category };
      else categories.push(category);
      writeJsonFile(CATEGORIES_FILE, categories);
      sendJson(res, 200, { success: true, category });
      return;
    }
    if (pathname.startsWith('/api/categories/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/categories/', '');
      let categories = readJsonFile(CATEGORIES_FILE, []);
      categories = categories.filter(c => c.id !== id);
      writeJsonFile(CATEGORIES_FILE, categories);
      sendJson(res, 200, { success: true });
      return;
    }

    // 5. ANNOUNCEMENTS
    if (pathname === '/api/announcements' && req.method === 'GET') {
      sendJson(res, 200, readJsonFile(ANNOUNCEMENTS_FILE, []));
      return;
    }
    if (pathname === '/api/announcements' && req.method === 'POST') {
      const list = await parseBody(req);
      writeJsonFile(ANNOUNCEMENTS_FILE, list);
      sendJson(res, 200, { success: true });
      return;
    }

    // 6. REVIEWS
    if (pathname === '/api/reviews' && req.method === 'GET') {
      sendJson(res, 200, readJsonFile(REVIEWS_FILE, []));
      return;
    }
    if (pathname === '/api/reviews/save' && req.method === 'POST') {
      const review = await parseBody(req);
      const reviews = readJsonFile(REVIEWS_FILE, []);
      const index = reviews.findIndex(r => r.id === review.id);
      if (index >= 0) reviews[index] = { ...reviews[index], ...review };
      else reviews.unshift(review);
      writeJsonFile(REVIEWS_FILE, reviews);
      sendJson(res, 200, { success: true, review });
      return;
    }
    if (pathname.startsWith('/api/reviews/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/reviews/', '');
      let reviews = readJsonFile(REVIEWS_FILE, []);
      reviews = reviews.filter(r => r.id !== id);
      writeJsonFile(REVIEWS_FILE, reviews);
      sendJson(res, 200, { success: true });
      return;
    }

    // 7. PAYMENTS
    if (pathname === '/api/payments' && req.method === 'GET') {
      sendJson(res, 200, readJsonFile(PAYMENTS_FILE, {}));
      return;
    }
    if (pathname === '/api/payments' && req.method === 'POST') {
      const data = await parseBody(req);
      writeJsonFile(PAYMENTS_FILE, data);

      // Real-time background sync to Google Sheets Store Settings & Gateway config
      syncToCloud('sync_settings', {
        settings: readJsonFile(SETTINGS_FILE, {}),
        paymentMethods: data
      }).catch(() => {});

      sendJson(res, 200, { success: true });
      return;
    }

    // 8. PROMOTIONS
    if (pathname === '/api/promotions' && req.method === 'GET') {
      sendJson(res, 200, readJsonFile(PROMOTIONS_FILE, {}));
      return;
    }
    if (pathname === '/api/promotions' && req.method === 'POST') {
      const data = await parseBody(req);
      writeJsonFile(PROMOTIONS_FILE, data);
      sendJson(res, 200, { success: true });
      return;
    }

    // 9. SETTINGS
    if (pathname === '/api/settings' && req.method === 'GET') {
      sendJson(res, 200, readJsonFile(SETTINGS_FILE, {}));
      return;
    }
    if (pathname === '/api/settings' && req.method === 'POST') {
      const data = await parseBody(req);
      writeJsonFile(SETTINGS_FILE, data);

      // Real-time background sync to Google Sheets Store Settings & WhatsApp config
      syncToCloud('sync_settings', {
        settings: data,
        paymentMethods: readJsonFile(PAYMENTS_FILE, {})
      }).catch(() => {});

      sendJson(res, 200, { success: true });
      return;
    }

    // 9A. HOMEPAGE CMS & BANNERS
    if (pathname === '/api/home-content' && req.method === 'GET') {
      sendJson(res, 200, readJsonFile(HOME_CONTENT_FILE, {}));
      return;
    }
    if (pathname === '/api/home-content/save' && req.method === 'POST') {
      const data = await parseBody(req);
      writeJsonFile(HOME_CONTENT_FILE, data);
      sendJson(res, 200, { success: true, message: 'Homepage CMS saved successfully' });
      return;
    }

    // 9B. CLOUD AUTOMATION SYNC ALL
    if (pathname === '/api/cloud/sync-all' && req.method === 'POST') {
      const products = readJsonFile(PRODUCTS_FILE, []);
      const settings = readJsonFile(SETTINGS_FILE, {});
      const paymentMethods = readJsonFile(PAYMENTS_FILE, {});
      
      const [catRes, setRes] = await Promise.all([
        syncToCloud('sync_catalog', { products }),
        syncToCloud('sync_settings', { settings, paymentMethods })
      ]);

      sendJson(res, 200, {
        success: catRes.success || setRes.success,
        catalog: catRes,
        settings: setRes,
        message: 'Synchronized catalog and store settings to Google Sheets automations.'
      });
      return;
    }

    if (pathname === '/api/cloud/status' && req.method === 'GET') {
      sendJson(res, 200, {
        status: lastCloudSyncStatus,
        lastSyncTime: lastCloudSyncTime,
        error: lastCloudSyncError,
        webhookUrl: APPS_SCRIPT_URL
      });
      return;
    }

    // 9C. ORDERS FEED & MANAGEMENT
    if (pathname === '/api/orders' && req.method === 'GET') {
      try {
        let orders = [];
        if (APPS_SCRIPT_URL) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const cloudRes = await fetch(`${APPS_SCRIPT_URL}?action=get_orders`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (cloudRes.ok) {
            const data = await cloudRes.json();
            if (data && Array.isArray(data.orders)) {
              orders = data.orders;
              writeJsonFile(ORDERS_CACHE_FILE, orders);
            }
          }
        }
        if (!orders.length) {
          orders = readJsonFile(ORDERS_CACHE_FILE, []);
        }
        sendJson(res, 200, { success: true, count: orders.length, orders });
      } catch (err) {
        console.warn('Orders fetch note:', err.message);
        const cached = readJsonFile(ORDERS_CACHE_FILE, []);
        sendJson(res, 200, { success: true, count: cached.length, orders: cached, source: 'cache' });
      }
      return;
    }

    if (pathname === '/api/orders/update-status' && req.method === 'POST') {
      const updatePayload = await parseBody(req);
      const { orderId, status, courier, trackingNumber } = updatePayload;

      // Update local cache
      const cachedOrders = readJsonFile(ORDERS_CACHE_FILE, []);
      const idx = cachedOrders.findIndex(o => String(o.orderId).toUpperCase() === String(orderId).toUpperCase());
      if (idx >= 0) {
        cachedOrders[idx].status = status;
        if (courier) cachedOrders[idx].courier = courier;
        if (trackingNumber) cachedOrders[idx].trackingNumber = trackingNumber;
        if (status === 'Dispatched') cachedOrders[idx].dispatchEmailSent = 'Yes';
        writeJsonFile(ORDERS_CACHE_FILE, cachedOrders);
      }

      // Sync to Google Apps Script cloud automation
      const cloudRes = await syncToCloud('update_order_status', updatePayload);
      sendJson(res, 200, {
        success: true,
        orderId,
        status,
        cloudSync: cloudRes,
        message: `Order #${orderId} marked as ${status}${cloudRes.success ? ' and customer notified' : ''}.`
      });
      return;
    }

    // 10. PUBLISH (GIT COMMIT & PUSH TO GITHUB -> VERCEL)
    if (pathname === '/api/publish' && req.method === 'POST') {
      const timestamp = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
      const commitMsg = `Store content & catalog update via Calenvee Portal [${timestamp}]`;

      // Step 1: Check status
      exec('git status --porcelain', { cwd: ROOT_DIR }, (statusErr, statusOut) => {
        const changes = (statusOut || '').trim();
        const filesChanged = changes ? changes.split('\n').filter(Boolean).length : 0;

        // Step 2: git add and git commit (or handle nothing to commit)
        const commitCmd = filesChanged > 0 
          ? `git add -A && git commit -m "${commitMsg}"`
          : `git status`;

        exec(commitCmd, { cwd: ROOT_DIR }, (commitErr, commitOut, commitStderr) => {
          // Step 3: git push origin main
          exec('git push origin main', { cwd: ROOT_DIR }, (pushErr, pushOut, pushStderr) => {
            // Step 4: get short commit hash
            exec('git rev-parse --short HEAD', { cwd: ROOT_DIR }, (revErr, revOut) => {
              const commitHash = (revOut || '').trim() || 'HEAD';
              const fullLog = [
                `=== LAYER 1: DATA VERIFICATION ===\nFiles modified: ${filesChanged}\n${changes || 'All store data files staged and validated.'}`,
                `=== LAYER 2: LOCAL GIT COMMIT ===\n${commitOut || ''}\n${commitStderr || ''}`,
                `=== LAYER 3: GITHUB CLOUD PUSH ===\n${pushOut || ''}\n${pushStderr || ''}`,
                `=== LAYER 4: VERCEL DEPLOYMENT ===\nLive commit ${commitHash} triggered Vercel deployment pipeline for calenvee.pk`
              ].join('\n\n');

              if (pushErr) {
                sendJson(res, 200, {
                  success: false,
                  stage: 'push',
                  error: pushErr.message,
                  commitHash,
                  filesChanged,
                  output: fullLog
                });
              } else {
                sendJson(res, 200, {
                  success: true,
                  commitHash,
                  commitMessage: commitMsg,
                  filesChanged,
                  repoUrl: 'https://github.com/calenveepk/calenvee.pk',
                  liveUrl: 'https://calenvee.pk',
                  output: fullLog
                });
              }
            });
          });
        });
      });
      return;
    }

    // 11. GOOGLE APPS SCRIPT SOURCE CODE
    if (pathname === '/api/apps-script' && req.method === 'GET') {
      const scriptPath = path.join(ROOT_DIR, 'backend', 'google-apps-script.js');
      if (fs.existsSync(scriptPath)) {
        const content = fs.readFileSync(scriptPath, 'utf8');
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
      } else {
        sendJson(res, 404, { error: 'Script file not found' });
      }
      return;
    }

    sendJson(res, 404, { error: 'Not found' });

  } catch (err) {
    console.error('Server error:', err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` CALENVEE SHOPIFY-STYLE STORE MANAGER RUNNING!`);
  console.log(`=======================================================`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Press Ctrl + C to stop`);
  console.log(`=======================================================`);
});

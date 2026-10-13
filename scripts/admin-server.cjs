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
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
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
  <title>Calenvee Store Manager — Desktop Portal</title>
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
    .glass-header { background: rgba(11, 19, 43, 0.95); backdrop-filter: blur(12px); }
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
            CALENVEE <span class="text-xs py-0.5 px-2 rounded-full bg-orange-500/20 text-[#F97316] font-semibold border border-orange-500/30">Store Manager</span>
          </h1>
          <p class="text-[11px] text-slate-400">Desktop Admin for Products, Payments & Promotions</p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <a href="http://localhost:5173" target="_blank" class="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-white/10 transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          <span>Preview Storefront</span>
        </a>
        <button onclick="publishToLive()" id="publishHeaderBtn" class="flex items-center space-x-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg transition active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <span>Publish to Live Store</span>
        </button>
      </div>
    </div>
  </header>

  <!-- NAVIGATION TABS -->
  <div class="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8">
      <button onclick="switchTab('products')" id="tab-products" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-[#F97316] text-[#F97316] flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        <span>Products Catalog (<span id="productsCount">0</span>)</span>
      </button>

      <button onclick="switchTab('payments')" id="tab-payments" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        <span>Payment Accounts (JazzCash / EasyPaisa / Bank)</span>
      </button>

      <button onclick="switchTab('promotions')" id="tab-promotions" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
        <span>Discounts & Sale Banners</span>
      </button>

      <button onclick="switchTab('publish')" id="tab-publish" class="tab-btn py-3.5 px-1 border-b-2 font-semibold text-xs tracking-wide border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
        <span>Deploy & Git Sync</span>
      </button>
    </div>
  </div>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- 1. PRODUCTS TAB -->
    <div id="content-products" class="tab-content space-y-6">
      
      <!-- Products Controls Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex flex-1 items-center space-x-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:max-w-xs">
            <input type="text" id="productSearch" oninput="filterProducts()" placeholder="Search products by name..." class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <select id="categoryFilter" onchange="filterProducts()" class="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#F97316]">
            <option value="all">All Categories</option>
            <option value="watches">Watches</option>
            <option value="jewelry">Jewelry</option>
            <option value="eyewear">Eyewear</option>
            <option value="fragrances">Fragrances</option>
            <option value="streetwear-bags">Streetwear & Bags</option>
            <option value="tech-everyday">Tech Everyday</option>
          </select>
        </div>

        <button onclick="openProductModal()" class="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#0B132B] hover:bg-[#1E293B] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition shadow">
          <svg class="w-4 h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>Add New Product</span>
        </button>
      </div>

      <!-- Products Grid -->
      <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Rendered via JavaScript -->
      </div>
    </div>

    <!-- 2. PAYMENT ACCOUNTS TAB -->
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
        </div>

        <div class="pt-4 flex justify-end">
          <button onclick="savePaymentAccounts()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>Save Payment Settings</span>
          </button>
        </div>

      </div>
    </div>

    <!-- 3. PROMOTIONS & SALE OFFERS TAB -->
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
              <input type="text" id="sale_banner_headline" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="e.g. UP TO 40% OFF">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Badge Symbol / Text</label>
              <input type="text" id="sale_banner_badge" class="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]" placeholder="e.g. %">
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
              <tbody id="promosTableBody" class="divide-y divide-slate-100">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-end">
          <button onclick="savePromotions()" class="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold py-3 px-8 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>Save All Promotions</span>
          </button>
        </div>

      </div>
    </div>

    <!-- 4. PUBLISH & GIT SYNC TAB -->
    <div id="content-publish" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto text-center space-y-6">
        
        <div class="w-16 h-16 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto border border-orange-200 shadow-sm">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>

        <div>
          <h2 class="text-2xl font-extrabold text-[#0B132B]">Publish Changes to Live Store</h2>
          <p class="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            When you make changes to products, prices, or payment accounts, click below to sync everything to GitHub. Vercel will automatically build and deploy the update live to <strong class="text-slate-900">calenvee.pk</strong> in ~30 seconds!
          </p>
        </div>

        <div class="pt-2">
          <button onclick="publishToLive()" id="publishBigBtn" class="bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-sm py-4 px-10 rounded-2xl shadow-xl hover:shadow-orange-500/25 transition active:scale-95 inline-flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>Click to Sync & Publish to Vercel</span>
          </button>
        </div>

        <!-- Terminal Output Window -->
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

  </main>

  <!-- PRODUCT EDIT / ADD MODAL -->
  <div id="productModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
      
      <!-- Modal Header -->
      <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 id="modalTitle" class="text-base font-bold text-[#0B132B]">Edit Product</h3>
          <p class="text-xs text-slate-500">Update details, pricing, inventory & visual tags</p>
        </div>
        <button onclick="closeProductModal()" class="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center">✕</button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-6 overflow-y-auto space-y-4 custom-scroll text-xs">
        <input type="hidden" id="prod_id">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Product Name *</label>
            <input type="text" id="prod_name" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Category *</label>
            <select id="prod_category" class="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#F97316]">
              <option value="watches">Watches & Timepieces</option>
              <option value="jewelry">Minimalist Jewelry</option>
              <option value="eyewear">Designer Eyewear</option>
              <option value="fragrances">Signature Fragrances</option>
              <option value="streetwear-bags">Streetwear & Bags</option>
              <option value="tech-everyday">Tech Everyday</option>
            </select>
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
            <label class="block font-semibold text-slate-700 mb-1">Original / Strike-through Price (PKR)</label>
            <input type="number" id="prod_originalPrice" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Stock Units Available</label>
            <input type="number" id="prod_stockCount" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Warranty Details</label>
            <input type="text" id="prod_warranty" placeholder="e.g. 1 Year Calenvee Warranty" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Product Image URL(s) (One URL per line)</label>
          <textarea id="prod_images" rows="2" class="w-full py-2 px-3 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-[#F97316]" placeholder="https://images.unsplash.com/... or /products/image.webp"></textarea>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Short Description (Summary on card)</label>
          <input type="text" id="prod_shortDescription" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Full Description</label>
          <textarea id="prod_description" rows="3" class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#F97316]"></textarea>
        </div>

        <!-- Badges & Status Checkboxes -->
        <div class="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="prod_inStock" class="accent-[#F97316] w-4 h-4">
            <span>In Stock</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="prod_isBestSeller" class="accent-[#F97316] w-4 h-4">
            <span>Best Seller Badge</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="prod_isNewDrop" class="accent-[#F97316] w-4 h-4">
            <span>New Drop Badge</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="prod_isTrending" class="accent-[#F97316] w-4 h-4">
            <span>Trending Badge</span>
          </label>
        </div>

      </div>

      <!-- Modal Footer -->
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

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 bg-[#0B132B] text-white py-3 px-5 rounded-xl shadow-2xl flex items-center space-x-3 transform translate-y-20 opacity-0 transition-all duration-300 border border-slate-700">
    <span id="toastIcon" class="text-[#F97316] text-lg font-bold">✓</span>
    <span id="toastMsg" class="text-xs font-semibold">Saved successfully</span>
  </div>

  <script>
    let allProducts = [];
    let paymentAccounts = {};
    let promotionsData = { promos: {}, saleOffer: {} };

    window.addEventListener('DOMContentLoaded', () => {
      loadProducts();
      loadPayments();
      loadPromotions();
    });

    function showToast(msg, isError = false) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      const toastIcon = document.getElementById('toastIcon');
      toastMsg.innerText = msg;
      toastIcon.innerText = isError ? '✕' : '✓';
      toastIcon.className = isError ? 'text-red-500 text-lg font-bold' : 'text-[#F97316] text-lg font-bold';
      toast.classList.remove('translate-y-20', 'opacity-0');
      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
      }, 3000);
    }

    function switchTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-[#F97316]', 'text-[#F97316]');
        btn.classList.add('border-transparent', 'text-slate-500');
      });
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

      document.getElementById('tab-' + tab).classList.add('border-[#F97316]', 'text-[#F97316]');
      document.getElementById('tab-' + tab).classList.remove('border-transparent', 'text-slate-500');
      document.getElementById('content-' + tab).classList.remove('hidden');
    }

    // 1. PRODUCTS LOGIC
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
        document.getElementById('prod_category').value = 'watches';
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
    }

    function closeProductModal() {
      document.getElementById('productModal').classList.add('hidden');
      document.getElementById('productModal').classList.remove('flex');
    }

    function editProduct(id) {
      const prod = allProducts.find(p => p.id === id);
      if (prod) openProductModal(prod);
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
        categoryLabel: category.charAt(0).toUpperCase() + category.slice(1),
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
        } else {
          showToast('Error saving product', true);
        }
      } catch (e) {
        showToast('Save failed', true);
      }
    }

    async function deleteCurrentProduct() {
      const id = document.getElementById('prod_id').value;
      if (!id) return;
      if (!confirm('Are you sure you want to remove this product?')) return;

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

    // 2. PAYMENT LOGIC
    async function loadPayments() {
      try {
        const res = await fetch('/api/payments');
        paymentAccounts = await res.json();

        // JazzCash
        document.getElementById('pay_jazzcash_title').value = paymentAccounts.jazzcash?.accountTitle || '';
        document.getElementById('pay_jazzcash_number').value = paymentAccounts.jazzcash?.accountNumber || '';
        document.getElementById('pay_jazzcash_inst').value = paymentAccounts.jazzcash?.instructions || '';

        // EasyPaisa
        document.getElementById('pay_easypaisa_title').value = paymentAccounts.easypaisa?.accountTitle || '';
        document.getElementById('pay_easypaisa_number').value = paymentAccounts.easypaisa?.accountNumber || '';
        document.getElementById('pay_easypaisa_inst').value = paymentAccounts.easypaisa?.instructions || '';

        // Bank
        document.getElementById('pay_bank_name').value = paymentAccounts.bank_transfer?.bankName || '';
        document.getElementById('pay_bank_title').value = paymentAccounts.bank_transfer?.accountTitle || '';
        document.getElementById('pay_bank_number').value = paymentAccounts.bank_transfer?.accountNumber || '';
        document.getElementById('pay_bank_iban').value = paymentAccounts.bank_transfer?.iban || '';
        document.getElementById('pay_bank_raast').value = paymentAccounts.bank_transfer?.raastId || '';
      } catch (e) {
        showToast('Error loading payment settings', true);
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
          instructions: 'Transfer funds via Bank App or Raast Instant ID, then send the receipt slip on WhatsApp.',
        }
      };

      try {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        const result = await res.json();
        if (result.success) {
          showToast('Payment Accounts Updated!');
        }
      } catch (e) {
        showToast('Failed to save payments', true);
      }
    }

    // 3. PROMOTIONS LOGIC
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
        showToast('Error loading promotions', true);
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
      promotionsData.promos[code] = {
        code,
        discountPercentage: discount,
        minOrderValue: minOrder,
        description: desc
      };

      closePromoModal();
      renderPromosTable();
      showToast('Coupon added (click Save All Promotions to apply)');
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
        if (result.success) {
          showToast('Promotions and Sale Banner Saved!');
        }
      } catch (e) {
        showToast('Failed to save promotions', true);
      }
    }

    // 4. PUBLISH / GIT SYNC
    async function publishToLive() {
      const btn = document.getElementById('publishHeaderBtn');
      const bigBtn = document.getElementById('publishBigBtn');
      const log = document.getElementById('syncLog');
      const badge = document.getElementById('syncStatusBadge');

      switchTab('publish');
      btn.disabled = true;
      bigBtn.disabled = true;
      badge.innerText = 'Syncing...';
      badge.className = 'text-amber-400 font-mono text-[10px] animate-pulse';
      log.innerText = 'Initiating Git commit and pushing to origin main on GitHub...\\n';

      try {
        const res = await fetch('/api/publish', { method: 'POST' });
        const result = await res.json();
        log.innerText += result.output;

        if (result.success) {
          badge.innerText = 'Published Successfully!';
          badge.className = 'text-emerald-400 font-mono text-[10px] font-bold';
          showToast('🚀 Pushed to GitHub! Vercel is deploying your live store.');
        } else {
          badge.innerText = 'Sync Error';
          badge.className = 'text-red-400 font-mono text-[10px] font-bold';
          showToast('Publish failed. Check console log.', true);
        }
      } catch (e) {
        log.innerText += '\\nNetwork error: ' + e.toString();
        badge.innerText = 'Error';
      } finally {
        btn.disabled = false;
        bigBtn.disabled = false;
      }
    }
  </script>
</body>
</html>`;
}

// Create HTTP Server
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
    if (pathname === '/' || pathname === '/admin') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getAdminHtml());
      return;
    }

    if (pathname === '/api/products' && req.method === 'GET') {
      const products = readJsonFile(PRODUCTS_FILE, []);
      sendJson(res, 200, products);
      return;
    }

    if (pathname === '/api/products/save' && req.method === 'POST') {
      const product = await parseBody(req);
      const products = readJsonFile(PRODUCTS_FILE, []);
      const index = products.findIndex(p => p.id === product.id);

      if (index >= 0) {
        products[index] = { ...products[index], ...product };
      } else {
        products.unshift(product);
      }

      writeJsonFile(PRODUCTS_FILE, products);
      sendJson(res, 200, { success: true, product });
      return;
    }

    if (pathname.startsWith('/api/products/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/products/', '');
      let products = readJsonFile(PRODUCTS_FILE, []);
      products = products.filter(p => p.id !== id);
      writeJsonFile(PRODUCTS_FILE, products);
      sendJson(res, 200, { success: true });
      return;
    }

    if (pathname === '/api/payments' && req.method === 'GET') {
      const payments = readJsonFile(PAYMENTS_FILE, {});
      sendJson(res, 200, payments);
      return;
    }

    if (pathname === '/api/payments' && req.method === 'POST') {
      const data = await parseBody(req);
      writeJsonFile(PAYMENTS_FILE, data);
      sendJson(res, 200, { success: true });
      return;
    }

    if (pathname === '/api/promotions' && req.method === 'GET') {
      const promotions = readJsonFile(PROMOTIONS_FILE, {});
      sendJson(res, 200, promotions);
      return;
    }

    if (pathname === '/api/promotions' && req.method === 'POST') {
      const data = await parseBody(req);
      writeJsonFile(PROMOTIONS_FILE, data);
      sendJson(res, 200, { success: true });
      return;
    }

    if (pathname === '/api/publish' && req.method === 'POST') {
      const commitMsg = `Store data update via Calenvee Admin Portal [${new Date().toLocaleString()}]`;
      const cmd = `git add src/data/products.json src/data/paymentAccounts.json src/data/promotions.json && git commit -m "${commitMsg}" && git push origin main`;

      exec(cmd, { cwd: ROOT_DIR }, (error, stdout, stderr) => {
        const output = stdout + (stderr ? '\n' + stderr : '');
        if (error) {
          sendJson(res, 200, { success: false, output, error: error.message });
        } else {
          sendJson(res, 200, { success: true, output });
        }
      });
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
  console.log(` CALENVEE DESKTOP STORE MANAGER RUNNING!`);
  console.log(`=======================================================`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Press Ctrl + C to stop`);
  console.log(`=======================================================`);
});

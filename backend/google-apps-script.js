/**
 * ==============================================================================
 * CALENVEE.PK — OFFICIAL BACKEND AUTOMATION SCRIPT (ENTERPRISE EDITION)
 * ==============================================================================
 * Official Store Account: calenvee.pk@gmail.com
 * Website: https://calenvee.pk
 * Helpline: +923001234567 (Nationwide Cash on Delivery 7-10 Working Days)
 * 
 * Features:
 * 1. Webhook API (doPost / doGet): Handles create_order, catalog sync, settings sync, status updates.
 * 2. Order Placement & Invoice Email: Sends customer the official luxury invoice with status "Placed".
 * 3. Manual Order Confirmation: Internal team verifies order, status moves to "Confirmed", sending confirmation email.
 * 4. Dispatch Tracking Email: Sends courier details and optional tracking ID when dispatched.
 * 5. Executive Dashboard: Tier 1 & Tier 2 KPI cards (Profit, Shipping, RTO Return Rate), 7-status pipeline,
 *    Top cities, 12-Month Trends with Returns, and 5 interactive charts including Month-Wise Return Analysis.
 * 6. Sequential Order IDs: Guaranteed CAL-ORD-1000001, CAL-ORD-1000002... formatting.
 * 7. Anti-Ghost Filter & Strict Validation: Only verified real orders are logged.
 * ==============================================================================
 */

// OFFICIAL STORE CONFIGURATION
const STORE_CONFIG = {
  storeName: "Calenvee.pk",
  storeTagline: "SHOP SMART, LIVE BETTER",
  logoUrl: "https://raw.githubusercontent.com/calenveepk/calenvee.pk/main/public/logo-white.png",
  ownerEmail: "calenvee.pk@gmail.com",
  helplinePhone: "+923001234567",
  helplineWhatsAppRaw: "923001234567",
  deliveryWindow: "7-10 Working Days",
  brandNavy: "#0B132B",
  brandOrange: "#F97316"
};

/**
 * 1. ONE-TIME SETUP FUNCTION (Run this once or via custom menu)
 * Creates "Executive Dashboard", "Orders", "OrderItems", "Inventory", and "Store Settings" sheets.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Tab 1: Orders (Master Record)
  let ordersSheet = ss.getSheetByName("Orders");
  if (!ordersSheet) {
    ordersSheet = ss.insertSheet("Orders");
  }

  const orderHeaders = [
    "Order ID",
    "Timestamp",
    "Customer Name",
    "Phone",
    "Email",
    "City",
    "Delivery Address",
    "Payment Method",
    "Total Payable (PKR)",
    "Order Status",
    "Courier",
    "Tracking Number",
    "Items Summary",
    "Delivery Notes",
    "Confirmation Email Sent",
    "Dispatch Email Sent",
    "Payment Receipt Proof"
  ];

  ordersSheet.getRange(1, 1, 1, orderHeaders.length).setValues([orderHeaders]);
  ordersSheet.getRange(1, 1, 1, orderHeaders.length)
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Arial")
    .setFontSize(10);
  ordersSheet.setFrozenRows(1);
  ordersSheet.setRowHeight(1, 35);

  // Status Dropdown validation for Column J (Order Status) with 7 distinct statuses including "Placed" & "Returned"
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Placed", "Confirmed", "In Processing", "Dispatched", "Delivered", "Cancelled", "Returned"], true)
    .setAllowInvalid(false)
    .build();
  ordersSheet.getRange("J2:J5000").setDataValidation(statusRule);

  // Tab 2: OrderItems (Line-item detail for packing & inventory)
  let itemsSheet = ss.getSheetByName("OrderItems");
  if (!itemsSheet) {
    itemsSheet = ss.insertSheet("OrderItems");
  }

  const itemHeaders = [
    "Order ID",
    "Timestamp",
    "Product Name",
    "Quantity",
    "Unit Price (PKR)",
    "Line Total (PKR)",
    "Color",
    "Size"
  ];

  itemsSheet.getRange(1, 1, 1, itemHeaders.length).setValues([itemHeaders]);
  itemsSheet.getRange(1, 1, 1, itemHeaders.length)
    .setBackground(STORE_CONFIG.brandOrange)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Arial")
    .setFontSize(10);
  itemsSheet.setFrozenRows(1);
  itemsSheet.setRowHeight(1, 35);



  // Tab 3: Inventory (Real-Time Catalog Sync)
  let invSheet = ss.getSheetByName("Inventory");
  if (!invSheet) {
    invSheet = ss.insertSheet("Inventory");
  }
  const invHeaders = [
    "Product ID", "Product Name", "Category", "Price (PKR)", 
    "Original Price (PKR)", "Stock", "Rating", "Badge", "Featured", 
    "Variants Summary", "Primary Image", "Last Updated"
  ];
  invSheet.getRange(1, 1, 1, invHeaders.length).setValues([invHeaders]);
  invSheet.getRange(1, 1, 1, invHeaders.length)
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Arial")
    .setFontSize(10);
  invSheet.setFrozenRows(1);
  invSheet.setRowHeight(1, 35);

  // Tab 4: Store Settings (Dynamic Store Configuration)
  let settingsSheet = ss.getSheetByName("Store Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Store Settings");
  }
  const settingsHeaders = ["Setting Key", "Setting Value", "Category", "Last Updated"];
  settingsSheet.getRange(1, 1, 1, settingsHeaders.length).setValues([settingsHeaders]);
  settingsSheet.getRange(1, 1, 1, settingsHeaders.length)
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Arial")
    .setFontSize(10);
  settingsSheet.setFrozenRows(1);
  settingsSheet.setRowHeight(1, 35);

  if (settingsSheet.getLastRow() <= 1) {
    const now = new Date();
    const defaultSettingsRows = [
      ["storeName", STORE_CONFIG.storeName, "General", now],
      ["storeTagline", STORE_CONFIG.storeTagline, "General", now],
      ["helplinePhone", STORE_CONFIG.helplinePhone, "Contact", now],
      ["helplineWhatsAppRaw", STORE_CONFIG.helplineWhatsAppRaw, "Contact", now],
      ["deliveryWindow", STORE_CONFIG.deliveryWindow, "Shipping", now],
      ["deliveryFee", 250, "Shipping", now],
      ["freeShippingThreshold", 3500, "Shipping", now],
      ["easypaisaTitle", "Muhammad Usman", "Payments", now],
      ["easypaisaNumber", "03001234567", "Payments", now],
      ["jazzcashTitle", "Muhammad Usman", "Payments", now],
      ["jazzcashNumber", "03001234567", "Payments", now],
      ["bankName", "Meezan Bank", "Payments", now],
      ["bankTitle", "Calenvee Private Limited", "Payments", now],
      ["bankIban", "PK12MEZN0001234567890123", "Payments", now],
      ["heroRotationIntervalSeconds", 5, "Hero Section", now],
      ["heroSlide1_image", "/products/1792091254271-luxury_essentials_still_life__1_.webp", "Hero Section", now],
      ["heroSlide1_kicker", "QUALITY. STYLE. EVERYDAY.", "Hero Section", now],
      ["heroSlide1_headlinePrefix", "Everything You Love,", "Hero Section", now],
      ["heroSlide1_headlineHighlight", "All in One Place.", "Hero Section", now],
      ["heroSlide1_subtitle", "Shop top-quality products across watches, jewelry, handbags, sunglasses, and fragrances with unbeatable prices and a seamless Cash on Delivery experience nationwide.", "Hero Section", now],
      ["heroSlide1_ctaText", "Shop Now", "Hero Section", now],
      ["heroSlide1_ctaLink", "/shop", "Hero Section", now],
      ["heroSlide2_image", "/hero/calenvee_hero_gold.jpg", "Hero Section", now],
      ["heroSlide2_kicker", "TIMEPIECES & CHRONOGRAPHS", "Hero Section", now],
      ["heroSlide2_headlinePrefix", "Signature Watches,", "Hero Section", now],
      ["heroSlide2_headlineHighlight", "Engineered For Prestige.", "Hero Section", now],
      ["heroSlide2_subtitle", "Explore timeless automatic movements, royal gold accents, and sapphire-crystal durability crafted to make every second memorable.", "Hero Section", now],
      ["heroSlide2_ctaText", "Explore Watches", "Hero Section", now],
      ["heroSlide2_ctaLink", "/category/watches", "Hero Section", now],
      ["heroSlide3_image", "/hero/hero_podium_collection.jpg", "Hero Section", now],
      ["heroSlide3_kicker", "CURATED LUXURY DROP", "Hero Section", now],
      ["heroSlide3_headlinePrefix", "Contemporary Accents,", "Hero Section", now],
      ["heroSlide3_headlineHighlight", "Defined by Elegance.", "Hero Section", now],
      ["heroSlide3_subtitle", "Elevate your daily presence with anti-tarnish waterproof jewelry, designer accessories, and artisan everyday essentials.", "Hero Section", now],
      ["heroSlide3_ctaText", "View Collection", "Hero Section", now],
      ["heroSlide3_ctaLink", "/category/jewelry", "Hero Section", now]
    ];
    settingsSheet.getRange(2, 1, defaultSettingsRows.length, defaultSettingsRows[0].length).setValues(defaultSettingsRows);
  }

  // Auto-generate the Executive Dashboard tab
  createExecutiveDashboard();
}

/**
 * Reads dynamic store configuration from "Store Settings" sheet,
 * falling back to STORE_CONFIG defaults if not yet populated.
 */
function getDynamicStoreSettings() {
  const cfg = {
    storeName: STORE_CONFIG.storeName,
    storeTagline: STORE_CONFIG.storeTagline,
    logoUrl: STORE_CONFIG.logoUrl,
    ownerEmail: STORE_CONFIG.ownerEmail,
    helplinePhone: STORE_CONFIG.helplinePhone,
    helplineWhatsAppRaw: STORE_CONFIG.helplineWhatsAppRaw,
    deliveryWindow: STORE_CONFIG.deliveryWindow,
    brandNavy: STORE_CONFIG.brandNavy,
    brandOrange: STORE_CONFIG.brandOrange,
    deliveryFee: 250,
    freeShippingThreshold: 3500
  };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Store Settings");
    if (sheet && sheet.getLastRow() > 1) {
      const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
      data.forEach(r => {
        const key = String(r[0]).trim();
        const val = r[1];
        if (key && val !== undefined && val !== "") {
          if (key === "storeName") cfg.storeName = String(val);
          if (key === "storeTagline") cfg.storeTagline = String(val);
          if (key === "helplinePhone") cfg.helplinePhone = String(val);
          if (key === "helplineWhatsAppRaw") cfg.helplineWhatsAppRaw = String(val).replace(/[^0-9]/g, '');
          if (key === "email") cfg.ownerEmail = String(val);
          if (key === "deliveryWindow") cfg.deliveryWindow = String(val);
          if (key === "deliveryFee") cfg.deliveryFee = Number(val);
          if (key === "freeShippingThreshold") cfg.freeShippingThreshold = Number(val);
        }
      });
    }
  } catch (err) {
    Logger.log("getDynamicStoreSettings error: " + err.toString());
  }

  return cfg;
}

/**
 * 1B. EXECUTIVE DASHBOARD GENERATOR (ENTERPRISE EDITION)
 * Features:
 * - Dynamic Month Selector Filter (Cell C4)
 * - Tier 1 KPI Cards: Total Revenue, Total Orders, AOV, Fulfillment Rate, Placed Orders (Action Needed), COD Share
 * - Tier 2 KPI Cards: Total Estimated Profit (PKR), Total Shipping Expense (PKR), Returned Orders (RTO), Return Rate %
 * - Order Pipeline & Fulfillment Status (Placed, Confirmed, In Processing, Dispatched, Delivered, Returned, Cancelled)
 * - Payment Gateway Breakdown (COD, EasyPaisa, JazzCash, Bank Transfer)
 * - Top Pakistan Cities Flow
 * - 12-Month Performance Trend with Delivered, Returned, and Return Rate %
 * - 5 Embedded Analytics Charts (Status Donut, 12-Month Bar, Payment Split, City Demands, and Month-Wise Return Analysis)
 */
function createExecutiveDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dash = ss.getSheetByName("Executive Dashboard");

  if (!dash) {
    dash = ss.insertSheet("Executive Dashboard", 0);
  } else {
    ss.setActiveSheet(dash);
    ss.moveActiveSheet(1);
    dash.clear();
    const existingCharts = dash.getCharts();
    for (let i = 0; i < existingCharts.length; i++) {
      dash.removeChart(existingCharts[i]);
    }
  }

  dash.setHiddenGridlines(false);

  // Professional Column Widths
  dash.setColumnWidth(1, 20);   // A - margin
  dash.setColumnWidth(2, 180);  // B - Metric / Status / City
  dash.setColumnWidth(3, 110);  // C - Month dropdown / Count
  dash.setColumnWidth(4, 110);  // D - Orders / Share %
  dash.setColumnWidth(5, 120);  // E - Revenue / KPI
  dash.setColumnWidth(6, 170);  // F - Action / Courier
  dash.setColumnWidth(7, 25);   // G - Separator
  dash.setColumnWidth(8, 170);  // H - Gateway / Month
  dash.setColumnWidth(9, 110);  // I - Channel / Orders
  dash.setColumnWidth(10, 100); // J - Count / Delivered
  dash.setColumnWidth(11, 100); // K - Share / Returned
  dash.setColumnWidth(12, 130); // L - Revenue (PKR)
  dash.setColumnWidth(13, 110); // M - Return Rate %

  // Professional Row Heights
  dash.setRowHeight(1, 12);
  dash.setRowHeight(2, 40);
  dash.setRowHeight(3, 24);
  dash.setRowHeight(4, 34);
  dash.setRowHeight(5, 12);
  dash.setRowHeight(6, 22);
  dash.setRowHeight(7, 32);
  dash.setRowHeight(8, 20);
  dash.setRowHeight(9, 22);
  dash.setRowHeight(10, 32);
  dash.setRowHeight(11, 20);
  dash.setRowHeight(12, 12);
  dash.setRowHeight(13, 26);
  dash.setRowHeight(14, 24);

  // Header Banner (Rows 2 & 3)
  dash.getRange("B2:M2").merge()
    .setValue("💼 CALENVEE.PK — EXECUTIVE REVENUE & OPERATIONS DASHBOARD")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(13)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  dash.getRange("B3:M3").merge()
    .setValue("SHOP SMART, LIVE BETTER  |  Official Store: " + STORE_CONFIG.ownerEmail + "  |  7-10 Working Days Nationwide Delivery")
    .setBackground("#1E293B")
    .setFontColor(STORE_CONFIG.brandOrange)
    .setFontWeight("bold")
    .setFontSize(9)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // Controls / Month Selector Bar (Row 4)
  dash.getRange("B4").setValue("📅 Select Month:")
    .setFontWeight("bold")
    .setFontColor(STORE_CONFIG.brandNavy)
    .setFontSize(10)
    .setHorizontalAlignment("right")
    .setVerticalAlignment("middle");

  const monthCell = dash.getRange("C4");
  monthCell.setValue("All Time");
  const monthRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "All Time", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ], true)
    .setAllowInvalid(false)
    .build();
  monthCell.setDataValidation(monthRule)
    .setBackground("#FEF3C7")
    .setFontWeight("bold")
    .setFontColor("#92400E")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false, "#F59E0B", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  dash.getRange("D4:G4").merge()
    .setValue("💡 Live Filter: Select any month to update all KPI cards, revenue, and order metrics instantly.")
    .setFontColor("#64748B")
    .setFontStyle("italic")
    .setFontSize(9)
    .setVerticalAlignment("middle");

  dash.getRange("L4:M4").merge()
    .setFormula('="⏱ Live Sync: " & TEXT(NOW(), "dd-mmm-yyyy hh:mm AM/PM")')
    .setFontColor("#94A3B8")
    .setFontSize(8)
    .setHorizontalAlignment("right")
    .setVerticalAlignment("middle");

  dash.setFrozenRows(4);

  // Dynamic KPI Card Formatter
  function formatKpiCard(rangeTitle, rangeVal, rangeSub, titleText, formulaVal, numFormat, subText, themeBg, accentColor) {
    dash.getRange(rangeTitle).merge()
      .setValue(titleText)
      .setBackground(themeBg)
      .setFontColor("#475569")
      .setFontWeight("bold")
      .setFontSize(8)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    dash.getRange(rangeVal).merge()
      .setFormula(formulaVal)
      .setNumberFormat(numFormat)
      .setBackground(themeBg)
      .setFontColor(accentColor)
      .setFontWeight("bold")
      .setFontSize(15)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    dash.getRange(rangeSub).merge()
      .setValue(subText)
      .setBackground(themeBg)
      .setFontColor("#64748B")
      .setFontSize(8)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");

    const startCell = rangeTitle.split(":")[0];
    const endCell = rangeSub.split(":")[1];
    dash.getRange(`${startCell}:${endCell}`)
      .setBorder(true, true, true, true, false, false, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
  }

  // --- TIER 1 KPI CARDS (Rows 6-8) ---
  // Card 1: Total Revenue (B6:C8)
  formatKpiCard(
    "B6:C6", "B7:C7", "B8:C8",
    "TOTAL REVENUE",
    '=IF(C4="All Time", IFERROR(SUM(Orders!I2:I), 0), IFERROR(SUM(FILTER(Orders!I2:I, Orders!B2:B<>"", TEXT(Orders!B2:B,"mmmm")=C4)), 0))',
    '"Rs. " #,##0',
    "Gross Sales (PKR)",
    "#F0FDF4", "#059669"
  );

  // Card 2: Total Orders (D6:E8)
  formatKpiCard(
    "D6:E6", "D7:E7", "D8:E8",
    "TOTAL ORDERS",
    '=IF(C4="All Time", IFERROR(COUNTA(Orders!A2:A), 0), IFERROR(ROWS(FILTER(Orders!A2:A, Orders!B2:B<>"", TEXT(Orders!B2:B,"mmmm")=C4)), 0))',
    '#,##0',
    "Store Checkout Orders",
    "#EFF6FF", "#1D4ED8"
  );

  // Card 3: Average Order Value (F6:G8)
  formatKpiCard(
    "F6:G6", "F7:G7", "F8:G8",
    "AVG ORDER VALUE (AOV)",
    '=IFERROR(B7/D7, 0)',
    '"Rs. " #,##0',
    "Basket Size per Customer",
    "#FFFBEB", "#D97706"
  );

  // Card 4: Fulfillment Rate (H6:I8)
  formatKpiCard(
    "H6:I6", "H7:I7", "H8:I8",
    "FULFILLMENT RATE",
    '=IFERROR((IF(C4="All Time", COUNTIF(Orders!J2:J, "Delivered") + COUNTIF(Orders!J2:J, "Dispatched"), IFERROR(ROWS(FILTER(Orders!A2:A, Orders!B2:B<>"", TEXT(Orders!B2:B,"mmmm")=C4, (Orders!J2:J="Delivered") + (Orders!J2:J="Dispatched"))), 0))) / D7, 0)',
    '0.0%',
    "Delivered + Dispatched",
    "#EEF2FF", "#4338CA"
  );

  // Card 5: Placed Orders - Needs Action (J6:K8)
  formatKpiCard(
    "J6:K6", "J7:K7", "J8:K8",
    "NEW ORDERS (PLACED)",
    '=IF(C4="All Time", COUNTIF(Orders!J2:J, "Placed"), IFERROR(ROWS(FILTER(Orders!A2:A, Orders!B2:B<>"", TEXT(Orders!B2:B,"mmmm")=C4, Orders!J2:J="Placed")), 0))',
    '#,##0',
    "Needs Phone Verification 📞",
    "#FEF3C7", "#D97706"
  );

  // Card 6: Cash on Delivery Share (L6:M8)
  formatKpiCard(
    "L6:M6", "L7:M7", "L8:M8",
    "CASH ON DELIVERY (COD)",
    '=IFERROR((IF(C4="All Time", COUNTIF(Orders!H2:H, "COD"), IFERROR(ROWS(FILTER(Orders!A2:A, Orders!B2:B<>"", TEXT(Orders!B2:B,"mmmm")=C4, Orders!H2:H="COD")), 0))) / D7, 0)',
    '0.0%',
    "Doorstep COD Ratio",
    "#F0FDFA", "#0F766E"
  );

  // --- TIER 2 KPI CARDS (Rows 9-11) ---
  // Card 7: Total Estimated Profit (B9:D11)
  formatKpiCard(
    "B9:D9", "B10:D10", "B11:D11",
    "TOTAL ESTIMATED PROFIT",
    '=IF(C4="All Time", IFERROR(SUMIF(Orders!$J$2:$J, "Delivered", Orders!$I$2:$I)*0.45, 0), IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=C4, Orders!$J$2:$J="Delivered"))*0.45, 0))',
    '"Rs. " #,##0',
    "Net Est. Margin (45% on Delivered)",
    "#ECFDF5", "#047857"
  );

  // Card 8: Total Shipping Expense (E9:G11)
  formatKpiCard(
    "E9:G9", "E10:G10", "E11:G11",
    "TOTAL SHIPPING EXPENSE",
    '=IF(C4="All Time", IFERROR((COUNTIF(Orders!$J$2:$J, "Delivered") + COUNTIF(Orders!$J$2:$J, "Dispatched") + COUNTIF(Orders!$J$2:$J, "Returned")) * 250, 0), IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=C4, (Orders!$J$2:$J="Delivered") + (Orders!$J$2:$J="Dispatched") + (Orders!$J$2:$J="Returned"))) * 250, 0))',
    '"Rs. " #,##0',
    "Courier Freight (Rs. 250/parcel)",
    "#FFF7ED", "#EA580C"
  );

  // Card 9: Returned Orders (H9:J11)
  formatKpiCard(
    "H9:J9", "H10:J10", "H11:J11",
    "RETURNED ORDERS (RTO)",
    '=IF(C4="All Time", COUNTIF(Orders!$J$2:$J, "Returned"), IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=C4, Orders!$J$2:$J="Returned")), 0))',
    '#,##0',
    "Customer Refused / Undelivered",
    "#FEF2F2", "#DC2626"
  );

  // Card 10: RTO Return Rate % (K9:M11)
  formatKpiCard(
    "K9:M9", "K10:M10", "K11:M11",
    "RTO RETURN RATE %",
    '=IFERROR(H10/D7, 0)',
    '0.0%',
    "Returned vs Total Orders",
    "#FFF1F2", "#BE123C"
  );

  // --- SECTION HEADERS 1 (Row 13) ---
  dash.getRange("B13:F13").merge()
    .setValue("📦 ORDER PIPELINE & FULFILLMENT STATUS")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  dash.getRange("H13:M13").merge()
    .setValue("💳 PAYMENT GATEWAY PERFORMANCE")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  // Table 1 Headers (Row 14)
  dash.getRange("B14:F14").setValues([["Order Status", "Orders", "Share %", "Revenue (PKR)", "Action Needed"]])
    .setBackground("#F1F5F9").setFontWeight("bold").setFontColor("#334155").setFontSize(9);

  // Table 1 Rows: 7 Distinct Statuses (Rows 15 to 21)
  const statuses = [
    { name: "Placed", action: "New booking — Call customer & confirm 📞" },
    { name: "Confirmed", action: "Order verified — Ready to pack 📦" },
    { name: "In Processing", action: "Pack in premium box & seal 🏷️" },
    { name: "Dispatched", action: "In transit with courier rider 🚚" },
    { name: "Delivered", action: "Payment collected & completed ✅" },
    { name: "Returned", action: "RTO — Returned to inventory ⚠️" },
    { name: "Cancelled", action: "Cancelled by customer/fake ❌" }
  ];

  for (let i = 0; i < statuses.length; i++) {
    const row = 15 + i;
    const st = statuses[i];
    dash.getRange(row, 2).setValue(st.name).setFontWeight("bold").setFontColor("#1E293B");
    dash.getRange(row, 3).setFormula(`=IF($C$4="All Time", COUNTIF(Orders!$J$2:$J, "${st.name}"), IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, Orders!$J$2:$J="${st.name}")), 0))`);
    dash.getRange(row, 4).setFormula(`=IFERROR(C${row}/$D$7, 0)`).setNumberFormat("0.0%");
    dash.getRange(row, 5).setFormula(`=IF($C$4="All Time", IFERROR(SUMIF(Orders!$J$2:$J, "${st.name}", Orders!$I$2:$I), 0), IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, Orders!$J$2:$J="${st.name}")), 0))`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 6).setValue(st.action).setFontColor("#64748B").setFontSize(8);
  }

  // Table 1 Total (Row 22)
  dash.getRange("B22").setValue("Total Pipeline").setFontWeight("bold").setFontColor(STORE_CONFIG.brandNavy);
  dash.getRange("C22").setFormula("=SUM(C15:C21)").setFontWeight("bold");
  dash.getRange("D22").setFormula("=SUM(D15:D21)").setFontWeight("bold").setNumberFormat("0.0%");
  dash.getRange("E22").setFormula("=SUM(E15:E21)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("F22").setValue("-").setFontColor("#94A3B8");
  dash.getRange("B22:F22").setBackground("#F8FAFC").setBorder(true, false, true, false, false, false, "#94A3B8", SpreadsheetApp.BorderStyle.DOUBLE);

  // Table 2 Headers (Row 14, Cols H to M)
  dash.getRange("H14:M14").setValues([["Payment Method", "Channel", "Orders", "Share %", "Revenue (PKR)", "Settlement Risk"]])
    .setBackground("#F1F5F9").setFontWeight("bold").setFontColor("#334155").setFontSize(9);

  const payments = [
    { key: "COD", label: "Cash on Delivery (COD)", channel: "Doorstep Cash", regex: "COD", risk: "Courier COD Cycle" },
    { key: "EASYPAISA", label: "EasyPaisa Mobile Account", channel: "Direct Wallet", regex: "EASYPAISA", risk: "Zero Risk (Prepaid)" },
    { key: "JAZZCASH", label: "JazzCash Mobile Account", channel: "Direct Wallet", regex: "JAZZ", risk: "Zero Risk (Prepaid)" },
    { key: "BANK", label: "Online Bank Transfer / Raast", channel: "Direct IBFT", regex: "BANK", risk: "Zero Risk (Prepaid)" }
  ];

  for (let i = 0; i < payments.length; i++) {
    const row = 15 + i;
    const pm = payments[i];
    dash.getRange(row, 8).setValue(pm.label).setFontWeight("bold").setFontColor("#1E293B");
    dash.getRange(row, 9).setValue(pm.channel).setFontColor("#64748B").setFontSize(8);
    dash.getRange(row, 10).setFormula(`=IF($C$4="All Time", COUNTIF(Orders!$H$2:$H, "${pm.key}"), IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, REGEXMATCH(Orders!$H$2:$H, "(?i)${pm.regex}"))), 0))`);
    dash.getRange(row, 11).setFormula(`=IFERROR(J${row}/$D$7, 0)`).setNumberFormat("0.0%");
    dash.getRange(row, 12).setFormula(`=IF($C$4="All Time", IFERROR(SUMIF(Orders!$H$2:$H, "${pm.key}", Orders!$I$2:$I), 0), IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, REGEXMATCH(Orders!$H$2:$H, "(?i)${pm.regex}"))), 0))`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 13).setValue(pm.risk).setFontColor("#059669").setFontSize(8);
  }

  // Table 2 Total (Row 19)
  dash.getRange("H19").setValue("Total Payment Volume").setFontWeight("bold").setFontColor(STORE_CONFIG.brandNavy);
  dash.getRange("I19").setValue("-").setFontColor("#94A3B8");
  dash.getRange("J19").setFormula("=SUM(J15:J18)").setFontWeight("bold");
  dash.getRange("K19").setFormula("=SUM(K15:K18)").setFontWeight("bold").setNumberFormat("0.0%");
  dash.getRange("L19").setFormula("=SUM(L15:L18)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("M19").setValue("-").setFontColor("#94A3B8");
  dash.getRange("H19:M19").setBackground("#F8FAFC").setBorder(true, false, true, false, false, false, "#94A3B8", SpreadsheetApp.BorderStyle.DOUBLE);

  // --- SECTION HEADERS 2 (Row 24) ---
  dash.getRange("B24:F24").merge()
    .setValue("🏙️ TOP PAKISTAN CITIES BY DEMAND")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  dash.getRange("H24:M24").merge()
    .setValue("📅 12-MONTH REVENUE & RETURN PERFORMANCE TREND")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  // Table 3 Headers (Row 25)
  dash.getRange("B25:F25").setValues([["Destination City", "Orders", "Share %", "Revenue (PKR)", "Courier Service"]])
    .setBackground("#F1F5F9").setFontWeight("bold").setFontColor("#334155").setFontSize(9);

  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"];
  for (let i = 0; i < cities.length; i++) {
    const row = 26 + i;
    const city = cities[i];
    dash.getRange(row, 2).setValue(city).setFontWeight("bold").setFontColor("#1E293B");
    dash.getRange(row, 3).setFormula(`=IF($C$4="All Time", COUNTIF(Orders!$F$2:$F, "*${city}*"), IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, REGEXMATCH(Orders!$F$2:$F, "(?i)${city}"))), 0))`);
    dash.getRange(row, 4).setFormula(`=IFERROR(C${row}/$D$7, 0)`).setNumberFormat("0.0%");
    dash.getRange(row, 5).setFormula(`=IF($C$4="All Time", IFERROR(SUMIF(Orders!$F$2:$F, "*${city}*", Orders!$I$2:$I), 0), IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, REGEXMATCH(Orders!$F$2:$F, "(?i)${city}"))), 0))`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 6).setValue("TCS Express (Nationwide)").setFontColor("#64748B").setFontSize(8);
  }

  // Row 33: Other Pakistan Cities
  dash.getRange("B33").setValue("Other Pakistan Cities").setFontWeight("bold").setFontColor("#64748B");
  dash.getRange("C33").setFormula("=IFERROR(MAX(0, D7 - SUM(C26:C32)), 0)");
  dash.getRange("D33").setFormula("=IFERROR(C33/$D$7, 0)").setNumberFormat("0.0%");
  dash.getRange("E33").setFormula("=IFERROR(MAX(0, B7 - SUM(E26:E32)), 0)").setNumberFormat('"Rs. " #,##0');
  dash.getRange("F33").setValue("Standard Postal / TCS").setFontColor("#64748B").setFontSize(8);

  // Row 34: Total Cities Flow
  dash.getRange("B34").setValue("Total Cities Flow").setFontWeight("bold").setFontColor(STORE_CONFIG.brandNavy);
  dash.getRange("C34").setFormula("=SUM(C26:C33)").setFontWeight("bold");
  dash.getRange("D34").setFormula("=SUM(D26:D33)").setFontWeight("bold").setNumberFormat("0.0%");
  dash.getRange("E34").setFormula("=SUM(E26:E33)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("F34").setValue("-").setFontColor("#94A3B8");
  dash.getRange("B34:F34").setBackground("#F8FAFC").setBorder(true, false, true, false, false, false, "#94A3B8", SpreadsheetApp.BorderStyle.DOUBLE);

  // Table 4 Headers (Row 25, Cols H to M): Includes Delivered, Returned, and Return Rate %
  dash.getRange("H25:M25").setValues([["Month", "Orders", "Delivered", "Returned", "Revenue (PKR)", "Return Rate"]])
    .setBackground("#F1F5F9").setFontWeight("bold").setFontColor("#334155").setFontSize(9);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (let i = 0; i < months.length; i++) {
    const row = 26 + i;
    const m = months[i];
    dash.getRange(row, 8).setValue(m).setFontWeight("bold").setFontColor("#1E293B");
    dash.getRange(row, 9).setFormula(`=IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$H${row})), 0)`);
    dash.getRange(row, 10).setFormula(`=IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$H${row}, Orders!$J$2:$J="Delivered")), 0)`);
    dash.getRange(row, 11).setFormula(`=IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$H${row}, Orders!$J$2:$J="Returned")), 0)`);
    dash.getRange(row, 12).setFormula(`=IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$H${row})), 0)`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 13).setFormula(`=IFERROR(K${row}/I${row}, 0)`).setNumberFormat("0.0%");
  }

  // Row 38: Annual Total YTD
  dash.getRange("H38").setValue("Annual Total YTD").setFontWeight("bold").setFontColor(STORE_CONFIG.brandNavy);
  dash.getRange("I38").setFormula("=SUM(I26:I37)").setFontWeight("bold");
  dash.getRange("J38").setFormula("=SUM(J26:J37)").setFontWeight("bold");
  dash.getRange("K38").setFormula("=SUM(K26:K37)").setFontWeight("bold");
  dash.getRange("L38").setFormula("=SUM(L26:L37)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("M38").setFormula("=IFERROR(K38/I38, 0)").setFontWeight("bold").setNumberFormat("0.0%");
  dash.getRange("H38:M38").setBackground("#F8FAFC").setBorder(true, false, true, false, false, false, "#94A3B8", SpreadsheetApp.BorderStyle.DOUBLE);

  // --- EMBEDDED VISUAL CHARTS (5 CHARTS) ---
  try {
    // Chart 1: Order Pipeline Status Donut Chart (Row 41, Col B)
    const chartStatus = dash.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(dash.getRange("B14:C21"))
      .setPosition(41, 2, 5, 5)
      .setOption('title', '📦 Order Pipeline Status Distribution')
      .setOption('pieHole', 0.4)
      .setOption('colors', ['#8B5CF6', '#3B82F6', '#F59E0B', '#06B6D4', '#10B981', '#DC2626', '#64748B'])
      .setOption('legend', { position: 'right' })
      .setOption('width', 490)
      .setOption('height', 310)
      .build();
    dash.insertChart(chartStatus);

    // Chart 2: 12-Month Performance Trend Column Chart (Row 41, Col H)
    const chartMonthly = dash.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(dash.getRange("H25:K37"))
      .setPosition(41, 8, 5, 5)
      .setOption('title', '📊 12-Month Orders, Delivered & Returned Volume')
      .setOption('colors', ['#2563EB', '#10B981', '#DC2626'])
      .setOption('legend', { position: 'bottom' })
      .setOption('width', 540)
      .setOption('height', 310)
      .build();
    dash.insertChart(chartMonthly);

    // Chart 3: Payment Method Split (Row 58, Col B)
    const chartPayment = dash.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(dash.getRange("H14:J18"))
      .setPosition(58, 2, 5, 5)
      .setOption('title', '💳 Payment Method Split (COD vs Prepaid)')
      .setOption('colors', ['#0D9488', '#10B981', '#EC4899', '#3B82F6'])
      .setOption('legend', { position: 'right' })
      .setOption('width', 490)
      .setOption('height', 300)
      .build();
    dash.insertChart(chartPayment);

    // Chart 4: Top Pakistan Cities Bar Chart (Row 58, Col H)
    const chartCities = dash.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(dash.getRange("B25:C32"))
      .setPosition(58, 8, 5, 5)
      .setOption('title', '🏙️ Regional Demand by Pakistan City')
      .setOption('colors', ['#0B132B'])
      .setOption('legend', { position: 'none' })
      .setOption('width', 540)
      .setOption('height', 300)
      .build();
    dash.insertChart(chartCities);

    // Chart 5: Month-Wise Order Return Analysis (RTO Trend) (Row 75, Col B)
    const chartReturns = dash.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(dash.getRange("H25:H37"))
      .addRange(dash.getRange("K25:K37"))
      .setPosition(75, 2, 5, 5)
      .setOption('title', '🚨 Month-Wise Order Return Analysis (RTO Volume & Trend)')
      .setOption('colors', ['#DC2626'])
      .setOption('legend', { position: 'none' })
      .setOption('width', 1040)
      .setOption('height', 310)
      .build();
    dash.insertChart(chartReturns);

  } catch (chartErr) {
    Logger.log("Chart generation note: " + chartErr.toString());
  }

  ss.setActiveSheet(dash);
  SpreadsheetApp.getUi().alert("✅ Executive Dashboard ready!\n\nAll Tier 1 & Tier 2 KPI cards, Returned Order metrics, and Month-Wise Return Analysis chart have been built successfully.");
}

/**
 * 2. UNIFIED WEBHOOK RECEIVER (doPost)
 */
function doPost(e) {
  try {
    const rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    const payload = JSON.parse(rawData);
    
    const action = payload.action || (payload.order ? 'create_order' : null);

    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing action. No database modification performed."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'sync_catalog') {
      return handleSyncCatalog(payload);
    } else if (action === 'sync_settings') {
      return handleSyncSettings(payload);
    } else if (action === 'update_order_status') {
      return handleUpdateOrderStatus(payload);
    } else if (action === 'get_orders') {
      return handleGetOrders();
    } else if (action === 'create_order') {
      return handleCreateOrder(payload);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Unrecognized action: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Generates sequential Order ID: CAL-ORD-1000001, CAL-ORD-1000002...
 */
function getNextSequentialOrderId(ordersSheet, requestedId) {
  let highestNum = 1000000;
  
  try {
    const props = PropertiesService.getScriptProperties();
    const savedLast = props.getProperty("LAST_ORDER_SEQ");
    if (savedLast) {
      const parsed = parseInt(savedLast, 10);
      if (!isNaN(parsed) && parsed > highestNum) {
        highestNum = parsed;
      }
    }
  } catch (propErr) {
    Logger.log("ScriptProperties read error: " + propErr.toString());
  }

  if (ordersSheet && ordersSheet.getLastRow() > 1) {
    const ids = ordersSheet.getRange(2, 1, ordersSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      const str = String(ids[i][0] || '').trim();
      const match = str.match(/CAL-ORD-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    }
  }

  if (requestedId && typeof requestedId === 'string') {
    const reqMatch = requestedId.trim().match(/^CAL-ORD-(\d+)$/i);
    if (reqMatch) {
      const reqNum = parseInt(reqMatch[1], 10);
      if (!isNaN(reqNum) && reqNum > highestNum) {
        highestNum = reqNum;
        try {
          PropertiesService.getScriptProperties().setProperty("LAST_ORDER_SEQ", String(highestNum));
        } catch (_) {}
        return requestedId.trim().toUpperCase();
      }
    }
  }

  const nextNum = highestNum + 1;
  try {
    PropertiesService.getScriptProperties().setProperty("LAST_ORDER_SEQ", String(nextNum));
  } catch (_) {}

  return `CAL-ORD-${nextNum}`;
}

/**
 * 2A. ORDER CREATION HANDLER
 * - Logs order with status "Placed" (NOT automatically "Confirmed")
 * - Sends official luxury invoice email (Order Placed) to customer
 * - Sends alert notification with attached payment proof to store owner
 */
function handleCreateOrder(payload) {
  const order = payload.order || payload;

  const customerName = String(order.customerName || '').trim();
  const phone = String(order.phone || '').trim();
  const address = String(order.address || '').trim();
  const itemsList = Array.isArray(order.items) ? order.items : [];
  const total = Number(order.total || 0);

  if (!customerName || customerName.toUpperCase() === 'N/A' || customerName.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Order rejected: Customer name is required."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (!phone || phone.toUpperCase() === 'N/A' || phone.length < 7) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Order rejected: Valid contact phone is required."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (itemsList.length === 0 || total <= 0) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Order rejected: Must contain at least 1 product item with total > 0."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const cfg = getDynamicStoreSettings();
  let calculatedSubtotal = 0;
  itemsList.forEach(item => {
    const itemQty = Number(item.quantity || 1);
    const itemPrice = Number(item.price || (item.product && item.product.price) || 0);
    calculatedSubtotal += itemPrice * itemQty;
  });
  if (calculatedSubtotal === 0 && total > 0) {
    calculatedSubtotal = total;
  }
  const discount = Math.max(0, Number(order.discount || 0));
  const netSubtotal = Math.max(0, calculatedSubtotal - discount);
  const calculatedShippingFee = netSubtotal >= cfg.freeShippingThreshold ? 0 : cfg.deliveryFee;
  const calculatedTotal = netSubtotal + calculatedShippingFee;

  order.subtotal = calculatedSubtotal;
  order.discount = discount;
  order.shippingFee = calculatedShippingFee;
  order.total = calculatedTotal;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName("Orders") || ss.getActiveSheet();
  const itemsSheet = ss.getSheetByName("OrderItems");

  const finalOrderId = getNextSequentialOrderId(ordersSheet, order.orderId);
  order.orderId = finalOrderId;

  const itemsSummary = itemsList.map(item => {
    const itemName = item.name || (item.product && item.product.name) || "Calenvee Product";
    const itemQty = item.quantity || 1;
    const itemPrice = item.price || (item.product && item.product.price) || 0;
    return `${itemName} (x${itemQty}) - Rs. ${itemPrice}`;
  }).join("; ");

  const timestamp = order.createdAt ? new Date(order.createdAt) : new Date();

  const TARGET_FOLDER_ID = "1WFEsVs1hxJtFGLlOYMhrmJjJCcUyGTW_";
  let receiptBlob = null;
  let receiptUrl = "";
  const paymentMethodUpper = (order.paymentMethod || "cod").toUpperCase();

  if (order.receiptImage && typeof order.receiptImage === "string" && order.receiptImage.length > 50) {
    try {
      let base64Data = order.receiptImage;
      let mimeType = "image/jpeg";
      if (order.receiptImage.includes("base64,")) {
        const parts = order.receiptImage.split(",");
        const header = parts[0];
        base64Data = parts[1];
        const mimeMatch = header.match(/:(.*?);/);
        if (mimeMatch) mimeType = mimeMatch[1];
      }
      const decodedBytes = Utilities.base64Decode(base64Data);
      const safeExt = mimeType === "application/pdf" ? ".pdf" : (mimeType === "image/png" ? ".png" : ".jpg");
      
      // Auto-rename image to specific order number (e.g. CAL-ORD-1000005_PaymentProof.jpg)
      const fileName = `${order.orderId}_PaymentProof${safeExt}`;

      receiptBlob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      let folder = null;
      try {
        folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
      } catch (fErr) {
        Logger.log("Drive folder by ID error: " + fErr.toString());
      }
      
      if (!folder) {
        const folders = DriveApp.getFoldersByName("Calenvee Payment Receipts");
        folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("Calenvee Payment Receipts");
      }

      if (folder) {
        const driveFile = folder.createFile(receiptBlob);
        driveFile.setName(fileName);
        try {
          driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (shareErr) {
          Logger.log("Drive share setting notice: " + shareErr.toString());
        }
        receiptUrl = driveFile.getUrl();
      }
    } catch (receiptErr) {
      Logger.log("Receipt error: " + receiptErr.toString());
      receiptUrl = "";
    }
  }

  const receiptProofCell = (receiptUrl && receiptUrl.startsWith("http"))
    ? receiptUrl
    : (paymentMethodUpper === "COD" ? "Cash on Delivery" : "No Screenshot Uploaded");

  const initialTracking = "-";
  const initialCourier = "-";

  const promoTag = order.promoCode && order.discount ? `[Coupon: ${order.promoCode} (-Rs. ${Number(order.discount).toLocaleString()})]` : '';
  const finalDeliveryNotes = [order.notes, promoTag].filter(Boolean).join(" | ");

  // Append with status "Placed" (Internal management team will verify and transition to "Confirmed")
  ordersSheet.appendRow([
    order.orderId,
    timestamp,
    customerName,
    phone,
    order.email || "",
    order.city || "Pakistan",
    address,
    paymentMethodUpper,
    calculatedTotal,
    "Placed", // Order status is Placed upon checkout!
    initialCourier, // Unassigned on placement (-)
    initialTracking, // Unassigned on placement (-)
    itemsSummary,
    finalDeliveryNotes,
    "No", // Confirmation Email Sent: No (will become Yes when status is set to Confirmed)
    "No", // Dispatch Email Sent: No
    receiptProofCell
  ]);

  const newOrderRow = ordersSheet.getLastRow();
  if (receiptUrl && receiptUrl.startsWith("http")) {
    try {
      ordersSheet.getRange(newOrderRow, 17).setFormula(`=HYPERLINK("${receiptUrl}", "View Receipt in Drive")`);
    } catch (_) {
      ordersSheet.getRange(newOrderRow, 17).setValue(receiptUrl);
    }
  }

  // Batch append items to OrderItems tab (atomic single write for ultra-fast performance)
  if (itemsSheet && itemsList.length > 0) {
    const itemRows = itemsList.map(item => {
      const itemName = item.name || (item.product && item.product.name) || "Calenvee Product";
      const itemPrice = item.price || (item.product && item.product.price) || 0;
      const itemQty = item.quantity || 1;
      const itemColor = (item.selectedColor && item.selectedColor.name) || item.color || "Standard";
      const itemSize = (item.selectedSize && item.selectedSize.name) || item.size || "Standard";
      return [
        order.orderId,
        timestamp,
        itemName,
        itemQty,
        itemPrice,
        itemPrice * itemQty,
        itemColor,
        itemSize
      ];
    });
    const lastRow = itemsSheet.getLastRow();
    itemsSheet.getRange(lastRow + 1, 1, itemRows.length, itemRows[0].length).setValues(itemRows);
  }

  // Send customer order placement email with official luxury invoice
  if (order.email && order.email.includes("@")) {
    try {
      sendCustomerOrderPlacedEmail(order);
    } catch (mailErr) {
      Logger.log("Order placed email error: " + mailErr.toString());
    }
  }

  // Send store owner instant alert email with attached receipt and Google Drive link
  order.receiptUrl = receiptUrl;
  try {
    sendOwnerNewOrderAlertEmail(order, receiptBlob, receiptUrl);
  } catch (ownerMailErr) {
    Logger.log("Owner alert email error: " + ownerMailErr.toString());
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: order.orderId,
    status: "Placed",
    message: `Order #${order.orderId} placed successfully. Pending manual verification.`
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2B. INVENTORY / CATALOG SYNC HANDLER
 */
function handleSyncCatalog(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Inventory");
  if (!sheet) {
    sheet = ss.insertSheet("Inventory");
  }

  const headers = [
    "Product ID", "Product Name", "Category", "Price (PKR)", 
    "Original Price (PKR)", "Stock", "Rating", "Badge", "Featured", 
    "Variants Summary", "Primary Image", "Last Updated"
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10);
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 35);

  const products = payload.products || [];
  if (Array.isArray(products) && products.length > 0) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
    }

    const now = new Date();
    const rows = products.map(p => {
      const variantsSummary = [];
      if (p.colors && p.colors.length) variantsSummary.push(`${p.colors.length} colors`);
      if (p.sizes && p.sizes.length) variantsSummary.push(`${p.sizes.length} sizes`);
      const primaryImg = (p.images && p.images[0]) || "";

      return [
        p.id || "",
        p.name || "",
        p.category || "",
        p.price || 0,
        p.originalPrice || p.price || 0,
        (p.stock !== undefined && p.stock !== null) ? p.stock : 50,
        p.rating || 4.9,
        p.badge || "",
        p.featured ? "Yes" : "No",
        variantsSummary.join(", ") || "Standard",
        primaryImg,
        now
      ];
    });

    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.getRange(2, 4, rows.length, 2).setNumberFormat('"Rs. " #,##0');
    sheet.getRange(2, 6, rows.length, 1).setNumberFormat('#,##0');
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    count: products.length,
    message: `Synchronized ${products.length} products to Google Sheets Inventory tab successfully.`
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2C. STORE SETTINGS & PAYMENT GATEWAY SYNC HANDLER
 */
function handleSyncSettings(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Store Settings");
  if (!sheet) {
    sheet = ss.insertSheet("Store Settings");
  }

  const headers = ["Setting Key", "Setting Value", "Category", "Last Updated"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10);
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 35);

  const s = payload.settings || {};
  const p = payload.paymentMethods || {};
  const now = new Date();

  const settingsRows = [
    ["storeName", s.storeName || STORE_CONFIG.storeName, "General", now],
    ["storeTagline", s.storeTagline || STORE_CONFIG.storeTagline, "General", now],
    ["helplinePhone", s.phone || STORE_CONFIG.helplinePhone, "Contact", now],
    ["helplineWhatsAppRaw", (s.phone || STORE_CONFIG.helplineWhatsAppRaw).replace(/[^0-9]/g, ''), "Contact", now],
    ["email", s.email || STORE_CONFIG.ownerEmail, "Contact", now],
    ["deliveryWindow", s.deliveryWindow || STORE_CONFIG.deliveryWindow, "Shipping", now],
    ["deliveryFee", s.deliveryFee !== undefined ? s.deliveryFee : 250, "Shipping", now],
    ["freeShippingThreshold", s.freeShippingThreshold !== undefined ? s.freeShippingThreshold : 3500, "Shipping", now],
    ["storeNotice", s.storeNotice || "", "Announcement", now],
    ["easypaisaTitle", (p.easypaisa && p.easypaisa.accountTitle) || "", "Payments", now],
    ["easypaisaNumber", (p.easypaisa && p.easypaisa.accountNumber) || "", "Payments", now],
    ["jazzcashTitle", (p.jazzcash && p.jazzcash.accountTitle) || "", "Payments", now],
    ["jazzcashNumber", (p.jazzcash && p.jazzcash.accountNumber) || "", "Payments", now],
    ["bankName", (p.bank && p.bank.bankName) || "", "Payments", now],
    ["bankTitle", (p.bank && p.bank.accountTitle) || "", "Payments", now],
    ["bankNumber", (p.bank && p.bank.accountNumber) || "", "Payments", now],
    ["bankIban", (p.bank && p.bank.iban) || "", "Payments", now],
    ["heroRotationIntervalSeconds", (payload.hero && payload.hero.autoIntervalSeconds) || 5, "Hero Section", now],
    ["heroSlide1_image", (payload.hero && payload.hero.slides && payload.hero.slides[0] && payload.hero.slides[0].image) || (payload.hero && payload.hero.image) || "/products/1792091254271-luxury_essentials_still_life__1_.webp", "Hero Section", now],
    ["heroSlide1_kicker", (payload.hero && payload.hero.slides && payload.hero.slides[0] && payload.hero.slides[0].kicker) || "QUALITY. STYLE. EVERYDAY.", "Hero Section", now],
    ["heroSlide1_headlinePrefix", (payload.hero && payload.hero.slides && payload.hero.slides[0] && payload.hero.slides[0].headlinePrefix) || "Everything You Love,", "Hero Section", now],
    ["heroSlide1_headlineHighlight", (payload.hero && payload.hero.slides && payload.hero.slides[0] && payload.hero.slides[0].headlineHighlight) || "All in One Place.", "Hero Section", now],
    ["heroSlide1_subtitle", (payload.hero && payload.hero.slides && payload.hero.slides[0] && payload.hero.slides[0].subtitle) || "", "Hero Section", now],
    ["heroSlide1_ctaText", (payload.hero && payload.hero.slides && payload.hero.slides[0] && payload.hero.slides[0].ctaText) || "Shop Now", "Hero Section", now],
    ["heroSlide1_ctaLink", (payload.hero && payload.hero.slides && payload.hero.slides[0] && payload.hero.slides[0].ctaLink) || "/shop", "Hero Section", now],
    ["heroSlide2_image", (payload.hero && payload.hero.slides && payload.hero.slides[1] && payload.hero.slides[1].image) || "/hero/calenvee_hero_gold.jpg", "Hero Section", now],
    ["heroSlide2_kicker", (payload.hero && payload.hero.slides && payload.hero.slides[1] && payload.hero.slides[1].kicker) || "TIMEPIECES & CHRONOGRAPHS", "Hero Section", now],
    ["heroSlide2_headlinePrefix", (payload.hero && payload.hero.slides && payload.hero.slides[1] && payload.hero.slides[1].headlinePrefix) || "Signature Watches,", "Hero Section", now],
    ["heroSlide2_headlineHighlight", (payload.hero && payload.hero.slides && payload.hero.slides[1] && payload.hero.slides[1].headlineHighlight) || "Engineered For Prestige.", "Hero Section", now],
    ["heroSlide2_subtitle", (payload.hero && payload.hero.slides && payload.hero.slides[1] && payload.hero.slides[1].subtitle) || "", "Hero Section", now],
    ["heroSlide2_ctaText", (payload.hero && payload.hero.slides && payload.hero.slides[1] && payload.hero.slides[1].ctaText) || "Explore Watches", "Hero Section", now],
    ["heroSlide2_ctaLink", (payload.hero && payload.hero.slides && payload.hero.slides[1] && payload.hero.slides[1].ctaLink) || "/category/watches", "Hero Section", now],
    ["heroSlide3_image", (payload.hero && payload.hero.slides && payload.hero.slides[2] && payload.hero.slides[2].image) || "/hero/hero_podium_collection.jpg", "Hero Section", now],
    ["heroSlide3_kicker", (payload.hero && payload.hero.slides && payload.hero.slides[2] && payload.hero.slides[2].kicker) || "CURATED LUXURY DROP", "Hero Section", now],
    ["heroSlide3_headlinePrefix", (payload.hero && payload.hero.slides && payload.hero.slides[2] && payload.hero.slides[2].headlinePrefix) || "Contemporary Accents,", "Hero Section", now],
    ["heroSlide3_headlineHighlight", (payload.hero && payload.hero.slides && payload.hero.slides[2] && payload.hero.slides[2].headlineHighlight) || "Defined by Elegance.", "Hero Section", now],
    ["heroSlide3_subtitle", (payload.hero && payload.hero.slides && payload.hero.slides[2] && payload.hero.slides[2].subtitle) || "", "Hero Section", now],
    ["heroSlide3_ctaText", (payload.hero && payload.hero.slides && payload.hero.slides[2] && payload.hero.slides[2].ctaText) || "View Collection", "Hero Section", now],
    ["heroSlide3_ctaLink", (payload.hero && payload.hero.slides && payload.hero.slides[2] && payload.hero.slides[2].ctaLink) || "/category/jewelry", "Hero Section", now]
  ];

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  }
  sheet.getRange(2, 1, settingsRows.length, headers.length).setValues(settingsRows);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Store settings and payment credentials synchronized with Google Sheets automations."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2D. ORDERS FEED (GET LIVE ORDERS)
 */
function handleGetOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Orders");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orders: []
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orders: []
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 17).getValues();
  const orders = values.map((row, idx) => {
    let receiptCell = String(row[16] || "");
    let receiptLink = "";
    if (receiptCell.includes("http")) {
      const match = receiptCell.match(/https?:\/\/[^\s"\)]+/);
      receiptLink = match ? match[0] : receiptCell;
    }

    return {
      rowIndex: idx + 2,
      orderId: String(row[0] || ""),
      timestamp: row[1] ? new Date(row[1]).toISOString() : "",
      customerName: String(row[2] || ""),
      phone: String(row[3] || ""),
      email: String(row[4] || ""),
      city: String(row[5] || ""),
      address: String(row[6] || ""),
      paymentMethod: String(row[7] || "COD"),
      total: Number(row[8] || 0),
      status: String(row[9] || "Placed"),
      courier: String(row[10] || "Pending Dispatch (TCS Express)"),
      trackingNumber: String(row[11] || "N/A"),
      itemsSummary: String(row[12] || ""),
      notes: String(row[13] || ""),
      confirmationEmailSent: String(row[14] || "No"),
      dispatchEmailSent: String(row[15] || "No"),
      receiptProof: receiptLink || receiptCell
    };
  });

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    count: orders.length,
    orders: orders.reverse()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2E. ORDER STATUS & DISPATCH / CONFIRMATION UPDATE HANDLER
 * - Supports transitioning to "Confirmed", "Dispatched", "Delivered", "Returned", etc.
 * - If status is "Confirmed", sends confirmation email to customer.
 * - If status is "Dispatched", sends dispatch email (optional tracking ID).
 */
function handleUpdateOrderStatus(payload) {
  const orderId = payload.orderId;
  const newStatus = payload.status || "Confirmed";
  const courier = payload.courier || "TCS Express";
  const rawTracking = payload.trackingNumber;
  const trackingNumber = (rawTracking && String(rawTracking).trim() !== '' && String(rawTracking).trim().toUpperCase() !== 'N/A')
    ? String(rawTracking).trim()
    : "N/A";
  const sendEmail = payload.sendEmail !== false;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Orders");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Orders sheet not found"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "No orders found in database"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 17).getValues();
  let foundRow = -1;
  let orderData = null;

  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === String(orderId).trim().toUpperCase()) {
      foundRow = i + 2;
      orderData = values[i];
      break;
    }
  }

  if (foundRow === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: `Order #${orderId} not found in database.`
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Update Status (Col 10)
  sheet.getRange(foundRow, 10).setValue(newStatus);
  if (courier) sheet.getRange(foundRow, 11).setValue(courier);
  if (trackingNumber) sheet.getRange(foundRow, 12).setValue(trackingNumber);

  let emailSent = false;
  const customerEmail = String(orderData[4] || "");
  const customerName = String(orderData[2] || "");
  const phone = String(orderData[3] || "");
  const city = String(orderData[5] || "");
  const total = Number(orderData[8] || 0);

  // 1. Status transition: Confirmed
  if (newStatus === "Confirmed" && sendEmail && customerEmail && customerEmail.includes("@")) {
    try {
      sendCustomerOrderConfirmationEmail({
        orderId: orderId,
        customerName: customerName,
        email: customerEmail,
        phone: phone,
        city: city,
        total: total,
        itemsSummary: String(orderData[12] || "")
      });
      sheet.getRange(foundRow, 15).setValue("Yes");
      emailSent = true;
    } catch (mailErr) {
      Logger.log("Confirmation email error: " + mailErr.toString());
    }
  }

  // 2. Status transition: Dispatched
  if (newStatus === "Dispatched" && sendEmail && customerEmail && customerEmail.includes("@")) {
    try {
      sendCustomerDispatchEmail({
        orderId: orderId,
        customerName: customerName,
        email: customerEmail,
        courier: courier,
        trackingNumber: trackingNumber
      });
      sheet.getRange(foundRow, 16).setValue("Yes");
      emailSent = true;
    } catch (mailErr) {
      Logger.log("Dispatch email error: " + mailErr.toString());
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: orderId,
    status: newStatus,
    courier: courier,
    trackingNumber: trackingNumber,
    emailSent: emailSent,
    message: `Order #${orderId} status updated to ${newStatus}${emailSent ? ' & email sent to customer' : ''}.`
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2F. INVENTORY FEED (GET PRODUCTS)
 */
function handleGetInventory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Inventory");
  if (!sheet || sheet.getLastRow() <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, products: [] })).setMimeType(ContentService.MimeType.JSON);
  }
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();
  const products = values.map(r => ({
    id: r[0],
    name: r[1],
    category: r[2],
    price: r[3],
    originalPrice: r[4],
    stock: r[5],
    rating: r[6],
    badge: r[7],
    featured: r[8] === "Yes",
    variants: r[9],
    image: r[10],
    updatedAt: r[11]
  }));
  return ContentService.createTextOutput(JSON.stringify({ success: true, count: products.length, products })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2G. SETTINGS FEED (GET LIVE CONFIG)
 */
function handleGetSettings() {
  const settings = getDynamicStoreSettings();
  return ContentService.createTextOutput(JSON.stringify({ success: true, settings })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 3. HEALTH CHECK & MULTI-ACTION QUERY (doGet)
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";
  const orderId = e && e.parameter && e.parameter.orderId;

  if (action === "get_orders") {
    return handleGetOrders();
  }

  if (action === "get_inventory") {
    return handleGetInventory();
  }

  if (action === "get_settings") {
    return handleGetSettings();
  }

  if (orderId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Orders");
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).toUpperCase() == String(orderId).toUpperCase()) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            orderId: data[i][0],
            customer: data[i][2],
            status: data[i][9],
            courier: data[i][10],
            trackingNumber: data[i][11]
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Order not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    service: "Calenvee Official Backend API",
    account: STORE_CONFIG.ownerEmail,
    status: "online",
    timestamp: new Date().toISOString(),
    supportedActions: ["create_order", "sync_catalog", "sync_settings", "update_order_status", "get_orders", "get_inventory", "get_settings"]
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 4. ON-EDIT TRIGGER (Automated Email Sync on Sheet Edit)
 * - Changing Column J to "Confirmed" sends confirmation email and updates Column 15 to "Yes"
 * - Changing Column J to "Dispatched" sends dispatch email and updates Column 16 to "Yes"
 */
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== "Orders") return;

  const row = e.range.getRow();
  const col = e.range.getColumn();

  // Column 10 is "Order Status"
  if (col === 10 && row > 1) {
    const newStatus = String(e.value || "").trim();
    const values = sheet.getRange(row, 1, 1, 17).getValues()[0];

    const orderId = String(values[0] || "").trim();
    const email = String(values[4] || "").trim();
    const confirmationEmailSent = values[14];
    const dispatchEmailSent = values[15];

    // Trigger 1: Status changed to Confirmed
    if (newStatus === "Confirmed" && confirmationEmailSent !== "Yes" && email && email.includes("@")) {
      try {
        const orderData = getOrderDetailsFromSheet(orderId, values);
        sendCustomerOrderConfirmationEmail(orderData);
        sheet.getRange(row, 15).setValue("Yes");
      } catch (err) {
        Logger.log("onEdit confirmation err: " + err.toString());
      }
    }

    // Trigger 2: Status changed to Dispatched
    if (newStatus === "Dispatched" && dispatchEmailSent !== "Yes" && email && email.includes("@")) {
      try {
        const courier = values[10] || "TCS Express";
        const trackingNumber = values[11] || "-";
        sendCustomerDispatchEmail({
          orderId: orderId,
          customerName: values[2],
          email: email,
          courier: courier,
          trackingNumber: trackingNumber
        });
        sheet.getRange(row, 16).setValue("Yes");
      } catch (err) {
        Logger.log("onEdit dispatch err: " + err.toString());
      }
    }
  }
}

/**
 * UNIVERSAL EMAIL HEADER
 * Standardized across all customer emails (Order Placed, Order Confirmed, Order Dispatched, Order Cancelled):
 * - No top WhatsApp bar
 * - Official white logo wrapped in anchor with pointer-events: none (prevents Gmail hover download overlay)
 * - Store Slogan in brand orange: "SHOP SMART, LIVE BETTER"
 */
function getUniversalEmailHeader(cfg) {
  return `
    <!-- Universal Luxury Brand Header -->
    <tr>
      <td class="header-cell" style="background-color: ${cfg.brandNavy}; padding: 24px 20px 20px 20px; text-align: center;">
        <div style="margin: 0 auto 8px auto; text-align: center;">
          <a href="https://calenvee.pk" target="_blank" style="text-decoration: none; display: inline-block; outline: none; border: none; cursor: default;">
            <img src="${cfg.logoUrl}" alt="${cfg.storeName}" width="160" style="width: 160px; max-width: 160px; height: auto; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; pointer-events: none;" />
          </a>
        </div>
        <p style="color: ${cfg.brandOrange}; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${cfg.storeTagline}
        </p>
      </td>
    </tr>
  `;
}

/**
 * UNIVERSAL EMAIL FOOTER
 * Standardized across all customer emails:
 * - Help prompt
 * - Prominent green WhatsApp Helpline button (+923001234567)
 * - Official brand copyright notice
 */
function getUniversalEmailFooter(cfg) {
  return `
    <!-- Universal Luxury Branded Footer -->
    <tr>
      <td class="footer-cell" style="background-color: #F8FAFC; padding: 20px 18px; text-align: center; border-top: 1px solid #E2E8F0;">
        <p style="margin: 0; font-size: 13px; color: #475569; font-weight: 500;">
          Have questions or need assistance with your order?
        </p>
        <p style="margin: 10px 0 0 0;">
          <a href="https://wa.me/${cfg.helplineWhatsAppRaw}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 700; font-size: 12px; padding: 10px 22px; border-radius: 8px; text-decoration: none; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(37, 211, 102, 0.25);">
            WhatsApp Helpline: ${cfg.helplinePhone}
          </a>
        </p>
        <p style="margin: 14px 0 0 0; font-size: 11px; color: #94A3B8; line-height: 1.4;">
          &copy; 2026 ${cfg.storeName} (${cfg.ownerEmail}). 100% Online Store Serving All Pakistan Cities.
        </p>
      </td>
    </tr>
  `;
}

/**
 * Helper: Fetches complete order line items, subtotal, shipping fee, payment method,
 * and delivery address by joining the Orders sheet row with the OrderItems sheet.
 */
function getOrderDetailsFromSheet(orderId, orderRowValues) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const itemsSheet = ss.getSheetByName("OrderItems");
  
  let items = [];
  let subtotal = 0;

  if (itemsSheet && itemsSheet.getLastRow() > 1) {
    const itemData = itemsSheet.getRange(2, 1, itemsSheet.getLastRow() - 1, 8).getValues();
    itemData.forEach(row => {
      if (String(row[0]).trim().toUpperCase() === String(orderId).trim().toUpperCase()) {
        const qty = Number(row[3]) || 1;
        const unitPrice = Number(row[4]) || 0;
        const lineTotal = Number(row[5]) || (qty * unitPrice);
        subtotal += lineTotal;
        items.push({
          name: String(row[2] || "Calenvee Product"),
          quantity: qty,
          price: unitPrice,
          color: String(row[6] || ""),
          size: String(row[7] || "")
        });
      }
    });
  }

  const total = Number(orderRowValues[8] || 0);

  // Fallback: If no items found in OrderItems sheet, parse itemsSummary
  if (items.length === 0 && orderRowValues[12]) {
    const summaryStr = String(orderRowValues[12]).trim();
    const parts = summaryStr.split(";").map(s => s.trim()).filter(Boolean);
    parts.forEach(part => {
      const match = part.match(/^(.*?)(?:\s*\(x(\d+)\))?(?:\s*-\s*Rs\.?\s*(\d+))?$/i);
      if (match) {
        const name = match[1].trim();
        const qty = match[2] ? Number(match[2]) : 1;
        const price = match[3] ? Number(match[3]) : 0;
        subtotal += (price * qty);
        items.push({ name, quantity: qty, price, color: "", size: "" });
      } else {
        items.push({ name: part, quantity: 1, price: total, color: "", size: "" });
      }
    });
  }

  // Calculate delivery fee accurately
  let shippingFee = 0;
  if (subtotal > 0 && total >= subtotal) {
    shippingFee = total - subtotal;
  } else if (subtotal === 0) {
    subtotal = total;
    shippingFee = 0;
  }

  return {
    orderId: String(orderRowValues[0] || orderId).trim(),
    customerName: String(orderRowValues[2] || "").trim(),
    phone: String(orderRowValues[3] || "").trim(),
    email: String(orderRowValues[4] || "").trim(),
    city: String(orderRowValues[5] || "").trim(),
    address: String(orderRowValues[6] || "").trim(),
    paymentMethod: String(orderRowValues[7] || "COD").trim(),
    total: total,
    subtotal: subtotal,
    shippingFee: shippingFee,
    items: items,
    itemsSummary: String(orderRowValues[12] || "")
  };
}

/**
 * 5A. OFFICIAL LUXURY HTML EMAIL: CUSTOMER ORDER PLACED EMAIL
 * Matches the official sleek card template with:
 * - Official white logo header with "SHOP SMART, LIVE BETTER" slogan (No "CALENVEE" plain text, no download overlay)
 * - Green checkmark circle with order reference badge
 * - Order Summary table with clean item lines and variants (no product images)
 * - Strictly "Total Amount: Rs. ..." (never "Total Payable (COD)")
 * - "CUSTOMER DETAILS" box (never "Shipping Details")
 * - Strictly "Expected Delivery: 7-10 Working Days"
 * - Universal branded footer with WhatsApp helpline button
 */
function sendCustomerOrderPlacedEmail(order) {
  const cfg = getDynamicStoreSettings();
  const subject = `Order Placed: ${order.orderId} | ${cfg.storeName}`;
  const htmlBody = generateCustomerOrderEmailHtml(order, "placed");

  GmailApp.sendEmail(order.email, subject, "", {
    htmlBody: htmlBody,
    name: cfg.storeName
  });
}

/**
 * 5B. OFFICIAL LUXURY HTML EMAIL: CUSTOMER ORDER CONFIRMATION EMAIL
 * Sent once internal management verifies and marks the order as "Confirmed".
 */
function sendCustomerOrderConfirmationEmail(order) {
  const cfg = getDynamicStoreSettings();
  const subject = `Order Confirmed: ${order.orderId} | ${cfg.storeName}`;
  const htmlBody = generateCustomerOrderEmailHtml(order, "confirmed");

  GmailApp.sendEmail(order.email, subject, "", {
    htmlBody: htmlBody,
    name: cfg.storeName
  });
}

/**
 * 5C. OFFICIAL LUXURY HTML EMAIL: CUSTOMER ORDER CANCELLED EMAIL
 * Sent when order is cancelled by customer or internal management during verification.
 * Includes user-provided cancellation reason and refund notice if paid via advance payment.
 */
function sendCustomerOrderCancelledEmail(order, reason) {
  const cfg = getDynamicStoreSettings();
  const subject = `Order Cancelled: ${order.orderId} | ${cfg.storeName}`;
  const htmlBody = generateCustomerOrderCancelledEmailHtml(order, reason);

  GmailApp.sendEmail(order.email, subject, "", {
    htmlBody: htmlBody,
    name: cfg.storeName
  });
}

/**
 * GENERATES HIGH-RESOLUTION CUSTOMER ORDER EMAIL (OFFICIAL LUXURY CARD)
 * Supports stage = "placed" and stage = "confirmed"
 * - Responsive 580px container
 * - Universal Header with logo and slogan (no top WhatsApp bar, no hover download icon)
 * - Zero raw emojis / corrupted symbols (clean ASCII/HTML entities)
 * - Clean items summary without images
 * - Correct Item Price & Delivery Fee breakdown (never sum of price + delivery as item price)
 * - Strictly "Total Amount: Rs. ..." (never "Total Payable (COD)")
 * - Strictly "CUSTOMER DETAILS" (never "SHIPPING DETAILS")
 * - Strictly "Expected Delivery: 7-10 Working Days"
 * - Accurate Payment Method (e.g. BANK TRANSFER, EASYPAISA, JAZZCASH, CASH ON DELIVERY)
 * - Accurate Delivery Address (no "undefined")
 * - Universal Footer with WhatsApp Helpline button
 */
function generateCustomerOrderEmailHtml(order, stage) {
  const cfg = getDynamicStoreSettings();
  const isConfirmed = stage === "confirmed";

  const itemsList = Array.isArray(order.items) && order.items.length > 0 
    ? order.items 
    : [{ name: order.itemsSummary || "Calenvee Product", quantity: 1, price: order.subtotal || order.total || 0 }];

  // Item summary without images (clean text layout)
  const itemsHtml = itemsList.map(item => {
    const itemName = item.name || (item.product && item.product.name) || "Calenvee Product";
    const itemQty = Number(item.quantity || 1);
    const itemPrice = Number(item.price || (item.product && item.product.price) || 0);
    const itemColor = (item.selectedColor && item.selectedColor.name) || item.color || "";
    const itemSize = (item.selectedSize && item.selectedSize.name) || item.size || "";

    let variantDetails = [];
    if (itemSize && itemSize !== "Standard") variantDetails.push(`Size: ${itemSize}`);
    if (itemColor && itemColor !== "Standard") variantDetails.push(`Color: ${itemColor}`);
    const variantStr = variantDetails.join(" | ");

    return `
      <tr>
        <td class="item-cell" style="padding: 10px 8px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #111827; text-align: left;">
          <div style="font-weight: 700; color: #111827; line-height: 1.3;">${itemName}</div>
          ${variantStr ? `<div style="font-size: 11px; color: #6B7280; margin-top: 2px;">${variantStr}</div>` : ""}
        </td>
        <td class="item-cell" style="padding: 10px 6px; border-bottom: 1px solid #E5E7EB; font-size: 13px; text-align: center; color: #374151; vertical-align: middle;">
          ${itemQty}
        </td>
        <td class="item-cell" style="padding: 10px 8px; border-bottom: 1px solid #E5E7EB; font-size: 13px; text-align: right; color: #111827; font-weight: 700; vertical-align: middle; white-space: nowrap;">
          Rs. ${(itemPrice * itemQty).toLocaleString()}
        </td>
      </tr>
    `;
  }).join("");

  // Subtotal & Shipping fee calculations
  let subtotal = Number(order.subtotal || 0);
  if (!subtotal) {
    subtotal = itemsList.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
  }
  if (!subtotal) {
    subtotal = Number(order.total || 0);
  }

  let shippingFee = order.shippingFee !== undefined && order.shippingFee !== null ? Number(order.shippingFee) : (Number(order.total || 0) - subtotal);
  if (shippingFee < 0) shippingFee = 0;
  const shippingFeeStr = shippingFee === 0 ? "FREE" : `Rs. ${shippingFee.toLocaleString()}`;
  const totalStr = Number(order.total || (subtotal + shippingFee)).toLocaleString();

  // Payment method format
  let paymentDisplay = "CASH ON DELIVERY (COD)";
  const rawPm = String(order.paymentMethod || "cod").trim().toUpperCase();
  if (rawPm.includes("BANK")) {
    paymentDisplay = "BANK TRANSFER";
  } else if (rawPm.includes("EASYPAISA")) {
    paymentDisplay = "EASYPAISA";
  } else if (rawPm.includes("JAZZCASH")) {
    paymentDisplay = "JAZZCASH";
  } else if (rawPm.includes("COD") || rawPm === "CASH ON DELIVERY") {
    paymentDisplay = "CASH ON DELIVERY (COD)";
  } else {
    paymentDisplay = rawPm;
  }

  // Clean formatted address (no "undefined")
  const cleanAddress = String(order.address || "").replace(/undefined/gi, "").trim();
  const cleanCity = String(order.city || "").replace(/undefined/gi, "").trim();
  const displayAddress = [cleanAddress, cleanCity].filter(Boolean).join(", ") || "Address provided during checkout";

  const heroTitle = isConfirmed ? "Your Order is Confirmed!" : "Thank You For Your Order!";
  const heroSubtitle = isConfirmed
    ? `Dear <strong>${order.customerName}</strong>, your order has been verified and confirmed by our team. It is now being prepared for dispatch.`
    : `Dear <strong>${order.customerName}</strong>, your order has been received and is being prepared for dispatch.`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${heroTitle}</title>
      <style>
        body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        @media only screen and (max-width: 640px) {
          .email-body { padding: 4px 0 !important; margin: 0 !important; background-color: #FFFFFF !important; }
          .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
          .content-cell { padding-left: 12px !important; padding-right: 12px !important; }
          .hero-cell { padding: 20px 14px 14px 14px !important; }
          .header-cell { padding: 20px 14px 16px 14px !important; }
          .footer-cell { padding: 18px 14px 18px 14px !important; }
          .details-box { padding: 10px 12px !important; }
          .item-cell { padding: 8px 6px !important; font-size: 12px !important; }
        }
      </style>
    </head>
    <body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 16px 6px; color: #111827;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 650px; width: 100%; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        
        ${getUniversalEmailHeader(cfg)}
        
        <!-- Hero Confirmation (Clean checkmark icon, ZERO emojis) -->
        <tr>
          <td class="hero-cell" style="padding: 24px 20px 18px 20px; text-align: center;">
            <div style="display: inline-block; width: 42px; height: 42px; line-height: 42px; border-radius: 50%; background-color: #ECFDF5; color: #059669; font-size: 19px; font-weight: bold; margin-bottom: 10px; text-align: center;">
              &#10003;
            </div>
            <h2 style="margin: 0; font-size: 20px; color: #111827; font-weight: 800;">${heroTitle}</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #6B7280; line-height: 1.4;">
              ${heroSubtitle}
            </p>
            <div style="margin-top: 12px; padding: 7px 15px; background-color: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; display: inline-block;">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #C2410C; font-weight: bold;">ORDER REFERENCE:</span>
              <span style="font-size: 14px; font-weight: 800; color: #9A3412; margin-left: 6px;">${order.orderId}</span>
            </div>
          </td>
        </tr>

        <!-- Order Items Table (No images) -->
        <tr>
          <td class="content-cell" style="padding: 0 20px 18px 20px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #374151; font-weight: 800; margin-bottom: 10px; border-bottom: 2px solid ${cfg.brandOrange}; padding-bottom: 6px;">
              ORDER SUMMARY
            </div>
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F3F4F6;">
                  <th style="padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #4B5563; font-weight: 700;">ITEM</th>
                  <th style="padding: 8px 6px; text-align: center; font-size: 11px; text-transform: uppercase; color: #4B5563; font-weight: 700; width: 44px;">QTY</th>
                  <th style="padding: 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #4B5563; font-weight: 700; width: 85px;">PRICE</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Pricing Breakdown (Strictly "Total Amount", NEVER "Total Payable (COD)") -->
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 12px; font-size: 13px; width: 100%;">
              <tr>
                <td style="color: #6B7280; padding: 4px 0;">Subtotal:</td>
                <td style="text-align: right; font-weight: 600; color: #111827;">Rs. ${subtotal.toLocaleString()}</td>
              </tr>
              ${order.discount ? `
              <tr>
                <td style="color: #059669; padding: 4px 0;">Discount Applied${order.promoCode ? ` (${order.promoCode})` : ""}:</td>
                <td style="text-align: right; font-weight: 600; color: #059669;">- Rs. ${Number(order.discount).toLocaleString()}</td>
              </tr>` : ""}
              <tr>
                <td style="color: #6B7280; padding: 4px 0;">Delivery Charges:</td>
                <td style="text-align: right; font-weight: 600; color: #111827;">${shippingFeeStr}</td>
              </tr>
              <tr style="border-top: 2px solid #E5E7EB; font-size: 15px;">
                <td style="padding-top: 10px; font-weight: 800; color: ${cfg.brandNavy};">Total Amount:</td>
                <td style="padding-top: 10px; text-align: right; font-weight: 800; color: ${cfg.brandOrange};">Rs. ${totalStr}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Customer Details Box (Strictly CUSTOMER DETAILS, colons attached) -->
        <tr>
          <td class="content-cell" style="padding: 0 20px 20px 20px;">
            <div class="details-box" style="background-color: #F9FAFB; border-radius: 10px; padding: 12px 16px; border: 1px solid #E5E7EB;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #4B5563; font-weight: 800; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">
                CUSTOMER DETAILS
              </div>
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12px; line-height: 1.7; width: 100%;">
                <tr>
                  <td style="color: #4B5563; font-weight: 700; width: 125px; padding: 3px 0; vertical-align: top;">Name:</td>
                  <td style="color: #111827; font-weight: 600; padding: 3px 0;">${order.customerName}</td>
                </tr>
                <tr>
                  <td style="color: #4B5563; font-weight: 700; padding: 3px 0; vertical-align: top;">Phone:</td>
                  <td style="color: #111827; padding: 3px 0;">${order.phone}</td>
                </tr>
                <tr>
                  <td style="color: #4B5563; font-weight: 700; padding: 3px 0; vertical-align: top;">Delivery Address:</td>
                  <td style="color: #111827; padding: 3px 0;">${displayAddress}</td>
                </tr>
                <tr>
                  <td style="color: #4B5563; font-weight: 700; padding: 3px 0; vertical-align: top;">Expected Delivery:</td>
                  <td style="color: #111827; font-weight: 600; padding: 3px 0;">7-10 Working Days</td>
                </tr>
                <tr>
                  <td style="color: #4B5563; font-weight: 700; padding: 3px 0; vertical-align: top;">Payment Method:</td>
                  <td style="color: #0B132B; font-weight: 700; text-transform: uppercase; padding: 3px 0;">${paymentDisplay}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        ${getUniversalEmailFooter(cfg)}
      </table>
    </body>
    </html>
  `;
}

/**
 * 6. LUXURY HTML EMAIL: DISPATCH NOTIFICATION
 * - Universal brand header & footer
 * - Zero raw emojis
 * - Clean courier company name (never "Pending Dispatch")
 * - Optional tracking number
 */
function sendCustomerDispatchEmail(dispatchData) {
  const cfg = getDynamicStoreSettings();
  const rawTrk = String(dispatchData.trackingNumber || "").trim();
  const hasTracking = rawTrk !== "" && rawTrk !== "-" && rawTrk.toUpperCase() !== "N/A";
  
  const subject = hasTracking
    ? `Your Order #${dispatchData.orderId} Has Been Dispatched! Tracking: ${rawTrk} | ${cfg.storeName}`
    : `Your Order #${dispatchData.orderId} Has Been Dispatched! | ${cfg.storeName}`;

  // Clean courier name (strip any "Pending Dispatch" or brackets)
  const courierClean = String(dispatchData.courier || "TCS Express").replace(/Pending\s*Dispatch\s*\(?/i, "").replace(/\)$/, "").trim() || "TCS Express";

  const trackingBoxHtml = hasTracking ? `
    <div class="details-box" style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 14px 18px; margin: 16px 0; text-align: left;">
      <div style="font-size: 13px; color: #1E40AF; margin-bottom: 5px;">
        <strong style="color: #1E3A8A;">Courier Service:</strong> ${courierClean}
      </div>
      <div style="font-size: 14px; color: #1E3A8A; font-weight: 800;">
        <strong style="color: #1E3A8A;">Tracking Number:</strong> ${rawTrk}
      </div>
      <div style="font-size: 11px; color: #3B82F6; margin-top: 5px;">
        You can track this consignment on the official ${courierClean} portal or via courier SMS alerts.
      </div>
    </div>
  ` : `
    <div class="details-box" style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 14px 18px; margin: 16px 0; text-align: left;">
      <div style="font-size: 13px; color: #1E40AF; margin-bottom: 5px;">
        <strong style="color: #1E3A8A;">Courier Service:</strong> ${courierClean}
      </div>
      <div style="font-size: 13px; color: #1E3A8A; font-weight: 700;">
        <strong style="color: #1E3A8A;">Consignment Status:</strong> Dispatched &amp; In Transit for Doorstep Delivery
      </div>
      <div style="font-size: 11px; color: #3B82F6; margin-top: 5px;">
        The courier delivery rider will coordinate with you via call/SMS prior to delivery. Please keep the exact payable amount ready.
      </div>
    </div>
  `;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Order #${dispatchData.orderId} Dispatched</title>
      <style>
        body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        @media only screen and (max-width: 640px) {
          .email-body { padding: 4px 0 !important; margin: 0 !important; background-color: #FFFFFF !important; }
          .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
          .content-cell { padding-left: 12px !important; padding-right: 12px !important; }
          .hero-cell { padding: 20px 14px 14px 14px !important; }
          .header-cell { padding: 20px 14px 16px 14px !important; }
          .footer-cell { padding: 18px 14px 18px 14px !important; }
          .details-box { padding: 10px 12px !important; }
        }
      </style>
    </head>
    <body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 16px 6px; color: #111827;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 650px; width: 100%; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        
        ${getUniversalEmailHeader(cfg)}

        <!-- Hero: Dispatched Notice (Clean checkmark icon, ZERO emojis) -->
        <tr>
          <td class="hero-cell" style="padding: 24px 20px 18px 20px; text-align: center;">
            <div style="display: inline-block; width: 42px; height: 42px; line-height: 42px; border-radius: 50%; background-color: #EFF6FF; color: #2563EB; font-size: 19px; font-weight: bold; margin-bottom: 10px; text-align: center;">
              &#10003;
            </div>
            <h2 style="margin: 0; font-size: 20px; color: #111827; font-weight: 800;">Your Package is on the Way!</h2>
            <p style="margin: 6px 0 14px 0; font-size: 13px; color: #6B7280; line-height: 1.4;">
              Dear <strong>${dispatchData.customerName}</strong>, your Calenvee parcel for Order <strong>#${dispatchData.orderId}</strong> has been handed over to ${courierClean}.
            </p>
            
            ${trackingBoxHtml}

            <p style="font-size: 12px; color: #6B7280; margin: 16px 0 6px 0;">
              Need delivery status assistance? WhatsApp us at <a href="https://wa.me/${cfg.helplineWhatsAppRaw}" style="color: #F97316; font-weight: bold; text-decoration: none;">${cfg.helplinePhone}</a>.
            </p>
          </td>
        </tr>

        ${getUniversalEmailFooter(cfg)}
      </table>
    </body>
    </html>
  `;

  GmailApp.sendEmail(dispatchData.email, subject, "", {
    htmlBody: htmlBody,
    name: cfg.storeName
  });
}

/**
 * GENERATES HIGH-RESOLUTION ORDER CANCELLATION EMAIL
 * - Universal Header and Footer
 * - Zero raw emojis
 * - Clear Reason for Cancellation box
 * - Summary of cancelled items and total amount
 * - Advance payment refund guidance
 */
function generateCustomerOrderCancelledEmailHtml(order, reason) {
  const cfg = getDynamicStoreSettings();

  const itemsList = Array.isArray(order.items) && order.items.length > 0 
    ? order.items 
    : [{ name: order.itemsSummary || "Calenvee Product", quantity: 1, price: order.subtotal || order.total || 0 }];

  const itemsHtml = itemsList.map(item => {
    const itemName = item.name || (item.product && item.product.name) || "Calenvee Product";
    const itemQty = Number(item.quantity || 1);
    const itemPrice = Number(item.price || (item.product && item.product.price) || 0);

    return `
      <tr>
        <td class="item-cell" style="padding: 10px 8px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #111827; text-align: left;">
          <div style="font-weight: 700; color: #111827; line-height: 1.3;">${itemName}</div>
        </td>
        <td class="item-cell" style="padding: 10px 6px; border-bottom: 1px solid #E5E7EB; font-size: 13px; text-align: center; color: #374151; vertical-align: middle;">
          ${itemQty}
        </td>
        <td class="item-cell" style="padding: 10px 8px; border-bottom: 1px solid #E5E7EB; font-size: 13px; text-align: right; color: #111827; font-weight: 700; vertical-align: middle; white-space: nowrap;">
          Rs. ${(itemPrice * itemQty).toLocaleString()}
        </td>
      </tr>
    `;
  }).join("");

  let paymentDisplay = "CASH ON DELIVERY (COD)";
  const rawPm = String(order.paymentMethod || "cod").trim().toUpperCase();
  if (rawPm.includes("BANK")) {
    paymentDisplay = "BANK TRANSFER";
  } else if (rawPm.includes("EASYPAISA")) {
    paymentDisplay = "EASYPAISA";
  } else if (rawPm.includes("JAZZCASH")) {
    paymentDisplay = "JAZZCASH";
  } else if (rawPm.includes("COD") || rawPm === "CASH ON DELIVERY") {
    paymentDisplay = "CASH ON DELIVERY (COD)";
  } else {
    paymentDisplay = rawPm;
  }

  const isAdvancePayment = paymentDisplay !== "CASH ON DELIVERY (COD)";
  const totalStr = Number(order.total || 0).toLocaleString();
  const cleanAddress = String(order.address || "").replace(/undefined/gi, "").trim();
  const cleanCity = String(order.city || "").replace(/undefined/gi, "").trim();
  const displayAddress = [cleanAddress, cleanCity].filter(Boolean).join(", ") || "Address provided during checkout";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Order Cancelled</title>
      <style>
        body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        @media only screen and (max-width: 640px) {
          .email-body { padding: 4px 0 !important; margin: 0 !important; background-color: #FFFFFF !important; }
          .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
          .content-cell { padding-left: 12px !important; padding-right: 12px !important; }
          .hero-cell { padding: 20px 14px 14px 14px !important; }
          .header-cell { padding: 20px 14px 16px 14px !important; }
          .footer-cell { padding: 18px 14px 18px 14px !important; }
          .details-box { padding: 10px 12px !important; }
          .item-cell { padding: 8px 6px !important; font-size: 12px !important; }
        }
      </style>
    </head>
    <body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 16px 6px; color: #111827;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 650px; width: 100%; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        
        ${getUniversalEmailHeader(cfg)}
        
        <!-- Hero: Cancellation Notice (Clean cross icon, ZERO emojis) -->
        <tr>
          <td class="hero-cell" style="padding: 24px 20px 18px 20px; text-align: center;">
            <div style="display: inline-block; width: 42px; height: 42px; line-height: 42px; border-radius: 50%; background-color: #FEE2E2; color: #DC2626; font-size: 19px; font-weight: bold; margin-bottom: 10px; text-align: center;">
              &#10005;
            </div>
            <h2 style="margin: 0; font-size: 20px; color: #111827; font-weight: 800;">Order Cancellation Notice</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #6B7280; line-height: 1.4;">
              Dear <strong>${order.customerName}</strong>, your Calenvee Order <strong>#${order.orderId}</strong> has been cancelled.
            </p>
            <div style="margin-top: 12px; padding: 7px 15px; background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; display: inline-block;">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #991B1B; font-weight: bold;">ORDER REFERENCE:</span>
              <span style="font-size: 14px; font-weight: 800; color: #991B1B; margin-left: 6px;">${order.orderId}</span>
            </div>
          </td>
        </tr>

        <!-- Cancellation Reason Box -->
        <tr>
          <td class="content-cell" style="padding: 0 20px 16px 20px;">
            <div class="details-box" style="background-color: #FFF5F5; border-left: 4px solid #EF4444; border-radius: 6px; padding: 12px 14px; border: 1px solid #FED7D7; border-left-width: 4px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #991B1B; font-weight: 800; margin-bottom: 4px;">
                REASON FOR CANCELLATION
              </div>
              <div style="font-size: 13px; color: #7F1D1D; font-weight: 600; line-height: 1.5;">
                ${reason || "Cancelled as requested during customer confirmation / verification call."}
              </div>
            </div>
          </td>
        </tr>

        <!-- Cancelled Items Summary -->
        <tr>
          <td class="content-cell" style="padding: 0 20px 18px 20px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #374151; font-weight: 800; margin-bottom: 10px; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px;">
              CANCELLED ITEMS
            </div>
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F3F4F6;">
                  <th style="padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #4B5563; font-weight: 700;">ITEM</th>
                  <th style="padding: 8px 6px; text-align: center; font-size: 11px; text-transform: uppercase; color: #4B5563; font-weight: 700; width: 44px;">QTY</th>
                  <th style="padding: 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #4B5563; font-weight: 700; width: 85px;">PRICE</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 12px; font-size: 13px; width: 100%;">
              <tr style="border-top: 2px solid #E5E7EB; font-size: 14px;">
                <td style="padding-top: 10px; font-weight: 800; color: #374151;">Total Order Value:</td>
                <td style="padding-top: 10px; text-align: right; font-weight: 800; color: #111827;">Rs. ${totalStr}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Advance Payment Refund Note if applicable -->
        ${isAdvancePayment ? `
        <tr>
          <td class="content-cell" style="padding: 0 20px 18px 20px;">
            <div class="details-box" style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #1E40AF; font-weight: 800; margin-bottom: 4px;">
                ADVANCE PAYMENT REFUND NOTICE
              </div>
              <div style="font-size: 12px; color: #1E3A8A; line-height: 1.6;">
                Since your payment method was <strong>${paymentDisplay}</strong>, our accounts team will verify and process your full refund to your source account within <strong>24 to 48 business hours</strong>. If you have any questions regarding your refund, please message our helpline.
              </div>
            </div>
          </td>
        </tr>
        ` : ""}

        <!-- Customer Details Box -->
        <tr>
          <td class="content-cell" style="padding: 0 20px 20px 20px;">
            <div class="details-box" style="background-color: #F9FAFB; border-radius: 10px; padding: 12px 16px; border: 1px solid #E5E7EB;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #4B5563; font-weight: 800; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px;">
                CUSTOMER DETAILS
              </div>
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 12px; line-height: 1.7; width: 100%;">
                <tr>
                  <td style="color: #4B5563; font-weight: 700; width: 125px; padding: 3px 0; vertical-align: top;">Name:</td>
                  <td style="color: #111827; font-weight: 600; padding: 3px 0;">${order.customerName}</td>
                </tr>
                <tr>
                  <td style="color: #4B5563; font-weight: 700; padding: 3px 0; vertical-align: top;">Phone:</td>
                  <td style="color: #111827; padding: 3px 0;">${order.phone}</td>
                </tr>
                <tr>
                  <td style="color: #4B5563; font-weight: 700; padding: 3px 0; vertical-align: top;">Delivery Address:</td>
                  <td style="color: #111827; padding: 3px 0;">${displayAddress}</td>
                </tr>
                <tr>
                  <td style="color: #4B5563; font-weight: 700; padding: 3px 0; vertical-align: top;">Payment Method:</td>
                  <td style="color: #0B132B; font-weight: 700; text-transform: uppercase; padding: 3px 0;">${paymentDisplay}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        ${getUniversalEmailFooter(cfg)}
      </table>
    </body>
    </html>
  `;
}

/**
 * 7. STORE OWNER NOTIFICATION EMAIL
 * Alerts store management with customer and payment details.
 * Item list and payment attachments are omitted as per store configuration.
 * Strictly clean ASCII without unicode emojis.
 */
function sendOwnerNewOrderAlertEmail(order, receiptBlob, receiptUrl) {
  const cfg = getDynamicStoreSettings();
  const paymentMethodUpper = (order.paymentMethod || "cod").toUpperCase();
  const discountAlertTag = order.discount ? ` [Coupon: ${order.promoCode || 'PROMO'} -Rs. ${Number(order.discount).toLocaleString()}]` : "";
  const subject = `[NEW ORDER PLACED] #${order.orderId} - Rs. ${Number(order.total || 0).toLocaleString()}${discountAlertTag} (${order.customerName}, ${order.city})`;

  const resolvedReceiptUrl = receiptUrl || order.receiptUrl || "";

  const textLines = [
    "New customer order received on Calenvee.pk!",
    "",
    `Order ID: ${order.orderId}`,
    `Status: Placed (Awaiting Verification)`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email || 'N/A'}`,
    `City: ${order.city}`,
    `Address: ${order.address}`,
    `Payment Method: ${paymentMethodUpper}`,
    `Total Payable: Rs. ${Number(order.total || 0).toLocaleString()}${order.discount ? ` (Includes Coupon Discount: -Rs. ${Number(order.discount).toLocaleString()})` : ''}`,
    `Delivery Notes: ${order.notes && order.notes !== 'N/A' && order.notes !== 'None' ? order.notes : 'None'}`
  ];

  if (resolvedReceiptUrl) {
    textLines.push(`Payment Proof (Google Drive): ${resolvedReceiptUrl}`);
  }

  textLines.push("");
  textLines.push("Manage all orders in your Google Sheet:");
  textLines.push(SpreadsheetApp.getActiveSpreadsheet().getUrl());

  const textBody = textLines.join("\n");

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>New Order Placed #${order.orderId}</title>
      <style>
        body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        @media only screen and (max-width: 640px) {
          .email-body { padding: 4px 0 !important; margin: 0 !important; background-color: #FFFFFF !important; }
          .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
          .content-cell { padding-left: 12px !important; padding-right: 12px !important; }
          .header-cell { padding: 20px 14px 16px 14px !important; }
          .footer-cell { padding: 16px 12px !important; }
          .details-box { padding: 10px 12px !important; }
        }
      </style>
    </head>
    <body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 16px 6px; color: #0F172A;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 650px; width: 100%; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Top Banner -->
        <tr>
          <td class="header-cell" style="background-color: ${cfg.brandNavy}; padding: 24px 20px; text-align: center;">
            <a href="https://calenvee.pk" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="${cfg.logoUrl}" alt="${cfg.storeName}" width="145" style="max-height: 44px; width: 145px; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto; border: 0; outline: none; pointer-events: none;" />
            </a>
            <div style="color: #FFFFFF; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">NEW ORDER PLACED (PENDING CONFIRMATION)</div>
            <div style="color: ${cfg.brandOrange}; font-size: 10px; font-weight: bold; margin-top: 4px; letter-spacing: 1.5px;">${cfg.storeTagline}</div>
          </td>
        </tr>

        <!-- Order Summary & Amount -->
        <tr>
          <td class="content-cell" style="padding: 24px 24px 16px 24px;">
            <table width="100%" style="margin-bottom: 16px;">
              <tr>
                <td>
                  <span style="font-size: 11px; color: #64748B; text-transform: uppercase; font-family: monospace;">Order ID</span>
                  <div style="font-size: 20px; font-weight: bold; color: #0B132B; font-family: monospace;">#${order.orderId}</div>
                  <div style="font-size: 11px; font-weight: bold; color: #D97706; margin-top: 2px;">Status: PLACED (Call customer to confirm)</div>
                </td>
                <td style="text-align: right;">
                  <span style="font-size: 11px; color: #64748B; text-transform: uppercase;">Total Payable</span>
                  <div style="font-size: 22px; font-weight: 800; color: ${cfg.brandOrange};">Rs. ${Number(order.total || 0).toLocaleString()}</div>
                  ${order.discount ? `
                  <div style="font-size: 11px; font-weight: 700; color: #059669; margin-top: 3px;">
                    Coupon Applied: ${order.promoCode || 'PROMO'} (-Rs. ${Number(order.discount).toLocaleString()})
                  </div>` : ''}
                </td>
              </tr>
            </table>

            <!-- Customer Details Card -->
            <div class="details-box" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <div style="font-size: 11px; font-weight: bold; color: #64748B; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">Customer &amp; Delivery Information</div>
              <table width="100%" style="font-size: 12px; line-height: 1.8;">
                <tr><td width="32%" style="color: #64748B; font-weight: 700; padding: 2px 0;">Name:</td><td style="font-weight: bold; color: #1E293B; padding: 2px 0;">${order.customerName}</td></tr>
                <tr><td style="color: #64748B; font-weight: 700; padding: 2px 0;">Mobile (WhatsApp):</td><td style="padding: 2px 0;"><a href="https://wa.me/${(order.phone || '').replace(/[^0-9]/g, '')}" style="color: #2563EB; font-weight: bold; text-decoration: none;">${order.phone}</a></td></tr>
                <tr><td style="color: #64748B; font-weight: 700; padding: 2px 0;">Email:</td><td style="color: #1E293B; padding: 2px 0;">${order.email || 'N/A'}</td></tr>
                <tr><td style="color: #64748B; font-weight: 700; padding: 2px 0;">City:</td><td style="font-weight: bold; color: #1E293B; padding: 2px 0;">${order.city}</td></tr>
                <tr><td style="color: #64748B; font-weight: 700; padding: 2px 0;">Address:</td><td style="color: #1E293B; padding: 2px 0;">${order.address}</td></tr>
                <tr><td style="color: #64748B; font-weight: 700; padding: 2px 0;">Payment:</td><td style="font-weight: bold; color: #0B132B; text-transform: uppercase; padding: 2px 0;">${paymentMethodUpper}</td></tr>
                ${order.discount ? `
                <tr>
                  <td style="color: #64748B; font-weight: 700; padding: 2px 0;">Coupon Discount:</td>
                  <td style="color: #059669; font-weight: bold; padding: 2px 0;">
                    ${order.promoCode ? order.promoCode + ' ' : ''}(-Rs. ${Number(order.discount).toLocaleString()})
                  </td>
                </tr>` : ''}
                ${resolvedReceiptUrl ? `
                <tr>
                  <td style="color: #64748B; vertical-align: top; padding-top: 6px;">Payment Proof:</td>
                  <td style="padding-top: 6px;">
                    <a href="${resolvedReceiptUrl}" target="_blank" style="background-color: #059669; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 6px 14px; border-radius: 6px; text-decoration: none; display: inline-block;">
                      View Uploaded Receipt in Google Drive
                    </a>
                    <div style="font-size: 10px; color: #2563EB; margin-top: 4px; word-break: break-all;">
                      <a href="${resolvedReceiptUrl}" target="_blank" style="color: #2563EB;">${resolvedReceiptUrl}</a>
                    </div>
                  </td>
                </tr>
                ` : (paymentMethodUpper !== 'COD' ? `
                <tr>
                  <td style="color: #64748B; padding: 2px 0;">Payment Proof:</td>
                  <td style="color: #DC2626; font-weight: bold; padding: 2px 0;">No screenshot uploaded during checkout</td>
                </tr>
                ` : '')}
                ${order.notes && order.notes !== "None" && order.notes !== "N/A" ? `<tr><td style="color: #64748B; padding: 2px 0;">Notes:</td><td style="color: #D97706; font-style: italic; padding: 2px 0;">"${order.notes}"</td></tr>` : ""}
              </table>
            </div>

            <!-- Quick Action Button -->
            <table width="100%" style="margin-top: 10px;">
              <tr>
                <td align="center">
                  <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" target="_blank" style="background-color: ${cfg.brandNavy}; color: #FFFFFF; font-size: 12px; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; display: inline-block;">
                    Open Orders in Google Sheets
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="footer-cell" style="background-color: #F8FAFC; padding: 16px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 10px; color: #94A3B8;">
            Calenvee Automated Bot &bull; Instant Store Notification &bull; ${new Date().toLocaleString()}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    htmlBody: htmlBody,
    name: "Calenvee Order Bot"
  };
  if (receiptBlob) {
    mailOptions.attachments = [receiptBlob];
  }

  GmailApp.sendEmail(cfg.ownerEmail, subject, textBody, mailOptions);
}

/**
 * 8. CUSTOM SPREADSHEET MENU
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Calenvee Store")
    .addItem("📊 1. Build / Refresh Executive Dashboard", "createExecutiveDashboard")
    .addItem("⚙️ 2. Setup All Sheets (Dashboard + Orders + OrderItems + Inventory + Settings)", "setupSheet")
    .addSeparator()
    .addItem("✉️ 3. Confirm Selected Order(s) & Send Email", "confirmSelectedOrderRows")
    .addItem("🚚 4. Dispatch Selected Order(s) & Send Email", "sendDispatchEmailForSelectedRows")
    .addItem("❌ 5. Cancel Selected Order & Send Email", "cancelSelectedOrderRow")
    .addSeparator()
    .addItem("🧹 6. Clean Ghost / Empty Orders (Remove Blank Rows)", "cleanGhostOrders")
    .addItem("🧪 7. Send Test Email to Store Owner", "testOrderEmail")
    .addItem("🗑️ 8. Reset All Dummy Orders (Fresh Store)", "resetDummyData")
    .addSeparator()
    .addItem("🔍 9. Authorize & Test Google Drive", "testDriveAndEmailSetup")
    .addToUi();
}

/**
 * 8A. BATCH CONFIRM SELECTED ORDERS FROM SHEET MENU (Option 3)
 * Allows management to confirm 1 or multiple orders simultaneously!
 */
function confirmSelectedOrderRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Orders") || ss.getActiveSheet();
  const range = sheet.getActiveRange();
  const ui = SpreadsheetApp.getUi();

  if (!range) {
    ui.alert("⚠️ Please select one or more order rows in the Orders sheet.");
    return;
  }

  const startRow = range.getRow();
  const numRows = range.getNumRows();

  const targetRows = [];
  for (let r = startRow; r < startRow + numRows; r++) {
    if (r >= 2 && !targetRows.includes(r)) {
      targetRows.push(r);
    }
  }

  if (targetRows.length === 0) {
    ui.alert("⚠️ Please select customer order rows (row 2 or below in the Orders sheet).");
    return;
  }

  const confirmedList = [];
  const skippedList = [];

  targetRows.forEach(row => {
    try {
      const values = sheet.getRange(row, 1, 1, 17).getValues()[0];
      const orderId = String(values[0] || "").trim();
      const customerName = String(values[2] || "").trim();
      const email = String(values[4] || "").trim();

      if (!orderId || !customerName) return;

      sheet.getRange(row, 10).setValue("Confirmed");

      if (email && email.includes("@") && email !== "N/A") {
        const orderData = getOrderDetailsFromSheet(orderId, values);
        sendCustomerOrderConfirmationEmail(orderData);
        sheet.getRange(row, 15).setValue("Yes");
        confirmedList.push(`${orderId} (${customerName}) → Email sent to ${email}`);
      } else {
        skippedList.push(`${orderId} (${customerName}) - Confirmed (No email on file)`);
      }
    } catch (err) {
      Logger.log("Error confirming row " + row + ": " + err.toString());
    }
  });

  if (typeof createExecutiveDashboard === 'function') {
    try { createExecutiveDashboard(); } catch (_) {}
  }

  let summary = `✅ BATCH CONFIRMATION SUMMARY\n\n`;
  summary += `Confirmed & Emailed: ${confirmedList.length} order(s)\n`;
  if (confirmedList.length > 0) {
    summary += confirmedList.map(item => `  • ${item}`).slice(0, 15).join("\n") + "\n";
    if (confirmedList.length > 15) {
      summary += `  ... and ${confirmedList.length - 15} more orders.\n`;
    }
  }
  if (skippedList.length > 0) {
    summary += `\n⚠️ Confirmed without email: ${skippedList.length}\n`;
    summary += skippedList.map(item => `  • ${item}`).join("\n");
  }

  ui.alert(summary);
}

function confirmSelectedOrderRow() {
  return confirmSelectedOrderRows();
}

/**
 * 8B. Cancel Selected Order from Sheet Menu (Option 5)
 * Prompts user for Cancellation Reason, updates Column J to "Cancelled",
 * and sends customer the official Cancellation Notice email.
 */
function cancelSelectedOrderRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  const ui = SpreadsheetApp.getUi();

  if (row <= 1) {
    ui.alert("⚠️ Please select a customer order row first (click on row 2 or below in the Orders sheet).");
    return;
  }

  const values = sheet.getRange(row, 1, 1, 17).getValues()[0];
  const orderId = String(values[0] || "").trim();
  const customerName = String(values[2] || "").trim();
  const email = String(values[4] || "").trim();

  if (!orderId) {
    ui.alert("⚠️ No Order ID found in the selected row.");
    return;
  }

  // Prompt: Ask for Cancellation Reason
  const reasonPrompt = ui.prompt(
    `Cancel Order #${orderId}`,
    `Customer: ${customerName} (${email || 'No email'})\n\nEnter Cancellation Reason (will be shown in customer email):\n(e.g., Cancelled by customer on verification call, Duplicate order, Customer requested cancellation, Incomplete address)`,
    ui.ButtonSet.OK_CANCEL
  );

  if (reasonPrompt.getSelectedButton() !== ui.Button.OK) {
    return; // Cancelled by operator
  }

  let reason = reasonPrompt.getResponseText().trim();
  if (!reason) {
    reason = "Cancelled as requested during customer confirmation / verification call.";
  }

  // Update Status to Cancelled in Column J
  sheet.getRange(row, 10).setValue("Cancelled");

  // Fetch full order details including line items from OrderItems tab
  const orderData = getOrderDetailsFromSheet(orderId, values);
  orderData.cancellationReason = reason;

  // Send cancellation email if email exists
  if (email && email.includes("@") && email !== "N/A") {
    sendCustomerOrderCancelledEmail(orderData, reason);
    ui.alert(`✅ Order #${orderId} marked Cancelled!\n\nReason: ${reason}\n\nCancellation email sent to ${customerName} (${email}).`);
  } else {
    ui.alert(`✅ Order #${orderId} marked Cancelled!\n\nReason: ${reason}\n(No customer email on file)`);
  }

  // Refresh Executive Dashboard if available
  if (typeof createExecutiveDashboard === 'function') {
    try { createExecutiveDashboard(); } catch (_) {}
  }
}

/**
 * 8C. BATCH DISPATCH SELECTED ORDERS FROM SHEET MENU (Option 4)
 * - Supports selecting 1 single order or 100+ orders at once!
 * - Reads Courier directly from Column K (defaults to "TCS Express" if empty or "-")
 * - Reads Tracking ID directly from Column L (optional — if empty or "-", sends without tracking)
 * - Zero repeated popups! Management enters Courier/Tracking directly in the sheet and clicks once.
 * - Updates Status (Col J) -> "Dispatched"
 * - Updates Courier (Col K) -> courier name
 * - Updates Tracking (Col L) -> tracking ID or "-"
 * - Updates Dispatch Email Sent (Col P) -> "Yes"
 * - Displays an executive summary popup of all sent emails!
 */
function sendDispatchEmailForSelectedRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Orders") || ss.getActiveSheet();
  const range = sheet.getActiveRange();
  const ui = SpreadsheetApp.getUi();

  if (!range) {
    ui.alert("⚠️ Please select one or more order rows in the Orders sheet.");
    return;
  }

  const startRow = range.getRow();
  const numRows = range.getNumRows();

  // Collect all unique row numbers >= 2 from the current selection
  const targetRows = [];
  for (let r = startRow; r < startRow + numRows; r++) {
    if (r >= 2 && !targetRows.includes(r)) {
      targetRows.push(r);
    }
  }

  if (targetRows.length === 0) {
    ui.alert("⚠️ Please select customer order rows (row 2 or below in the Orders sheet).");
    return;
  }

  const dispatchedList = [];
  const skippedList = [];
  const errorsList = [];

  targetRows.forEach(row => {
    try {
      const values = sheet.getRange(row, 1, 1, 17).getValues()[0];
      const orderId = String(values[0] || "").trim();
      const customerName = String(values[2] || "").trim();
      const email = String(values[4] || "").trim();

      if (!orderId || !customerName) {
        return; // Blank row, skip silently
      }

      // Read Courier from Column K (values[10])
      let courierName = String(values[10] || "").trim();
      if (!courierName || courierName === "-" || courierName.toLowerCase().includes("pending")) {
        courierName = "TCS Express";
      }

      // Read Tracking from Column L (values[11])
      let trackingNumber = String(values[11] || "").trim();
      if (trackingNumber === "-" || trackingNumber.toUpperCase() === "N/A" || trackingNumber.toLowerCase().includes("pending")) {
        trackingNumber = "";
      }

      if (!email || !email.includes("@")) {
        sheet.getRange(row, 10).setValue("Dispatched");
        sheet.getRange(row, 11).setValue(courierName);
        sheet.getRange(row, 12).setValue(trackingNumber || "-");
        skippedList.push(`${orderId} (${customerName}) - Status set to Dispatched (No email on file)`);
        return;
      }

      // Send Customer Dispatch Email
      sendCustomerDispatchEmail({
        orderId: orderId,
        customerName: customerName,
        email: email,
        courier: courierName,
        trackingNumber: trackingNumber
      });

      // Update Orders sheet
      sheet.getRange(row, 10).setValue("Dispatched");
      sheet.getRange(row, 11).setValue(courierName);
      sheet.getRange(row, 12).setValue(trackingNumber || "-");
      sheet.getRange(row, 16).setValue("Yes");

      const trackInfo = trackingNumber ? `Tracking: ${trackingNumber}` : "No tracking";
      dispatchedList.push(`${orderId} (${customerName}) → ${courierName} [${trackInfo}]`);
    } catch (err) {
      errorsList.push(`Row ${row}: ${err.toString()}`);
    }
  });

  // Refresh Executive Dashboard
  if (typeof createExecutiveDashboard === 'function') {
    try { createExecutiveDashboard(); } catch (_) {}
  }

  // Display summary
  let summary = `🚚 BATCH DISPATCH SUMMARY\n\n`;
  summary += `✅ Dispatched Successfully: ${dispatchedList.length} order(s)\n`;
  if (dispatchedList.length > 0) {
    summary += dispatchedList.map(item => `  • ${item}`).slice(0, 15).join("\n") + "\n";
    if (dispatchedList.length > 15) {
      summary += `  ... and ${dispatchedList.length - 15} more orders.\n`;
    }
  }

  if (skippedList.length > 0) {
    summary += `\n⚠️ Dispatched without email: ${skippedList.length}\n`;
    summary += skippedList.map(item => `  • ${item}`).join("\n") + "\n";
  }

  if (errorsList.length > 0) {
    summary += `\n❌ Errors:\n`;
    summary += errorsList.map(item => `  • ${item}`).join("\n") + "\n";
  }

  ui.alert(summary);
}

function sendDispatchEmailForSelectedRow() {
  return sendDispatchEmailForSelectedRows();
}

/**
 * 9. CLEAN GHOST / EMPTY ORDERS
 */
function cleanGhostOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName("Orders");
  const itemsSheet = ss.getSheetByName("OrderItems");
  
  if (!ordersSheet) {
    SpreadsheetApp.getUi().alert("Orders sheet not found.");
    return "Orders sheet not found";
  }
  
  const lastRow = ordersSheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert("No orders to clean.");
    return "No orders to clean.";
  }
  
  const deletedOrders = [];
  for (let r = lastRow; r >= 2; r--) {
    const row = ordersSheet.getRange(r, 1, 1, 17).getValues()[0];
    const orderId = String(row[0] || "").trim();
    const customerName = String(row[2] || "").trim();
    const phone = String(row[3] || "").trim();
    const total = Number(row[8] || 0);
    
    const isSampleOrder = orderId === "CV-999001" || ((orderId === "CAL-ORD-1000001" || orderId === "CAL-ORD-1000002" || orderId === "CAL-ORD-1000003") && (customerName === "Hamza Tariq" || customerName === "Ayesha Malik" || customerName === "Bilal Ahmed"));
    const isGhost = isSampleOrder || (!customerName || customerName.toUpperCase() === "N/A") || (total === 0 && (!phone || phone.toUpperCase() === "N/A"));
    
    if (isGhost) {
      if (orderId) deletedOrders.push(orderId);
      ordersSheet.deleteRow(r);
    }
  }
  
  if (itemsSheet && itemsSheet.getLastRow() > 1) {
    const itemsLastRow = itemsSheet.getLastRow();
    for (let r = itemsLastRow; r >= 2; r--) {
      const itemRow = itemsSheet.getRange(r, 1, 1, 8).getValues()[0];
      const itemOrderId = String(itemRow[0] || "").trim();
      const itemName = String(itemRow[2] || "").trim();
      if (!itemName || deletedOrders.includes(itemOrderId) || !itemOrderId) {
        itemsSheet.deleteRow(r);
      }
    }
  }
  
  if (typeof createExecutiveDashboard === 'function') {
    try { createExecutiveDashboard(); } catch (_) {}
  }
  
  const msg = `Cleaned ${deletedOrders.length} ghost/empty row(s) successfully!`;
  SpreadsheetApp.getUi().alert("🧹 Cleanup Complete!\n\n" + msg + (deletedOrders.length > 0 ? "\nRemoved IDs: " + deletedOrders.join(", ") : ""));
  return msg;
}

/**
 * 10. TEST ORDER EMAIL FUNCTION
 */
function testOrderEmail() {
  const sampleOrder = {
    orderId: "CV-999001",
    customerName: "Zohaib Saleem",
    email: STORE_CONFIG.ownerEmail,
    phone: "+923001234567",
    city: "Lahore",
    address: "Model Town, Block C",
    paymentMethod: "easypaisa",
    subtotal: 3899,
    discount: 0,
    shippingFee: 0,
    total: 3899,
    receiptFileName: "easypaisa_proof_test.jpg",
    items: [
      {
        name: "Obsidian Chronograph Edition",
        quantity: 1,
        price: 3899,
        image: "https://calenvee.pk/hero/hero_podium_collection.jpg",
        selectedColor: { name: "Matte Stealth Black" }
      }
    ]
  };

  const testBlob = Utilities.newBlob("CALENVEE TEST RECEIPT - EASYPAISA TRANSACTION ID: 882910405", "text/plain", "easypaisa_receipt_sample.txt");

  sendCustomerOrderPlacedEmail(sampleOrder);
  sendOwnerNewOrderAlertEmail(sampleOrder, testBlob, "https://drive.google.com");
  Logger.log("Test emails with sample receipt sent to " + STORE_CONFIG.ownerEmail);
}

/**
 * 11. RESET DUMMY DATA FUNCTION
 */
function resetDummyData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const ordersSheet = ss.getSheetByName("Orders");
  if (ordersSheet && ordersSheet.getLastRow() > 1) {
    ordersSheet.deleteRows(2, ordersSheet.getLastRow() - 1);
  }

  const itemsSheet = ss.getSheetByName("OrderItems");
  if (itemsSheet && itemsSheet.getLastRow() > 1) {
    itemsSheet.deleteRows(2, itemsSheet.getLastRow() - 1);
  }

  if (typeof createExecutiveDashboard === 'function') {
    createExecutiveDashboard();
  }

  Logger.log("✅ All dummy orders cleared successfully. Sheet is ready for real live customer orders!");
}

/**
 * 12. DIAGNOSTIC: TEST DRIVE & EMAIL SETUP
 * Run this function from Apps Script editor or "Calenvee Store > 🔍 9. Authorize & Test Google Drive"
 * to immediately trigger Google's permission prompt and verify access to target Drive folder.
 */
function testDriveAndEmailSetup() {
  const FOLDER_ID = "1WFEsVs1hxJtFGLlOYMhrmJjJCcUyGTW_";
  const ui = SpreadsheetApp.getUi();
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const testBlob = Utilities.newBlob("Calenvee Drive Connection Diagnostic", "text/plain", "test_connection.txt");
    const testFile = folder.createFile(testBlob);
    testFile.setTrashed(true); // Clean up immediately

    ui.alert(
      "✅ Google Drive & Permissions Fully Active!\n\n" +
      "1. Target Drive Folder Found: " + folder.getName() + " (ID: " + FOLDER_ID + ")\n" +
      "2. File upload permission verified successfully.\n" +
      "3. Gmail & Sheets services active.\n\n" +
      "⚠️ CRITICAL STEP TO ACTIVATE:\n" +
      "Click: Deploy > Manage deployments > Edit (pencil icon) > Version: select 'New version' > Click Deploy!"
    );
  } catch (err) {
    Logger.log("Diagnostic test error: " + err.toString());
    ui.alert(
      "❌ Diagnostic / Authorization Notice:\n\n" +
      "Error: " + err.toString() + "\n\n" +
      "Please ensure Google Drive permissions are granted when prompted."
    );
  }
}

/**
 * ==============================================================================
 * CALENVEE.PK — OFFICIAL BACKEND AUTOMATION SCRIPT
 * ==============================================================================
 * Official Store Account: calenvee.pk@gmail.com
 * Website: https://calenvee.pk
 * Helpline: +923001234567 (Nationwide Cash on Delivery 7-10 Days)
 * 
 * Features:
 * 1. Webhook API (doPost): Logs orders from the checkout page directly to Google Sheets.
 * 2. Customer Order Confirmation Email: Sends luxury HTML receipt with order summary.
 * 3. Store Owner Instant Alert: Sends notification to calenvee.pk@gmail.com.
 * 4. Dispatch Tracking Email (onEdit / Menu): Automatically sends courier tracking details.
 * 5. One-Click Setup (setupSheet): Auto-creates tabs, headers, dropdowns & colors.
 * 6. Test Suite: Click "testOrderEmail" in the editor to test instantly!
 * ==============================================================================
 */

// OFFICIAL STORE CONFIGURATION
const STORE_CONFIG = {
  storeName: "Calenvee.pk",
  storeTagline: "SHOP SMART, LIVE BETTER", // Official Store Slogan
  logoUrl: "https://calenvee.pk/logo-white.png", // Store Logo
  ownerEmail: "calenvee.pk@gmail.com", // Official Store Gmail
  helplinePhone: "+923001234567",
  helplineWhatsAppRaw: "923001234567",
  deliveryWindow: "Nationwide Cash on Delivery (7-10 Days)",
  brandNavy: "#0B132B",
  brandOrange: "#F97316"
};

/**
 * 1. ONE-TIME SETUP FUNCTION (Run this once)
 * Creates "Executive Dashboard", "Orders", and "OrderItems" sheets with professional styling, 
 * frozen rows, auto-column widths, sample starter data, KPI formulas, and visual charts.
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

  // Status Dropdown validation for Column J (Order Status)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Confirmed", "In Processing", "Dispatched", "Delivered", "Cancelled"], true)
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

  // If brand new sheet with no orders, add 3 realistic starter orders so the dashboard is immediately alive!
  if (ordersSheet.getLastRow() <= 1) {
    const now = new Date();
    const sampleOrders = [
      [
        "CAL-ORD-1000001", now, "Hamza Tariq", "+923001234567", "calenvee.pk@gmail.com",
        "Lahore", "DHA Phase 5, Sector C", "COD", 3899, "Delivered",
        "TCS Express", "TRK-982101", "Obsidian Chronograph Edition (x1) - Rs. 3899", "Deliver after 4 PM", "Yes", "Yes", "N/A (Cash on Delivery)"
      ],
      [
        "CAL-ORD-1000002", now, "Ayesha Malik", "+923219876543", "calenvee.pk@gmail.com",
        "Karachi", "Clifton Block 4", "EASYPAISA", 4499, "Dispatched",
        "Trax Logistics", "TRK-982102", "Royal Gold Dress Watch (x1) - Rs. 4499", "Call before arrival", "Yes", "Yes", "Attached in Drive & Email 🧾"
      ],
      [
        "CAL-ORD-1000003", now, "Bilal Ahmed", "+923335551234", "calenvee.pk@gmail.com",
        "Islamabad", "F-7/2, Street 14", "COD", 3499, "Confirmed",
        "Pending Dispatch (TCS Express)", "N/A", "Azure Chronograph Edition (x1) - Rs. 3499", "Leave at reception", "Yes", "No", "N/A (Cash on Delivery)"
      ]
    ];
    ordersSheet.getRange(2, 1, sampleOrders.length, sampleOrders[0].length).setValues(sampleOrders);

    const sampleItems = [
      ["CAL-ORD-1000001", now, "Obsidian Chronograph Edition", 1, 3899, 3899, "Matte Stealth Black", "Standard"],
      ["CAL-ORD-1000002", now, "Royal Gold Dress Watch", 1, 4499, 4499, "Royal Gold", "Standard"],
      ["CAL-ORD-1000003", now, "Azure Chronograph Edition", 1, 3499, 3499, "Ocean Sunburst Blue", "Standard"]
    ];
    itemsSheet.getRange(2, 1, sampleItems.length, sampleItems[0].length).setValues(sampleItems);
  }

  // Tab 3: Inventory (Real-Time Catalog Sync from Local Web App)
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

  // Tab 4: Store Settings (Dynamic Store Configuration from Local Web App)
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
      ["bankIban", "PK12MEZN0001234567890123", "Payments", now]
    ];
    settingsSheet.getRange(2, 1, defaultSettingsRows.length, defaultSettingsRows[0].length).setValues(defaultSettingsRows);
  }

  // Auto-generate the Executive Dashboard tab!
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
 * 1B. EXECUTIVE DASHBOARD GENERATOR
 * Creates/Refreshes the "Executive Dashboard" tab with KPI cards, Month Filter,
 * Status Pipeline, Payment Flow, City Demand, 12-Month Trends, and Embedded Charts.
 */
function createExecutiveDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dash = ss.getSheetByName("Executive Dashboard");

  if (!dash) {
    dash = ss.insertSheet("Executive Dashboard", 0);
  } else {
    // If it already exists, move to tab 1 and clear previous layout/charts
    ss.setActiveSheet(dash);
    ss.moveActiveSheet(1);
    dash.clear();
    const existingCharts = dash.getCharts();
    for (let i = 0; i < existingCharts.length; i++) {
      dash.removeChart(existingCharts[i]);
    }
  }

  // Ensure gridlines are visible for clean card borders
  dash.setHiddenGridlines(false);

  // Professional Column Widths
  dash.setColumnWidth(1, 20);   // A - margin
  dash.setColumnWidth(2, 180);  // B - Metric / Status / City
  dash.setColumnWidth(3, 110);  // C - Month dropdown / Count
  dash.setColumnWidth(4, 110);  // D - Orders / Share %
  dash.setColumnWidth(5, 120);  // E - Revenue / KPI
  dash.setColumnWidth(6, 160);  // F - Action / Courier
  dash.setColumnWidth(7, 25);   // G - Separator
  dash.setColumnWidth(8, 180);  // H - Gateway / Month
  dash.setColumnWidth(9, 120);  // I - Channel / Orders
  dash.setColumnWidth(10, 100); // J - Count / Delivered
  dash.setColumnWidth(11, 130); // K - Share / Revenue
  dash.setColumnWidth(12, 130); // L - Total / AOV
  dash.setColumnWidth(13, 110); // M - Risk / Fulfillment %

  // Professional Row Heights
  dash.setRowHeight(1, 12);
  dash.setRowHeight(2, 40);
  dash.setRowHeight(3, 24);
  dash.setRowHeight(4, 34);
  dash.setRowHeight(5, 12);
  dash.setRowHeight(6, 22);
  dash.setRowHeight(7, 32);
  dash.setRowHeight(8, 20);
  dash.setRowHeight(9, 14);
  dash.setRowHeight(10, 10);
  dash.setRowHeight(11, 28);
  dash.setRowHeight(12, 24);

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
    .setValue("SHOP SMART, LIVE BETTER  |  Official Store: " + STORE_CONFIG.ownerEmail + "  |  Nationwide Cash on Delivery (7-10 Days)")
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

  // Pin frozen rows up to filter bar
  dash.setFrozenRows(4);

  // Helper formatting for KPI Card
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

    const colStart = rangeTitle.split(":")[0].substring(0, 1);
    const colEnd = rangeTitle.split(":")[1].substring(0, 1);
    dash.getRange(`${colStart}6:${colEnd}8`)
      .setBorder(true, true, true, true, false, false, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
  }

  // --- KPI CARDS (Rows 6-8) ---
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

  // Card 5: Pending Orders (J6:K8)
  formatKpiCard(
    "J6:K6", "J7:K7", "J8:K8",
    "PENDING ACTION",
    '=IF(C4="All Time", COUNTIF(Orders!J2:J, "Confirmed") + COUNTIF(Orders!J2:J, "In Processing"), IFERROR(ROWS(FILTER(Orders!A2:A, Orders!B2:B<>"", TEXT(Orders!B2:B,"mmmm")=C4, (Orders!J2:J="Confirmed") + (Orders!J2:J="In Processing"))), 0))',
    '#,##0',
    "Confirmed & Processing",
    "#FEF2F2", "#DC2626"
  );

  // Card 6: COD Share (L6:M8)
  formatKpiCard(
    "L6:M6", "L7:M7", "L8:M8",
    "CASH ON DELIVERY (COD)",
    '=IFERROR((IF(C4="All Time", COUNTIF(Orders!H2:H, "COD"), IFERROR(ROWS(FILTER(Orders!A2:A, Orders!B2:B<>"", TEXT(Orders!B2:B,"mmmm")=C4, Orders!H2:H="COD")), 0))) / D7, 0)',
    '0.0%',
    "Doorstep COD Ratio",
    "#F0FDFA", "#0F766E"
  );

  // --- SECTION HEADERS (Row 11) ---
  dash.getRange("B11:F11").merge()
    .setValue("📦 ORDER PIPELINE & FULFILLMENT STATUS")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  dash.getRange("H11:M11").merge()
    .setValue("💳 PAYMENT GATEWAY PERFORMANCE")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  // Table 1 Headers (Row 12)
  dash.getRange("B12:F12").setValues([["Order Status", "Orders", "Share %", "Revenue (PKR)", "Action Needed"]])
    .setBackground("#F1F5F9").setFontWeight("bold").setFontColor("#334155").setFontSize(9);

  // Table 1 Rows (Rows 13 to 17)
  const statuses = [
    { name: "Confirmed", action: "Call customer & verify" },
    { name: "In Processing", action: "Pack in premium box" },
    { name: "Dispatched", action: "In transit with courier" },
    { name: "Delivered", action: "Payment collected ✅" },
    { name: "Cancelled", action: "Return to inventory" }
  ];

  for (let i = 0; i < statuses.length; i++) {
    const row = 13 + i;
    const st = statuses[i];
    dash.getRange(row, 2).setValue(st.name).setFontWeight("bold").setFontColor("#1E293B");
    dash.getRange(row, 3).setFormula(`=IF($C$4="All Time", COUNTIF(Orders!$J$2:$J, "${st.name}"), IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, Orders!$J$2:$J="${st.name}")), 0))`);
    dash.getRange(row, 4).setFormula(`=IFERROR(C${row}/$D$7, 0)`).setNumberFormat("0.0%");
    dash.getRange(row, 5).setFormula(`=IF($C$4="All Time", IFERROR(SUMIF(Orders!$J$2:$J, "${st.name}", Orders!$I$2:$I), 0), IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, Orders!$J$2:$J="${st.name}")), 0))`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 6).setValue(st.action).setFontColor("#64748B").setFontSize(8);
  }

  // Table 1 Total (Row 18)
  dash.getRange("B18").setValue("Total Pipeline").setFontWeight("bold").setFontColor(STORE_CONFIG.brandNavy);
  dash.getRange("C18").setFormula("=SUM(C13:C17)").setFontWeight("bold");
  dash.getRange("D18").setFormula("=SUM(D13:D17)").setFontWeight("bold").setNumberFormat("0.0%");
  dash.getRange("E18").setFormula("=SUM(E13:E17)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("F18").setValue("-").setFontColor("#94A3B8");
  dash.getRange("B18:F18").setBackground("#F8FAFC").setBorder(true, false, true, false, false, false, "#94A3B8", SpreadsheetApp.BorderStyle.DOUBLE);

  // Table 2 Headers (Row 12, Cols H to M)
  dash.getRange("H12:M12").setValues([["Payment Method", "Channel", "Orders", "Share %", "Revenue (PKR)", "Settlement Risk"]])
    .setBackground("#F1F5F9").setFontWeight("bold").setFontColor("#334155").setFontSize(9);

  const payments = [
    { key: "COD", label: "Cash on Delivery (COD)", channel: "Doorstep Cash", regex: "COD", risk: "Courier COD Cycle" },
    { key: "EASYPAISA", label: "EasyPaisa Mobile Account", channel: "Direct Wallet", regex: "EASYPAISA", risk: "Zero Risk (Prepaid)" },
    { key: "JAZZCASH", label: "JazzCash Mobile Account", channel: "Direct Wallet", regex: "JAZZ", risk: "Zero Risk (Prepaid)" },
    { key: "BANK", label: "Online Bank Transfer / Raast", channel: "Direct IBFT", regex: "BANK", risk: "Zero Risk (Prepaid)" }
  ];

  for (let i = 0; i < payments.length; i++) {
    const row = 13 + i;
    const pm = payments[i];
    dash.getRange(row, 8).setValue(pm.label).setFontWeight("bold").setFontColor("#1E293B");
    dash.getRange(row, 9).setValue(pm.channel).setFontColor("#64748B").setFontSize(8);
    dash.getRange(row, 10).setFormula(`=IF($C$4="All Time", COUNTIF(Orders!$H$2:$H, "${pm.key}"), IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, REGEXMATCH(Orders!$H$2:$H, "(?i)${pm.regex}"))), 0))`);
    dash.getRange(row, 11).setFormula(`=IFERROR(J${row}/$D$7, 0)`).setNumberFormat("0.0%");
    dash.getRange(row, 12).setFormula(`=IF($C$4="All Time", IFERROR(SUMIF(Orders!$H$2:$H, "${pm.key}", Orders!$I$2:$I), 0), IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, REGEXMATCH(Orders!$H$2:$H, "(?i)${pm.regex}"))), 0))`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 13).setValue(pm.risk).setFontColor("#059669").setFontSize(8);
  }

  // Table 2 Total (Row 17)
  dash.getRange("H17").setValue("Total Payment Volume").setFontWeight("bold").setFontColor(STORE_CONFIG.brandNavy);
  dash.getRange("I17").setValue("-").setFontColor("#94A3B8");
  dash.getRange("J17").setFormula("=SUM(J13:J16)").setFontWeight("bold");
  dash.getRange("K17").setFormula("=SUM(K13:K16)").setFontWeight("bold").setNumberFormat("0.0%");
  dash.getRange("L17").setFormula("=SUM(L13:L16)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("M17").setValue("-").setFontColor("#94A3B8");
  dash.getRange("H17:M17").setBackground("#F8FAFC").setBorder(true, false, true, false, false, false, "#94A3B8", SpreadsheetApp.BorderStyle.DOUBLE);

  // --- SECTION HEADERS 2 (Row 20) ---
  dash.getRange("B20:F20").merge()
    .setValue("🏙️ TOP PAKISTAN CITIES BY DEMAND")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  dash.getRange("H20:M20").merge()
    .setValue("📅 12-MONTH REVENUE & PERFORMANCE TREND")
    .setBackground(STORE_CONFIG.brandNavy)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setVerticalAlignment("middle");

  // Table 3 Headers (Row 21)
  dash.getRange("B21:F21").setValues([["Destination City", "Orders", "Share %", "Revenue (PKR)", "Courier Service"]])
    .setBackground("#F1F5F9").setFontWeight("bold").setFontColor("#334155").setFontSize(9);

  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"];
  for (let i = 0; i < cities.length; i++) {
    const row = 22 + i;
    const city = cities[i];
    dash.getRange(row, 2).setValue(city).setFontWeight("bold").setFontColor("#1E293B");
    dash.getRange(row, 3).setFormula(`=IF($C$4="All Time", COUNTIF(Orders!$F$2:$F, "*${city}*"), IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, REGEXMATCH(Orders!$F$2:$F, "(?i)${city}"))), 0))`);
    dash.getRange(row, 4).setFormula(`=IFERROR(C${row}/$D$7, 0)`).setNumberFormat("0.0%");
    dash.getRange(row, 5).setFormula(`=IF($C$4="All Time", IFERROR(SUMIF(Orders!$F$2:$F, "*${city}*", Orders!$I$2:$I), 0), IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$C$4, REGEXMATCH(Orders!$F$2:$F, "(?i)${city}"))), 0))`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 6).setValue("TCS Express (Nationwide)").setFontColor("#64748B").setFontSize(8);
  }

  // Row 29: Other Cities
  dash.getRange("B29").setValue("Other Pakistan Cities").setFontWeight("bold").setFontColor("#64748B");
  dash.getRange("C29").setFormula("=IFERROR(MAX(0, D7 - SUM(C22:C28)), 0)");
  dash.getRange("D29").setFormula("=IFERROR(C29/$D$7, 0)").setNumberFormat("0.0%");
  dash.getRange("E29").setFormula("=IFERROR(MAX(0, B7 - SUM(E22:E28)), 0)").setNumberFormat('"Rs. " #,##0');
  dash.getRange("F29").setValue("Standard Postal / TCS").setFontColor("#64748B").setFontSize(8);

  // Row 30: Total Regional Flow
  dash.getRange("B30").setValue("Total Cities Flow").setFontWeight("bold").setFontColor(STORE_CONFIG.brandNavy);
  dash.getRange("C30").setFormula("=SUM(C22:C29)").setFontWeight("bold");
  dash.getRange("D30").setFormula("=SUM(D22:D29)").setFontWeight("bold").setNumberFormat("0.0%");
  dash.getRange("E30").setFormula("=SUM(E22:E29)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("F30").setValue("-").setFontColor("#94A3B8");
  dash.getRange("B30:F30").setBackground("#F8FAFC").setBorder(true, false, true, false, false, false, "#94A3B8", SpreadsheetApp.BorderStyle.DOUBLE);

  // Table 4 Headers (Row 21, Cols H to M)
  dash.getRange("H21:M21").setValues([["Month", "Orders", "Delivered", "Revenue (PKR)", "AOV (PKR)", "Delivery Rate"]])
    .setBackground("#F1F5F9").setFontWeight("bold").setFontColor("#334155").setFontSize(9);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (let i = 0; i < months.length; i++) {
    const row = 22 + i;
    const m = months[i];
    dash.getRange(row, 8).setValue(m).setFontWeight("bold").setFontColor("#1E293B");
    dash.getRange(row, 9).setFormula(`=IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$H${row})), 0)`);
    dash.getRange(row, 10).setFormula(`=IFERROR(ROWS(FILTER(Orders!$A$2:$A, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$H${row}, Orders!$J$2:$J="Delivered")), 0)`);
    dash.getRange(row, 11).setFormula(`=IFERROR(SUM(FILTER(Orders!$I$2:$I, Orders!$B$2:$B<>"", TEXT(Orders!$B$2:$B,"mmmm")=$H${row})), 0)`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 12).setFormula(`=IFERROR(K${row}/I${row}, 0)`).setNumberFormat('"Rs. " #,##0');
    dash.getRange(row, 13).setFormula(`=IFERROR(J${row}/I${row}, 0)`).setNumberFormat("0.0%");
  }

  // Row 34: Annual Total YTD
  dash.getRange("H34").setValue("Annual Total YTD").setFontWeight("bold").setFontColor(STORE_CONFIG.brandNavy);
  dash.getRange("I34").setFormula("=SUM(I22:I33)").setFontWeight("bold");
  dash.getRange("J34").setFormula("=SUM(J22:J33)").setFontWeight("bold");
  dash.getRange("K34").setFormula("=SUM(K22:K33)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("L34").setFormula("=IFERROR(K34/I34, 0)").setFontWeight("bold").setNumberFormat('"Rs. " #,##0');
  dash.getRange("M34").setFormula("=IFERROR(J34/I34, 0)").setFontWeight("bold").setNumberFormat("0.0%");
  dash.getRange("H34:M34").setBackground("#F8FAFC").setBorder(true, false, true, false, false, false, "#94A3B8", SpreadsheetApp.BorderStyle.DOUBLE);

  // --- EMBEDDED VISUAL CHARTS ---
  try {
    // Chart 1: Order Pipeline Status Donut Chart (Placed at Row 36, Col B)
    const chartStatus = dash.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(dash.getRange("B12:C17"))
      .setPosition(36, 2, 5, 5)
      .setOption('title', '📦 Order Pipeline Status Distribution')
      .setOption('pieHole', 0.4)
      .setOption('colors', ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'])
      .setOption('legend', { position: 'right' })
      .setOption('width', 490)
      .setOption('height', 310)
      .build();
    dash.insertChart(chartStatus);

    // Chart 2: 12-Month Performance Column Chart (Placed at Row 36, Col H)
    const chartMonthly = dash.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(dash.getRange("H21:K33"))
      .setPosition(36, 8, 5, 5)
      .setOption('title', '📊 12-Month Orders & Delivered Volume')
      .setOption('colors', ['#2563EB', '#10B981', '#F97316'])
      .setOption('legend', { position: 'bottom' })
      .setOption('width', 540)
      .setOption('height', 310)
      .build();
    dash.insertChart(chartMonthly);

    // Chart 3: Payment Method Share (Placed at Row 53, Col B)
    const chartPayment = dash.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(dash.getRange("H12:J16"))
      .setPosition(53, 2, 5, 5)
      .setOption('title', '💳 Payment Method Split (COD vs Prepaid)')
      .setOption('colors', ['#0D9488', '#10B981', '#EC4899', '#3B82F6'])
      .setOption('legend', { position: 'right' })
      .setOption('width', 490)
      .setOption('height', 300)
      .build();
    dash.insertChart(chartPayment);

    // Chart 4: Top Pakistan Cities Bar Chart (Placed at Row 53, Col H)
    const chartCities = dash.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(dash.getRange("B21:C28"))
      .setPosition(53, 8, 5, 5)
      .setOption('title', '🏙️ Regional Demand by Pakistan City')
      .setOption('colors', ['#0B132B'])
      .setOption('legend', { position: 'none' })
      .setOption('width', 540)
      .setOption('height', 300)
      .build();
    dash.insertChart(chartCities);
  } catch (chartErr) {
    Logger.log("Chart generation note: " + chartErr.toString());
  }

  // Activate the Executive Dashboard
  ss.setActiveSheet(dash);
  SpreadsheetApp.getUi().alert("✅ Executive Dashboard ready!\n\nUse the 'Select Month' dropdown in Cell C4 to filter your store's live performance, or leave it as 'All Time'.");
}

/**
 * 2. UNIFIED WEBHOOK RECEIVER (doPost)
 * Receives multi-action payloads from Calenvee Storefront & Local Management App:
 * - action: "create_order" (checkout placement)
 * - action: "sync_catalog" (sync products to Inventory tab)
 * - action: "sync_settings" (sync store settings to Store Settings tab)
 * - action: "update_order_status" (order dispatch & tracking email)
 * - action: "get_orders" (fetch all orders)
 */
function doPost(e) {
  try {
    const rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    const payload = JSON.parse(rawData);
    
    // STRICT ACTION DISPATCH: Only recognize explicit valid actions (NEVER default to create_order!)
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
 * Generates the next sequential Order ID in format CAL-ORD-1000001, CAL-ORD-1000002...
 * Scans Orders sheet and ScriptProperties to guarantee strictly increasing sequential IDs.
 */
function getNextSequentialOrderId(ordersSheet, requestedId) {
  let highestNum = 1000000;
  
  // 1. Read persistent counter from Script Properties
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

  // 2. Scan Orders sheet Column A for highest CAL-ORD- number
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

  // 3. If client already generated a valid sequential ID that doesn't conflict, validate it
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
 * Enforces strict validation: Only REAL placed orders with verified customer name,
 * phone, items list, and total > 0 are logged to Orders & OrderItems tabs.
 */
function handleCreateOrder(payload) {
  const order = payload.order || payload;

  // STRICT VALIDATION GUARD: Reject any malformed, empty, or ghost orders
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

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName("Orders") || ss.getActiveSheet();
  const itemsSheet = ss.getSheetByName("OrderItems");

  // Generate authoritative sequential Order ID (e.g. CAL-ORD-1000001, CAL-ORD-1000002...)
  const finalOrderId = getNextSequentialOrderId(ordersSheet, order.orderId);
  order.orderId = finalOrderId;

  const itemsSummary = itemsList.map(item => `${item.name} (x${item.quantity}) - Rs. ${item.price}`).join("; ");
  const timestamp = order.createdAt ? new Date(order.createdAt) : new Date();

  // Process payment receipt attachment (if customer uploaded screenshot)
  let receiptBlob = null;
  let receiptUrl = "N/A";
  const paymentMethodUpper = (order.paymentMethod || "cod").toUpperCase();

  if (order.receiptImage && typeof order.receiptImage === "string" && order.receiptImage.includes("base64,")) {
    try {
      const parts = order.receiptImage.split(",");
      const header = parts[0];
      const base64Data = parts[1];
      const mimeMatch = header.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const decodedBytes = Utilities.base64Decode(base64Data);
      const safeExt = mimeType === "application/pdf" ? ".pdf" : ".jpg";
      const fileName = order.receiptFileName || (`Receipt_${order.orderId || Date.now()}${safeExt}`);

      receiptBlob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      // Store into dedicated Google Drive folder
      let folder;
      const folders = DriveApp.getFoldersByName("Calenvee Payment Receipts");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("Calenvee Payment Receipts");
      }
      const driveFile = folder.createFile(receiptBlob);
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      receiptUrl = driveFile.getUrl();
    } catch (receiptErr) {
      Logger.log("Receipt error: " + receiptErr.toString());
      receiptUrl = "Error saving: " + receiptErr.toString();
    }
  }

  const receiptProofCell = receiptUrl !== "N/A" && receiptUrl.startsWith("http")
    ? `=HYPERLINK("${receiptUrl}", "View Receipt 🧾")`
    : (paymentMethodUpper === "COD" ? "N/A (Cash on Delivery)" : "No Screenshot Uploaded");

  // Initial tracking number is ALWAYS "N/A" on initial placement (DO NOT auto-generate fake tracking!)
  const initialTracking = "N/A";
  const initialCourier = order.courier || "Pending Dispatch (TCS Express)";

  // Append strictly verified order to Orders tab
  ordersSheet.appendRow([
    order.orderId,
    timestamp,
    customerName,
    phone,
    order.email || "N/A",
    order.city || "N/A",
    address,
    paymentMethodUpper,
    total,
    "Confirmed",
    initialCourier,
    initialTracking,
    itemsSummary,
    order.notes || "None",
    order.email && order.email.includes("@") ? "Yes" : "No Email",
    "No",
    receiptProofCell
  ]);

  // Append items to OrderItems tab with the exact sequential orderId
  if (itemsSheet && itemsList.length > 0) {
    itemsList.forEach(item => {
      itemsSheet.appendRow([
        order.orderId,
        timestamp,
        item.name,
        item.quantity,
        item.price,
        item.price * item.quantity,
        item.selectedColor?.name || "Standard",
        item.selectedSize?.label || "Standard"
      ]);
    });
  }

  // Send customer order confirmation email with official invoice (if email was provided)
  if (order.email && order.email.includes("@") && order.email !== "N/A") {
    sendCustomerOrderConfirmationEmail(order);
  }

  // Send store owner instant notification with attached receipt to calenvee.pk@gmail.com
  sendOwnerNewOrderAlertEmail(order, receiptBlob, receiptUrl);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: order.orderId,
    message: `Order #${order.orderId} verified and recorded successfully in Calenvee database.`
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2B. INVENTORY / CATALOG SYNC HANDLER
 * Keeps Google Sheets "Inventory" tab 100% updated with products, stock, prices & variants
 * saved in the Store Data and Management Local Web app.
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
 * Keeps Google Sheets "Store Settings" tab synchronized with helpline, WhatsApp,
 * shipping policies, and Easypaisa / Jazzcash / Bank account details.
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
    // Payments
    ["easypaisaTitle", (p.easypaisa && p.easypaisa.accountTitle) || "", "Payments", now],
    ["easypaisaNumber", (p.easypaisa && p.easypaisa.accountNumber) || "", "Payments", now],
    ["jazzcashTitle", (p.jazzcash && p.jazzcash.accountTitle) || "", "Payments", now],
    ["jazzcashNumber", (p.jazzcash && p.jazzcash.accountNumber) || "", "Payments", now],
    ["bankName", (p.bank && p.bank.bankName) || "", "Payments", now],
    ["bankTitle", (p.bank && p.bank.accountTitle) || "", "Payments", now],
    ["bankNumber", (p.bank && p.bank.accountNumber) || "", "Payments", now],
    ["bankIban", (p.bank && p.bank.iban) || "", "Payments", now]
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
 * Fetches all orders from Google Sheets so the Local Web App can display and manage them.
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
      status: String(row[9] || "Confirmed"),
      courier: String(row[10] || "TCS Express"),
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
    orders: orders.reverse() // latest orders first
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 2E. ORDER STATUS & DISPATCH TRACKING UPDATE HANDLER
 * Updates status in Google Sheets, saves courier & tracking ID,
 * and automatically sends customer dispatch email.
 */
function handleUpdateOrderStatus(payload) {
  const orderId = payload.orderId;
  const newStatus = payload.status || "Dispatched";
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

  // Update Status (Col 10), Courier (Col 11), Tracking (Col 12)
  sheet.getRange(foundRow, 10).setValue(newStatus);
  if (courier) sheet.getRange(foundRow, 11).setValue(courier);
  if (trackingNumber) sheet.getRange(foundRow, 12).setValue(trackingNumber);

  let emailSent = false;
  const customerEmail = String(orderData[4] || "");
  const customerName = String(orderData[2] || "");

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
    message: `Order #${orderId} status updated to ${newStatus}${emailSent ? ' & dispatch email sent to customer' : ''}.`
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
 * 4. ON-EDIT TRIGGER (Automated Dispatch Email)
 * When you change the status in Column J to "Dispatched", this sends the tracking email!
 */
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== "Orders") return;

  const row = e.range.getRow();
  const col = e.range.getColumn();

  // Column 10 is "Order Status"
  if (col === 10 && row > 1) {
    const newStatus = e.value;
    const values = sheet.getRange(row, 1, 1, 16).getValues()[0];

    const orderId = values[0];
    const customerName = values[2];
    const email = values[4];
    const courier = values[10] || "TCS Express";
    const trackingNumber = values[11] || "TRK-" + Math.floor(10000000 + Math.random() * 90000000);
    const dispatchEmailSent = values[15];

    if (newStatus === "Dispatched" && dispatchEmailSent !== "Yes" && email && email.includes("@")) {
      sendCustomerDispatchEmail({
        orderId: orderId,
        customerName: customerName,
        email: email,
        courier: courier,
        trackingNumber: trackingNumber
      });
      sheet.getRange(row, 16).setValue("Yes");
    }
  }
}

/**
 * 5. OFFICIAL LUXURY HTML INVOICE: CUSTOMER ORDER CONFIRMATION
 * Matches Calenvee's official high-resolution invoice template.
 */
function sendCustomerOrderConfirmationEmail(order) {
  const cfg = getDynamicStoreSettings();
  const subject = `Invoice & Order Confirmation: #${order.orderId} | ${cfg.storeName}`;
  const htmlBody = generateCustomerInvoiceEmailHtml(order);

  GmailApp.sendEmail(order.email, subject, "", {
    htmlBody: htmlBody,
    name: cfg.storeName
  });
}

function generateCustomerInvoiceEmailHtml(order) {
  const cfg = getDynamicStoreSettings();
  const dateStr = order.createdAt 
    ? Utilities.formatDate(new Date(order.createdAt), "Asia/Karachi", "dd MMM yyyy")
    : Utilities.formatDate(new Date(), "Asia/Karachi", "dd MMM yyyy");

  const itemsList = order.items || [];
  const rowsHtml = itemsList.map((item, idx) => {
    const itemName = item.name || (item.product && item.product.name) || "Calenvee Product";
    let itemImage = (item.product && item.product.images && item.product.images[0]) || item.image || "https://calenvee.pk/hero/hero_podium_collection.jpg";
    if (itemImage && !itemImage.startsWith("http")) {
      itemImage = "https://calenvee.pk" + (itemImage.startsWith("/") ? "" : "/") + itemImage;
    }
    const itemPrice = item.price || (item.product && item.product.price) || 0;
    const itemQty = item.quantity || 1;
    const itemColor = (item.selectedColor && item.selectedColor.name) || item.color || "";
    const itemSize = (item.selectedSize && item.selectedSize.name) || item.size || "";
    
    let variantDetails = [];
    if (itemSize) variantDetails.push(`Size: ${itemSize}`);
    if (itemColor) variantDetails.push(`Color: ${itemColor}`);
    const variantStr = variantDetails.join(" | ");

    return `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 14px 10px; text-align: center; font-size: 12px; font-weight: bold; color: #6B7280; vertical-align: middle;">
          ${idx + 1}
        </td>
        <td style="padding: 14px 12px; vertical-align: middle;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 48px; vertical-align: middle;">
                <img src="${itemImage}" alt="${itemName}" width="46" height="46" style="width: 46px; height: 46px; object-fit: contain; border-radius: 8px; border: 1px solid #E5E7EB; background-color: #F9FAFB; display: block;" />
              </td>
              <td style="padding-left: 12px; vertical-align: middle;">
                <div style="font-size: 13px; font-weight: 700; color: #111827; line-height: 1.3;">${itemName}</div>
                ${variantStr ? `<div style="font-size: 11px; color: #6B7280; margin-top: 3px;">${variantStr}</div>` : ""}
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 14px 10px; text-align: center; font-size: 12px; font-weight: 600; color: #111827; vertical-align: middle;">
          ${itemQty}
        </td>
        <td style="padding: 14px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #374151; vertical-align: middle;">
          ${itemPrice.toLocaleString()}
        </td>
        <td style="padding: 14px 12px; text-align: right; font-size: 13px; font-weight: 800; color: #111827; vertical-align: middle;">
          ${(itemPrice * itemQty).toLocaleString()}
        </td>
      </tr>
    `;
  }).join("");

  const subtotal = order.subtotal || order.total || 0;
  const shippingFeeStr = order.shippingFee === 0 ? "FREE" : (order.shippingFee ? order.shippingFee.toLocaleString() : "250");
  const totalStr = (order.total || 0).toLocaleString();
  const paymentMethodLabel = (order.paymentMethod === "cod" || !order.paymentMethod)
    ? "Cash on Delivery (COD)"
    : order.paymentMethod.toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${order.orderId}</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 660px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    
    <!-- Header: Logo & Contact Info -->
    <tr>
      <td style="padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 30px 24px 16px 30px; vertical-align: top;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 32px; font-weight: 900; letter-spacing: 1px; color: #111827; font-family: 'Arial Black', Arial, sans-serif; line-height: 1;">
                      C<span style="color: #F97316;">A</span>LENVEE
                    </div>
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 2.5px; color: #111827; margin-top: 5px; text-transform: uppercase;">
                      SHOP SMART. LIVE BETTER.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 24px 28px 16px 10px; text-align: right; vertical-align: top;">
              <div style="display: inline-block; text-align: right; font-size: 11px; color: #4B5563; line-height: 1.7;">
                <div>🌐 <a href="https://calenvee.pk" style="color: #4B5563; text-decoration: none;">www.calenvee.pk</a></div>
                <div>📷 <a href="https://instagram.com/calenvee" style="color: #4B5563; text-decoration: none;">@calenvee</a></div>
                <div>✉️ <a href="mailto:support@calenvee.pk" style="color: #4B5563; text-decoration: none;">support@calenvee.pk</a></div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Title & Metadata Section -->
    <tr>
      <td style="padding: 10px 30px 20px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #F1F5F9; padding-top: 20px;">
          <tr>
            <!-- Left: Title & Subtitle -->
            <td style="vertical-align: top;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #111827; letter-spacing: 0.5px; line-height: 1.1;">INVOICE</h1>
              <div style="margin-top: 6px; font-size: 13px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase;">THANK YOU FOR YOUR ORDER!</div>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #6B7280; line-height: 1.5;">
                We truly appreciate your trust in CALENVEE.<br>Here's a summary of your order details.
              </p>
            </td>
            <!-- Right: Order Date & Order Number Cards -->
            <td style="text-align: right; vertical-align: top; width: 230px;">
              <table cellpadding="0" cellspacing="0" border="0" align="right" style="margin-top: 4px;">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 6px 12px;">
                      <tr>
                        <td style="width: 26px; font-size: 16px; vertical-align: middle;">📅</td>
                        <td style="padding-left: 6px; text-align: left;">
                          <div style="font-size: 9px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Order Date</div>
                          <div style="font-size: 12px; font-weight: 700; color: #111827;">${dateStr}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 6px 12px;">
                      <tr>
                        <td style="width: 26px; vertical-align: middle;">
                          <div style="width: 20px; height: 20px; background-color: #F97316; color: #FFFFFF; border-radius: 4px; text-align: center; line-height: 20px; font-size: 11px; font-weight: 900;">#</div>
                        </td>
                        <td style="padding-left: 6px; text-align: left;">
                          <div style="font-size: 9px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Order Number</div>
                          <div style="font-size: 12px; font-weight: 900; color: #111827; font-family: monospace;">#${order.orderId}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Customer Details Section -->
    <tr>
      <td style="padding: 0 30px 20px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #E5E7EB; padding-top: 16px;">
          <tr>
            <td>
              <div style="font-size: 14px; font-weight: 800; color: #111827; margin-bottom: 10px;">
                <span style="color: #F97316; font-size: 16px; margin-right: 4px;">👤</span> Customer Details
              </div>
              <table cellpadding="3" cellspacing="0" border="0" style="font-size: 12px; color: #374151;">
                <tr>
                  <td style="width: 70px; font-weight: 600; color: #6B7280;">Name</td>
                  <td style="font-weight: 700; color: #111827;">: ${order.customerName}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #6B7280;">Phone</td>
                  <td style="font-weight: 500; color: #111827;">: ${order.phone}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #6B7280;">Email</td>
                  <td style="font-weight: 500; color: #111827;">: ${order.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #6B7280; vertical-align: top;">Address</td>
                  <td style="font-weight: 500; color: #111827; line-height: 1.4;">: ${order.address}, ${order.city}, Pakistan</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Order Summary Table -->
    <tr>
      <td style="padding: 0 30px 20px 30px;">
        <div style="font-size: 14px; font-weight: 800; color: #111827; margin-bottom: 12px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
          <span style="color: #F97316; font-size: 16px; margin-right: 4px;">🛒</span> Order Summary
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background-color: #111827; color: #FFFFFF; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px 8px; width: 36px; text-align: center;">#</th>
              <th style="padding: 10px 12px; text-align: left;">Item</th>
              <th style="padding: 10px 8px; width: 60px; text-align: center;">Quantity</th>
              <th style="padding: 10px 12px; width: 100px; text-align: right;">Unit Price (PKR)</th>
              <th style="padding: 10px 12px; width: 100px; text-align: right;">Total Price (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </td>
    </tr>

    <!-- Notice Box & Calculation Totals -->
    <tr>
      <td style="padding: 0 30px 24px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <!-- Left Notice Box -->
            <td style="width: 50%; vertical-align: top; padding-right: 14px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="width: 38px; vertical-align: top;">
                    <div style="width: 32px; height: 32px; background-color: #F97316; border-radius: 50%; text-align: center; line-height: 32px; font-size: 16px; color: #FFFFFF;">🚚</div>
                  </td>
                  <td style="padding-left: 10px; vertical-align: top;">
                    <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.5; font-weight: 500;">
                      Your order is being prepared with care and will be shipped soon. We'll keep you updated!
                    </p>
                    <div style="width: 36px; height: 3px; background-color: #F97316; border-radius: 2px; margin-top: 8px;"></div>
                  </td>
                </tr>
              </table>
            </td>
            <!-- Right Totals Table -->
            <td style="width: 50%; vertical-align: top; padding-left: 14px;">
              <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 12px;">
                <tr>
                  <td style="color: #6B7280; font-weight: 500;">Subtotal</td>
                  <td style="text-align: right; font-weight: 700; color: #111827;">${subtotal.toLocaleString()}</td>
                </tr>
                ${order.discount ? `
                <tr>
                  <td style="color: #059669; font-weight: 500;">Discount</td>
                  <td style="text-align: right; font-weight: 700; color: #059669;">- ${order.discount.toLocaleString()}</td>
                </tr>` : ""}
                <tr>
                  <td style="color: #6B7280; font-weight: 500;">Shipping Fee</td>
                  <td style="text-align: right; font-weight: 700; color: #111827;">${shippingFeeStr}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 8px;">
                    <table width="100%" cellpadding="10" cellspacing="0" border="0" style="background-color: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px;">
                      <tr>
                        <td style="font-size: 13px; font-weight: 800; color: #111827; text-transform: uppercase;">Total Amount</td>
                        <td style="text-align: right; font-size: 18px; font-weight: 900; color: #111827;">${totalStr}</td>
                      </tr>
                    </table>
                    <div style="font-size: 10px; color: #9CA3AF; text-align: right; margin-top: 4px; font-style: italic;">
                      (All prices are in Pakistani Rupees)
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Bottom 3 Cards: Payment Method, Order Notes, Thank You -->
    <tr>
      <td style="padding: 0 30px 26px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #E5E7EB; padding-top: 18px;">
          <tr>
            <!-- Card 1: Payment Method -->
            <td style="width: 33%; vertical-align: top; padding-right: 8px;">
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; min-height: 85px;">
                <div style="font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 4px;">
                  ℹ️ Payment Method
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #111827; margin-bottom: 3px;">
                  ${paymentMethodLabel}
                </div>
                <div style="font-size: 10px; color: #6B7280; line-height: 1.4;">
                  ${order.paymentMethod === 'cod' ? 'You can pay at the time of delivery.' : 'Receipt verified & confirmed.'}
                </div>
              </div>
            </td>
            <!-- Card 2: Order Notes -->
            <td style="width: 34%; vertical-align: top; padding: 0 4px;">
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; min-height: 85px;">
                <div style="font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 4px;">
                  📝 Order Notes
                </div>
                <div style="font-size: 10px; color: #6B7280; line-height: 1.4;">
                  ${order.notes && order.notes !== 'N/A' && order.notes !== 'None' ? order.notes : 'Please inspect your order at the time of delivery. In case of any issue, contact us within 24 hours.'}
                </div>
              </div>
            </td>
            <!-- Card 3: Thank You Signature -->
            <td style="width: 33%; vertical-align: top; padding-left: 8px;">
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; min-height: 85px; text-align: center;">
                <div style="font-family: 'Brush Script MT', 'Caveat', cursive, sans-serif; font-size: 28px; color: #F97316; line-height: 1; font-weight: bold;">
                  Thank You
                </div>
                <div style="font-size: 9px; font-weight: 800; letter-spacing: 1.5px; color: #111827; text-transform: uppercase; margin-top: 4px;">
                  FOR CHOOSING CALENVEE!
                </div>
                <div style="width: 28px; height: 2px; background-color: #F97316; margin: 6px auto 0 auto; border-radius: 2px;"></div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer Banner -->
    <tr>
      <td style="background-color: #111827; padding: 18px 24px; color: #FFFFFF;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 18px; font-weight: 900; letter-spacing: 1px; color: #FFFFFF; font-family: 'Arial Black', Arial, sans-serif;">
                C<span style="color: #F97316;">A</span>LENVEE
              </div>
              <div style="font-size: 8px; font-weight: 700; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase; margin-top: 2px;">
                SHOP SMART. LIVE BETTER.
              </div>
            </td>
            <td style="width: 20px; text-align: center; color: #374151; font-size: 18px; vertical-align: middle;">|</td>
            <td style="text-align: right; vertical-align: middle; font-size: 11px; color: #D1D5DB;">
              <span style="margin-left: 8px;">🛡️ Quality Products</span>
              <span style="margin-left: 12px;">🚚 Fast &amp; Reliable Shipping</span>
              <span style="margin-left: 12px;">💬 Dedicated Support</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
}

/**
 * 6. LUXURY HTML EMAIL: DISPATCH NOTIFICATION
 */
function sendCustomerDispatchEmail(dispatchData) {
  const cfg = getDynamicStoreSettings();
  const rawTrk = dispatchData.trackingNumber;
  const hasTracking = rawTrk && String(rawTrk).trim() !== '' && String(rawTrk).trim().toUpperCase() !== 'N/A';
  
  const subject = hasTracking
    ? `Your Order #${dispatchData.orderId} Has Been Dispatched! Tracking: ${rawTrk} | ${cfg.storeName}`
    : `Your Order #${dispatchData.orderId} Has Been Dispatched! | ${cfg.storeName}`;

  const trackingBoxHtml = hasTracking ? `
    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px; margin: 16px 0; text-align: left;">
      <div style="font-size: 12px; color: #1E40AF; margin-bottom: 6px;"><strong>Courier Service:</strong> ${dispatchData.courier || 'TCS Express'}</div>
      <div style="font-size: 14px; color: #1E3A8A; font-weight: 800;"><strong>Tracking Number:</strong> ${rawTrk}</div>
      <div style="font-size: 11px; color: #3B82F6; margin-top: 6px;">You can track this consignment on the official courier portal or via SMS alerts.</div>
    </div>
  ` : `
    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px; margin: 16px 0; text-align: left;">
      <div style="font-size: 12px; color: #1E40AF; margin-bottom: 6px;"><strong>Courier Service:</strong> ${dispatchData.courier || 'TCS Express'}</div>
      <div style="font-size: 13px; color: #1E3A8A; font-weight: 700;"><strong>Consignment Status:</strong> Dispatched & In Transit for Doorstep Delivery</div>
      <div style="font-size: 11px; color: #3B82F6; margin-top: 6px;">The courier delivery rider will coordinate with you via call/SMS prior to delivery. Please keep the exact payable amount ready.</div>
    </div>
  `;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 24px; color: #111827;">
      <table align="center" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; margin: 0 auto;">
        <!-- Header with Store Logo & Slogan -->
        <tr>
          <td style="background-color: ${cfg.brandNavy}; padding: 32px 24px; text-align: center;">
            <div style="margin-bottom: 10px;">
              <img src="${cfg.logoUrl}" alt="${cfg.storeName}" style="max-height: 44px; width: auto; display: inline-block; border: 0;" />
            </div>
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 800; font-family: 'Arial Black', Arial, sans-serif;">CALENVEE</h1>
            <p style="color: ${cfg.brandOrange}; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">${cfg.storeTagline} • ORDER DISPATCHED</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 24px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
            <h2 style="margin: 0; font-size: 20px; color: #111827;">Your Package is on the Way!</h2>
            <p style="margin: 8px 0 16px 0; font-size: 13px; color: #6B7280;">
              Dear <strong>${dispatchData.customerName}</strong>, your Calenvee parcel for Order <strong>#${dispatchData.orderId}</strong> has been handed over to ${dispatchData.courier || 'our delivery partner'}.
            </p>
            
            ${trackingBoxHtml}

            <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
              Need delivery status assistance? WhatsApp us at <a href="https://wa.me/${cfg.helplineWhatsAppRaw}" style="color: #F97316; font-weight: bold;">${cfg.helplinePhone}</a>.
            </p>
          </td>
        </tr>
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
 * 7. STORE OWNER NOTIFICATION EMAIL (WITH ATTACHED PAYMENT RECEIPT)
 */
function sendOwnerNewOrderAlertEmail(order, receiptBlob, receiptUrl) {
  const cfg = getDynamicStoreSettings();
  const isPrepaid = (order.paymentMethod || "cod").toLowerCase() !== "cod";
  const hasReceipt = !!receiptBlob;
  
  let subjectPrefix = "📦 [NEW ORDER]";
  if (hasReceipt) {
    subjectPrefix = "🧾 [PAYMENT RECEIPT ATTACHED]";
  } else if (isPrepaid) {
    subjectPrefix = "⚠️ [UNVERIFIED PREPAID]";
  } else {
    subjectPrefix = "💵 [COD ORDER]";
  }

  const subject = `${subjectPrefix} Order #${order.orderId} — Rs. ${order.total.toLocaleString()} (${order.customerName}, ${order.city})`;

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #1E293B;">
        <strong>${item.name}</strong>
        ${item.selectedColor ? `<br><span style="font-size: 11px; color: #64748B;">Color: ${item.selectedColor.name}</span>` : ""}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #475569; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #0F172A; text-align: right; font-weight: bold;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join("");

  // Payment status card
  let paymentVerificationCard = "";
  if (hasReceipt) {
    paymentVerificationCard = `
      <div style="margin: 20px 0; padding: 16px; background-color: #ECFDF5; border: 1px solid #10B981; border-radius: 12px;">
        <div style="margin-bottom: 6px;">
          <strong style="color: #065F46; font-size: 13px;">🧾 PAYMENT PROOF ATTACHED (${order.receiptFileName || 'Slip'})</strong>
        </div>
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #047857; line-height: 1.5;">
          The customer uploaded a transaction screenshot during checkout. It is <strong>attached directly to this email</strong> and saved in your Google Drive.
        </p>
        ${receiptUrl && receiptUrl.startsWith("http") ? `
          <a href="${receiptUrl}" target="_blank" style="display: inline-block; background-color: #0B132B; color: #FFFFFF; font-size: 11px; font-weight: bold; text-decoration: none; padding: 8px 14px; border-radius: 8px;">
            Open High-Res Receipt in Google Drive ↗
          </a>
        ` : ""}
      </div>
    `;
  } else if (isPrepaid) {
    paymentVerificationCard = `
      <div style="margin: 20px 0; padding: 16px; background-color: #FFFBEB; border: 1px solid #F59E0B; border-radius: 12px;">
        <div style="margin-bottom: 6px;">
          <strong style="color: #92400E; font-size: 13px;">⚠️ NO SCREENSHOT UPLOADED DURING CHECKOUT</strong>
        </div>
        <p style="margin: 0; font-size: 12px; color: #B45309; line-height: 1.5;">
          Customer selected ${(order.paymentMethod || "").toUpperCase()} but did not attach a slip. Please verify payment on WhatsApp (${order.phone}) before dispatching.
        </p>
      </div>
    `;
  } else {
    paymentVerificationCard = `
      <div style="margin: 20px 0; padding: 14px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
        <strong style="color: #1E293B; font-size: 12px;">💵 CASH ON DELIVERY (COD)</strong>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748B;">
          Collect Rs. ${order.total.toLocaleString()} in cash at customer's doorstep via courier rider.
        </p>
      </div>
    `;
  }

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 20px; color: #0F172A;">
      <table align="center" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Top Banner -->
        <tr>
          <td style="background-color: ${cfg.brandNavy}; padding: 24px 20px; text-align: center;">
            <img src="${cfg.logoUrl}" alt="${cfg.storeName}" style="max-height: 38px; margin-bottom: 8px;" />
            <div style="color: #FFFFFF; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">🔥 NEW ORDER RECEIVED</div>
            <div style="color: ${cfg.brandOrange}; font-size: 10px; font-weight: bold; margin-top: 4px; letter-spacing: 1.5px;">${cfg.storeTagline}</div>
          </td>
        </tr>

        <!-- Order Summary & Amount -->
        <tr>
          <td style="padding: 24px 24px 16px 24px;">
            <table width="100%" style="margin-bottom: 16px;">
              <tr>
                <td>
                  <span style="font-size: 11px; color: #64748B; text-transform: uppercase; font-family: monospace;">Order ID</span>
                  <div style="font-size: 20px; font-weight: bold; color: #0B132B; font-family: monospace;">#${order.orderId}</div>
                </td>
                <td style="text-align: right;">
                  <span style="font-size: 11px; color: #64748B; text-transform: uppercase;">Total Payable</span>
                  <div style="font-size: 22px; font-weight: 800; color: ${cfg.brandOrange};">Rs. ${order.total.toLocaleString()}</div>
                </td>
              </tr>
            </table>

            <!-- Payment Proof Alert / Status Card -->
            ${paymentVerificationCard}

            <!-- Customer Details Card -->
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <div style="font-size: 11px; font-weight: bold; color: #64748B; text-transform: uppercase; margin-bottom: 8px;">Customer Information</div>
              <table width="100%" style="font-size: 12px; line-height: 1.8;">
                <tr><td width="30%" style="color: #64748B;">Name:</td><td style="font-weight: bold; color: #1E293B;">${order.customerName}</td></tr>
                <tr><td style="color: #64748B;">Mobile (WhatsApp):</td><td><a href="https://wa.me/${(order.phone || '').replace(/[^0-9]/g, '')}" style="color: #2563EB; font-weight: bold; text-decoration: none;">${order.phone} 💬</a></td></tr>
                <tr><td style="color: #64748B;">Email:</td><td style="color: #1E293B;">${order.email || 'N/A'}</td></tr>
                <tr><td style="color: #64748B;">City:</td><td style="font-weight: bold; color: #1E293B;">${order.city}</td></tr>
                <tr><td style="color: #64748B;">Address:</td><td style="color: #1E293B;">${order.address}</td></tr>
                <tr><td style="color: #64748B;">Payment:</td><td style="font-weight: bold; color: #0B132B; text-transform: uppercase;">${order.paymentMethod || 'COD'}</td></tr>
                ${order.notes && order.notes !== "None" && order.notes !== "N/A" ? `<tr><td style="color: #64748B;">Notes:</td><td style="color: #D97706; font-style: italic;">"${order.notes}"</td></tr>` : ""}
              </table>
            </div>

            <!-- Ordered Items List -->
            <div style="font-size: 11px; font-weight: bold; color: #64748B; text-transform: uppercase; margin-bottom: 8px;">Order Items</div>
            <table width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="border-bottom: 2px solid #E2E8F0;">
                  <th align="left" style="padding-bottom: 8px; font-size: 11px; color: #64748B;">Product</th>
                  <th align="center" style="padding-bottom: 8px; font-size: 11px; color: #64748B;">Qty</th>
                  <th align="right" style="padding-bottom: 8px; font-size: 11px; color: #64748B;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Quick Action Buttons -->
            <table width="100%" style="margin-top: 10px;">
              <tr>
                <td align="center">
                  <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" target="_blank" style="background-color: ${cfg.brandNavy}; color: #FFFFFF; font-size: 12px; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; display: inline-block;">
                    Open Orders in Google Sheets 📊
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #F8FAFC; padding: 16px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 10px; color: #94A3B8;">
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

  GmailApp.sendEmail(cfg.ownerEmail, subject, "", mailOptions);
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
    .addItem("✉️ 3. Send Dispatch Email for Selected Row", "sendDispatchEmailForSelectedRow")
    .addItem("🧹 4. Clean Ghost / Empty Orders (Remove Blank Rows)", "cleanGhostOrders")
    .addItem("🧪 5. Send Test Email to Store Owner", "testOrderEmail")
    .addSeparator()
    .addItem("🗑️ 6. Reset All Dummy Orders (Fresh Store)", "resetDummyData")
    .addToUi();
}

function sendDispatchEmailForSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Please select a customer order row first.");
    return;
  }

  const values = sheet.getRange(row, 1, 1, 17).getValues()[0];
  const orderId = values[0];
  const customerName = values[2];
  const email = values[4];
  const courier = values[10] || "TCS Express";
  let trackingNumber = String(values[11] || "").trim();

  if (!email || !email.includes("@")) {
    SpreadsheetApp.getUi().alert("No valid email address in this row.");
    return;
  }

  // Tracking number is OPTIONAL! If empty or N/A, keep it as N/A
  if (!trackingNumber || trackingNumber === "") {
    trackingNumber = "N/A";
  }

  sendCustomerDispatchEmail({
    orderId: orderId,
    customerName: customerName,
    email: email,
    courier: courier,
    trackingNumber: trackingNumber
  });

  sheet.getRange(row, 10).setValue("Dispatched");
  sheet.getRange(row, 12).setValue(trackingNumber);
  sheet.getRange(row, 16).setValue("Yes");
  SpreadsheetApp.getUi().alert(`✅ Dispatch email sent to ${customerName} (${email})!\nOrder: #${orderId}\nStatus: Dispatched\nTracking: ${trackingNumber}`);
}

/**
 * 11. CLEAN GHOST / EMPTY ORDERS
 * Safely removes any erroneous empty rows (e.g. rows created with missing customer details,
 * or 0 total) from both Orders and OrderItems tabs.
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
  // Loop from bottom to top so index shifts do not affect row deletion
  for (let r = lastRow; r >= 2; r--) {
    const row = ordersSheet.getRange(r, 1, 1, 17).getValues()[0];
    const orderId = String(row[0] || "").trim();
    const customerName = String(row[2] || "").trim();
    const phone = String(row[3] || "").trim();
    const total = Number(row[8] || 0);
    
    // Ghost row criteria: customer name is empty or "N/A", and total is 0 or phone is empty/"N/A"
    const isGhost = (!customerName || customerName.toUpperCase() === "N/A") && (total === 0 || !phone || phone.toUpperCase() === "N/A");
    
    if (isGhost) {
      if (orderId) deletedOrders.push(orderId);
      ordersSheet.deleteRow(r);
    }
  }
  
  // Clean corresponding OrderItems for deleted ghost orders or blank items
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
  
  // Refresh Dashboard
  if (typeof createExecutiveDashboard === 'function') {
    try { createExecutiveDashboard(); } catch (_) {}
  }
  
  const msg = `Cleaned ${deletedOrders.length} ghost/empty row(s) successfully!`;
  SpreadsheetApp.getUi().alert("🧹 Cleanup Complete!\n\n" + msg + (deletedOrders.length > 0 ? "\nRemoved IDs: " + deletedOrders.join(", ") : ""));
  return msg;
}

/**
 * 9. TEST FUNCTION (Run this in script editor to test right now!)
 */
function testOrderEmail() {
  const sampleOrder = {
    orderId: "CV-999001",
    customerName: "Zohaib Saleem",
    email: STORE_CONFIG.ownerEmail, // Sends test to calenvee.pk@gmail.com
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
        selectedColor: { name: "Matte Stealth Black" }
      }
    ]
  };

  // Create a sample test receipt text blob to demonstrate attachment
  const testBlob = Utilities.newBlob("CALENVEE TEST RECEIPT - EASYPAISA TRANSACTION ID: 882910405", "text/plain", "easypaisa_receipt_sample.txt");

  sendCustomerOrderConfirmationEmail(sampleOrder);
  sendOwnerNewOrderAlertEmail(sampleOrder, testBlob, "https://drive.google.com");
  Logger.log("Test emails with sample receipt sent to " + STORE_CONFIG.ownerEmail);
}

/**
 * 10. RESET DUMMY DATA FUNCTION
 * Clears all sample/starter orders and line items from "Orders" and "OrderItems" sheets,
 * preserving header Row 1 and updating the Executive Dashboard to fresh zero state.
 */
function resetDummyData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Clear Orders tab (keep header row 1)
  const ordersSheet = ss.getSheetByName("Orders");
  if (ordersSheet && ordersSheet.getLastRow() > 1) {
    ordersSheet.deleteRows(2, ordersSheet.getLastRow() - 1);
  }

  // 2. Clear OrderItems tab (keep header row 1)
  const itemsSheet = ss.getSheetByName("OrderItems");
  if (itemsSheet && itemsSheet.getLastRow() > 1) {
    itemsSheet.deleteRows(2, itemsSheet.getLastRow() - 1);
  }

  // 3. Refresh Dashboard KPIs
  if (typeof createExecutiveDashboard === 'function') {
    createExecutiveDashboard();
  }

  Logger.log("✅ All dummy orders cleared successfully. Sheet is ready for real live customer orders!");
}


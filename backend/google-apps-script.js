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
        "CV-100201", now, "Hamza Tariq", "+923001234567", "calenvee.pk@gmail.com",
        "Lahore", "DHA Phase 5, Sector C", "COD", 3899, "Delivered",
        "TCS Express", "TRK-982101", "Obsidian Chronograph Edition (x1) - Rs. 3899", "Deliver after 4 PM", "Yes", "Yes", "N/A (Cash on Delivery)"
      ],
      [
        "CV-100202", now, "Ayesha Malik", "+923219876543", "calenvee.pk@gmail.com",
        "Karachi", "Clifton Block 4", "EASYPAISA", 4499, "Dispatched",
        "Trax Logistics", "TRK-982102", "Royal Gold Dress Watch (x1) - Rs. 4499", "Call before arrival", "Yes", "Yes", "Attached in Drive & Email 🧾"
      ],
      [
        "CV-100203", now, "Bilal Ahmed", "+923335551234", "calenvee.pk@gmail.com",
        "Islamabad", "F-7/2, Street 14", "COD", 3499, "Confirmed",
        "TCS Express", "N/A", "Azure Chronograph Edition (x1) - Rs. 3499", "Leave at reception", "Yes", "No", "N/A (Cash on Delivery)"
      ]
    ];
    ordersSheet.getRange(2, 1, sampleOrders.length, sampleOrders[0].length).setValues(sampleOrders);

    const sampleItems = [
      ["CV-100201", now, "Obsidian Chronograph Edition", 1, 3899, 3899, "Matte Stealth Black", "Standard"],
      ["CV-100202", now, "Royal Gold Dress Watch", 1, 4499, 4499, "Royal Gold", "Standard"],
      ["CV-100203", now, "Azure Chronograph Edition", 1, 3499, 3499, "Ocean Sunburst Blue", "Standard"]
    ];
    itemsSheet.getRange(2, 1, sampleItems.length, sampleItems[0].length).setValues(sampleItems);
  }

  // Auto-generate the Executive Dashboard tab!
  createExecutiveDashboard();
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
 * 2. WEBHOOK RECEIVER (doPost)
 * Receives order payloads from the Calenvee storefront checkout.
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);
    const order = payload.order || payload;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ordersSheet = ss.getSheetByName("Orders") || ss.getActiveSheet();
    const itemsSheet = ss.getSheetByName("OrderItems");

    const itemsList = order.items || [];
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

    // Append to Orders tab
    ordersSheet.appendRow([
      order.orderId || "CV-" + Math.floor(100000 + Math.random() * 900000),
      timestamp,
      order.customerName || "N/A",
      order.phone || "N/A",
      order.email || "N/A",
      order.city || "N/A",
      order.address || "N/A",
      paymentMethodUpper,
      order.total || 0,
      "Confirmed",
      order.courier || "TCS Express",
      order.trackingNumber || "N/A",
      itemsSummary,
      order.notes || "None",
      order.email && order.email.includes("@") ? "Yes" : "No Email",
      "No",
      receiptProofCell
    ]);

    // Append items to OrderItems tab
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

    // Send customer order confirmation email (if email was provided)
    if (order.email && order.email.includes("@") && order.email !== "N/A") {
      sendCustomerOrderConfirmationEmail(order);
    }

    // Send store owner instant notification with attached receipt to calenvee.pk@gmail.com
    sendOwnerNewOrderAlertEmail(order, receiptBlob, receiptUrl);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orderId: order.orderId,
      message: "Order placed and recorded successfully in Calenvee database."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. HEALTH CHECK & ORDER LOOKUP (doGet)
 */
function doGet(e) {
  const orderId = e.parameter.orderId;
  if (orderId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Orders");
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == orderId) {
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
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Order not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    service: "Calenvee Official Backend API",
    account: STORE_CONFIG.ownerEmail,
    status: "online",
    timestamp: new Date().toISOString()
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
 * 5. LUXURY HTML EMAIL: CUSTOMER ORDER CONFIRMATION
 */
function sendCustomerOrderConfirmationEmail(order) {
  const subject = `Order Confirmed: ${order.orderId} | Calenvee.pk`;

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #E5E7EB; font-size: 13px; color: #111827;">
        <strong>${item.name}</strong>
        ${item.selectedColor ? `<br><span style="font-size: 11px; color: #6B7280;">Color: ${item.selectedColor.name}</span>` : ""}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #E5E7EB; font-size: 13px; text-align: center; color: #374151;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #E5E7EB; font-size: 13px; text-align: right; color: #111827; font-weight: bold;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join("");

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 24px; color: #111827;">
      <table align="center" width="100%" max-width="600" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin: 0 auto;">
        
        <!-- Header with Store Logo & Slogan -->
        <tr>
          <td style="background-color: ${STORE_CONFIG.brandNavy}; padding: 36px 24px; text-align: center;">
            <div style="margin-bottom: 12px;">
              <img src="${STORE_CONFIG.logoUrl}" alt="${STORE_CONFIG.storeName}" style="max-height: 48px; width: auto; display: inline-block; border: 0;" />
            </div>
            <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; letter-spacing: 2px; font-weight: 800; font-family: 'Arial Black', Arial, sans-serif;">CALENVEE</h1>
            <p style="color: ${STORE_CONFIG.brandOrange}; font-size: 12px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">${STORE_CONFIG.storeTagline}</p>
          </td>
        </tr>
        
        <!-- Hero Confirmation -->
        <tr>
          <td style="padding: 32px 24px 20px 24px; text-align: center;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background-color: #ECFDF5; color: #059669; font-size: 24px; margin-bottom: 12px;">✓</div>
            <h2 style="margin: 0; font-size: 20px; color: #111827;">Thank You For Your Order!</h2>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6B7280; line-height: 1.5;">
              Dear <strong>${order.customerName}</strong>, your order has been received and is being prepared for dispatch.
            </p>
            <div style="margin-top: 16px; padding: 10px 18px; background-color: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; display: inline-block;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #C2410C; font-weight: bold;">Order Reference:</span>
              <span style="font-size: 14px; font-weight: 800; color: #9A3412; margin-left: 6px;">${order.orderId}</span>
            </div>
          </td>
        </tr>

        <!-- Order Items Table -->
        <tr>
          <td style="padding: 0 24px 24px 24px;">
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #374151; margin-bottom: 12px; border-bottom: 2px solid ${STORE_CONFIG.brandOrange}; padding-bottom: 6px;">Order Summary</h3>
            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F3F4F6;">
                  <th style="padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #4B5563;">Item</th>
                  <th style="padding: 8px; text-align: center; font-size: 11px; text-transform: uppercase; color: #4B5563;">Qty</th>
                  <th style="padding: 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #4B5563;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Totals -->
            <table width="100%" style="margin-top: 16px; font-size: 13px;">
              <tr>
                <td style="color: #6B7280; padding: 4px 0;">Subtotal:</td>
                <td style="text-align: right; font-weight: 600; color: #111827;">Rs. ${(order.subtotal || order.total).toLocaleString()}</td>
              </tr>
              ${order.discount ? `
              <tr>
                <td style="color: #059669; padding: 4px 0;">Discount Applied:</td>
                <td style="text-align: right; font-weight: 600; color: #059669;">- Rs. ${order.discount.toLocaleString()}</td>
              </tr>` : ""}
              <tr>
                <td style="color: #6B7280; padding: 4px 0;">Delivery Charges:</td>
                <td style="text-align: right; font-weight: 600; color: #111827;">${order.shippingFee === 0 ? "FREE" : "Rs. " + order.shippingFee}</td>
              </tr>
              <tr style="border-top: 2px solid #E5E7EB; font-size: 16px;">
                <td style="padding-top: 10px; font-weight: 800; color: ${STORE_CONFIG.brandNavy};">Total Payable (COD):</td>
                <td style="padding-top: 10px; text-align: right; font-weight: 800; color: ${STORE_CONFIG.brandOrange};">Rs. ${(order.total).toLocaleString()}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Shipping Address Details -->
        <tr>
          <td style="padding: 0 24px 24px 24px;">
            <div style="background-color: #F9FAFB; border-radius: 12px; padding: 16px; border: 1px solid #E5E7EB;">
              <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #4B5563;">Shipping Details</h4>
              <p style="margin: 0; font-size: 12px; color: #1F2937; line-height: 1.6;">
                <strong>Recipient:</strong> ${order.customerName}<br>
                <strong>Phone:</strong> ${order.phone}<br>
                <strong>Delivery Address:</strong> ${order.address}, ${order.city}<br>
                <strong>Expected Delivery:</strong> ${STORE_CONFIG.deliveryWindow}<br>
                <strong>Payment Method:</strong> ${(order.paymentMethod || "cod").toUpperCase()}
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #F3F4F6; padding: 20px 24px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; font-size: 12px; color: #4B5563;">
              Have questions or need to modify your order? Chat with our team:
            </p>
            <p style="margin: 8px 0 0 0;">
              <a href="https://wa.me/${STORE_CONFIG.helplineWhatsAppRaw}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: bold; font-size: 12px; padding: 8px 16px; border-radius: 8px; text-decoration: none;">
                WhatsApp Helpline: ${STORE_CONFIG.helplinePhone}
              </a>
            </p>
            <p style="margin: 14px 0 0 0; font-size: 10px; color: #9CA3AF;">
              &copy; 2026 Calenvee.pk (${STORE_CONFIG.ownerEmail}). 100% Online Store Serving All Pakistan Cities.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  GmailApp.sendEmail(order.email, subject, "", {
    htmlBody: htmlBody,
    name: STORE_CONFIG.storeName
  });
}

/**
 * 6. LUXURY HTML EMAIL: DISPATCH NOTIFICATION
 */
function sendCustomerDispatchEmail(dispatchData) {
  const subject = `Your Order Has Been Dispatched! Tracking: ${dispatchData.trackingNumber} | Calenvee.pk`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 24px; color: #111827;">
      <table align="center" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; margin: 0 auto;">
        <!-- Header with Store Logo & Slogan -->
        <tr>
          <td style="background-color: ${STORE_CONFIG.brandNavy}; padding: 32px 24px; text-align: center;">
            <div style="margin-bottom: 10px;">
              <img src="${STORE_CONFIG.logoUrl}" alt="${STORE_CONFIG.storeName}" style="max-height: 44px; width: auto; display: inline-block; border: 0;" />
            </div>
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 800; font-family: 'Arial Black', Arial, sans-serif;">CALENVEE</h1>
            <p style="color: ${STORE_CONFIG.brandOrange}; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">${STORE_CONFIG.storeTagline} • ORDER DISPATCHED</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 24px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
            <h2 style="margin: 0; font-size: 20px; color: #111827;">Your Package is on the Way!</h2>
            <p style="margin: 8px 0 16px 0; font-size: 13px; color: #6B7280;">
              Dear <strong>${dispatchData.customerName}</strong>, your Calenvee parcel for Order <strong>${dispatchData.orderId}</strong> has been handed over to ${dispatchData.courier}.
            </p>
            
            <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px; margin: 16px 0; text-align: left;">
              <div style="font-size: 12px; color: #1E40AF; margin-bottom: 6px;"><strong>Courier Service:</strong> ${dispatchData.courier}</div>
              <div style="font-size: 14px; color: #1E3A8A; font-weight: 800;"><strong>Tracking Number:</strong> ${dispatchData.trackingNumber}</div>
              <div style="font-size: 11px; color: #3B82F6; margin-top: 6px;">Please keep the exact amount ready upon courier delivery (Nationwide Cash on Delivery).</div>
            </div>

            <p style="font-size: 12px; color: #6B7280; margin-top: 20px;">
              Need delivery status assistance? WhatsApp us at <a href="https://wa.me/${STORE_CONFIG.helplineWhatsAppRaw}" style="color: #F97316; font-weight: bold;">${STORE_CONFIG.helplinePhone}</a>.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  GmailApp.sendEmail(dispatchData.email, subject, "", {
    htmlBody: htmlBody,
    name: STORE_CONFIG.storeName
  });
}

/**
 * 7. STORE OWNER NOTIFICATION EMAIL (WITH ATTACHED PAYMENT RECEIPT)
 */
function sendOwnerNewOrderAlertEmail(order, receiptBlob, receiptUrl) {
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
          <td style="background-color: ${STORE_CONFIG.brandNavy}; padding: 24px 20px; text-align: center;">
            <img src="${STORE_CONFIG.logoUrl}" alt="Calenvee.pk" style="max-height: 38px; margin-bottom: 8px;" />
            <div style="color: #FFFFFF; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">🔥 NEW ORDER RECEIVED</div>
            <div style="color: ${STORE_CONFIG.brandOrange}; font-size: 10px; font-weight: bold; margin-top: 4px; letter-spacing: 1.5px;">${STORE_CONFIG.storeTagline}</div>
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
                  <div style="font-size: 22px; font-weight: 800; color: ${STORE_CONFIG.brandOrange};">Rs. ${order.total.toLocaleString()}</div>
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
                  <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" target="_blank" style="background-color: ${STORE_CONFIG.brandNavy}; color: #FFFFFF; font-size: 12px; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; display: inline-block;">
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

  GmailApp.sendEmail(STORE_CONFIG.ownerEmail, subject, "", mailOptions);
}

/**
 * 8. CUSTOM SPREADSHEET MENU
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Calenvee Store")
    .addItem("📊 1. Build / Refresh Executive Dashboard", "createExecutiveDashboard")
    .addItem("⚙️ 2. Setup All Sheets (Dashboard + Orders + OrderItems)", "setupSheet")
    .addSeparator()
    .addItem("✉️ 3. Send Dispatch Email for Selected Row", "sendDispatchEmailForSelectedRow")
    .addItem("🧪 4. Send Test Email to Store Owner", "testOrderEmail")
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
  const trackingNumber = values[11];

  if (!email || !email.includes("@")) {
    SpreadsheetApp.getUi().alert("No valid email address in this row.");
    return;
  }

  if (!trackingNumber || trackingNumber === "N/A") {
    SpreadsheetApp.getUi().alert("Please enter a tracking number in Column L before sending dispatch email.");
    return;
  }

  sendCustomerDispatchEmail({
    orderId: orderId,
    customerName: customerName,
    email: email,
    courier: courier,
    trackingNumber: trackingNumber
  });

  sheet.getRange(row, 10).setValue("Dispatched");
  sheet.getRange(row, 16).setValue("Yes");
  SpreadsheetApp.getUi().alert(`✅ Dispatch email sent to ${customerName} (${email})!`);
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

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
 * Creates "Orders" and "OrderItems" sheets with professional styling, 
 * frozen rows, auto-column widths, and status dropdowns.
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
    "Dispatch Email Sent"
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

  SpreadsheetApp.getUi().alert("✅ Calenvee Orders & OrderItems configured successfully for calenvee.pk@gmail.com!");
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

    // Append to Orders tab
    ordersSheet.appendRow([
      order.orderId || "CV-" + Math.floor(100000 + Math.random() * 900000),
      timestamp,
      order.customerName || "N/A",
      order.phone || "N/A",
      order.email || "N/A",
      order.city || "N/A",
      order.address || "N/A",
      (order.paymentMethod || "cod").toUpperCase(),
      order.total || 0,
      "Confirmed",
      order.courier || "TCS Express",
      order.trackingNumber || "N/A",
      itemsSummary,
      order.notes || "None",
      order.email && order.email.includes("@") ? "Yes" : "No Email",
      "No"
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

    // Send store owner instant notification to calenvee.pk@gmail.com
    sendOwnerNewOrderAlertEmail(order);

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
 * 7. STORE OWNER NOTIFICATION EMAIL
 */
function sendOwnerNewOrderAlertEmail(order) {
  const subject = `🔥 NEW ORDER #${order.orderId} — Rs. ${order.total.toLocaleString()} (${order.customerName}, ${order.city})`;
  const itemsText = (order.items || []).map(i => `• ${i.name} x${i.quantity} (Rs. ${i.price})`).join("\n");

  const body = `
New customer order received on Calenvee.pk!

Order ID: ${order.orderId}
Customer: ${order.customerName}
Phone: ${order.phone}
Email: ${order.email}
City: ${order.city}
Address: ${order.address}
Payment Method: ${(order.paymentMethod || "cod").toUpperCase()}
Total Payable: Rs. ${order.total.toLocaleString()}

Items Ordered:
${itemsText}

Delivery Notes: ${order.notes || "None"}

Manage all orders in your Google Sheet:
${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
  `;

  GmailApp.sendEmail(STORE_CONFIG.ownerEmail, subject, body, {
    name: "Calenvee Order Bot"
  });
}

/**
 * 8. CUSTOM SPREADSHEET MENU
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Calenvee Store Manager")
    .addItem("1. Setup Sheet Columns", "setupSheet")
    .addItem("2. Send Dispatch Email for Selected Row", "sendDispatchEmailForSelectedRow")
    .addToUi();
}

function sendDispatchEmailForSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Please select a customer order row first.");
    return;
  }

  const values = sheet.getRange(row, 1, 1, 16).getValues()[0];
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
    paymentMethod: "cod",
    subtotal: 3899,
    discount: 0,
    shippingFee: 0,
    total: 3899,
    items: [
      {
        name: "Obsidian Chronograph Edition",
        quantity: 1,
        price: 3899,
        selectedColor: { name: "Matte Stealth Black" }
      }
    ]
  };

  sendCustomerOrderConfirmationEmail(sampleOrder);
  sendOwnerNewOrderAlertEmail(sampleOrder);
  Logger.log("Test emails sent to " + STORE_CONFIG.ownerEmail);
}

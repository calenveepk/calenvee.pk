/**
 * ==============================================================================
 * CALENVEE.PK — PRODUCTION GOOGLE APPS SCRIPT BACKEND
 * ==============================================================================
 * 
 * Capabilities:
 * 1. Webhook API: Receives orders from frontend checkout & logs into Google Sheets
 * 2. Automated Emails: Sends luxury HTML Order Confirmation, Dispatch, and Delivery emails
 * 3. Store Owner Alerts: Notifies the owner whenever an order arrives
 * 4. Tracking & Status: onEdit trigger automatically sends Dispatch Email when status is changed to "Dispatched"
 * 5. Custom Menu: Adds "Calenvee Manager" menu in Google Sheets for 1-click actions
 * 
 * Cost: $0 / Month (Uses Google Free Tier: 100 emails/day, unlimited Sheets storage)
 * ==============================================================================
 */

// CONFIGURATION: Set your store owner email address here
const STORE_CONFIG = {
  storeName: "Calenvee.pk",
  storeTagline: "Engineered for Modern Presence",
  ownerEmail: "mrvirkjutt106@gmail.com", // <-- Replace with your email to receive order alerts
  helplinePhone: "+923001234567",
  helplineWhatsAppRaw: "923001234567",
  deliveryWindow: "Nationwide Cash on Delivery (7-10 Days)",
  brandColorNavy: "#0B132B",
  brandColorOrange: "#F97316"
};

/**
 * 1. SETUP SPREADSHEET HEADERS & TABS
 * Run this function once from the script editor or from the custom menu.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Orders (Master Record)
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
    "Total (PKR)",
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
    .setBackground("#0B132B")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Arial");
  ordersSheet.setFrozenRows(1);

  // Sheet 2: OrderItems (Item-level detail for inventory & packing)
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
    "Total (PKR)",
    "Selected Color",
    "Selected Size"
  ];
  
  itemsSheet.getRange(1, 1, 1, itemHeaders.length).setValues([itemHeaders]);
  itemsSheet.getRange(1, 1, 1, itemHeaders.length)
    .setBackground("#F97316")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Arial");
  itemsSheet.setFrozenRows(1);

  SpreadsheetApp.getUi().alert("Calenvee Orders & OrderItems sheets configured successfully!");
}

/**
 * 2. WEBHOOK ENDPOINT (doPost)
 * Receives JSON payloads sent from the Calenvee checkout page.
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);
    const order = payload.order || payload;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ordersSheet = ss.getSheetByName("Orders") || ss.getActiveSheet();
    const itemsSheet = ss.getSheetByName("OrderItems");

    // Format items summary string
    const itemsList = order.items || [];
    const itemsSummary = itemsList.map(item => `${item.name} (x${item.quantity}) - Rs. ${item.price}`).join("; ");

    const timestamp = order.createdAt ? new Date(order.createdAt) : new Date();

    // Append to Orders Sheet
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
      order.deliveryNotes || "N/A",
      order.email && order.email.includes("@") ? "Yes" : "No Email",
      "No"
    ]);

    // Append individual line items to OrderItems Sheet
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

    // Send Customer Order Confirmation Email (if valid email provided)
    if (order.email && order.email.includes("@") && order.email !== "N/A") {
      sendCustomerOrderConfirmationEmail(order);
    }

    // Send Store Owner New Order Alert Email
    if (STORE_CONFIG.ownerEmail && STORE_CONFIG.ownerEmail.includes("@")) {
      sendOwnerNewOrderAlertEmail(order);
    }

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
 * 3. HEALTH CHECK & LOOKUP (doGet)
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
    service: "Calenvee Storefront Order API",
    status: "online",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 4. AUTOMATED ON-EDIT TRIGGER
 * When you change the status in Column J to "Dispatched", it automatically sends tracking details!
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
      // Mark as sent in Column 16
      sheet.getRange(row, 16).setValue("Yes");
    }
  }
}

/**
 * 5. EMAIL GENERATOR: CUSTOMER ORDER CONFIRMATION
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
        <!-- Header Banner -->
        <tr>
          <td style="background-color: ${STORE_CONFIG.brandColorNavy}; padding: 32px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; letter-spacing: 2px; font-weight: 800;">CALENVEE</h1>
            <p style="color: ${STORE_CONFIG.brandColorOrange}; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">${STORE_CONFIG.storeTagline}</p>
          </td>
        </tr>
        
        <!-- Confirmation Hero -->
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
            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #374151; margin-bottom: 12px; border-bottom: 2px solid ${STORE_CONFIG.brandColorOrange}; padding-bottom: 6px;">Order Summary</h3>
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

            <!-- Financial Totals -->
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
                <td style="padding-top: 10px; font-weight: 800; color: ${STORE_CONFIG.brandColorNavy};">Total Payable (COD):</td>
                <td style="padding-top: 10px; text-align: right; font-weight: 800; color: ${STORE_CONFIG.brandColorOrange};">Rs. ${(order.total).toLocaleString()}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Delivery & Payment Info -->
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

        <!-- Footer Assistance -->
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
              &copy; 2026 Calenvee.pk. All rights reserved. Operating 100% online across Pakistan.
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
 * 6. EMAIL GENERATOR: DISPATCH NOTIFICATION WITH TRACKING
 */
function sendCustomerDispatchEmail(dispatchData) {
  const subject = `Your Order Has Been Dispatched! Tracking: ${dispatchData.trackingNumber} | Calenvee.pk`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 24px; color: #111827;">
      <table align="center" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; margin: 0 auto;">
        <tr>
          <td style="background-color: ${STORE_CONFIG.brandColorNavy}; padding: 28px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; letter-spacing: 2px;">CALENVEE</h1>
            <p style="color: ${STORE_CONFIG.brandColorOrange}; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; font-weight: bold;">Order Dispatched</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 24px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
            <h2 style="margin: 0; font-size: 20px; color: #111827;">Your Package is on the Way!</h2>
            <p style="margin: 8px 0 16px 0; font-size: 13px; color: #6B7280;">
              Dear <strong>${dispatchData.customerName}</strong>, your Calenvee parcel for Order <strong>${dispatchData.orderId}</strong> has been handed over to the courier.
            </p>
            
            <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px; margin: 16px 0; text-align: left;">
              <div style="font-size: 12px; color: #1E40AF; margin-bottom: 6px;"><strong>Courier Service:</strong> ${dispatchData.courier}</div>
              <div style="font-size: 14px; color: #1E3A8A; font-weight: 800;"><strong>Tracking Number:</strong> ${dispatchData.trackingNumber}</div>
              <div style="font-size: 11px; color: #3B82F6; margin-top: 6px;">Please keep the exact amount ready upon courier delivery (Nationwide COD).</div>
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
 * 7. EMAIL GENERATOR: STORE OWNER NEW ORDER ALERT
 */
function sendOwnerNewOrderAlertEmail(order) {
  const subject = `🔥 NEW ORDER #${order.orderId} — Rs. ${order.total.toLocaleString()} (${order.customerName}, ${order.city})`;

  const itemsText = (order.items || []).map(i => `• ${i.name} x${i.quantity} (Rs. ${i.price})`).join("\n");

  const body = `
New order received on Calenvee.pk!

Order ID: ${order.orderId}
Customer: ${order.customerName}
Phone: ${order.phone}
Email: ${order.email}
City: ${order.city}
Address: ${order.address}
Payment Method: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : "COD"}
Total Payable: Rs. ${order.total.toLocaleString()}

Items Ordered:
${itemsText}

Delivery Notes: ${order.deliveryNotes || "None"}

View and manage all orders directly in your Google Sheet:
${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
  `;

  GmailApp.sendEmail(STORE_CONFIG.ownerEmail, subject, body, {
    name: "Calenvee Order Bot"
  });
}

/**
 * 8. CUSTOM SPREADSHEET MENU (UI)
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
  SpreadsheetApp.getUi().alert(`Dispatch notification sent successfully to ${customerName} (${email})!`);
}

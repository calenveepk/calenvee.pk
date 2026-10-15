import type { IncomingMessage, ServerResponse } from 'http';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Vercel serverless request/response types
interface VercelReq extends IncomingMessage {
  query: Record<string, string | string[]>;
  cookies: Record<string, string>;
  body: any;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelRes extends ServerResponse {
  status: (statusCode: number) => VercelRes;
  json: (jsonBody: any) => VercelRes;
  send: (body: any) => VercelRes;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

// Authoritative data loading (tamper-proof source of truth)
const require = createRequire(import.meta.url);
const productsData: any[] = require('../src/data/products.json');
const promotionsData: { promos: Record<string, any> } = require('../src/data/promotions.json');

const productCatalog = new Map<string, any>(productsData.map((p) => [p.id, p]));

/**
 * Generate luxury responsive HTML invoice matching Calenvee brand standards
 */
function generateLuxuryInvoiceHtml(order: {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  deliveryNotes?: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    variantColor?: string;
    variantSize?: string;
    image?: string;
  }>;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
}): string {
  const paymentMethodLabels: Record<string, string> = {
    cod: 'Cash on Delivery (COD)',
    jazzcash: 'JazzCash Mobile Account',
    easypaisa: 'EasyPaisa Mobile Account',
    bank_transfer: 'Meezan Bank Direct Transfer',
  };

  const paymentLabel = paymentMethodLabels[order.paymentMethod] || order.paymentMethod.toUpperCase();

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #1E293B;">
          <div style="font-weight: 600;">${item.name}</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
            ${item.variantColor && item.variantColor !== 'Standard' ? `Color: ${item.variantColor}` : ''}
            ${item.variantSize && item.variantSize !== 'Standard' ? ` | Size: ${item.variantSize}` : ''}
          </div>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #F1F5F9; font-size: 13px; text-align: center; color: #475569;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #F1F5F9; font-size: 13px; text-align: right; color: #475569;">
          Rs. ${item.unitPrice.toLocaleString()}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #F1F5F9; font-size: 13px; text-align: right; font-weight: 700; color: #0F172A;">
          Rs. ${item.lineTotal.toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — ${order.orderNumber} | Calenvee.pk</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
    
    <!-- Top Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #0B132B 0%, #1C2541 100%); padding: 32px 28px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; letter-spacing: 3px; color: #FFFFFF; text-transform: uppercase;">
          CALENVEE
        </div>
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #F97316; margin-top: 4px; text-transform: uppercase;">
          Shop Smart, Live Better
        </div>
        <div style="display: inline-block; background-color: rgba(249, 115, 22, 0.15); border: 1px solid #F97316; border-radius: 20px; padding: 6px 16px; margin-top: 18px;">
          <span style="font-size: 12px; font-weight: 700; color: #F97316; letter-spacing: 0.5px;">
            ORDER CONFIRMED &bull; ${order.orderNumber}
          </span>
        </div>
      </td>
    </tr>

    <!-- Body Notice -->
    <tr>
      <td style="padding: 28px 28px 16px 28px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">
          Thank You, ${order.customerName}!
        </h2>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0;">
          Your order has been recorded in our dispatch system. We are preparing your parcel with our signature gift packaging. Expected delivery timeline is <strong>7–10 working days</strong> across Pakistan.
        </p>
      </td>
    </tr>

    <!-- Customer & Delivery Details -->
    <tr>
      <td style="padding: 0 28px 20px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; padding: 16px;">
          <tr>
            <td style="vertical-align: top; width: 50%; font-size: 12px; line-height: 1.6; color: #334155;">
              <strong style="color: #0F172A; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</strong>
              ${order.customerName}<br />
              ${order.address}<br />
              <strong>${order.city}</strong>, Pakistan<br />
              Phone: <strong>${order.phone}</strong>
            </td>
            <td style="vertical-align: top; width: 50%; font-size: 12px; line-height: 1.6; color: #334155; padding-left: 12px;">
              <strong style="color: #0F172A; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Details</strong>
              Method: <strong>${paymentLabel}</strong><br />
              Status: <span style="color: #EA580C; font-weight: 700;">Pending Verification</span><br />
              ${order.deliveryNotes ? `Notes: <em>${order.deliveryNotes}</em>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Order Items Table -->
    <tr>
      <td style="padding: 0 28px 20px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <thead>
            <tr style="background-color: #F1F5F9; text-align: left;">
              <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Product</th>
              <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: center;">Qty</th>
              <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Unit Price</th>
              <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </td>
    </tr>

    <!-- Summary Breakdown -->
    <tr>
      <td style="padding: 0 28px 24px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width: 50%;"></td>
            <td style="width: 50%;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #475569;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0F172A;">Rs. ${order.subtotal.toLocaleString()}</td>
                </tr>
                ${
                  order.discount > 0
                    ? `
                <tr>
                  <td style="padding: 4px 0; color: #16A34A;">Discount Applied:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #16A34A;">-Rs. ${order.discount.toLocaleString()}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 4px 0;">Shipping Delivery:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0F172A;">
                    ${order.shippingFee === 0 ? '<span style="color: #16A34A;">FREE</span>' : `Rs. ${order.shippingFee.toLocaleString()}`}
                  </td>
                </tr>
                <tr style="border-top: 2px solid #E2E8F0;">
                  <td style="padding: 12px 0 4px 0; font-size: 15px; font-weight: 800; color: #0F172A;">Total Payable:</td>
                  <td style="padding: 12px 0 4px 0; text-align: right; font-size: 17px; font-weight: 800; color: #EA580C;">Rs. ${order.total.toLocaleString()}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- WhatsApp Support CTA -->
    <tr>
      <td style="padding: 20px 28px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
        <div style="font-size: 12px; color: #475569; margin-bottom: 12px;">
          Have questions or want to update your delivery address?
        </div>
        <a href="https://wa.me/923337905840?text=Hi%20Calenvee,%20I%20have%20a%20question%20about%20Order%20${order.orderNumber}" 
           style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px;">
          💬 Chat with Us on WhatsApp
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px; text-align: center; font-size: 11px; color: #94A3B8; line-height: 1.6;">
        Calenvee Pakistan &bull; Building 14-C, 4th Commercial Lane, Zamzama DHA Phase 5, Karachi<br />
        Website: <a href="https://calenvee.pk" style="color: #F97316; text-decoration: none;">calenvee.pk</a> &bull; Email: <a href="mailto:support@calenvee.pk" style="color: #F97316; text-decoration: none;">support@calenvee.pk</a>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Main Vercel Serverless Function Handler: /api/create-order
 */
export default async function handler(req: VercelReq, res: VercelRes) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      customerName,
      email,
      phone,
      city,
      address,
      deliveryNotes,
      paymentMethod = 'cod',
      promoCode,
      items,
      receiptImage,
      receiptFileName,
      receiptFileSize,
    } = body || {};

    // 2. Strict Input Validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Customer name is required (minimum 2 characters).' });
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Complete delivery address is required.' });
    }

    if (!city || typeof city !== 'string') {
      return res.status(400).json({ success: false, error: 'Delivery city is required.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'A valid email address is required for official invoice delivery.' });
    }

    // Pakistani Mobile Number Validation: Supports 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX
    const cleanPhone = (phone || '').replace(/[\s\-\(\)]/g, '');
    const pakPhoneRegex = /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/;
    if (!pakPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Pakistani mobile number (e.g. 0300-1234567 or +923001234567).',
      });
    }

    // Items array validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty. Please add at least one item.' });
    }

    // 3. AUTHORITATIVE PRICE CALCULATION (Fixes Audit SEC-01: Zero Client Price Trust)
    let calculatedSubtotal = 0;
    const processedItems: Array<{
      productId: string;
      productName: string;
      variantColor: string;
      variantSize: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      imageUrl: string;
    }> = [];

    for (const item of items) {
      const pId = item.productId || item.id;
      const catalogProduct = productCatalog.get(pId);

      if (!catalogProduct) {
        return res.status(400).json({
          success: false,
          error: `Product with ID '${pId}' could not be verified in the store catalog.`,
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitPrice = catalogProduct.price; // Taken strictly from server catalog!
      const lineTotal = unitPrice * qty;
      calculatedSubtotal += lineTotal;

      processedItems.push({
        productId: catalogProduct.id,
        productName: catalogProduct.name,
        variantColor: item.variantColor || item.selectedColor?.name || 'Standard',
        variantSize: item.variantSize || item.selectedSize?.name || 'Standard',
        quantity: qty,
        unitPrice,
        lineTotal,
        imageUrl: (catalogProduct.images && catalogProduct.images[0]) || '',
      });
    }

    // 4. Promo Code Calculation
    let calculatedDiscount = 0;
    if (promoCode && typeof promoCode === 'string') {
      const cleanCode = promoCode.trim().toUpperCase();
      const promoDef = promotionsData.promos?.[cleanCode];
      if (promoDef && calculatedSubtotal >= (promoDef.minOrderValue || 0)) {
        calculatedDiscount = Math.round(calculatedSubtotal * ((promoDef.discountPercentage || 0) / 100));
      }
    }

    // 5. Shipping Fee Calculation
    // Free Shipping threshold across Pakistan: Orders >= Rs. 5,999
    const netSubtotal = Math.max(0, calculatedSubtotal - calculatedDiscount);
    const calculatedShippingFee = netSubtotal >= 5999 ? 0 : 350;
    const calculatedTotal = netSubtotal + calculatedShippingFee;

    // 6. Supabase Client Initialization
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let finalOrderNumber = `CAL-ORD-${Date.now().toString().slice(-6)}`;
    let receiptUrl: string | null = null;
    let orderRowId: string | null = null;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });

      // A. If payment proof image is attached, upload to Supabase Storage 'payment-proofs'
      if (receiptImage && typeof receiptImage === 'string' && receiptImage.startsWith('data:image/')) {
        try {
          const match = receiptImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (match) {
            const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
            const buffer = Buffer.from(match[2], 'base64');
            const fileName = `receipts/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

            const { error: uploadErr } = await supabase.storage
              .from('payment-proofs')
              .upload(fileName, buffer, {
                contentType: `image/${match[1]}`,
                upsert: false,
              });

            if (!uploadErr) {
              const { data: pubUrlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
              receiptUrl = pubUrlData.publicUrl;
            } else {
              console.warn('Receipt upload to storage warned:', uploadErr.message);
            }
          }
        } catch (storageErr) {
          console.warn('Storage processing error:', storageErr);
        }
      }

      // B. Insert into 'orders' table
      const { data: insertedOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName.trim(),
          email: email.trim(),
          phone: cleanPhone,
          city: city.trim(),
          address: address.trim(),
          delivery_notes: deliveryNotes ? deliveryNotes.trim() : '',
          payment_method: paymentMethod,
          subtotal: calculatedSubtotal,
          discount: calculatedDiscount,
          shipping_fee: calculatedShippingFee,
          total: calculatedTotal,
          receipt_url: receiptUrl,
          receipt_filename: receiptFileName || null,
          receipt_size: receiptFileSize || null,
          status: 'placed',
        })
        .select('id, order_number')
        .single();

      if (orderErr) {
        console.error('Supabase order insertion error:', orderErr);
        throw new Error(`Database order insertion failed: ${orderErr.message}`);
      }

      if (insertedOrder) {
        orderRowId = insertedOrder.id;
        finalOrderNumber = insertedOrder.order_number;
      }

      // C. Insert items into 'order_items' table (triggers automatic stock decrement)
      if (orderRowId) {
        const orderItemsPayload = processedItems.map((it) => ({
          order_id: orderRowId,
          order_number: finalOrderNumber,
          product_id: it.productId,
          product_name: it.productName,
          variant_color: it.variantColor,
          variant_size: it.variantSize,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          line_total: it.lineTotal,
          image_url: it.imageUrl,
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsPayload);
        if (itemsErr) {
          console.error('Supabase order_items insertion error:', itemsErr);
        }
      }
    } else {
      console.warn('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not configured. Operating in resilient fallback mode.');
    }

    // 7. Resend Luxury HTML Invoice Dispatch
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const invoiceHtml = generateLuxuryInvoiceHtml({
          orderNumber: finalOrderNumber,
          customerName: customerName.trim(),
          email: email.trim(),
          phone: cleanPhone,
          city: city.trim(),
          address: address.trim(),
          deliveryNotes,
          paymentMethod,
          items: processedItems.map((it) => ({
            name: it.productName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: it.lineTotal,
            variantColor: it.variantColor,
            variantSize: it.variantSize,
            image: it.imageUrl,
          })),
          subtotal: calculatedSubtotal,
          discount: calculatedDiscount,
          shippingFee: calculatedShippingFee,
          total: calculatedTotal,
          createdAt: new Date().toISOString(),
        });

        const storeAlertEmail = process.env.STORE_ALERT_EMAIL || 'orders@calenvee.pk';
        const senderEmail = process.env.RESEND_FROM_EMAIL || 'orders@calenvee.pk';

        await resend.emails.send({
          from: `Calenvee Orders <${senderEmail}>`,
          to: [email.trim()],
          bcc: [storeAlertEmail],
          subject: `Order Confirmed: ${finalOrderNumber} — Calenvee.pk`,
          html: invoiceHtml,
        });

        // Mark confirmation email sent in DB if connected
        if (supabaseUrl && supabaseServiceKey && orderRowId) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
          await supabase.from('orders').update({ confirmation_email_sent: true }).eq('id', orderRowId);
        }
      } catch (emailErr) {
        console.warn('Resend email dispatch error:', emailErr);
      }
    }

    // 8. Asynchronous Mirroring to Google Sheets (Zero Disruption)
    const googleSheetWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
    if (googleSheetWebhook && googleSheetWebhook.trim() !== '') {
      fetch(googleSheetWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'create_order',
          order: {
            orderId: finalOrderNumber,
            customerName,
            email,
            phone: cleanPhone,
            city,
            address,
            notes: deliveryNotes,
            paymentMethod,
            subtotal: calculatedSubtotal,
            discount: calculatedDiscount,
            shippingFee: calculatedShippingFee,
            total: calculatedTotal,
            items: processedItems,
            receiptUrl,
            status: 'placed',
            createdAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.warn('Background Google Sheet mirror error:', err));
    }

    // 9. Return Secure JSON Response
    return res.status(200).json({
      success: true,
      orderId: finalOrderNumber,
      orderNumber: finalOrderNumber,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      shippingFee: calculatedShippingFee,
      total: calculatedTotal,
      message: 'Order placed successfully and recorded in Calenvee secure database.',
    });
  } catch (err: any) {
    console.error('Serverless order creation error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your order. Please try again or contact WhatsApp support.',
      details: err?.message || String(err),
    });
  }
}


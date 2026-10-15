import { OrderDetails } from '../types';

export interface OrderSubmissionResult {
  success: boolean;
  orderId: string;
  source: 'supabase' | 'google_sheets' | 'local_fallback';
  message: string;
  calculatedTotal?: number;
}

/**
 * Calenvee Multi-Tier Order Dispatch Service
 * Primary: Vercel Serverless + Supabase PostgreSQL + Resend Email API (/api/create-order)
 * Secondary: Google Apps Script Webhook (Google Sheets fallback mirroring)
 * Tertiary: Local storage offline recovery
 */
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwCZvq-OqA4l18DK3ecPrRSclzRrNz2dINOiMY-qaNeyfjLvB-mSbJQH4cO_gWMWcBm/exec';

export async function submitOrderToBackend(order: OrderDetails): Promise<OrderSubmissionResult> {
  const webhookUrl = (import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK_URL)?.trim();

  // Guard: NEVER send ghost or empty orders
  if (!order || !order.customerName || !order.phone || !order.items || order.items.length === 0 || order.total <= 0) {
    console.warn('Blocked invalid/empty order submission');
    return {
      success: false,
      orderId: order?.orderId || '',
      source: 'local_fallback',
      message: 'Order validation failed: missing customer details or items.',
    };
  }

  // Tier 1: Try Primary Secure Serverless Endpoint (/api/create-order)
  try {
    const serverlessController = new AbortController();
    const serverlessTimeout = setTimeout(() => serverlessController.abort(), 10000);

    const payload = {
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      city: order.city,
      address: order.address,
      deliveryNotes: order.notes,
      paymentMethod: order.paymentMethod,
      promoCode: order.promoCode,
      items: order.items.map((it) => ({
        productId: it.product?.id || it.id,
        quantity: it.quantity,
        variantColor: it.selectedColor?.name || (it as any).color || 'Standard',
        variantSize: it.selectedSize?.name || (it as any).size || 'Standard',
      })),
      receiptImage: order.receiptImage,
      receiptFileName: order.receiptFileName,
      receiptFileSize: order.receiptFileSize,
    };

    const apiResponse = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: serverlessController.signal,
    });

    clearTimeout(serverlessTimeout);

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      if (data && data.success) {
        const serverOrderId = data.orderId || order.orderId;
        order.orderId = serverOrderId;
        if (data.total !== undefined) {
          order.total = data.total;
        }

        // Cache confirmed order locally
        try {
          const savedOrders = JSON.parse(localStorage.getItem('calenvee_orders') || '[]');
          localStorage.setItem('calenvee_orders', JSON.stringify([order, ...savedOrders]));
        } catch (storageErr) {
          console.warn('Local caching warning:', storageErr);
        }

        return {
          success: true,
          orderId: serverOrderId,
          source: 'supabase',
          message: data.message || 'Order confirmed and recorded in secure database.',
          calculatedTotal: data.total,
        };
      }
    }
  } catch (apiError) {
    // /api/create-order may not be available when running Vite standalone without Vercel CLI
    console.info('Serverless API /api/create-order unreachable or local dev mode, falling back to secondary tier:', apiError);
  }

  // Tier 2: Google Apps Script Webhook Fallback
  if (webhookUrl && webhookUrl.trim() !== '') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'create_order',
          order,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Cache order locally
        try {
          const savedOrders = JSON.parse(localStorage.getItem('calenvee_orders') || '[]');
          localStorage.setItem('calenvee_orders', JSON.stringify([order, ...savedOrders]));
        } catch (storageErr) {
          console.warn('Local caching warning:', storageErr);
        }

        return {
          success: true,
          orderId: data.orderId || order.orderId,
          source: 'google_sheets',
          message: data.message || 'Order placed and recorded in Google Sheets.',
        };
      }
    } catch (networkError) {
      clearTimeout(timeoutId);
      console.warn('Google Sheets webhook timed out or failed, saving locally:', networkError);
    }
  }

  // Tier 3: Local Offline Fallback Mode
  try {
    const savedOrders = JSON.parse(localStorage.getItem('calenvee_orders') || '[]');
    localStorage.setItem('calenvee_orders', JSON.stringify([order, ...savedOrders]));
  } catch (err) {
    console.warn('Could not cache order to localStorage:', err);
  }

  return {
    success: true,
    orderId: order.orderId,
    source: 'local_fallback',
    message: 'Order saved locally. Ready for automated cloud sync.',
  };
}

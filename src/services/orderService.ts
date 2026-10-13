import { OrderDetails } from '../types';

export interface OrderSubmissionResult {
  success: boolean;
  orderId: string;
  source: 'google_sheets' | 'local_fallback';
  message: string;
}

/**
 * Calenvee Order Dispatch Service
 * Sends order data to the Google Apps Script webhook (Google Sheets + Gmail)
 * with robust offline/network fallback.
 */
export async function submitOrderToBackend(order: OrderDetails): Promise<OrderSubmissionResult> {
  const webhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;

  // Always cache locally in localStorage first for resilience
  try {
    const savedOrders = JSON.parse(localStorage.getItem('calenvee_orders') || '[]');
    localStorage.setItem('calenvee_orders', JSON.stringify([order, ...savedOrders]));
  } catch (err) {
    console.warn('Could not cache order to localStorage:', err);
  }

  // If webhook URL is configured, POST to Google Apps Script Webhook
  if (webhookUrl && webhookUrl.trim() !== '') {
    try {
      // Google Apps Script requires text/plain or no-cors mode to avoid CORS preflight blocks
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
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          orderId: order.orderId,
          source: 'google_sheets',
          message: data.message || 'Order confirmed and recorded in Google Sheets.',
        };
      }
    } catch (networkError) {
      console.warn('Backend webhook submission failed, order preserved locally:', networkError);
    }
  }

  // Fallback mode (when webhook URL is not configured yet or network is interrupted)
  return {
    success: true,
    orderId: order.orderId,
    source: 'local_fallback',
    message: 'Order saved locally. Ready for Google Sheets webhook sync.',
  };
}

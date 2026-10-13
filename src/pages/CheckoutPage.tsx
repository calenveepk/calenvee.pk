import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../utils/formatters';
import { OrderDetails } from '../types';
import { submitOrderToBackend } from '../services/orderService';
import { SEO } from '../components/common/SEO';
import {
  RealWhatsAppIcon,
  RealJazzCashIcon,
  RealEasyPaisaIcon,
  RealisticTruckIcon,
  RealisticShieldIcon,
} from '../components/common/RealisticIcons';
import {
  PAKISTAN_CITIES,
  PHYSICAL_STORE_LOCATION,
  generateOrderId,
  generateTrackingNumber,
} from '../utils/formatters';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, discount, shippingFee, finalTotal, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(PAKISTAN_CITIES[0]);
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAccount(label);
      setTimeout(() => setCopiedAccount(null), 2000);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in your name, mobile number, and complete delivery address.');
      return;
    }

    setIsSubmitting(true);

    const newOrder: OrderDetails = {
      orderId: generateOrderId(),
      trackingNumber: generateTrackingNumber('TCS Express'),
      courier: 'TCS Express',
      customerName: fullName.trim(),
      email: email.trim() || 'N/A',
      phone: phone.trim(),
      city,
      address: address.trim(),
      notes: deliveryNotes.trim() || 'N/A',
      paymentMethod,
      items: [...items],
      subtotal,
      discount,
      shippingFee,
      total: finalTotal,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    try {
      await submitOrderToBackend(newOrder);
    } catch (err) {
      console.warn('Backend sync error:', err);
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F97316', '#0B132B', '#25D366', '#FFFFFF'],
    });

    setCompletedOrder(newOrder);
    clearCart();
    setIsSubmitting(false);
  };

  const whatsappReceiptLink = completedOrder
    ? `https://wa.me/${PHYSICAL_STORE_LOCATION.whatsappRaw}?text=${encodeURIComponent(
        `Hello Calenvee.pk! I have placed Order ${completedOrder.orderId} for Rs. ${completedOrder.total.toLocaleString()} via ${completedOrder.paymentMethod.toUpperCase()}. Here is my payment receipt slip:`
      )}`
    : '';

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gray-50 text-gray-900">
      <SEO
        title="Checkout | Calenvee.pk"
        description="Checkout with Cash on Delivery or Mobile Accounts. Expected 7-10 Days Delivery across Pakistan."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* If Order is Confirmed, Show Digital Invoice Receipt */}
        {completedOrder ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B]">
                Thank You, {completedOrder.customerName}
              </h1>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Your order reference is <strong className="text-gray-900">{completedOrder.orderId}</strong>. Expected delivery across Pakistan is <strong className="text-[#F97316]">7-10 Days</strong>.
              </p>
            </div>

            {/* Crucial Receipt Instruction if non-COD */}
            {completedOrder.paymentMethod !== 'cod' && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-left space-y-2.5">
                <div className="flex items-center space-x-2 text-orange-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                  <span>Important: Please Send Payment Receipt on WhatsApp</span>
                </div>
                <p className="text-xs text-orange-800 leading-relaxed font-normal">
                  To confirm and dispatch your order immediately, please share a screenshot of your {completedOrder.paymentMethod.toUpperCase()} transaction slip to our official WhatsApp.
                </p>
                <a
                  href={whatsappReceiptLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 py-2.5 px-5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-lg shadow-md transition-all"
                >
                  <RealWhatsAppIcon size={20} />
                  <span>Send Receipt Slip to WhatsApp ({PHYSICAL_STORE_LOCATION.whatsappNumber})</span>
                </a>
              </div>
            )}

            {/* Receipt Summary */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 text-left space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 block font-mono text-[10px] uppercase">Order Number</span>
                  <span className="text-gray-900 font-bold font-mono text-sm">{completedOrder.orderId}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block font-mono text-[10px] uppercase">Tracking Consignment</span>
                  <span className="text-[#F97316] font-bold font-mono text-sm">{completedOrder.trackingNumber}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination Address:</span>
                  <span className="text-right font-semibold text-gray-900 max-w-xs">{completedOrder.address}, {completedOrder.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Option:</span>
                  <span className="uppercase font-bold text-gray-900">
                    {completedOrder.paymentMethod === 'cod' ? 'Cash On Delivery (7-10 Days)' : completedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-gray-900">
                  <span>Total Amount:</span>
                  <span className="text-[#0B132B] font-extrabold text-base">{formatPKR(completedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/shop"
                className="flex-1 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-center shadow-md"
              >
                Continue Shopping
              </Link>

              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-[#0B132B] hover:bg-[#1C2541] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors text-center shadow-md flex items-center justify-center space-x-2"
              >
                <span>Order Inquiries (WhatsApp)</span>
              </a>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left: Customer Info & Shipping (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B]">
                    Delivery Address
                  </h2>
                </div>

                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3.5">
                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Daniyal Aslam"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mobile Number (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                      />
                    </div>
                  </div>

                  {/* Email & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. daniyal@gmail.com"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        City *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                      >
                        {PAKISTAN_CITIES.map((c: string) => (
                          <option key={c} value={c} className="text-gray-900">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Complete Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Complete Street Address / House / Flat # *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / Apartment #, Street, Sector / Area..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Call before arrival / leave with reception"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>

                  {/* Payment Method Selector with Realistic Icons */}
                  <div className="space-y-3 pt-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                      Payment Channel:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* COD */}
                      <label
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                          paymentMethod === 'cod'
                            ? 'border-[#F97316] bg-orange-50/60 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="mt-1 accent-[#F97316]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">Cash On Delivery</span>
                            <RealisticTruckIcon size={22} />
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Expected delivery: <strong className="text-[#F97316]">7-10 Days</strong>
                          </div>
                        </div>
                      </label>

                      {/* JazzCash */}
                      <label
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                          paymentMethod === 'jazzcash'
                            ? 'border-[#F97316] bg-orange-50/60 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'jazzcash'}
                          onChange={() => setPaymentMethod('jazzcash')}
                          className="mt-1 accent-[#F97316]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">JazzCash</span>
                            <RealJazzCashIcon size={30} />
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Send receipt on WhatsApp
                          </div>
                        </div>
                      </label>

                      {/* EasyPaisa */}
                      <label
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                          paymentMethod === 'easypaisa'
                            ? 'border-[#F97316] bg-orange-50/60 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'easypaisa'}
                          onChange={() => setPaymentMethod('easypaisa')}
                          className="mt-1 accent-[#F97316]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">EasyPaisa</span>
                            <RealEasyPaisaIcon size={30} />
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Send receipt on WhatsApp
                          </div>
                        </div>
                      </label>

                      {/* Bank / Raast */}
                      <label
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                          paymentMethod === 'bank_transfer'
                            ? 'border-[#F97316] bg-orange-50/60 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="mt-1 accent-[#F97316]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">Bank Transfer</span>
                            <Building className="w-5 h-5 text-[#F97316]" />
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Raast instant transfer
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Prominent Payment Slip WhatsApp Requirement */}
                    {paymentMethod !== 'cod' && (
                      <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 space-y-2">
                        <div className="flex items-center space-x-2 font-bold text-[#F97316]">
                          <AlertCircle className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                          <span>Payment Slip Verification Required</span>
                        </div>
                        <p className="font-normal leading-relaxed text-orange-800">
                          After placing this order, transfer <strong>{formatPKR(finalTotal)}</strong> to our official account and send your screenshot slip to our WhatsApp (<strong>{PHYSICAL_STORE_LOCATION.whatsappNumber}</strong>).
                        </p>
                        <div className="bg-white p-2.5 rounded-lg border border-orange-200 font-mono text-[11px] space-y-1 text-gray-800">
                          <div className="flex justify-between items-center">
                            <span><strong>Account:</strong> 0341-7865207</span>
                            <button
                              type="button"
                              onClick={() => handleCopy('03417865207', 'acc')}
                              className="text-[#F97316] hover:underline flex items-center gap-1 font-bold"
                            >
                              {copiedAccount === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedAccount === 'acc' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <div><strong>Account Title:</strong> Calenvee Official</div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-gray-900 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs text-gray-500 font-mono">({items.length} items)</span>
                </h3>

                {/* Items list */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 text-xs">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-contain p-1 bg-gray-50 border border-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 font-semibold truncate">{item.product.name}</h4>
                        <div className="text-gray-500 text-[11px]">
                          Qty: {item.quantity} • {item.selectedColor.name}
                        </div>
                      </div>
                      <span className="font-extrabold text-[#0B132B]">
                        {formatPKR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-semibold">{formatPKR(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">-{formatPKR(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery (Expected 7-10 Days)</span>
                    <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : 'text-gray-900'}>
                      {shippingFee === 0 ? 'FREE' : formatPKR(shippingFee)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span className="font-sans text-xl font-extrabold text-[#0B132B]">{formatPKR(finalTotal)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>
                    {isSubmitting
                      ? 'Confirming Order...'
                      : paymentMethod === 'cod'
                      ? 'Confirm Cash On Delivery Order'
                      : 'Place Order & Send Slip on WhatsApp'}
                  </span>
                </button>

                <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-500 text-center">
                  <RealisticShieldIcon size={16} />
                  <span>100% Inspected Presentation Packaging</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

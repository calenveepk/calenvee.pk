import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  UploadCloud,
  FileText,
  X,
  Camera,
  Trash2,
  Mail,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../utils/formatters';
import { OrderDetails } from '../types';
import { submitOrderToBackend } from '../services/orderService';
import { SEO } from '../components/common/SEO';
import { OrderInvoice } from '../components/common/OrderInvoice';
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
import { PAYMENT_ACCOUNTS } from '../data/paymentAccounts';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, discount, shippingFee, finalTotal, clearCart, removeItem } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(PAKISTAN_CITIES[0]);
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer'>('cod');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [botHoneypot, setBotHoneypot] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size: 5MB maximum limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setReceiptError('File exceeds 5MB limit. Please choose a screenshot or photo under 5MB.');
      return;
    }

    setReceiptError(null);
    setReceiptFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const rawBase64 = reader.result as string;
      if (file.type.startsWith('image/')) {
        // High-Scale Optimization: Compress image on client via Canvas to ensure fast mobile upload
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setReceiptPreview(compressed);
          } else {
            setReceiptPreview(rawBase64);
          }
        };
        img.onerror = () => setReceiptPreview(rawBase64);
        img.src = rawBase64;
      } else {
        setReceiptPreview(rawBase64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptError(null);
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAccount(label);
      setTimeout(() => setCopiedAccount(null), 2000);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    // Security Honeypot check: reject bots silently
    if (botHoneypot) {
      console.warn('Bot submission blocked');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in your name, mobile number, and complete delivery address.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      alert('Please provide a valid Gmail / Email address so we can deliver your official invoice.');
      return;
    }

    // Open confirmation modal to ask customer before final placement
    setIsConfirmModalOpen(true);
  };

  const executeFinalSubmitOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const initialOrderId = generateOrderId();

    const newOrder: OrderDetails = {
      orderId: initialOrderId,
      trackingNumber: '', // NO tracking number upon initial order placement!
      courier: 'Pending Dispatch (TCS Express)',
      customerName: fullName.trim(),
      email: email.trim(),
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
      receiptImage: receiptPreview || undefined,
      receiptFileName: receiptFile?.name || undefined,
      receiptFileSize: receiptFile ? `${(receiptFile.size / 1024).toFixed(0)} KB` : undefined,
    };

    try {
      const result = await submitOrderToBackend(newOrder);
      if (result && result.orderId) {
        newOrder.orderId = result.orderId;
      }
    } catch (err) {
      console.warn('Backend sync error:', err);
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F97316', '#0B132B', '#25D366', '#FFFFFF'],
    });

    setIsConfirmModalOpen(false);
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
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Top Thank You & Verification Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B]">
                  Thank You, {completedOrder.customerName}
                </h1>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Your order reference is <strong className="text-gray-900 font-mono">#{completedOrder.orderId}</strong>. Expected delivery across Pakistan is <strong className="text-[#F97316]">7-10 Days</strong>. A copy of your invoice has also been sent to your email.
                </p>
              </div>

              {/* Crucial Receipt Instruction if non-COD */}
              {completedOrder.paymentMethod !== 'cod' && (() => {
                const acc = PAYMENT_ACCOUNTS[completedOrder.paymentMethod];
                return (
                  <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/80 border border-orange-200 text-left space-y-3.5">
                    <div className="flex items-center space-x-2 text-orange-900 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                      <span>Payment Verification ({acc?.providerName || completedOrder.paymentMethod.toUpperCase()})</span>
                    </div>

                    {completedOrder.receiptImage ? (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2.5">
                        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>Payment Screenshot Attached &amp; Received!</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 leading-relaxed font-normal">
                          Your transaction screenshot has been delivered to Calenvee's dispatch email. Our team will verify and prepare your package for courier shipping.
                        </p>
                        {completedOrder.receiptImage && !completedOrder.receiptFileName?.toLowerCase().endsWith('.pdf') && (
                          <div className="pt-1">
                            <img
                              src={completedOrder.receiptImage}
                              alt="Payment Receipt"
                              className="max-h-36 rounded-lg border border-emerald-300 shadow-xs object-contain bg-white p-1"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-orange-800 leading-relaxed font-normal">
                          Please transfer <strong>{formatPKR(completedOrder.total)}</strong> to our official account below and share the screenshot slip on WhatsApp:
                        </p>

                        {acc && (
                          <div className="bg-white p-3 rounded-lg border border-orange-200 font-mono text-[11px] space-y-1 text-gray-800">
                            {acc.bankName && <div><strong className="text-gray-500 font-sans">Bank:</strong> {acc.bankName}</div>}
                            <div><strong className="text-gray-500 font-sans">Title:</strong> {acc.accountTitle}</div>
                            <div className="flex justify-between items-center">
                              <span><strong className="text-gray-500 font-sans">Account No:</strong> {acc.accountNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(acc.accountNumber, 'order-acc')}
                                className="text-[#F97316] hover:underline flex items-center gap-1 font-bold font-sans text-xs"
                              >
                                {copiedAccount === 'order-acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedAccount === 'order-acc' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            {acc.iban && (
                              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                <span className="truncate mr-2"><strong className="text-gray-500 font-sans">IBAN:</strong> {acc.iban}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(acc.iban!, 'order-iban')}
                                  className="text-[#F97316] hover:underline flex items-center gap-1 font-bold font-sans text-xs flex-shrink-0"
                                >
                                  {copiedAccount === 'order-iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedAccount === 'order-iban' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <a
                          href={whatsappReceiptLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 py-2.5 px-5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-lg shadow-md transition-all"
                        >
                          <RealWhatsAppIcon size={20} />
                          <span>Send Receipt Slip to WhatsApp ({PHYSICAL_STORE_LOCATION.whatsappNumber})</span>
                        </a>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Invoice Emailed to Gmail Notice & Itemized Summary (No review/print on screen) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5 text-left">
              
              <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-orange-50/80 border border-orange-200">
                <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-gray-900">
                    Official Itemized Invoice Dispatched to Your Gmail
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    A copy of your complete official order invoice and packaging slip has been dispatched to <strong className="text-gray-900 font-semibold">{completedOrder.email}</strong>. Please check your inbox or spam folder.
                  </p>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Items Ordered ({completedOrder.items.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/40">
                  {completedOrder.items.map((item, idx) => {
                    const img = item.product?.images?.[0] || '';
                    return (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                        <div className="flex items-center space-x-3 min-w-0">
                          {img && (
                            <img
                              src={img}
                              alt={item.product?.name}
                              className="w-12 h-12 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 truncate">
                              {item.product?.name}
                            </h5>
                            <p className="text-[11px] text-gray-500">
                              {item.selectedColor?.name && `Color: ${item.selectedColor.name}`}
                              {item.selectedSize?.name && ` | Size: ${item.selectedSize.name}`}
                              {` • Qty: ${item.quantity}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-gray-900 whitespace-nowrap">
                          {formatPKR(item.product?.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery & Logistics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Shipping Address
                  </span>
                  <p className="text-xs font-semibold text-gray-800">
                    {completedOrder.address}, {completedOrder.city}
                  </p>
                  <p className="text-[11px] text-gray-500">Phone: {completedOrder.phone}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Delivery & Courier
                  </span>
                  <p className="text-xs font-semibold text-[#F97316]">
                    TCS Express (Expected 7-10 Days Delivery)
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Tracking ID: {completedOrder.trackingNumber}
                  </p>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="pt-3 border-t border-gray-100 space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>{formatPKR(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span>-{formatPKR(completedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping:</span>
                  <span>{completedOrder.shippingFee === 0 ? 'FREE' : formatPKR(completedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount Payable:</span>
                  <span className="text-[#F97316] font-black">{formatPKR(completedOrder.total)}</span>
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

              <Link
                to={`/track-order?tracking=${completedOrder.trackingNumber}`}
                className="flex-1 py-3.5 bg-[#081320] hover:bg-[#1C2541] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors text-center shadow-md"
              >
                Track Your Package
              </Link>

              <a
                href={`https://wa.me/${PHYSICAL_STORE_LOCATION.whatsappRaw}?text=${encodeURIComponent(
                  `Hello Calenvee.pk! I have an inquiry about Order #${completedOrder.orderId}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors text-center shadow-md flex items-center justify-center space-x-2"
              >
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {items.length === 0 && (
              <div className="lg:col-span-12 p-4 rounded-2xl bg-orange-50/80 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-[#F97316] flex-shrink-0" />
                  <span className="text-xs text-orange-950 font-medium">
                    Your cart is currently empty. Please add items to your cart to proceed with checkout.
                  </span>
                </div>
                <Link
                  to="/shop"
                  className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  Return to Shop
                </Link>
              </div>
            )}

            {/* Left: Customer Info & Shipping (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B]">
                    Delivery Address
                  </h2>
                </div>

                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3.5">
                  {/* Invisible Honeypot field for bot protection */}
                  <input
                    type="text"
                    name="hp_validation"
                    value={botHoneypot}
                    onChange={(e) => setBotHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

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
                          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Upload Receipt (Max 5MB)</span>
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
                          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Upload Receipt (Max 5MB)</span>
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
                          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Raast / Upload Slip (Max 5MB)</span>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Dynamic Payment Account Instructions */}
                    {paymentMethod !== 'cod' && (() => {
                      const acc = PAYMENT_ACCOUNTS[paymentMethod];
                      return (
                        <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-orange-900 space-y-3.5">
                          <div className="flex items-center space-x-2 font-bold text-[#F97316]">
                            <AlertCircle className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                            <span>{acc.providerName} Details</span>
                          </div>
                          <p className="font-normal leading-relaxed text-orange-800 text-[11px]">
                            {acc.instructions}
                          </p>
                          <div className="bg-white p-3 rounded-lg border border-orange-200 font-mono text-[11px] space-y-1.5 text-gray-800">
                            {acc.bankName && (
                              <div><strong className="text-gray-500 font-sans">Bank:</strong> {acc.bankName}</div>
                            )}
                            <div><strong className="text-gray-500 font-sans">Account Title:</strong> {acc.accountTitle}</div>
                            <div className="flex justify-between items-center">
                              <span><strong className="text-gray-500 font-sans">Account No:</strong> {acc.accountNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(acc.accountNumber, 'acc')}
                                className="text-[#F97316] hover:underline flex items-center gap-1 font-bold font-sans text-xs"
                              >
                                {copiedAccount === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedAccount === 'acc' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            {acc.iban && (
                              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                <span className="truncate mr-2"><strong className="text-gray-500 font-sans">IBAN:</strong> {acc.iban}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(acc.iban!, 'iban')}
                                  className="text-[#F97316] hover:underline flex items-center gap-1 font-bold font-sans text-xs flex-shrink-0"
                                >
                                  {copiedAccount === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedAccount === 'iban' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            )}
                            {acc.raastId && (
                              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                <span><strong className="text-gray-500 font-sans">Raast ID:</strong> {acc.raastId}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(acc.raastId!, 'raast')}
                                  className="text-[#F97316] hover:underline flex items-center gap-1 font-bold font-sans text-xs"
                                >
                                  {copiedAccount === 'raast' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedAccount === 'raast' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* DIRECT RECEIPT SCREENSHOT UPLOAD (UP TO 5MB) */}
                          <div className="bg-white p-3.5 rounded-xl border border-orange-300/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5 text-[#F97316]" />
                                <span>Upload Payment Screenshot / Slip (Max 5MB)</span>
                              </label>
                              <span className="text-[10px] text-gray-500 font-medium">JPG, PNG, PDF</span>
                            </div>

                            <p className="text-[11px] text-gray-600 leading-normal">
                              Attach your transaction screenshot here. It will be sent directly to the store owner's order email for rapid verification &amp; immediate dispatch!
                            </p>

                            {receiptError && (
                              <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                                <span>{receiptError}</span>
                              </div>
                            )}

                            {receiptPreview ? (
                              <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-300 rounded-xl">
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  {receiptFile?.type === 'application/pdf' ? (
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                  ) : (
                                    <img
                                      src={receiptPreview}
                                      alt="Payment Proof"
                                      className="w-10 h-10 object-cover rounded-lg border border-emerald-200 flex-shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-emerald-950 truncate">
                                      {receiptFile?.name}
                                    </div>
                                    <div className="text-[10px] text-emerald-700 font-medium">
                                      ✓ Ready to attach ({(receiptFile!.size / 1024).toFixed(0)} KB)
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleRemoveReceipt}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Remove screenshot"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div>
                                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 hover:border-[#F97316] bg-gray-50 hover:bg-orange-50/30 rounded-xl cursor-pointer transition group">
                                  <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#F97316] transition mb-1" />
                                  <span className="text-xs font-bold text-gray-700 group-hover:text-[#F97316] transition">
                                    Click to Choose Receipt Screenshot
                                  </span>
                                  <span className="text-[10px] text-gray-500 mt-0.5">
                                    Up to 5MB (Camera photo or screenshot)
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                                    onChange={handleReceiptUpload}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}

                            <div className="text-[10px] text-gray-500 italic pt-0.5">
                              Prefer WhatsApp? You can also send the slip to our WhatsApp helpline after placing the order.
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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

                {/* Items list with remove option */}
                {items.length === 0 ? (
                  <div className="py-8 text-center space-y-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                      <Trash2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-700">Your cart is empty</p>
                      <p className="text-[11px] text-gray-500">You have removed all items from your order.</p>
                    </div>
                    <Link
                      to="/shop"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-lg shadow-sm transition"
                    >
                      <span>Explore Collection</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex items-center space-x-3 p-2.5 rounded-xl bg-gray-50/70 hover:bg-gray-50 border border-gray-200/80 transition-colors text-xs"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-contain p-1 bg-white border border-gray-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 font-semibold truncate text-xs">{item.product.name}</h4>
                          <div className="text-gray-500 text-[11px] flex items-center space-x-1.5 mt-0.5 flex-wrap">
                            <span className="font-medium">Qty: {item.quantity}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span
                                className="w-2 h-2 rounded-full inline-block border border-gray-300"
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                              {item.selectedColor.name}
                            </span>
                            {item.selectedSize && (
                              <>
                                <span>•</span>
                                <span>{item.selectedSize.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="font-extrabold text-[#0B132B] text-xs">
                            {formatPKR(item.product.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from cart"
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                  disabled={isSubmitting || items.length === 0}
                  className="w-full py-3.5 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>
                    {isSubmitting
                      ? 'Confirming Order...'
                      : items.length === 0
                      ? 'Your Cart is Empty'
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

      {/* Final Step: Customer Confirmation Modal before Order Placement */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 text-left animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                    Confirm Your Order
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Please verify your delivery details before final submission
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification Details Box */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-2.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500 font-medium">Customer Name:</span>
                <strong className="text-gray-900 font-bold text-sm">{fullName}</strong>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500 font-medium">Contact Phone:</span>
                <strong className="text-gray-900 font-mono font-bold">{phone}</strong>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500 font-medium">Invoice Gmail:</span>
                <span className="text-gray-900 font-semibold truncate max-w-[200px]">{email}</span>
              </div>
              <div className="flex justify-between items-start pt-1 border-t border-gray-200/60">
                <span className="text-gray-500 font-medium">Delivery Address:</span>
                <span className="text-gray-900 font-medium text-right max-w-[220px]">
                  {address}, {city}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-gray-200/60">
                <span className="text-gray-500 font-medium">Payment Method:</span>
                <span className="text-[#EA580C] font-extrabold uppercase">
                  {paymentMethod === 'cod' ? 'Cash on Delivery (Pay at Doorstep)' : paymentMethod.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 text-sm">
                <span className="font-bold text-gray-900">Total Payable:</span>
                <span className="font-extrabold text-[#F97316] text-base">{formatPKR(finalTotal)}</span>
              </div>
            </div>

            {/* Prompt Question */}
            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-center text-xs text-orange-950 font-medium">
              Would you like to confirm and place this order now?
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={executeFinalSubmitOrder}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Submitting Order...' : '✓ Yes, Place My Order'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="py-3.5 px-6 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Review / Edit
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

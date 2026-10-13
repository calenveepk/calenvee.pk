import React from 'react';
import {
  Globe,
  Instagram,
  Mail,
  Calendar,
  Hash,
  User,
  ShoppingCart,
  Truck,
  Info,
  FileText,
  ShieldCheck,
  Headphones,
  Printer,
  Download,
} from 'lucide-react';
import { OrderDetails } from '../../types';
import { formatPKR } from '../../utils/formatters';

interface OrderInvoiceProps {
  order: OrderDetails;
  onPrint?: () => void;
  showActions?: boolean;
}

export const OrderInvoice: React.FC<OrderInvoiceProps> = ({
  order,
  onPrint,
  showActions = true,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden when printing) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-xs print:hidden">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Official Digital Tax Invoice &amp; Packaging Slip</span>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs rounded-lg shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      )}

      {/* Main Printable Invoice Card */}
      <div
        id="calenvee-printable-invoice"
        className="relative bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-w-3xl mx-auto print:border-none print:shadow-none print:m-0 print:max-w-none print:w-full"
      >
        {/* Top-Right Decorative Geometric Corner Accent */}
        <div className="absolute top-0 right-0 w-36 h-28 overflow-hidden pointer-events-none select-none z-10">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#F97316] transform rotate-45" />
          <div className="absolute -top-20 -right-10 w-32 h-32 bg-[#111827] transform rotate-45" />
        </div>

        {/* Invoice Body Padding */}
        <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
          {/* Header Row: Logo & Contact Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827] font-sans">
                  C<span className="text-[#F97316]">A</span>LENVEE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#111827] mt-1">
                SHOP SMART. LIVE BETTER.
              </p>
            </div>

            {/* Contact links on top right */}
            <div className="space-y-1.5 text-xs text-gray-600 sm:text-right pr-4 sm:pr-8">
              <div className="flex items-center sm:justify-end space-x-2">
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-medium text-[11px] sm:text-xs">www.calenvee.pk</span>
              </div>
              <div className="flex items-center sm:justify-end space-x-2">
                <Instagram className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-medium text-[11px] sm:text-xs">@calenvee</span>
              </div>
              <div className="flex items-center sm:justify-end space-x-2">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-medium text-[11px] sm:text-xs">support@calenvee.pk</span>
              </div>
            </div>
          </div>

          {/* Title & Metadata Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-2 border-t border-gray-100">
            <div className="space-y-1 max-w-md">
              <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
                INVOICE
              </h1>
              <p className="text-xs sm:text-sm font-extrabold uppercase text-[#111827] tracking-wider">
                THANK YOU FOR YOUR ORDER!
              </p>
              <p className="text-xs text-gray-500 leading-relaxed pt-0.5">
                We truly appreciate your trust in CALENVEE. Here's a summary of your order details.
              </p>
            </div>

            {/* Order Date & Order Number Cards */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Order Date */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80 min-w-[150px]">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F97316] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">Order Date</div>
                  <div className="text-xs font-bold text-gray-900">{formattedDate}</div>
                </div>
              </div>

              {/* Order Number */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80 min-w-[150px]">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black flex-shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">Order Number</div>
                  <div className="text-xs font-black text-gray-900 font-mono">#{order.orderId}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center space-x-2 text-sm font-extrabold text-[#111827]">
              <div className="w-5 h-5 rounded-full bg-[#F97316] text-white flex items-center justify-center text-[10px]">
                <User className="w-3 h-3" />
              </div>
              <span>Customer Details</span>
            </div>

            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              <div className="sm:col-span-2 text-gray-500 font-semibold">Name</div>
              <div className="sm:col-span-10 text-gray-900 font-bold">: {order.customerName}</div>

              <div className="sm:col-span-2 text-gray-500 font-semibold">Phone</div>
              <div className="sm:col-span-10 text-gray-900 font-medium">: {order.phone}</div>

              <div className="sm:col-span-2 text-gray-500 font-semibold">Email</div>
              <div className="sm:col-span-10 text-gray-900 font-medium">: {order.email || 'N/A'}</div>

              <div className="sm:col-span-2 text-gray-500 font-semibold">Address</div>
              <div className="sm:col-span-10 text-gray-900 font-medium leading-relaxed">
                : {order.address}, {order.city}, Pakistan
              </div>
            </div>
          </div>

          {/* Order Summary Table */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center space-x-2 text-sm font-extrabold text-[#111827]">
              <div className="w-5 h-5 rounded-full bg-[#F97316] text-white flex items-center justify-center text-[10px]">
                <ShoppingCart className="w-3 h-3" />
              </div>
              <span>Order Summary</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111827] text-white uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">#</th>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-3 text-center w-20">Quantity</th>
                    <th className="py-3 px-4 text-right w-28">Unit Price (PKR)</th>
                    <th className="py-3 px-4 text-right w-28">Total Price (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {order.items.map((item, index) => {
                    const itemName = item.product?.name || (item as any).name || 'Calenvee Item';
                    const itemImage =
                      item.product?.images?.[0] || (item as any).image || '/hero/hero_podium_collection.jpg';
                    const itemPrice = item.product?.price || (item as any).price || 0;
                    const itemColor = item.selectedColor?.name || (item as any).color || '';
                    const itemSize = item.selectedSize?.name || (item as any).size || '';

                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition">
                        <td className="py-3.5 px-3 text-center font-bold text-gray-500">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={itemImage}
                              alt={itemName}
                              className="w-11 h-11 object-contain p-1 rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 text-xs truncate max-w-xs">
                                {itemName}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                {itemSize && <span>Size: {itemSize}</span>}
                                {itemSize && itemColor && <span> | </span>}
                                {itemColor && <span>Color: {itemColor}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold text-gray-800">
                          {item.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-gray-700">
                          {itemPrice.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                          {(itemPrice * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notice Box & Calculation Totals */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
            {/* Left: Dispatch Notice Box */}
            <div className="md:col-span-6 p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-[#F97316] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                  Your order is being prepared with care and will be shipped soon. We'll keep you updated!
                </p>
                <div className="w-10 h-0.5 bg-[#F97316] rounded-full" />
              </div>
            </div>

            {/* Right: Calculations */}
            <div className="md:col-span-6 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 px-1">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">
                  {order.subtotal ? order.subtotal.toLocaleString() : order.total.toLocaleString()}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 px-1">
                  <span className="font-medium">Discount Applied</span>
                  <span className="font-bold">- {order.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 px-1">
                <span className="font-medium">Shipping Fee</span>
                <span className="font-bold text-gray-900">
                  {order.shippingFee === 0 ? 'FREE' : order.shippingFee.toLocaleString()}
                </span>
              </div>

              {/* Total Amount Container */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 flex items-center justify-between mt-2">
                <span className="font-black text-sm text-[#111827] uppercase tracking-wide">
                  Total Amount
                </span>
                <span className="font-black text-xl text-[#111827]">
                  {order.total.toLocaleString()}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 text-right italic pt-0.5">
                (All prices are in Pakistani Rupees)
              </div>
            </div>
          </div>

          {/* Bottom 3 Cards: Payment Method, Order Notes, Thank You */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {/* Card 1: Payment Method */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-black text-[#111827]">
                <Info className="w-4 h-4 text-[#F97316]" />
                <span>Payment Method</span>
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase">
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery (COD)'
                  : order.paymentMethod.toUpperCase()}
              </p>
              <p className="text-[11px] text-gray-500 leading-normal">
                {order.paymentMethod === 'cod'
                  ? 'You can pay in cash at the time of delivery to the courier rider.'
                  : 'Payment slip received & verified.'}
              </p>
            </div>

            {/* Card 2: Order Notes */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-black text-[#111827]">
                <FileText className="w-4 h-4 text-[#F97316]" />
                <span>Order Notes</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {order.notes && order.notes !== 'N/A' && order.notes !== 'None'
                  ? order.notes
                  : 'Please inspect your order at the time of delivery. In case of any issue, contact us within 24 hours.'}
              </p>
            </div>

            {/* Card 3: Thank You Signature */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col justify-center items-center text-center">
              <span
                className="text-3xl sm:text-4xl text-[#F97316] font-bold select-none"
                style={{ fontFamily: "'Brush Script MT', 'Caveat', cursive, sans-serif" }}
              >
                Thank You
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111827] mt-1">
                FOR CHOOSING CALENVEE!
              </span>
              <div className="w-8 h-0.5 bg-[#F97316] rounded-full mt-2" />
            </div>
          </div>
        </div>

        {/* Footer Banner */}
        <div className="relative bg-[#111827] text-white p-5 sm:p-6 overflow-hidden">
          {/* Bottom-right angled orange accent */}
          <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden pointer-events-none select-none">
            <div className="absolute -bottom-14 -right-14 w-28 h-28 bg-[#F97316] transform rotate-45" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Logo & Tagline */}
            <div className="flex items-center space-x-4 text-center lg:text-left">
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  C<span className="text-[#F97316]">A</span>LENVEE
                </span>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-0.5">
                  SHOP SMART. LIVE BETTER.
                </p>
              </div>
            </div>

            <div className="hidden lg:block w-px h-8 bg-gray-700" />

            {/* 3 Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-300">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F97316]" />
                <span className="font-semibold text-[11px] sm:text-xs">Quality Products</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-[#F97316]" />
                <span className="font-semibold text-[11px] sm:text-xs">Fast &amp; Reliable Shipping</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Headphones className="w-4 h-4 text-[#F97316]" />
                <span className="font-semibold text-[11px] sm:text-xs">Dedicated Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

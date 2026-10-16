import React, { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { formatPKR } from '../utils/formatters';
import { OrderDetails } from '../types';

export const TrackOrderPage: React.FC = () => {
  const [orderQuery, setOrderQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<OrderDetails | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderQuery.trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setSearched(true);

    // Search local cache first
    try {
      const cached = JSON.parse(localStorage.getItem('calenvee_orders') || '[]');
      const match = cached.find(
        (o: OrderDetails) =>
          o.orderId?.toUpperCase() === cleanId ||
          o.phone?.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '') ||
          (o.trackingNumber && o.trackingNumber.toUpperCase() === cleanId)
      );

      if (match) {
        setFoundOrder(match);
        setLoading(false);
        return;
      }
    } catch (_) {}

    // Simulated network lookup or fallback
    setTimeout(() => {
      setFoundOrder(null);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen py-6 sm:py-10 bg-white text-gray-900">
      <SEO
        title="Track Your Order | Calenvee.pk"
        description="Track your Calenvee nationwide order status and delivery updates across Pakistan."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-gray-100 pb-5 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-semibold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Nationwide Order Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            TRACK YOUR ORDER
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-normal leading-relaxed pt-0.5">
            Enter your Order Reference Number (e.g. CAL-ORD-1000001) or mobile number to check real-time packaging and dispatch status.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-xs">
          <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="Enter Order ID (e.g. CAL-ORD-1000001) or Phone"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 uppercase font-mono placeholder:font-sans placeholder:normal-case placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#0B132B] hover:bg-black disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
            >
              {loading ? 'Searching...' : 'Track Package'}
            </button>
          </form>
        </div>

        {/* Result Area */}
        {searched && (
          <div>
            {foundOrder ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Order Reference</span>
                    <h2 className="text-lg font-mono font-black text-gray-900">#{foundOrder.orderId}</h2>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status: {foundOrder.status.toUpperCase()}</span>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                    <Package className="w-5 h-5 text-[#F97316] mx-auto mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">1. Placed</span>
                    <span className="text-[10px] text-gray-500">Order logged</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${foundOrder.status !== 'placed' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <Clock className="w-5 h-5 text-[#F97316] mx-auto mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">2. In Verification</span>
                    <span className="text-[10px] text-gray-500">Quality check</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${['shipped', 'delivered'].includes(foundOrder.status) ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <Truck className="w-5 h-5 text-[#F97316] mx-auto mb-1" />
                    <span className="text-xs font-bold text-gray-900 block">3. Courier Dispatch</span>
                    <span className="text-[10px] text-gray-500">7-10 Working Days</span>
                  </div>
                </div>

                {/* Summary Details */}
                <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2 border border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Customer Name:</span>
                    <strong className="text-gray-900">{foundOrder.customerName}</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Destination:</span>
                    <strong className="text-gray-900">{foundOrder.city}</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Payment Method:</span>
                    <strong className="text-gray-900 uppercase">{foundOrder.paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
                    <span>Total Amount Payable:</span>
                    <span className="text-[#F97316] font-black">{formatPKR(foundOrder.total)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-sm font-bold text-gray-900">Order Not Located</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  We could not find an order matching "{orderQuery}". Please verify your order number in your confirmation email or message our WhatsApp helpline.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#F97316] hover:underline pt-2"
                >
                  <span>Contact Customer Care</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


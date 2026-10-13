import React from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, PhoneCall, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { STORE_INFO } from '../utils/formatters';

export const ReturnsRefundsPage: React.FC = () => {
  return (
    <div className="min-h-screen py-6 sm:py-10 bg-white text-gray-900">
      <SEO
        title="Returns & Refunds Policy | Calenvee.pk"
        description="Official 7-Day Exchange & Return Guarantee for Calenvee Pakistan. Hassle-free replacements, verified claims, and refund processing."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header — Centered */}
        <div className="mb-6 text-center space-y-2 border-b border-gray-100 pb-5 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-semibold uppercase tracking-wider">
            <RotateCcw className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Buyer Protection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            RETURNS & REFUNDS
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
            Clear guidelines on our 7-day exchange window, replacement eligibility, and refund procedure.
          </p>
        </div>

        {/* 3 Steps Visual Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div className="text-xs font-bold text-gray-900">Contact Us in 7 Days</div>
            <div className="text-[11px] text-gray-500">
              Message us on WhatsApp with your Order ID and photo of the item received.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div className="text-xs font-bold text-gray-900">Instant Verification</div>
            <div className="text-[11px] text-gray-500">
              Our support team reviews the claim within 24 hours and issues return instructions.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div className="text-xs font-bold text-gray-900">Exchange or Refund</div>
            <div className="text-[11px] text-gray-500">
              Receive your replacement package or prompt refund via JazzCash, EasyPaisa, or Bank.
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              1. 7-Day Exchange & Return Guarantee
            </h2>
            <p>
              At Calenvee, we want you to shop with complete peace of mind. If you are not satisfied with your purchase, received a defective item, or need a different size/variant, you are covered under our <strong>7-Day Replacement Policy</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li>The 7-day period begins from the day your parcel is marked as delivered by the courier.</li>
              <li>Requests submitted after 7 calendar days cannot be entertained.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
              2. Eligibility Criteria for Returns & Exchanges
            </h2>
            <p>
              To ensure hygiene, product authenticity, and warranty validity, items must meet the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li>The item must be <strong>unused, unworn, and unwashed</strong> with all original tags attached.</li>
              <li>Watches and electronic items must have their original protective film, warranty card, and accessories intact.</li>
              <li>The original brand box and packaging must be returned undamaged.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#F97316]" />
              3. Damaged or Incorrect Item Claims
            </h2>
            <p>
              In the unlikely event that an item arrives damaged or the incorrect model was dispatched:
            </p>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1.5">
              <p className="font-semibold text-xs sm:text-sm">
                ⚠️ Report within 24 Hours:
              </p>
              <p className="text-xs">
                Please take a short unboxing video or clear pictures showing the damaged product along with the courier shipping label, and send it to our WhatsApp support at <strong>{STORE_INFO.whatsappNumber}</strong>. We will arrange a free exchange at zero additional shipping cost.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#F97316]" />
              4. Refund Processing
            </h2>
            <p>
              If an exchange cannot be fulfilled due to out-of-stock items, or if you request a refund:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li><strong>Prepaid Orders (JazzCash / EasyPaisa / Bank Transfer):</strong> Refunds will be sent directly to your originating mobile account or bank account within <strong>3 to 5 business days</strong> after item receipt and inspection.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds are disbursed directly to your provided JazzCash or EasyPaisa account upon return parcel receipt.</li>
              <li>Courier shipping charges (Rs. 200) are non-refundable unless the return is due to our error or a defective item.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#F97316]" />
              5. Start a Return or Exchange Request
            </h2>
            <p>
              To initiate a claim, reach out to our customer care team with your order reference:
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 space-y-2">
              <div className="font-mono text-xs">
                <strong>WhatsApp Helpline:</strong> {STORE_INFO.whatsappNumber}
              </div>
              <div className="font-mono text-xs">
                <strong>Official Email:</strong> {STORE_INFO.supportEmail}
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/923001234567?text=${encodeURIComponent('Hello Calenvee! I would like to request an exchange/return for my order.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-lg transition-colors"
                >
                  <span>Chat on WhatsApp to Start Return</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


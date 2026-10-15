import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin, CheckCircle2, PhoneCall } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { STORE_INFO } from '../utils/formatters';
import storeSettingsData from '../data/storeSettings.json';

export const ShippingPolicyPage: React.FC = () => {
  const freeThresholdStr = (storeSettingsData.freeShippingThreshold || 3500).toLocaleString();
  const feeStr = (storeSettingsData.standardShippingFee || 250).toLocaleString();
  return (
    <div className="min-h-screen py-6 sm:py-10 bg-white text-gray-900">
      <SEO
        title="Shipping Policy | Calenvee.pk"
        description="Learn about Calenvee's nationwide Cash on Delivery shipping, 7-10 Working Days delivery timeline, courier partners, and packaging standards across Pakistan."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header — Centered */}
        <div className="mb-6 text-center space-y-2 border-b border-gray-100 pb-5 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Nationwide Logistics</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            SHIPPING POLICY
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
            Transparent delivery schedules, packaging safety, and Cash on Delivery guidelines for all orders placed on Calenvee.
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center space-x-3">
            <Clock className="w-6 h-6 text-[#F97316] flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">7 – 10 Working Days</div>
              <div className="text-[11px] text-gray-500">Nationwide Delivery</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-[#F97316] flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">100% Inspected</div>
              <div className="text-[11px] text-gray-500">Tamper-Proof Box</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center space-x-3">
            <Truck className="w-6 h-6 text-[#F97316] flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">Cash On Delivery</div>
              <div className="text-[11px] text-gray-500">All Over Pakistan</div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
              1. Delivery Timeline & Dispatch Process
            </h2>
            <p>
              Every order placed at Calenvee undergoes a thorough <strong>3-point quality check</strong> (item inspection, protective bubble wrap, and barcode labeling) prior to handover to courier personnel.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li><strong>Order Processing Time:</strong> Orders are verified and packaged within <strong>24 to 48 hours</strong> of placement.</li>
              <li><strong>Transit Timeline:</strong> Standard nationwide delivery takes approximately <strong>7 to 10 working days</strong> depending on your city and regional courier route.</li>
              <li><strong>Major Cities:</strong> Deliveries to Karachi, Lahore, Islamabad, and Rawalpindi typically arrive on the earlier side of this window.</li>
              <li><strong>Remote / Rural Areas:</strong> Shipments to distant districts may take up to 10 working days.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
              2. Shipping Charges & Free Delivery Threshold
            </h2>
            <p>
              We maintain clear and fair shipping rates across Pakistan:
            </p>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
              <p className="font-semibold text-xs sm:text-sm">
                🚚 <strong>FREE SHIPPING:</strong> Applied automatically on all orders with a cart total of <strong>Rs. {freeThresholdStr} or above</strong>.
              </p>
              <p className="text-xs text-emerald-800">
                For orders below Rs. {freeThresholdStr}, a flat delivery fee of <strong>Rs. {feeStr}</strong> is charged nationwide regardless of weight.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
              3. Courier Partners & Tracking
            </h2>
            <p>
              We work with Pakistan's leading logistics networks (including TCS, Trax Logistics, Call Courier, and Leopards) to ensure fast and safe parcel handling.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li>Once your parcel is dispatched, you will receive your tracking tracking ID and tracking link via WhatsApp or SMS.</li>
              <li>The courier rider will call the primary phone number provided at checkout prior to delivering the package. Please ensure your contact number is reachable.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
              4. Cash on Delivery (COD) Rules
            </h2>
            <p>
              For Cash on Delivery shipments:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li>Please keep the exact invoice cash amount ready for the delivery rider to facilitate a speedy handover.</li>
              <li>Courier riders are not authorized to allow opening of the sealed packaging before payment is received, as per standard logistics policies in Pakistan.</li>
              <li>If there are any issues after opening your parcel, you are 100% protected under our <strong>7-Day Exchange & Replacement Guarantee</strong>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#F97316]" />
              5. Shipping Support & Inquiries
            </h2>
            <p>
              Need an update on your parcel or change of delivery address? Contact our dedicated support desk directly:
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-mono text-xs space-y-1">
              <div><strong>WhatsApp Support:</strong> {STORE_INFO.whatsappNumber}</div>
              <div><strong>Email Desk:</strong> {STORE_INFO.supportEmail}</div>
              <div className="text-gray-500 font-sans text-[11px] pt-1">Operating Hours: Monday – Saturday (10:00 AM – 8:00 PM PKT)</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


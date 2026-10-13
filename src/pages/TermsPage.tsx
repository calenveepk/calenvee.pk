import React from 'react';
import { SEO } from '../components/common/SEO';
import { STORE_INFO } from '../utils/formatters';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen py-10 sm:py-16 bg-white text-gray-900">
      <SEO
        title="Terms & Conditions | Calenvee.pk"
        description="Official Terms and Conditions, Cash on Delivery policy, and 7-day exchange rules for Calenvee Pakistan."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Standardized Page Header Banner */}
        <div className="mb-8 text-left space-y-2 border-b border-gray-100 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            TERMS & CONDITIONS
            <span className="block w-16 h-1 bg-[#F97316] mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed pt-0.5">
            Official store policies, Cash on Delivery guidelines, and 7-day exchange warranty for Calenvee Pakistan.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              1. General Terms of Service
            </h2>
            <p>
              By accessing or placing an order on <strong>Calenvee.pk</strong>, you agree to adhere to the terms and guidelines outlined on this page. Calenvee operates strictly as an independent online direct-to-consumer store delivering nationwide across Pakistan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              2. Shipping & Delivery Timeline (7-10 Days)
            </h2>
            <p>
              We provide <strong>Nationwide Cash on Delivery (COD)</strong> to all major cities and rural areas of Pakistan.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li><strong>Expected Delivery Time:</strong> Deliveries typically take between <strong>7 to 10 business days</strong> from the date of dispatch.</li>
              <li><strong>Courier Tracking:</strong> Once your parcel is dispatched, a tracking consignment number (TCS / Trax) is provided to monitor transit progress.</li>
              <li><strong>Doorstep Delivery:</strong> Riders will call your provided contact number before arrival. Please ensure cash is ready for payment upon parcel receipt.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              3. Payment Methods & Receipt Verification
            </h2>
            <p>
              We offer flexible payment channels across Pakistan:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li><strong>Cash on Delivery (COD):</strong> Pay cash directly to the courier rider upon delivery.</li>
              <li><strong>JazzCash & EasyPaisa:</strong> For direct mobile account transfers, customers must send a screenshot of the transaction receipt slip to our official WhatsApp at <strong>{STORE_INFO.whatsappNumber}</strong> before the order can be processed and dispatched.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              4. 7-Day Exchange Policy
            </h2>
            <p>
              Your satisfaction is our priority. We offer a transparent 7-day exchange window:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li>Exchanges are valid within <strong>7 days</strong> from the delivery confirmation date.</li>
              <li>Items must be unused, in their original packaging, with tags and protective films intact.</li>
              <li>To initiate an exchange for size, color, or a different product, message our official WhatsApp support at <strong>{STORE_INFO.whatsappNumber}</strong> with your Order ID and photo of the item.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              5. Order Cancellation
            </h2>
            <p>
              You may cancel an order at any time before it has been handed over to the courier partner. Once the parcel is in transit with TCS or Trax, cancellations cannot be processed until the parcel arrives.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              6. Customer Support
            </h2>
            <p>
              For any questions regarding these terms, product specifications, or order inquiries:
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-mono text-xs">
              <strong>Official Customer Support (WhatsApp / Call):</strong> {STORE_INFO.whatsappNumber}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


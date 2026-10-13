import React from 'react';
import { SEO } from '../components/common/SEO';
import { STORE_INFO } from '../utils/formatters';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen py-10 sm:py-16 bg-white text-gray-900">
      <SEO
        title="Privacy Policy | Calenvee.pk"
        description="Official Privacy Policy for Calenvee Pakistan. Learn how we handle your shipping details and order information securely."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Standardized Page Header Banner */}
        <div className="mb-8 text-left space-y-2 border-b border-gray-100 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            PRIVACY POLICY
            <span className="block w-16 h-1 bg-[#F97316] mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed pt-0.5">
            How Calenvee collects, protects, and handles your order information with strict confidentiality across Pakistan.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              1. Information We Collect
            </h2>
            <p>
              When you place an order on <strong>Calenvee.pk</strong>, we collect necessary customer details strictly required to process and fulfill your shipment:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li><strong>Contact Information:</strong> Full name, mobile/WhatsApp telephone number.</li>
              <li><strong>Delivery Information:</strong> Complete home or office shipping address, landmark, and destination city.</li>
              <li><strong>Order History:</strong> Product items ordered, size selections, and preferred payment method (Cash on Delivery, JazzCash, or EasyPaisa).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              2. How We Use Your Information
            </h2>
            <p>
              Your data is used solely for the following legitimate business purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
              <li>Dispatching and delivering your parcel through our domestic courier partners (TCS Express, Trax Logistics).</li>
              <li>Sending SMS or WhatsApp order confirmations and real-time tracking numbers.</li>
              <li>Coordinating Cash on Delivery (COD) collection at your doorstep.</li>
              <li>Assisting with customer support queries, exchanges, or sizing advisory via WhatsApp.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              3. Data Protection & Sharing
            </h2>
            <p>
              We value your privacy deeply. We <strong>never sell, lease, or share</strong> your personal contact or delivery information with external advertising networks or data brokers.
            </p>
            <p>
              The only third parties who receive your contact details are licensed courier delivery personnel solely for the objective of delivering your package to your doorstep.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              4. Payment Security
            </h2>
            <p>
              Calenvee operates on a Cash on Delivery (COD) and direct mobile account basis (JazzCash / EasyPaisa). We do not store sensitive debit or credit card credentials on our servers. All digital transactions are verified manually via WhatsApp transaction receipt slips.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              5. Contact Us Regarding Your Privacy
            </h2>
            <p>
              If you wish to review, update, or request the deletion of your order contact details, please contact our official WhatsApp support helpline:
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


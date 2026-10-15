import React, { useState } from 'react';
import { FileText, HelpCircle, ChevronDown, ChevronUp, Shield, Truck, RotateCcw } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { STORE_INFO } from '../utils/formatters';

export const TermsPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How long does nationwide delivery take?',
      a: 'Deliveries across Pakistan typically take between 7 to 10 working days from the dispatch date. Orders placed in major metropolitan hubs like Karachi, Lahore, and Islamabad/Rawalpindi often arrive sooner.',
    },
    {
      q: 'Is Cash on Delivery (COD) supported in my city?',
      a: 'Yes! We provide Cash on Delivery (COD) to all major cities, towns, and reachable rural postal codes across Pakistan in partnership with TCS and Trax logistics.',
    },
    {
      q: 'How can I pay using JazzCash, EasyPaisa, or Online Bank Transfer?',
      a: `During checkout, select "Bank Transfer / Mobile Accounts". You will receive our official account numbers. Once you transfer the payment, simply upload or send the transaction receipt screenshot to our WhatsApp (${STORE_INFO.whatsappNumber}) to confirm your order.`,
    },
    {
      q: 'What is your exchange and return policy?',
      a: 'We offer a 7-day exchange warranty. If you receive a damaged or incorrect product, contact our WhatsApp helpline within 7 days of receiving the parcel to get an immediate replacement.',
    },
    {
      q: 'Are all products authentic and quality-checked?',
      a: 'Absolutely. Every timepiece, handbag, and accessory is inspected for finish, movement, and packaging before dispatch to ensure 100% satisfaction.',
    },
    {
      q: 'How do I cancel or modify my order?',
      a: 'You can modify or cancel your order by messaging our customer support on WhatsApp before the parcel is dispatched to the courier hub. Once in transit, cancellation cannot be processed until delivery.',
    },
  ];

  return (
    <div className="min-h-screen py-6 sm:py-10 bg-white text-gray-900">
      <SEO
        title="Terms & Conditions & FAQs | Calenvee.pk"
        description="Official Terms of Service, user policies, and frequently asked questions for Calenvee Pakistan."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header — Centered */}
        <div className="text-center space-y-2 border-b border-gray-100 pb-5 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Store Agreement & FAQs</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            TERMS & CONDITIONS
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
            Official store guidelines, terms of service, customer commitments, and frequently asked questions for Calenvee Pakistan.
          </p>
        </div>

        {/* Section 1: Frequently Asked Questions (FAQ) */}
        <section id="faqs" className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <HelpCircle className="w-5 h-5 text-[#F97316]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 uppercase tracking-wide">
              FREQUENTLY ASKED QUESTIONS (FAQS)
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-all bg-gray-50/50 hover:bg-gray-50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-gray-900 focus:outline-hidden"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#F97316] flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-gray-600 border-t border-gray-100/80 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Terms of Service */}
        <section className="space-y-8 text-xs sm:text-sm text-gray-600 leading-relaxed pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 pb-2">
            <Shield className="w-5 h-5 text-[#F97316]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 uppercase tracking-wide">
              STORE POLICIES & TERMS OF USE
            </h2>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              1. Acceptance of Terms
            </h3>
            <p>
              By browsing, placing an order, or communicating with <strong>Calenvee.pk</strong>, you agree to comply with all applicable Pakistani commercial guidelines, our ordering procedures, and policies outlined herein.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              2. Accuracy of Product Information & Pricing
            </h3>
            <p>
              All prices shown on Calenvee are in Pakistani Rupees (PKR) and include all applicable store discounts. While we make every effort to display accurate imagery, slight variations in color tone may occur due to device display configurations and photographic studio lighting.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              3. Order Confirmation & Fulfillment
            </h3>
            <p>
              An automated order reference number (e.g. CV-XXXXXXXX) is generated upon completing the checkout process. Calenvee reserves the right to verify high-value orders via phone or WhatsApp prior to dispatch to prevent fictitious bookings.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              4. Payment Verifications for Prepaid Orders
            </h3>
            <p>
              For payments via JazzCash, EasyPaisa, or direct bank transfer, orders are released for dispatch once the transaction reference or deposit screenshot is verified against our accounts.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              5. Intellectual Property
            </h3>
            <p>
              The Calenvee logo, slogan "Shop Smart, Live Better", website graphics, promotional banners, and proprietary visual assets belong exclusively to Calenvee.pk.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              6. Official Support & Dispute Resolution
            </h3>
            <p>
              If you have any questions or require assistance regarding our terms or an active order:
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-mono text-xs space-y-1">
              <div><strong>Helpline:</strong> {STORE_INFO.whatsappNumber}</div>
              <div><strong>Email:</strong> {STORE_INFO.supportEmail}</div>
              <div className="text-gray-500 font-sans text-[11px] pt-1">Calenvee Pakistan • Shop Smart, Live Better.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

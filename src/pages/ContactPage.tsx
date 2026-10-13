import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  ChevronDown,
  Clock,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PAKISTAN_CITIES, STORE_INFO } from '../utils/formatters';
import {
  RealWhatsAppIcon,
  RealInstagramIcon,
  RealFacebookIcon,
  RealisticTruckIcon,
} from '../components/common/RealisticIcons';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(PAKISTAN_CITIES[0]);
  const [subject, setSubject] = useState('Order & Delivery Status');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setIsSent(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setMessage('');
    }, 1200);
  };

  const faqs = [
    {
      q: 'What is the delivery timeline for orders across Pakistan?',
      a: 'Nationwide deliveries across Pakistan arrive within 7 to 10 days via TCS Express and Trax Logistics with full Cash on Delivery (COD) tracking.',
    },
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'When your order arrives, the courier rider will hand over the parcel. You can physically inspect the package exterior and pay the exact invoice amount in cash directly to the rider.',
    },
    {
      q: 'How do I exchange an item for a different size or model?',
      a: `If you need a different ring size or strap adjustment, message our official WhatsApp at ${STORE_INFO.whatsappNumber} within 7 days of delivery. Our customer support team will arrange a quick exchange.`,
    },
    {
      q: 'How do I send my payment receipt if I paid via JazzCash / EasyPaisa?',
      a: `Take a screenshot of the transaction completion slip from your JazzCash or EasyPaisa app and message it to our official WhatsApp helpline (${STORE_INFO.whatsappNumber}) along with your Order ID.`,
    },
  ];

  return (
    <div className="min-h-screen py-5 sm:py-8 bg-white text-gray-900">
      <SEO
        title="Contact & Customer Care | Calenvee.pk"
        description="Official contact hub for Calenvee Pakistan. WhatsApp helpline: +923001234567, Instagram/Facebook: @Calenvee.Pk. Inquire about deliveries, order status, or sizing advice."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Standardized Page Header Banner — Centered */}
        <div className="mb-6 text-center space-y-2 border-b border-gray-100 pb-5 flex flex-col items-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            CONTACT CALENVEE
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
            Have questions regarding an order, sizing, or product specifications? We are at your service 24/7 across Pakistan.
          </p>
        </div>

        {/* 4 Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Card 1: 24/7 WhatsApp Support */}
          <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 hover:border-[#F97316]/50 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                <RealWhatsAppIcon size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                24/7 WhatsApp Support
              </h3>
              <p className="text-xs text-gray-500 font-normal">
                Direct chat for order status, sizing advice, & payment slips:
              </p>
            </div>
            <a
              href={`https://wa.me/${STORE_INFO.whatsappRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-600 hover:underline transition-colors"
            >
              {STORE_INFO.whatsappNumber} →
            </a>
          </div>

          {/* Card 2: Phone Helpline */}
          <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 hover:border-[#F97316]/50 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#F97316] shadow-xs">
                <Phone className="w-5 h-5 text-[#F97316]" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Direct Phone Line
              </h3>
              <p className="text-xs text-gray-500 font-normal">
                Speak directly with our support team:
              </p>
            </div>
            <a
              href={`tel:${STORE_INFO.whatsappNumber}`}
              className="text-xs font-bold text-gray-900 hover:text-[#F97316] transition-colors"
            >
              {STORE_INFO.whatsappNumber}
            </a>
          </div>

          {/* Card 3: Official Socials */}
          <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 hover:border-[#F97316]/50 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RealInstagramIcon size={24} />
                <RealFacebookIcon size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Official Socials
              </h3>
              <p className="text-xs text-gray-500 font-normal">
                Follow our new drops & updates:
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <a
                href="https://instagram.com/calenvee.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F97316] hover:underline font-bold"
              >
                Instagram
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="https://facebook.com/calenvee.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0B132B] hover:underline font-bold"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Card 4: Nationwide Cash on Delivery (7-10 Days) */}
          <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 hover:border-[#F97316]/50 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#F97316] shadow-xs">
                <RealisticTruckIcon size={22} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                100% Online Store
              </h3>
              <p className="text-xs text-gray-500 font-normal leading-relaxed">
                Nationwide Cash on Delivery (7-10 Days) across Pakistan.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 font-mono">
              Serving All Pakistan Cities
            </span>
          </div>
        </div>

        {/* Contact Form & Support Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
          {/* Left: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="space-y-1 mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B]">
                Send A Direct Message
              </h2>
              <p className="text-xs text-gray-500 font-normal">
                Complete the inquiry form below and our care team will get back to you promptly on WhatsApp.
              </p>
            </div>

            {isSent ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">Message Received</h3>
                <p className="text-xs text-gray-600">
                  Thank you! Our customer care team will reply via WhatsApp or phone call promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Usman Ali"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile / WhatsApp Number *
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Inquiry Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    >
                      <option value="Order & Delivery Status">Order & Delivery Status (7-10 Days)</option>
                      <option value="Sizing & Strap Fitting">Sizing & Strap Fitting Advice</option>
                      <option value="Exchange Request">7-Day Exchange Request</option>
                      <option value="Payment Verification">Payment Slip Verification (WhatsApp)</option>
                      <option value="Other Inquiries">Other Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your query or order ID..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center space-x-2 active:scale-98"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: FAQs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                Frequently Asked Questions
              </h3>

              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-3.5 text-left flex justify-between items-center text-xs font-bold text-gray-900 hover:text-[#F97316] transition-colors"
                    >
                      <span className="pr-2">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
                          openFaq === idx ? 'rotate-180 text-[#F97316]' : ''
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="px-3.5 pb-3.5 text-xs text-gray-600 font-normal leading-relaxed border-t border-gray-200 pt-2 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Direct WhatsApp Advisory Box */}
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 flex items-center space-x-4 shadow-xs">
              <RealWhatsAppIcon size={38} />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900">Direct WhatsApp Helpline</h4>
                <p className="text-[11px] text-gray-600 font-normal">
                  Need instant answers or want to send your payment receipt?
                </p>
                <a
                  href={`https://wa.me/${STORE_INFO.whatsappRaw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-xs font-bold text-emerald-700 hover:underline"
                >
                  Open WhatsApp ({STORE_INFO.whatsappNumber}) →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

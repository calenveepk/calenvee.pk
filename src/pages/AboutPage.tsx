import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import {
  RealisticTruckIcon,
  RealisticShieldIcon,
  RealWhatsAppIcon,
} from '../components/common/RealisticIcons';
import { STORE_INFO } from '../utils/formatters';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 sm:py-12 bg-white text-gray-900">
      <SEO
        title="About Calenvee | Modern Online Lifestyle Store"
        description="Learn about Calenvee.pk, an independent Pakistani online brand curating premium, accessible watches, jewelry, and lifestyle accessories with Cash on Delivery nationwide."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Standardized Page Header Banner */}
        <div className="mb-8 text-left space-y-2 border-b border-gray-100 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            ABOUT CALENVEE
            <span className="block w-16 h-1 bg-[#F97316] mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed pt-0.5">
            Curated accessories designed for modern individuals across Pakistan who appreciate clean aesthetics without paying inflated prices.
          </p>
        </div>

        {/* Brand Mission Statement */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#0B132B]">
            Premium Styling Made Accessible
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            Calenvee was founded with a singular focus: to bridge the gap between unattainable luxury price tags and flimsy fast-fashion accessories. We operate strictly as a <strong>100% online direct-to-consumer store</strong>, cutting out expensive physical retail middlemen so we can pass true savings directly to our customers.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            Whether you are heading to university lectures, preparing for a professional job interview, or dressing up for an evening dinner, our versatile timepieces, jewelry, and daily accessories complement your personal style effortlessly.
          </p>
        </div>

        {/* 3 Core Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
            <RealisticTruckIcon size={32} />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Nationwide COD (7-10 Days)
            </h3>
            <p className="text-xs text-gray-500 font-normal leading-relaxed">
              We deliver to every corner of Pakistan. Pay securely with Cash on Delivery at your doorstep after inspecting the parcel exterior.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
            <RealisticShieldIcon size={32} />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              7-Day Hassle-Free Exchange
            </h3>
            <p className="text-xs text-gray-500 font-normal leading-relaxed">
              Ordered the wrong size or need an adjustment? We offer straightforward size and model exchanges within 7 days of package delivery.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
            <RealWhatsAppIcon size={32} />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              24/7 Dedicated Support
            </h3>
            <p className="text-xs text-gray-500 font-normal leading-relaxed">
              Talk directly with our support team on WhatsApp at <strong>{STORE_INFO.whatsappNumber}</strong> for sizing advice, dispatch tracking, or exchange queries.
            </p>
          </div>
        </div>

        {/* Transparent Shopping Experience */}
        <div className="border-t border-gray-100 pt-8 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#0B132B]">
            Authentic & Transparent
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            As an emerging independent brand, we believe in radical transparency. Every product is individually inspected and packaged before dispatch via reliable courier partners (TCS & Trax). We do not make false claims or hide behind automated bots—our customer care is always just one WhatsApp message away.
          </p>
        </div>

        {/* Call to action */}
        <div className="text-center pt-4">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-98"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

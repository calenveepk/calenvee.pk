import React from 'react';
import { Truck, ShieldCheck, RotateCcw, MessageSquare } from 'lucide-react';

export const WhyShopWithUs: React.FC = () => {
  const pillars = [
    {
      icon: <Truck className="w-6 h-6 text-[#F97316]" />,
      title: 'Cash on Delivery',
      subtitle: 'Nationwide Cash on Delivery across Pakistan (7-10 Days)',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#F97316]" />,
      title: 'Quality Inspected',
      subtitle: 'Every parcel is individually hand-checked before packing',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-[#F97316]" />,
      title: '7-Day Exchange',
      subtitle: 'Hassle-free replacement policy for size & style adjustments',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-[#F97316]" />,
      title: 'Direct WhatsApp Support',
      subtitle: 'Prompt assistance for order placement at +923001234567',
    },
  ];

  return (
    <section className="bg-white py-6 sm:py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading with Centered Orange Underline */}
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider relative inline-block">
            OUR <span className="text-[#F97316]">SERVICE</span> PROMISE
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-normal leading-relaxed">
            Honest service, reliable delivery, and customer care you can depend on.
          </p>
        </div>

        {/* 4 Pillars Grid (2 cards side by side on mobile, 4 columns on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="p-3.5 sm:p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-orange-200 transition-colors flex flex-col items-center text-center space-y-2.5 sm:space-y-3"
            >
              <div className="p-2.5 sm:p-3.5 rounded-full bg-white shadow-xs">
                {p.icon}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  {p.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed">
                  {p.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

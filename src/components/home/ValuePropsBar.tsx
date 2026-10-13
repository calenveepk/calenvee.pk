import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Phone } from 'lucide-react';

export const ValuePropsBar: React.FC = () => {
  const props = [
    {
      icon: <Truck className="w-5 h-5 text-[#F97316]" />,
      title: 'CASH ON DELIVERY',
      subtitle: 'Nationwide Cash on Delivery (7-10 Days)',
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-[#F97316]" />,
      title: '7 DAYS RETURNS',
      subtitle: 'Hassle-free exchange & replacement',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#F97316]" />,
      title: 'QUALITY INSPECTED',
      subtitle: 'Hand-checked before packaging',
    },
    {
      icon: <Phone className="w-5 h-5 text-[#F97316]" />,
      title: '24/7 SUPPORT',
      subtitle: 'Call / WhatsApp: +923001234567',
    },
  ];

  return (
    <section className="bg-white border-b border-gray-100 py-6 sm:py-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {props.map((p, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-3 ${idx !== 0 ? 'sm:pl-6' : ''} ${
                idx > 1 ? 'pt-4 sm:pt-0' : ''
              }`}
            >
              <div className="p-2.5 rounded-full bg-orange-50/80 flex items-center justify-center flex-shrink-0">
                {p.icon}
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {p.title}
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
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

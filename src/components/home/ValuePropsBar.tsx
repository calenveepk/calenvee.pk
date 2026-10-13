import React from 'react';
import { Truck, RotateCcw, Award, Headphones } from 'lucide-react';

export const ValuePropsBar: React.FC = () => {
  const props = [
    {
      icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />,
      title: 'Free Shipping',
      subtitle: 'On orders over Rs. 2,999',
    },
    {
      icon: <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />,
      title: 'Easy Returns',
      subtitle: '7-day replacement warranty',
    },
    {
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />,
      title: 'Premium Quality',
      subtitle: '100% original inspected products',
    },
    {
      icon: <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />,
      title: '24/7 Support',
      subtitle: "We're here to help on WhatsApp",
    },
  ];

  return (
    <section className="bg-white border-y border-gray-100 py-4 sm:py-8 my-1 sm:my-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single row horizontally scrollable on mobile view, responsive grid on desktop */}
        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-3 pb-1 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:gap-8">
          {props.map((p, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[165px] sm:w-auto snap-center bg-gray-50/70 sm:bg-transparent rounded-2xl p-3 sm:p-0 border border-gray-100/80 sm:border-none flex flex-col items-center text-center space-y-2 transition-transform active:scale-98"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white sm:bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 shadow-2xs">
                {p.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight whitespace-nowrap">
                  {p.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-gray-500 line-clamp-1 sm:line-clamp-none">
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

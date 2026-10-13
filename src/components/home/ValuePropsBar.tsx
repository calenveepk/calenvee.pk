import React from 'react';
import { Truck, RotateCcw, Award, Headphones } from 'lucide-react';

export const ValuePropsBar: React.FC = () => {
  const props = [
    {
      icon: <Truck className="w-6 h-6 text-gray-800" />,
      title: 'Free Shipping',
      subtitle: 'On orders over Rs. 2,999',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-gray-800" />,
      title: 'Easy Returns',
      subtitle: '7-day replacement warranty',
    },
    {
      icon: <Award className="w-6 h-6 text-gray-800" />,
      title: 'Premium Quality',
      subtitle: '100% original inspected products',
    },
    {
      icon: <Headphones className="w-6 h-6 text-gray-800" />,
      title: '24/7 Support',
      subtitle: "We're here to help on WhatsApp",
    },
  ];

  return (
    <section className="bg-white border-y border-gray-100 py-6 sm:py-8 my-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {props.map((p, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 shadow-2xs">
                {p.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
                  {p.title}
                </h4>
                <p className="text-[11px] text-gray-500">
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

import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Tag, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const MarqueeBanner: React.FC = () => {
  const items = [
    {
      icon: <Truck className="w-3.5 h-3.5 text-[#F97316]" />,
      prefix: 'FREE SHIPPING',
      text: 'Nationwide on orders over Rs. 2,999',
    },
    {
      icon: <Tag className="w-3.5 h-3.5 text-[#F97316]" />,
      prefix: 'EXTRA 10% OFF',
      text: 'On prepaid orders (JazzCash / EasyPaisa / Bank)',
    },
    {
      icon: <Zap className="w-3.5 h-3.5 text-[#F97316]" />,
      prefix: 'UP TO 50% OFF',
      text: 'Flash Deals live right now — Shop More, Save More!',
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />,
      prefix: 'CASH ON DELIVERY',
      text: 'Available across all cities in Pakistan',
    },
    {
      icon: <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />,
      prefix: 'CALENVEE EXCLUSIVE',
      text: 'Shop Smart, Live Better • 7-Day Easy Exchange',
    },
  ];

  // Duplicate items 4 times to ensure seamless infinite looping track
  const tickerItems = [...items, ...items, ...items, ...items];

  return (
    <aside
      aria-label="Announcement"
      className="relative w-full bg-[#081320] text-white py-2 overflow-hidden border-b border-slate-800/80 text-[11px] font-medium select-none z-40"
    >
      {/* Subtle edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#081320] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#081320] to-transparent z-10" />

      {/* Moving Marquee Track: identical smooth velocity to Review section */}
      <div className="flex w-max animate-marquee-slow transform-gpu items-center space-x-8 sm:space-x-12 px-4">
        {tickerItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-2 text-slate-300 flex-shrink-0"
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>
              <strong className="text-white font-bold tracking-wider">{item.prefix}</strong>{' '}
              <span className="text-slate-300 font-normal">{item.text}</span>
            </span>
            <span className="text-slate-600 pl-4">•</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

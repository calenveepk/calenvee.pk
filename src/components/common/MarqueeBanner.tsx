import React from 'react';
import { Sparkles } from 'lucide-react';
import announcementsData from '../../data/announcements.json';

export const MarqueeBanner: React.FC = () => {
  const announcements: string[] = announcementsData || [
    "Nationwide Cash on Delivery (7-10 Days)",
    "SHOP SMART, LIVE BETTER",
    "7-Day Easy Exchange & Replacement Warranty"
  ];

  return (
    <aside aria-label="Announcement" className="w-full bg-[#0B132B] text-white py-2 overflow-hidden select-none border-b border-[#1C2541]">
      <div className="flex w-max animate-marquee space-x-10">
        {[...announcements, ...announcements, ...announcements, ...announcements].map((text, index) => (
          <div
            key={index}
            className="flex items-center space-x-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-200 hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
            <span>{text}</span>
            <span className="text-[#F97316] font-bold ml-4">✦</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

import React from 'react';
import { Truck, ShieldCheck, Phone, MessageSquare, CheckCircle } from 'lucide-react';

export const MarqueeBanner: React.FC = () => {
  const items = [
    { icon: <Truck className="w-3.5 h-3.5 text-[#F97316]" />, text: "Nationwide Cash on Delivery (7-10 Days)" },
    { icon: <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />, text: "7-Day Easy Exchange & Replacement Warranty" },
    { icon: <Phone className="w-3.5 h-3.5 text-[#F97316]" />, text: "24/7 Customer Support: +923001234567" },
    { icon: <MessageSquare className="w-3.5 h-3.5 text-[#F97316]" />, text: "Official WhatsApp Inquiries: +923001234567" },
    { icon: <CheckCircle className="w-3.5 h-3.5 text-[#F97316]" />, text: "Inspected Quality Presentation Packaging" },
  ];

  return (
    <aside aria-label="Announcement" className="w-full bg-[#0B132B] text-white py-2 overflow-hidden select-none border-b border-[#1C2541]">
      <div className="flex w-max animate-marquee space-x-10">
        {[...items, ...items, ...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-200 hover:text-white transition-colors"
          >
            {item.icon}
            <span>{item.text}</span>
            <span className="text-[#F97316] font-bold ml-4">✦</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

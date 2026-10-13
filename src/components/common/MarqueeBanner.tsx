import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Tag, ExternalLink } from 'lucide-react';

export const MarqueeBanner: React.FC = () => {
  return (
    <aside aria-label="Announcement" className="w-full bg-[#081320] text-white py-2 px-4 border-b border-slate-800/80 text-[11px] font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Free Shipping */}
        <div className="flex items-center space-x-2 text-slate-300">
          <Truck className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
          <span>
            <strong className="text-white font-bold">FREE SHIPPING</strong> On orders over Rs. 2,999
          </span>
        </div>

        {/* Center: Extra 10% Off on Prepaid */}
        <div className="hidden sm:flex items-center space-x-2 text-slate-300">
          <Tag className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
          <span>
            <strong className="text-white font-bold">EXTRA 10% OFF</strong> On prepaid orders (JazzCash/EasyPaisa/Raast)
          </span>
        </div>

        {/* Right: Direct Deals / Track link */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/shop"
            className="text-slate-400 hover:text-white transition-colors underline flex items-center gap-1"
          >
            <span>View Flash Deals</span>
            <ExternalLink className="w-3 h-3 text-[#F97316]" />
          </Link>
        </div>

      </div>
    </aside>
  );
};

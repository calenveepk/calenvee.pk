import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import {
  RealWhatsAppIcon,
  RealInstagramIcon,
  RealFacebookIcon,
  RealBankIcon,
  RealCODBadge,
} from '../common/RealisticIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#081320] text-gray-300 border-t border-slate-800">
      {/* Main Footer Container with broad mobile width */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-10">
        
        {/* Top Grid: Brand & Description + 3 Navigation Columns (NO Download Our App) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-slate-800">
          
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5 text-left">
            <Link to="/" className="inline-block group">
              <img
                src="/logo-white.png"
                alt="Calenvee"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback if logo-white not found
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-xl font-black text-white tracking-wider block">CALENVEE</span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your trusted store for premium timepieces, waterproof jewelry, and modern lifestyle essentials across Pakistan. Shop smart, live better.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 pt-1">
              <a
                href="https://facebook.com/calenvee.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#F97316] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <RealFacebookIcon size={16} />
              </a>

              <a
                href="https://instagram.com/calenvee.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#F97316] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <RealInstagramIcon size={16} />
              </a>

              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-[#25D366] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="WhatsApp"
              >
                <RealWhatsAppIcon size={16} />
              </a>
            </div>
          </div>

          {/* Col 1: Shop (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Shop
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=top-deals" className="hover:text-white transition-colors">
                  Top Deals
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/best-sellers" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/category/watches" className="hover:text-white transition-colors">
                  Watches
                </Link>
              </li>
              <li>
                <Link to="/category/jewelry" className="hover:text-white transition-colors">
                  Jewelry
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Customer Service (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/returns-refunds" className="hover:text-white transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping Info (7-10 Days COD)
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors inline-flex items-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>WhatsApp: +92 300 1234567</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: About Calenvee (2 cols) */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              About Calenvee
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block pt-1">
                  100% Inspected Packaging
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Payment Badges Row: COD, EasyPaisa, JazzCash, Bank — Center Aligned */}
        <div className="pt-6 pb-6 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
          {/* COD Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-2xs h-10 text-white">
            <RealCODBadge size={22} />
            <span className="text-[11px] font-bold whitespace-nowrap">Cash On Delivery</span>
          </div>

          {/* Official EasyPaisa Logo Badge */}
          <div className="inline-flex items-center justify-center bg-white border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-2xs h-10">
            <img
              src="/payments/easypaisa.png"
              alt="EasyPaisa"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </div>

          {/* Official JazzCash Logo Badge */}
          <div className="inline-flex items-center justify-center bg-white border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-2xs h-10">
            <img
              src="/payments/jazzcash.png"
              alt="JazzCash"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>

          {/* Bank / Raast Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-2xs h-10 text-white">
            <RealBankIcon size={22} />
            <span className="text-[11px] font-bold whitespace-nowrap">Bank / Raast</span>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-left">
          <p>© 2026 Calenvee. All rights reserved. Shop Smart, Live Better.</p>
          <div className="flex items-center space-x-4 text-[11px]">
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

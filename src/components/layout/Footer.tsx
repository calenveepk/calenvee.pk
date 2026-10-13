import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import {
  RealWhatsAppIcon,
  RealInstagramIcon,
  RealFacebookIcon,
  RealJazzCashIcon,
  RealEasyPaisaIcon,
  RealBankIcon,
  RealCODBadge,
} from '../common/RealisticIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-10 text-center">
        
        {/* Top: Brand Logo, Slogan, Description & Social Icons — Centered */}
        <div className="max-w-xl mx-auto space-y-3 pb-8 border-b border-gray-100 flex flex-col items-center text-center">
          <Link to="/" className="inline-block group">
            <img
              src="/logo.png"
              alt="Calenvee"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105 mx-auto"
            />
          </Link>

          <p className="text-xs font-bold text-[#F97316] font-mono tracking-wider uppercase">
            SHOP SMART, LIVE BETTER.
          </p>

          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Your destination for contemporary lifestyle essentials, timepieces, and accessories delivered nationwide with Cash on Delivery.
          </p>

          {/* Social Icons Centered */}
          <div className="flex items-center justify-center space-x-3 pt-1">
            <a
              href="https://facebook.com/calenvee.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#F97316] hover:text-white flex items-center justify-center transition-colors"
              title="Facebook"
            >
              <RealFacebookIcon size={18} />
            </a>

            <a
              href="https://instagram.com/calenvee.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#F97316] hover:text-white flex items-center justify-center transition-colors"
              title="Instagram"
            >
              <RealInstagramIcon size={18} />
            </a>

            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-colors"
              title="WhatsApp"
            >
              <RealWhatsAppIcon size={18} />
            </a>
          </div>
        </div>

        {/* Middle: Quick Links, Customer Care, Contact Us — Side by Side in Same Row (3 Columns) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-8 pt-8 pb-8 text-center max-w-4xl mx-auto">
          
          {/* Col 1: QUICK LINKS */}
          <div className="space-y-3">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-[11px] sm:text-xs text-gray-500">
              <li>
                <Link to="/new-arrivals" className="hover:text-[#F97316] transition-colors">
                  New In
                </Link>
              </li>
              <li>
                <Link to="/best-sellers" className="hover:text-[#F97316] transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#F97316] transition-colors">
                  Deals &amp; Offers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F97316] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: CUSTOMER CARE */}
          <div className="space-y-3">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2 text-[11px] sm:text-xs text-gray-500">
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#F97316] transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-[#F97316] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-refunds" className="hover:text-[#F97316] transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#F97316] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#F97316] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: CONTACT US */}
          <div className="space-y-3">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">
              CONTACT US
            </h4>
            <ul className="space-y-2.5 text-[11px] sm:text-xs text-gray-500 flex flex-col items-center">
              <li>
                <a
                  href="mailto:calenvee.pk@gmail.com"
                  className="hover:text-[#F97316] transition-colors inline-flex items-center space-x-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-none">calenvee.pk@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F97316] transition-colors font-mono inline-flex items-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
                  <span>+92 300 1234567</span>
                </a>
              </li>
              <li className="text-[10px] text-gray-400">
                10:00 AM – 8:00 PM PKT
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom: COD, Easypaisa, Jazzcash, Bank — Center Aligned in One Row */}
        <div className="pt-6 pb-6 border-t border-gray-100 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {/* COD Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-2.5 py-1.5 transition-colors">
            <RealCODBadge size={24} />
            <span className="text-[11px] font-bold text-gray-800 whitespace-nowrap">COD</span>
          </div>

          {/* EasyPaisa Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-2.5 py-1.5 transition-colors">
            <RealEasyPaisaIcon size={24} />
            <span className="text-[11px] font-bold text-gray-800 whitespace-nowrap">EasyPaisa</span>
          </div>

          {/* JazzCash Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-2.5 py-1.5 transition-colors">
            <RealJazzCashIcon size={24} />
            <span className="text-[11px] font-bold text-gray-800 whitespace-nowrap">JazzCash</span>
          </div>

          {/* Bank / Raast Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg px-2.5 py-1.5 transition-colors">
            <RealBankIcon size={24} />
            <span className="text-[11px] font-bold text-gray-800 whitespace-nowrap">Bank / Raast</span>
          </div>
        </div>

        {/* Bottom Dark Strip matching reference — Centered */}
        <div className="pt-4 border-t border-gray-100 flex flex-col items-center justify-center text-xs text-gray-500 text-center gap-1">
          <p>© 2026 Calenvee. All rights reserved. Shop Smart, Live Better.</p>
          <p className="text-[11px] text-gray-400">
            Nationwide Cash On Delivery • 100% Inspected Packaging
          </p>
        </div>

      </div>
    </footer>
  );
};

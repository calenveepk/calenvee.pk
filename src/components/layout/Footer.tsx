import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import {
  RealWhatsAppIcon,
  RealInstagramIcon,
  RealFacebookIcon,
  RealJazzCashIcon,
  RealEasyPaisaIcon,
  RealisticTruckIcon,
} from '../common/RealisticIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Col 1: Brand Logo, Slogan & Description matching reference */}
          <div className="space-y-4">
            <Link to="/" className="inline-block group">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logo.png"
                  alt="Calenvee"
                  className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
            
            <p className="text-xs font-semibold text-[#F97316] font-mono tracking-wide">
              SHOP SMART, LIVE BETTER.
            </p>

            <p className="text-xs text-gray-500 leading-relaxed">
              Your one-stop destination for quality products, luxury timepieces, and lifestyle essentials at unbeatable prices.
            </p>

            {/* Social Icons matching reference */}
            <div className="flex items-center space-x-3 pt-1">
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

          {/* Col 2: QUICK LINKS matching reference */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
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

          {/* Col 3: CUSTOMER CARE matching reference */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
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

          {/* Col 4: CONTACT US matching reference */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              CONTACT US
            </h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" />
                <a href="mailto:calenvee.pk@gmail.com" className="hover:text-[#F97316] transition-colors">
                  calenvee.pk@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="hover:text-[#F97316] transition-colors font-mono">
                  +92 300 1234567
                </a>
              </li>
            </ul>

            {/* Payment Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
                <RealisticTruckIcon size={14} />
                <span>COD</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
                <RealJazzCashIcon size={14} />
                <span>JazzCash</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
                <RealEasyPaisaIcon size={14} />
                <span>EasyPaisa</span>
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Dark Strip matching reference */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 text-center sm:text-left gap-2">
          <p>© 2026 Calenvee. All rights reserved. Shop Smart, Live Better.</p>
          <p className="text-[11px] text-gray-400">
            Nationwide Cash On Delivery • 100% Inspected Packaging
          </p>
        </div>
      </div>
    </footer>
  );
};

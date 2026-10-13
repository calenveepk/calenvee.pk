import React from 'react';
import { Link } from 'react-router-dom';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8 xl:gap-10">
          
          {/* Col 1: Brand Info & Socials (Centered on mobile, left-aligned on desktop) */}
          <div className="lg:col-span-1 flex flex-col items-center text-center lg:items-start lg:text-left space-y-3.5">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Calenvee.pk"
                className="h-9 w-auto object-contain mx-auto lg:mx-0"
              />
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed font-normal max-w-sm mx-auto lg:mx-0">
              Calenvee delivers quality lifestyle accessories you can trust, at prices you'll love. Your satisfaction is our priority.
            </p>

            {/* Social Icons with authentic badges */}
            <div className="flex items-center justify-center lg:justify-start space-x-3 pt-1">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-full hover:scale-110 transition-transform"
                title="WhatsApp Support: +923001234567"
              >
                <RealWhatsAppIcon size={24} />
              </a>

              <a
                href="https://instagram.com/calenvee.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-full hover:scale-110 transition-transform"
                title="Instagram: @calenvee.pk"
              >
                <RealInstagramIcon size={24} />
              </a>

              <a
                href="https://facebook.com/calenvee.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-full hover:scale-110 transition-transform"
                title="Facebook: @calenvee.pk"
              >
                <RealFacebookIcon size={24} />
              </a>
            </div>
          </div>

          {/* Cols 2, 3, 4: SHOP, CUSTOMER SERVICE, ABOUT US (Side-by-side in 3 columns on mobile) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-6 lg:contents border-t border-b border-gray-100 py-6 lg:border-none lg:py-0">
            {/* Col 2: SHOP */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">
                SHOP
              </h4>
              <ul className="space-y-2 text-[11px] sm:text-xs text-gray-500">
                <li>
                  <Link to="/shop" className="hover:text-[#F97316] transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/best-sellers" className="hover:text-[#F97316] transition-colors">
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link to="/new-arrivals" className="hover:text-[#F97316] transition-colors">
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: CUSTOMER SERVICE */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">
                CUSTOMER CARE
              </h4>
              <ul className="space-y-2 text-[11px] sm:text-xs text-gray-500">
                <li>
                  <Link to="/contact" className="hover:text-[#F97316] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="hover:text-[#F97316] transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="hover:text-[#F97316] transition-colors">
                    7-Day Exchange
                  </Link>
                </li>
                <li>
                  <a
                    href="https://wa.me/923001234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F97316] transition-colors text-emerald-600 font-semibold"
                  >
                    WhatsApp Help
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: ABOUT US */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">
                ABOUT US
              </h4>
              <ul className="space-y-2 text-[11px] sm:text-xs text-gray-500">
                <li>
                  <Link to="/about" className="hover:text-[#F97316] transition-colors">
                    About Calenvee
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-[#F97316] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="hover:text-[#F97316] transition-colors">
                    Terms & Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 5: WE ACCEPT (Centrally aligned on mobile, left-aligned on desktop) */}
          <div className="space-y-2.5 sm:space-y-3 pt-1 lg:pt-0 flex flex-col items-center text-center lg:items-start lg:text-left">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">
              WE ACCEPT
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Safe & secure payment options across Pakistan:
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {/* Cash on Delivery Badge */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 border border-gray-200 text-gray-800 text-[10px] font-bold">
                <RealisticTruckIcon size={16} />
                <span>Cash on Delivery</span>
              </div>

              {/* JazzCash Badge */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 border border-gray-200">
                <RealJazzCashIcon size={18} />
                <span className="text-[10px] font-bold text-gray-800">JazzCash</span>
              </div>

              {/* EasyPaisa Badge */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 border border-gray-200">
                <RealEasyPaisaIcon size={18} />
                <span className="text-[10px] font-bold text-gray-800">EasyPaisa</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 pt-1 text-center lg:text-left">
              Nationwide Delivery Expected in 7-10 Days.
            </p>
          </div>

        </div>

        {/* Bottom Bar: Exactly @2026 Calenvee.pk. All Rights Reserved */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2026 Calenvee.pk. All Rights Reserved.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 text-[11px] text-gray-400">
            <span>Official Store</span>
            <span>•</span>
            <span>Pakistan</span>
            <span>•</span>
            <span>PKR (Rs.)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

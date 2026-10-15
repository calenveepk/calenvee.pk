import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Check, Crown } from 'lucide-react';
import homeContentData from '../../data/homeContent.json';

export const MemberExclusiveBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const member = homeContentData.trioBanners?.memberExclusive || {
    badge: 'Member Exclusive',
    title: 'Extra 10% Off',
    couponCode: 'CALENVEE10',
    subtitle: 'On prepaid & COD orders this weekend',
    link: '/shop',
    ctaText: 'Shop Now',
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(member.couponCode || 'CALENVEE10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="bg-white py-4 sm:py-7">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative bg-[#081320] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-800 shadow-xl overflow-hidden">
          
          {/* Subtle Ambient Background Glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Column: Heading & Copy Text */}
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-[11px] font-extrabold text-orange-400 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-orange-400" />
                <span>{member.badge}</span>
              </div>

              <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {member.title} Across Entire Store
              </h3>

              <p className="text-xs sm:text-sm text-slate-300">
                {member.subtitle}. Apply our exclusive coupon code at checkout!
              </p>

              {/* Interactive Coupon Code Pill */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="group/code inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-dashed border-orange-400/60 transition-all cursor-pointer"
                  title="Click to copy coupon code"
                >
                  <span className="text-xs font-mono font-black text-[#F97316] tracking-wider">
                    {member.couponCode || 'CALENVEE10'}
                  </span>
                  {copied ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED!</span>
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-orange-300 group-hover/code:text-white transition-colors" />
                  )}
                </button>

                <Link
                  to={member.link || '/shop'}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors shadow-md hover:shadow-orange-500/25 active:scale-95"
                >
                  <span>{member.ctaText || 'Shop Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Gold Discount Medal / Badge */}
            <div className="shrink-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1.5 shadow-2xl transform transition-transform duration-500 hover:rotate-6 hover:scale-105 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-900/40 flex flex-col items-center justify-center bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-stone-900 font-black shadow-inner">
                    <span className="text-2xl sm:text-4xl font-black leading-none tracking-tight">10%</span>
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest mt-0.5">OFF</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-xs text-[10px] font-bold text-amber-300 px-3 py-0.5 rounded-full border border-amber-500/40 shadow-xs">
                  PREPAID & COD
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};


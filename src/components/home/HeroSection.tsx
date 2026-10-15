import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Truck } from 'lucide-react';
import homeContentData from '../../data/homeContent.json';

export const HeroSection: React.FC = () => {
  const hero = homeContentData.hero || {
    kicker: 'QUALITY. STYLE. EVERYDAY.',
    headlinePrefix: 'Everything You Love,',
    headlineHighlight: 'All in One Place.',
    subtitle: 'Shop top-quality products across watches, jewelry, handbags, sunglasses, and fragrances with unbeatable prices and a seamless Cash on Delivery experience nationwide.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    trustPoints: [
      { text: 'Cash on Delivery' },
      { text: 'Premium Quality' },
      { text: 'Nationwide Shipping' },
    ],
    image: '/hero/hero_podium_collection.jpg',
  };

  return (
    <section className="w-full bg-[#FAF7F2] border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Left Content Column (7 cols) */}
          <div className="lg:col-span-6 space-y-3.5 sm:space-y-6 text-left">
            
            {/* Kicker Pill matching reference */}
            <div className="inline-flex items-center space-x-1 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#F97316]">
              <span>{hero.kicker}</span>
            </div>

            {/* Main Headline matching reference */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-[#0B132B] tracking-tight leading-[1.15]">
                {hero.headlinePrefix}<br />
                <span className="text-[#F97316]">{hero.headlineHighlight}</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 font-normal leading-relaxed max-w-lg">
                {hero.subtitle}
              </p>
            </div>

            {/* Shop Now CTA Button — Full width on mobile for instant thumb action */}
            <div className="pt-1 sm:pt-2">
              <Link
                to={hero.ctaLink || '/shop'}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 sm:px-8 sm:py-4 bg-[#081320] hover:bg-[#F97316] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all duration-200 active:scale-95 group"
              >
                <span>{hero.ctaText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* 3 Trust Points matching reference */}
            <div className="pt-3.5 sm:pt-6 border-t border-gray-200/60 flex items-center justify-between sm:justify-start gap-2 sm:gap-6 flex-wrap text-gray-700">
              <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-bold text-gray-800">
                <ShieldCheck className="w-4 h-4 text-[#F97316] shrink-0" />
                <span>{hero.trustPoints?.[0]?.text || 'Cash on Delivery'}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-bold text-gray-800">
                <Award className="w-4 h-4 text-[#F97316] shrink-0" />
                <span>{hero.trustPoints?.[1]?.text || 'Premium Quality'}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-bold text-gray-800">
                <Truck className="w-4 h-4 text-[#F97316] shrink-0" />
                <span>{hero.trustPoints?.[2]?.text || 'Nationwide Shipping'}</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Column (5 cols) matching lifestyle composition */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg sm:max-w-xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-stone-200/70 bg-white">
              <img
                src={hero.image || '/hero/hero_podium_collection.jpg'}
                alt="Calenvee Luxury Lifestyle Collection"
                className="w-full h-full object-cover object-center aspect-[4/3] sm:aspect-[16/11]"
              />
              
              {/* Subtle floating badge */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-gray-100 flex items-center space-x-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-none">Curated Drop</span>
                  <span className="text-xs font-extrabold text-gray-900 leading-tight">100% Original Products</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

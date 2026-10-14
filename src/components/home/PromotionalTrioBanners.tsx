import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import homeContentData from '../../data/homeContent.json';

export const PromotionalTrioBanners: React.FC = () => {
  const trio = homeContentData.trioBanners || {};
  const deal = trio.dealOfTheDay || {
    badge: 'Deal of the Day',
    title: 'Up to 60% Off',
    productId: 'cv-watch-01',
    link: '/product/calenvee-obsidian-chrono-edition',
    ctaText: 'Shop Deals',
  };
  const fresh = trio.newArrivals || {
    badge: 'New Arrivals',
    title: 'Fresh Finds',
    subtitle: 'Check out the latest drops just for you',
    link: '/new-arrivals',
    ctaText: 'Explore Now',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
  };
  const member = trio.memberExclusive || {
    badge: 'Member Exclusive',
    title: 'Extra 10% Off',
    couponCode: 'CALENVEE10',
    subtitle: 'On prepaid orders this weekend',
    link: '/shop',
    ctaText: 'Shop Now',
  };

  // Most selling product for Deal of the Day
  const topProduct = PRODUCTS.find((p) => p.id === deal.productId) || PRODUCTS[0];

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* 3-Card Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Deal of the Day (Center aligned on mobile, row on desktop) */}
          <Link
            to={deal.link || `/product/${topProduct.slug}`}
            className="group relative bg-[#FFF7F0] rounded-2xl p-5 sm:p-6 border border-orange-100/80 hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col-reverse sm:flex-row items-center justify-between text-center sm:text-left overflow-hidden min-h-[170px] gap-3 sm:gap-0"
          >
            <div className="space-y-1.5 z-10 w-full sm:max-w-[58%] text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider block">
                {deal.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B132B] tracking-tight leading-tight">
                {deal.title}
              </h3>
              <p className="text-[11px] text-gray-500 line-clamp-1">
                Top seller: {topProduct.name}
              </p>
              <div className="pt-1.5 sm:pt-2">
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#EA580C] group-hover:underline">
                  <span>{deal.ctaText || 'Shop Deals'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            {/* Cutout Product Image */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
              <img
                src={topProduct.images[0] || '/hero/hero-watch.png'}
                alt={topProduct.name}
                className="w-full h-full object-contain filter drop-shadow-md transform transition-transform duration-500 group-hover:scale-108"
                loading="lazy"
              />
            </div>
          </Link>

          {/* Card 2: New Arrivals */}
          <Link
            to={fresh.link || '/new-arrivals'}
            className="group relative bg-[#F4F8F7] rounded-2xl p-5 sm:p-6 border border-emerald-100/70 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col-reverse sm:flex-row items-center justify-between text-center sm:text-left overflow-hidden min-h-[170px] gap-3 sm:gap-0"
          >
            <div className="space-y-1.5 z-10 w-full sm:max-w-[58%] text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                {fresh.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B132B] tracking-tight leading-tight">
                {fresh.title}
              </h3>
              <p className="text-[11px] text-gray-500 line-clamp-1">
                {fresh.subtitle}
              </p>
              <div className="pt-1.5 sm:pt-2">
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 group-hover:underline">
                  <span>{fresh.ctaText || 'Explore Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            {/* Cutout Sneaker Product Image */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
              <img
                src={fresh.image || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80'}
                alt="New Arrival"
                className="w-full h-full object-contain filter drop-shadow-md transform transition-transform duration-500 group-hover:scale-108"
                loading="lazy"
              />
            </div>
          </Link>

          {/* Card 3: Member Exclusive (Dark Luxury Card) */}
          <Link
            to={member.link || '/shop'}
            className="group relative bg-[#081320] text-white rounded-2xl p-5 sm:p-6 border border-slate-800 hover:border-orange-500/50 hover:shadow-md transition-all duration-300 flex flex-col-reverse sm:flex-row items-center justify-between text-center sm:text-left overflow-hidden min-h-[170px] gap-3 sm:gap-0"
          >
            <div className="space-y-1.5 z-10 w-full sm:max-w-[58%] text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                {member.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {member.title}
              </h3>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                Use code: <strong className="text-[#F97316]">{member.couponCode || 'CALENVEE10'}</strong>
              </p>
              <div className="pt-1.5 sm:pt-2">
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-orange-400 group-hover:text-[#F97316] group-hover:underline">
                  <span>{member.ctaText || 'Shop Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            {/* Gold Discount Coin/Emblem */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
              <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-lg transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-amber-800/40 flex flex-col items-center justify-center bg-gradient-to-b from-amber-400 to-amber-500 text-stone-900 font-black shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black leading-none">%</span>
                  <span className="text-[8px] font-black uppercase tracking-wider">OFF</span>
                </div>
              </div>
            </div>
          </Link>

        </div>

      </div>
    </section>
  );
};

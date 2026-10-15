import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import homeContentData from '../../data/homeContent.json';

export const FreshFindsBanner: React.FC = () => {
  const fresh = homeContentData.trioBanners?.newArrivals || {
    badge: 'New Arrivals',
    title: 'Fresh Finds',
    subtitle: 'Check out the latest drops just for you',
    link: '/new-arrivals',
    ctaText: 'Explore Now',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
  };

  return (
    <section className="bg-white py-3 sm:py-5">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <Link
          to={fresh.link || '/new-arrivals'}
          className="group relative bg-[#F4F8F7] hover:bg-[#EEF6F4] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-row items-center justify-between text-left overflow-hidden min-h-[110px] sm:min-h-[140px] gap-3"
        >
          {/* Left Text Content */}
          <div className="space-y-1 z-10 max-w-[65%] sm:max-w-[70%] text-left flex flex-col items-start">
            <div className="inline-flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{fresh.badge}</span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-[#0B132B] tracking-tight leading-tight">
              {fresh.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-1">
              {fresh.subtitle}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 group-hover:underline">
                <span>{fresh.ctaText || 'Explore Now'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Right Cutout Image */}
          <div className="relative w-20 h-20 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            <img
              src={fresh.image || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80'}
              alt="New Arrivals"
              className="w-full h-full object-contain filter drop-shadow-md transform transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
      </div>
    </section>
  );
};


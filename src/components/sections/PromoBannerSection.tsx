import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PromoBannerSectionProps {
  settings: {
    layout?: 'single' | 'split-2' | 'trio-3';
    banners?: Array<{
      id: string;
      badge?: string;
      title: string;
      subtitle?: string;
      discountBadge?: string;
      ctaText?: string;
      link: string;
      image: string;
      imageAlt?: string;
    }>;
  };
}

export const PromoBannerSection: React.FC<PromoBannerSectionProps> = ({ settings }) => {
  const { layout = 'single', banners = [] } = settings;

  if (banners.length === 0) return null;

  return (
    <section className="bg-white py-5 sm:py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className={`grid ${layout === 'split-2' ? 'grid-cols-1 md:grid-cols-2' : layout === 'trio-3' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} gap-4 sm:gap-6`}>
          {banners.map((b) => (
            <div
              key={b.id}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B132B] to-[#1C2541] text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md"
            >
              <div className="space-y-3 max-w-xl text-center md:text-left z-10">
                {b.badge && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#F97316] text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{b.badge}</span>
                  </span>
                )}
                <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed">
                    {b.subtitle}
                  </p>
                )}
                {b.ctaText && b.link && (
                  <div className="pt-2">
                    <Link
                      to={b.link}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white text-[#0B132B] hover:bg-[#F97316] hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      <span>{b.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {b.image && (
                <div className="w-full md:w-1/3 max-w-[280px] aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg flex-shrink-0">
                  <img
                    src={b.image}
                    alt={b.imageAlt || b.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


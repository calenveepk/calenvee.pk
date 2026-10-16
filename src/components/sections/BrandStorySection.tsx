import React from 'react';

interface BrandStorySectionProps {
  settings: {
    badge?: string;
    title?: string;
    paragraphs?: string[];
    stats?: Array<{ value: string; label: string }>;
    image?: string;
    imageAlt?: string;
  };
}

export const BrandStorySection: React.FC<BrandStorySectionProps> = ({ settings }) => {
  const {
    badge = 'ABOUT CALENVEE',
    title = 'MODERN TIMEPIECES. TIMELESS LUXURY.',
    paragraphs = [
      'Calenvee was founded with a singular purpose: to deliver precision-crafted luxury timepieces, tarnish-resistant jewelry, and premium accessories across Pakistan without the inflated markup of overseas imports.',
      'Every piece is individually inspected for finish, movement accuracy, and enduring durability before being packed in our signature unboxing presentation box.'
    ],
    stats = [
      { value: '100%', label: 'Quality Inspected' },
      { value: '7-10 Days', label: 'Nationwide Delivery' },
      { value: '7 Days', label: 'Exchange Guarantee' },
    ],
    image,
    imageAlt = 'Calenvee Brand Story',
  } = settings;

  return (
    <section className="bg-white py-8 sm:py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            {badge && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-[#EA580C]">
                {badge}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B132B] tracking-tight">
              {title}
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
              {paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {stats.map((s, idx) => (
                  <div key={idx} className="text-center lg:text-left">
                    <div className="text-xl sm:text-2xl font-extrabold text-[#0B132B]">{s.value}</div>
                    <div className="text-[11px] sm:text-xs text-gray-500 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {image && (
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 aspect-4/3 lg:aspect-auto">
                <img
                  src={image}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};


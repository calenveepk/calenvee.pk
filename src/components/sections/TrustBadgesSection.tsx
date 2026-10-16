import React from 'react';
import { Truck, ShieldCheck, RotateCcw, MessageSquare, Award, Lock, Headphones, RefreshCw } from 'lucide-react';
import { TrustBadgesSettingsSchema } from '../../schema/sections';

const iconMap: Record<string, React.ReactNode> = {
  Truck: <Truck className="w-6 h-6 text-[#F97316]" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-[#F97316]" />,
  RotateCcw: <RotateCcw className="w-6 h-6 text-[#F97316]" />,
  MessageSquare: <MessageSquare className="w-6 h-6 text-[#F97316]" />,
  Award: <Award className="w-6 h-6 text-[#F97316]" />,
  Lock: <Lock className="w-6 h-6 text-[#F97316]" />,
  Headphones: <Headphones className="w-6 h-6 text-[#F97316]" />,
  RefreshCw: <RefreshCw className="w-6 h-6 text-[#F97316]" />,
};

interface TrustBadgesSectionProps {
  settings: {
    title?: string;
    subtitle?: string;
    badges?: Array<{
      id: string;
      title: string;
      subtitle: string;
      icon: string;
    }>;
  };
}

export const TrustBadgesSection: React.FC<TrustBadgesSectionProps> = ({ settings }) => {
  const {
    title = 'OUR SERVICE PROMISE',
    subtitle = 'Honest service, reliable delivery, and customer care you can depend on.',
    badges = [
      { id: 'b1', title: 'Cash on Delivery', subtitle: 'Pay at your doorstep anywhere in Pakistan (7-10 Working Days)', icon: 'Truck' },
      { id: 'b2', title: 'Quality Inspected', subtitle: 'Every parcel is individually hand-checked before packing', icon: 'ShieldCheck' },
      { id: 'b3', title: '7-Day Exchange', subtitle: 'Hassle-free replacement policy for size & style adjustments', icon: 'RotateCcw' },
      { id: 'b4', title: 'Direct WhatsApp Support', subtitle: 'Prompt assistance for order placement and inquiries', icon: 'MessageSquare' },
    ],
  } = settings;

  if (badges.length === 0) return null;

  return (
    <section className="bg-white py-6 sm:py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider relative inline-block">
              {title}
              <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {badges.map((b) => (
            <div
              key={b.id}
              className="p-3.5 sm:p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-orange-200 transition-colors flex flex-col items-center text-center space-y-2.5 sm:space-y-3"
            >
              <div className="p-2.5 sm:p-3.5 rounded-full bg-white shadow-xs">
                {iconMap[b.icon] || <Truck className="w-6 h-6 text-[#F97316]" />}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  {b.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed">
                  {b.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


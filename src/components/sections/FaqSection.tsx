import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqSectionProps {
  settings: {
    title?: string;
    subtitle?: string;
    items?: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };
}

export const FaqSection: React.FC<FaqSectionProps> = ({ settings }) => {
  const {
    title = 'FREQUENTLY ASKED QUESTIONS',
    subtitle = 'Quick answers regarding shipping, ordering, and exchange policies.',
    items = [],
  } = settings;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section className="bg-white py-8 sm:py-14 border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider relative inline-block">
            {title}
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto font-normal">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id || idx}
                className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


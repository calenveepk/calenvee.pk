import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const AboutBriefSection: React.FC = () => {
  return (
    <section className="bg-white py-12 sm:py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading with Centered Orange Underline */}
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider relative inline-block">
            ABOUT <span className="text-[#F97316]">CALENVEE</span>
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-normal leading-relaxed">
            Everyday modern essentials, built for real life across Pakistan.
          </p>
        </div>

        {/* Centered Content Block */}
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          
          {/* Story & Ethos Text */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              Premium Styling Made Accessible Direct-to-Consumer.
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Calenvee was founded with a straightforward mission: to deliver clean, contemporary styling to university students and young professionals across Pakistan without inflated luxury markups.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Operating strictly as a <strong>100% online store</strong>, we cut out physical retail overheads so you get dependable timepieces, versatile jewelry, and daily accessories that seamlessly fit your routine—from morning lectures to evening gatherings.
            </p>
          </div>

          {/* 3 Value Pillars Centered */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <CheckCircle2 className="w-5 h-5 text-[#F97316] mb-1.5" />
              <div className="text-xs font-bold text-gray-900">Direct-To-You</div>
              <div className="text-[11px] text-gray-500 mt-0.5">No retail middleman markups</div>
            </div>

            <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <CheckCircle2 className="w-5 h-5 text-[#F97316] mb-1.5" />
              <div className="text-xs font-bold text-gray-900">Hand Inspected</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Checked before packaging</div>
            </div>

            <div className="flex flex-col items-center text-center p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <CheckCircle2 className="w-5 h-5 text-[#F97316] mb-1.5" />
              <div className="text-xs font-bold text-gray-900">Doorstep COD</div>
              <div className="text-[11px] text-gray-500 mt-0.5">7-10 Days across Pakistan</div>
            </div>
          </div>

          {/* Centered CTA Button */}
          <div className="pt-2">
            <Link
              to="/about"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0B132B] hover:bg-[#1C2541] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors group shadow-sm active:scale-98"
            >
              <span>LEARN MORE ABOUT US</span>
              <ArrowRight className="w-4 h-4 text-[#F97316] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Centered Philosophy Quote Card */}
          <div className="max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-gray-50 to-orange-50/40 border border-orange-100 p-6 sm:p-7 space-y-4 shadow-xs text-center">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-gray-200 flex items-center justify-center mx-auto">
              <img
                src="/logo.png"
                alt="Calenvee.pk"
                className="h-5 w-auto object-contain"
              />
            </div>

            <blockquote className="text-xs sm:text-sm text-gray-800 font-medium italic leading-relaxed">
              "We believe great personal styling shouldn't require compromising your monthly budget. We curate pieces that make you feel polished, capable, and ready for whatever the day holds."
            </blockquote>

            <div className="pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs max-w-xs mx-auto">
              <div className="text-left">
                <div className="font-bold text-[#0B132B]">Calenvee Pakistan</div>
                <div className="text-[10px] text-gray-500">Official Online Store</div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#F97316] bg-white px-2.5 py-1 rounded-full border border-orange-200">
                EST. 2026
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

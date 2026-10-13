import React, { useState } from 'react';
import { Mail, ChevronRight, CheckCircle2 } from 'lucide-react';

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-[#0B132B] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 lg:p-10 shadow-lg">
          
          {/* Orange Accent Graphic Angle on Left (Matching Reference Screenshot) */}
          <div className="hidden lg:block absolute -left-10 top-0 bottom-0 w-32 bg-[#F97316] -skew-x-12 z-0" />

          {/* Left Text & Icon */}
          <div className="relative z-10 flex items-center space-x-5 text-white mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center flex-shrink-0 shadow-md">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg lg:text-xl font-extrabold uppercase tracking-wider">
                JOIN THE CALENVEE FAMILY
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-light max-w-md">
                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
              </p>
            </div>
          </div>

          {/* Right Input Bar & Button */}
          <div className="relative z-10 w-full md:w-auto">
            {isSubscribed ? (
              <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-5 py-3 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you for subscribing! Check your inbox for your 10% coupon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-80 px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-colors flex-shrink-0"
                >
                  <span>SUBSCRIBE</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};


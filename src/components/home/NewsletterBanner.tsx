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
    <section className="bg-white py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-[#0B132B] overflow-hidden flex flex-col items-center justify-center p-7 sm:p-10 lg:p-12 shadow-lg text-center space-y-5">
          
          {/* Centered Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center shadow-md">
            <Mail className="w-6 h-6 text-white" />
          </div>

          {/* Centered Headline & Subtitle */}
          <div className="space-y-1.5 max-w-xl mx-auto text-center text-white">
            <h3 className="text-base sm:text-lg lg:text-xl font-extrabold uppercase tracking-wider">
              JOIN THE CALENVEE FAMILY
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
          </div>

          {/* Centered Input Form */}
          <div className="relative z-10 w-full max-w-md mx-auto">
            {isSubscribed ? (
              <div className="flex items-center justify-center space-x-2 bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-5 py-3 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you for subscribing! Check your inbox for your 10% coupon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-72 px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center space-x-1.5 flex-shrink-0"
                >
                  <span>SUBSCRIBE</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

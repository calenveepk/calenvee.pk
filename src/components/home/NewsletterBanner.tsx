import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Security Honeypot check: If bot filled the hidden input, ignore
    if (honeypot) return;

    if (email.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 5000);
    }
  };

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner matching reference design: Deep Forest Green container */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0A2619] via-[#0D2E1E] to-[#0A2619] p-6 sm:p-8 lg:p-10 shadow-xl border border-emerald-900/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Left: Icon & Text matching reference design */}
            <div className="flex items-center space-x-4 sm:space-x-5 text-left w-full lg:w-auto">
              <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center flex-shrink-0 shadow-lg text-white">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Get Exclusive Offers &amp; Updates
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 font-normal">
                  Sign up now and get <strong className="text-[#F97316]">10% OFF</strong> on your first order!
                </p>
              </div>
            </div>

            {/* Right: Email Input & Subscribe Button */}
            <div className="w-full lg:w-auto flex-shrink-0">
              {isSubscribed ? (
                <div className="inline-flex items-center space-x-2 bg-emerald-900/80 border border-emerald-500 text-emerald-200 px-5 py-3 rounded-xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Welcome to Calenvee VIP! Your 10% coupon code is: <strong>CALENVEE10</strong></span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                  {/* Invisible Honeypot anti-spam field */}
                  <input
                    type="text"
                    name="website_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full sm:w-80 px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] shadow-inner"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-150 shadow-md active:scale-95 flex-shrink-0"
                  >
                    SUBSCRIBE
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

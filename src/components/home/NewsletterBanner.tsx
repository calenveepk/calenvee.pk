import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <section className="bg-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Banner matching reference mockup: Warm, clean container with envelope visual */}
        <div className="rounded-2xl bg-[#FAF7F2] p-6 sm:p-8 lg:p-10 border border-stone-200/80 shadow-2xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            
            {/* Left: Envelope Graphic + Text */}
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 max-w-xl">
              {/* Envelope Icon Badge */}
              <div className="w-14 h-14 rounded-2xl bg-[#081320] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Mail className="w-7 h-7 text-[#F97316]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#0B132B] tracking-tight">
                  Stay in the Loop
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-normal">
                  Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                </p>
              </div>
            </div>

            {/* Right: Email Input & Subscribe Button */}
            <div className="w-full lg:w-auto flex-1 max-w-md">
              {isSubscribed ? (
                <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-5 py-3 rounded-xl text-xs font-bold w-full justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>VIP Subscribed! Use code <strong>CALENVEE10</strong> for 10% off.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
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
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full sm:flex-1 px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-xl text-xs sm:text-sm font-medium border border-gray-200 focus:outline-none focus:border-[#081320] shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 bg-[#081320] hover:bg-[#F97316] text-white rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 flex-shrink-0"
                  >
                    Subscribe
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

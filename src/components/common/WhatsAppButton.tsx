import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PHYSICAL_STORE_LOCATION } from '../../utils/formatters';
import { RealWhatsAppIcon } from './RealisticIcons';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const defaultMessage = encodeURIComponent("Hello Calenvee.pk! I have an inquiry regarding products and order placement.");
  const whatsappUrl = `https://wa.me/${PHYSICAL_STORE_LOCATION.whatsappRaw}?text=${defaultMessage}`;

  return (
    <div
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end select-none pointer-events-auto"
    >
      {/* Quick Chat Popup Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden cursor-default transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#128C7E] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <RealWhatsAppIcon size={32} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#128C7E] rounded-full" />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-tight">Calenvee.pk Official</h4>
                <p className="text-[10px] text-emerald-100">Live WhatsApp Advisor</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 bg-gray-50 text-xs text-gray-700 space-y-2 border-b border-gray-100">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs border border-gray-200 max-w-[92%] leading-relaxed text-xs text-gray-800">
              Hello! 👋 Welcome to <strong className="text-[#F97316]">Calenvee.pk</strong>. Send us your inquiry, tracking query, or transaction slip for instant assistance.
            </div>
            <div className="text-[10px] text-gray-400 text-right">Online now</div>
          </div>

          <div className="p-3 bg-white">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
            >
              <RealWhatsAppIcon size={18} />
              <span>Start Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Glowing WhatsApp Toggle Button (No twinkling dot) */}
      <div className="relative group">
        {/* Soft Ambient Emerald Glow / Halo in the background */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#25D366] via-[#10B981] to-[#25D366] opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-300 animate-pulse pointer-events-none" />

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#2BE875] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none border-2 border-white/40 drop-shadow-xl"
          aria-label="WhatsApp Support"
        >
          <RealWhatsAppIcon size={34} className="filter drop-shadow-md sm:scale-110" />
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, GripHorizontal } from 'lucide-react';
import { PHYSICAL_STORE_LOCATION } from '../../utils/formatters';
import { RealWhatsAppIcon } from './RealisticIcons';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const defaultMessage = encodeURIComponent("Hello Calenvee.pk! I have an inquiry regarding products and order placement.");
  const whatsappUrl = `https://wa.me/${PHYSICAL_STORE_LOCATION.whatsappRaw}?text=${defaultMessage}`;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end cursor-grab active:cursor-grabbing select-none"
      title="Drag to move anywhere"
    >
      {/* Quick Chat Popup Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden cursor-default">
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
              className="text-white/80 hover:text-white p-1"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 bg-gray-50 text-xs text-gray-700 space-y-2 border-b border-gray-100">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs border border-gray-200 max-w-[90%] leading-relaxed text-xs text-gray-800">
              Hello! 👋 Welcome to <strong className="text-[#F97316]">Calenvee.pk</strong>. Send us your inquiry or payment slip for instant assistance.
            </div>
            <div className="text-[10px] text-gray-400 text-right">Online now</div>
          </div>

          <div className="p-3 bg-white">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
            >
              <RealWhatsAppIcon size={18} />
              <span>Start Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Moveable Drag Button with Real WhatsApp Icon */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center justify-center p-0 rounded-full bg-transparent hover:scale-110 active:scale-95 transition-transform duration-200 focus:outline-none drop-shadow-2xl"
          aria-label="Moveable WhatsApp Support Toggle"
        >
          {/* Online status beacon */}
          <span className="absolute 1 -top-0.5 -right-0.5 flex h-3.5 w-3.5 z-20 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
          </span>

          {/* Real WhatsApp Icon as the entire toggle */}
          <RealWhatsAppIcon size={56} className="drop-shadow-xl" />

          {/* Move handle hint tooltip */}
          <span className="hidden md:group-hover:flex absolute -top-8 bg-gray-900/90 backdrop-blur-xs text-white text-[10px] font-medium py-1 px-2.5 rounded-full whitespace-nowrap shadow-md items-center gap-1 border border-gray-700">
            <GripHorizontal className="w-3 h-3 text-[#F97316]" />
            <span>Drag anywhere</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
};

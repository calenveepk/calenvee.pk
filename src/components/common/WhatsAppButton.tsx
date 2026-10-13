import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { PHYSICAL_STORE_LOCATION } from '../../utils/formatters';
import { RealWhatsAppIcon } from './RealisticIcons';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
    hasMoved: boolean;
  } | null>(null);

  const defaultMessage = encodeURIComponent("Hello Calenvee.pk! I have an inquiry regarding products and order placement.");
  const whatsappUrl = `https://wa.me/${PHYSICAL_STORE_LOCATION.whatsappRaw}?text=${defaultMessage}`;

  const handleStart = (clientX: number, clientY: number) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      elemX: rect.left,
      elemY: rect.top,
      hasMoved: false,
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragStartRef.current) return;
    const deltaX = clientX - dragStartRef.current.startX;
    const deltaY = clientY - dragStartRef.current.startY;

    // Register drag once movement exceeds 5px threshold
    if (!dragStartRef.current.hasMoved) {
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragStartRef.current.hasMoved = true;
        setIsDragging(true);
      } else {
        return;
      }
    }

    const buttonWidth = buttonRef.current?.offsetWidth || 64;
    const buttonHeight = buttonRef.current?.offsetHeight || 64;
    const maxX = window.innerWidth - buttonWidth - 12;
    const maxY = window.innerHeight - buttonHeight - 12;

    const newX = Math.min(Math.max(12, dragStartRef.current.elemX + deltaX), Math.max(12, maxX));
    const newY = Math.min(Math.max(12, dragStartRef.current.elemY + deltaY), Math.max(12, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    if (dragStartRef.current) {
      if (dragStartRef.current.hasMoved) {
        hasDraggedRef.current = true;
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 150);
      }
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragStartRef.current) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const onMouseUp = () => {
      if (dragStartRef.current) {
        handleEnd();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (dragStartRef.current && e.touches.length > 0) {
        if (dragStartRef.current.hasMoved && e.cancelable) {
          e.preventDefault();
        }
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      if (dragStartRef.current) {
        handleEnd();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const buttonWidth = 64;
        const buttonHeight = 64;
        const maxX = window.innerWidth - buttonWidth - 12;
        const maxY = window.innerHeight - buttonHeight - 12;
        return {
          x: Math.min(Math.max(12, prev.x), Math.max(12, maxX)),
          y: Math.min(Math.max(12, prev.y), Math.max(12, maxY)),
        };
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasDraggedRef.current) return;
    setIsOpen((prev) => !prev);
  };

  const isNearTop = position ? position.y < 380 : false;
  const isNearLeft = position ? position.x < window.innerWidth / 2 : false;

  const getContainerStyle = (): React.CSSProperties | undefined => {
    if (!position) return undefined;
    const buttonWidth = 64;
    const buttonHeight = 64;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 50,
    };

    if (isNearLeft) {
      style.left = `${position.x}px`;
      style.right = 'auto';
    } else {
      style.right = `${Math.max(12, window.innerWidth - (position.x + buttonWidth))}px`;
      style.left = 'auto';
    }

    if (isNearTop) {
      style.top = `${position.y}px`;
      style.bottom = 'auto';
    } else {
      style.bottom = `${Math.max(12, window.innerHeight - (position.y + buttonHeight))}px`;
      style.top = 'auto';
    }

    return style;
  };

  return (
    <div
      style={getContainerStyle()}
      className={`${
        position
          ? `fixed z-50 flex flex-col ${isNearLeft ? 'items-start' : 'items-end'}`
          : 'fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end'
      } select-none pointer-events-auto`}
    >
      {/* Quick Chat Popup Card */}
      {isOpen && (
        <div
          className={`${
            isNearTop ? 'order-2 mt-3' : 'order-1 mb-3'
          } w-72 sm:w-80 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden cursor-default transition-all animate-in fade-in zoom-in-95 duration-200`}
        >
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

      {/* Main Moveable WhatsApp Toggle Button (No glowing circle) */}
      <div className={`relative ${isNearTop ? 'order-1' : 'order-2'}`}>
        <button
          ref={buttonRef}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onClick={handleToggle}
          className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#2BE875] text-white shadow-xl focus:outline-none border-2 border-white/40 drop-shadow-lg touch-none transition-transform duration-150 ${
            isDragging
              ? 'cursor-grabbing scale-110 shadow-2xl'
              : 'cursor-grab hover:scale-105 active:scale-95'
          }`}
          aria-label="WhatsApp Support"
          title="Drag to reposition anywhere, tap to chat"
        >
          <RealWhatsAppIcon size={34} className="filter drop-shadow-md sm:scale-110 pointer-events-none" />
        </button>
      </div>
    </div>
  );
};

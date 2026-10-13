import React from 'react';

/**
 * Realistic, high-fidelity SVGs for WhatsApp, social platforms, payment channels,
 * and 3D luxury features across Calenvee.pk
 */

// 1. Official WhatsApp Icon with authentic green gradient, 3D gloss, and telephone handset
export const RealWhatsAppIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <defs>
      <linearGradient id="wa-grad" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#29B356" />
        <stop offset="1" stopColor="#1E9646" />
      </linearGradient>
      <filter id="wa-shadow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Outer circle */}
    <circle cx="24" cy="24" r="22" fill="url(#wa-grad)" filter="url(#wa-shadow)" />
    {/* Inner white telephone speech bubble */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 8C15.163 8 8 15.163 8 24C8 27.02 8.847 29.851 10.324 32.263L8.85 38.35L15.143 36.903C17.478 38.286 20.638 39.09 24 39.09C32.837 39.09 40 31.927 40 23.09C40 14.253 32.837 8 24 8ZM24 36.5C21.14 36.5 18.49 35.75 16.23 34.45L15.69 34.14L11.51 35.1L12.51 31.02L12.16 30.46C10.74 28.19 10 25.5 10 22.71C10 15.69 16.28 10 24 10C31.72 10 38 15.69 38 22.71C38 29.73 31.72 36.5 24 36.5ZM31.62 26.69C31.2 26.48 29.13 25.46 28.75 25.32C28.37 25.18 28.09 25.11 27.81 25.53C27.53 25.95 26.74 26.88 26.49 27.16C26.24 27.44 26 27.47 25.58 27.26C25.16 27.05 23.82 26.61 22.23 25.19C20.99 24.08 20.15 22.71 19.91 22.29C19.67 21.87 19.88 21.64 20.09 21.43C20.28 21.24 20.51 20.94 20.72 20.7C20.93 20.46 21 20.28 21.14 20C21.28 19.72 21.21 19.47 21.11 19.26C21.01 19.05 20.17 17.02 19.82 16.18C19.48 15.36 19.13 15.47 18.87 15.46C18.63 15.45 18.35 15.45 18.07 15.45C17.79 15.45 17.33 15.56 16.95 15.97C16.57 16.38 15.5 17.38 15.5 19.43C15.5 21.48 17 23.46 17.21 23.74C17.42 24.02 20.14 28.18 24.31 29.98C25.3 30.41 26.08 30.67 26.68 30.86C27.68 31.18 28.58 31.13 29.3 31.02C30.1 30.9 31.76 30.01 32.1 29.04C32.45 28.07 32.45 27.23 32.35 27.05C32.25 26.88 32.04 26.9 31.62 26.69Z"
      fill="white"
    />
  </svg>
);

// 2. Official Instagram Icon with authentic 4-color radial gradient
export const RealInstagramIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <defs>
      <radialGradient id="ig-grad" cx="20%" cy="105%" r="130%" fx="20%" fy="105%">
        <stop offset="0%" stopColor="#FED373" />
        <stop offset="15%" stopColor="#F15245" />
        <stop offset="50%" stopColor="#D92E7F" />
        <stop offset="85%" stopColor="#9B36B7" />
        <stop offset="100%" stopColor="#515ECF" />
      </radialGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#ig-grad)" />
    <rect x="11" y="11" width="26" height="26" rx="7" stroke="white" strokeWidth="2.8" />
    <circle cx="24" cy="24" r="6.5" stroke="white" strokeWidth="2.8" />
    <circle cx="31.5" cy="16.5" r="1.8" fill="white" />
  </svg>
);

// 3. Official Facebook Icon with authentic #1877F2 blue and bold 'f'
export const RealFacebookIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <circle cx="24" cy="24" r="22" fill="#1877F2" />
    <path
      d="M27.5 25H31L31.6 20.5H27.5V18C27.5 16.8 28 15.7 29.8 15.7H31.8V11.8C31.8 11.8 30 11.5 28.3 11.5C24.8 11.5 22.5 13.6 22.5 17.5V20.5H18.5V25H22.5V36H27.5V25Z"
      fill="white"
    />
  </svg>
);

// 4. Authentic JazzCash Payment Badge
export const RealJazzCashIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <rect width="56" height="40" rx="8" fill="#D31A2B" />
    <circle cx="20" cy="20" r="12" fill="#FFC72C" />
    <path
      d="M20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20C12 15.5817 15.5817 12 20 12Z"
      fill="#E30613"
    />
    <text x="32" y="24" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
      JAZZ
    </text>
    <text x="32" y="32" fill="#FFC72C" fontSize="7.5" fontWeight="800" fontFamily="sans-serif">
      CASH
    </text>
  </svg>
);

// 5. Authentic EasyPaisa Payment Badge
export const RealEasyPaisaIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <rect width="56" height="40" rx="8" fill="#00A859" />
    <circle cx="18" cy="20" r="10" fill="white" />
    <path
      d="M15 20C15 17.5 17 15.5 19.5 15.5H21V18H19.5C18.4 18 17.5 18.9 17.5 20C17.5 21.1 18.4 22 19.5 22H21V24.5H19.5C17 24.5 15 22.5 15 20Z"
      fill="#00A859"
    />
    <text x="30" y="22" fill="white" fontSize="8" fontWeight="800" fontFamily="sans-serif">
      easy
    </text>
    <text x="30" y="30" fill="#D4FF66" fontSize="8" fontWeight="900" fontFamily="sans-serif">
      paisa
    </text>
  </svg>
);

// 6. Realistic 3D Express Courier Delivery Truck (TCS / Trax Style)
export const RealisticTruckIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow ${className}`}
  >
    <defs>
      <linearGradient id="truck-body" x1="4" y1="12" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F3E5AB" />
        <stop offset="1" stopColor="#B98A3C" />
      </linearGradient>
      <linearGradient id="truck-cab" x1="32" y1="18" x2="44" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D4AF37" />
        <stop offset="1" stopColor="#8C6527" />
      </linearGradient>
    </defs>
    {/* Cargo box with gold gradient */}
    <rect x="4" y="12" width="28" height="20" rx="3" fill="url(#truck-body)" stroke="#6C4E1E" strokeWidth="1" />
    <path d="M7 16H29M7 21H29M7 26H29" stroke="#8C6527" strokeWidth="1" strokeOpacity="0.4" />
    {/* Cab */}
    <path d="M32 18H38L44 25V32H32V18Z" fill="url(#truck-cab)" stroke="#6C4E1E" strokeWidth="1" />
    {/* Windshield */}
    <path d="M34 20H37.5L41.5 25H34V20Z" fill="#E0F2FE" />
    {/* Headlight */}
    <rect x="42" y="28" width="2" height="3" rx="1" fill="#FEF08A" />
    {/* Wheels with 3D chrome rim */}
    <circle cx="14" cy="33" r="5" fill="#1C1917" />
    <circle cx="14" cy="33" r="2.5" fill="#E5E7EB" />
    <circle cx="36" cy="33" r="5" fill="#1C1917" />
    <circle cx="36" cy="33" r="2.5" fill="#E5E7EB" />
  </svg>
);

// 7. Realistic 3D Marine Grade Surgical Shield (Gold & Emerald)
export const RealisticShieldIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow ${className}`}
  >
    <defs>
      <linearGradient id="shield-rim" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#D4AF37" />
        <stop offset="1" stopColor="#785517" />
      </linearGradient>
      <linearGradient id="shield-center" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#065F46" />
        <stop offset="1" stopColor="#022C22" />
      </linearGradient>
    </defs>
    <path
      d="M24 4L39 9.5V22C39 31.8 32.5 40.5 24 44C15.5 40.5 9 31.8 9 22V9.5L24 4Z"
      fill="url(#shield-rim)"
    />
    <path
      d="M24 7.5L36 12V22C36 30 30.8 37.3 24 40.3C17.2 37.3 12 30 12 22V12L24 7.5Z"
      fill="url(#shield-center)"
    />
    {/* Checkmark inside */}
    <path
      d="M19 22.5L22.5 26L29 18.5"
      stroke="#FDE68A"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 8. Realistic 3D Golden Star with Specular Highlight
export const RealisticStarIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 18,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 drop-shadow-sm ${className}`}
  >
    <defs>
      <linearGradient id="star-gold" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF2A3" />
        <stop offset="0.35" stopColor="#FFC72C" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <polygon
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      fill="url(#star-gold)"
      stroke="#B45309"
      strokeWidth="0.75"
    />
    {/* Sparkle glint on top point */}
    <circle cx="12" cy="4" r="1" fill="white" opacity="0.8" />
  </svg>
);

// 9. Realistic Category Icons
export const RealisticWatchIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="gold-bezel" x1="16" y1="6" x2="16" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#92400E" />
      </linearGradient>
    </defs>
    {/* Straps */}
    <rect x="11" y="2" width="10" height="6" rx="2" fill="#292524" />
    <rect x="11" y="24" width="10" height="6" rx="2" fill="#292524" />
    {/* Bezel */}
    <circle cx="16" cy="16" r="10" fill="url(#gold-bezel)" />
    <circle cx="16" cy="16" r="7.5" fill="#0C0A09" />
    {/* Hands */}
    <line x1="16" y1="16" x2="16" y2="11" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="16" x2="20" y2="16" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="16" r="1" fill="#FDE68A" />
  </svg>
);

export const RealisticJewelryIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="diamond-grad" x1="16" y1="6" x2="16" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BAE6FD" />
        <stop offset="0.5" stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <polygon points="10,8 22,8 27,15 16,26 5,15" fill="url(#diamond-grad)" stroke="#E0F2FE" strokeWidth="1" />
    <polygon points="10,8 16,15 22,8" fill="#E0F2FE" opacity="0.6" />
    <polygon points="16,15 27,15 16,26" fill="#0369A1" opacity="0.4" />
    <polygon points="5,15 16,15 16,26" fill="#0284C7" opacity="0.6" />
    <circle cx="10" cy="10" r="1" fill="white" />
  </svg>
);

export const RealisticEyewearIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="lens-grad" x1="16" y1="10" x2="16" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="0.6" stopColor="#DC2626" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* Frame */}
    <rect x="4" y="11" width="10" height="9" rx="3" fill="url(#lens-grad)" stroke="#D4AF37" strokeWidth="1.5" />
    <rect x="18" y="11" width="10" height="9" rx="3" fill="url(#lens-grad)" stroke="#D4AF37" strokeWidth="1.5" />
    <path d="M14 14H18" stroke="#D4AF37" strokeWidth="2" />
    <path d="M4 13L2 14M28 13L30 14" stroke="#D4AF37" strokeWidth="1.5" />
    <line x1="6" y1="13" x2="10" y2="15" stroke="white" strokeWidth="1" opacity="0.7" />
  </svg>
);

export const RealisticFragranceIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="perfume-amber" x1="16" y1="11" x2="16" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCD34D" />
        <stop offset="0.7" stopColor="#D97706" />
        <stop offset="1" stopColor="#78350F" />
      </linearGradient>
    </defs>
    {/* Spray nozzle */}
    <rect x="13.5" y="4" width="5" height="4" rx="1" fill="#D4AF37" stroke="#78350F" strokeWidth="0.5" />
    <rect x="14.5" y="8" width="3" height="3" fill="#B45309" />
    {/* Bottle */}
    <rect x="8" y="11" width="16" height="17" rx="3" fill="url(#perfume-amber)" stroke="#FDE68A" strokeWidth="1" />
    {/* Glass shine */}
    <rect x="10" y="13" width="2" height="13" rx="1" fill="white" opacity="0.5" />
    <rect x="11.5" y="17" width="9" height="5" rx="1" fill="#1C1917" stroke="#D4AF37" strokeWidth="0.5" />
  </svg>
);

export const RealisticBagIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="leather-dark" x1="16" y1="10" x2="16" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#44403C" />
        <stop offset="1" stopColor="#1C1917" />
      </linearGradient>
    </defs>
    {/* Handle */}
    <path d="M11 12V8C11 5.5 13 4 16 4C19 4 21 5.5 21 8V12" stroke="#D4AF37" strokeWidth="2" fill="none" />
    {/* Main body */}
    <rect x="5" y="11" width="22" height="17" rx="3" fill="url(#leather-dark)" stroke="#78716C" strokeWidth="1" />
    {/* Hardware buckle */}
    <rect x="14" y="15" width="4" height="4" rx="1" fill="#D4AF37" />
  </svg>
);

export const RealisticEverydayTechIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <defs>
      <linearGradient id="titanium-gray" x1="16" y1="5" x2="16" y2="27" gradientUnits="userSpaceOnUse">
        <stop stopColor="#94A3B8" />
        <stop offset="1" stopColor="#334155" />
      </linearGradient>
    </defs>
    <rect x="9" y="4" width="14" height="24" rx="3.5" fill="url(#titanium-gray)" stroke="#CBD5E1" strokeWidth="1" />
    <rect x="11" y="6" width="10" height="20" rx="2" fill="#090D16" />
    <circle cx="16" cy="24" r="1" fill="#64748B" />
    <rect x="13.5" y="7" width="5" height="1" rx="0.5" fill="#334155" />
  </svg>
);


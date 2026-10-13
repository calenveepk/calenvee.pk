import React from 'react';
import { formatPKR } from '../../utils/formatters';

interface CurrencyProps {
  amount: number;
  originalAmount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSavingsBadge?: boolean;
}

export const Currency: React.FC<CurrencyProps> = ({
  amount,
  originalAmount,
  size = 'md',
  showSavingsBadge = false,
}) => {
  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl md:text-3xl font-extrabold',
  };

  const originalClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  const discountPercent = originalAmount && originalAmount > amount
    ? Math.round(((originalAmount - amount) / originalAmount) * 100)
    : 0;

  return (
    <div className="flex items-baseline flex-wrap gap-2">
      <span className={`${sizeClasses[size]} text-[#dfb76c] font-display tracking-tight`}>
        {formatPKR(amount)}
      </span>

      {originalAmount && originalAmount > amount && (
        <span className={`${originalClasses[size]} text-gray-500 line-through font-medium`}>
          {formatPKR(originalAmount)}
        </span>
      )}

      {showSavingsBadge && discountPercent > 0 && (
        <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Save {discountPercent}%
        </span>
      )}
    </div>
  );
};


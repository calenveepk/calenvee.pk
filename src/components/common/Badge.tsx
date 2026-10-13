import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'gold' | 'purple' | 'cyan' | 'emerald' | 'crimson';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'gold',
  size = 'sm',
}) => {
  const variantStyles = {
    gold: 'bg-[#dfb76c]/15 text-[#dfb76c] border-[#dfb76c]/40',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    crimson: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase font-bold',
    md: 'text-xs px-2.5 py-1 tracking-wide font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {text}
    </span>
  );
};


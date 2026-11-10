import React from 'react';

export interface BrandLogoProps {
  size?: 'sm' | 'md';
  className?: string;
}

const sizeStyles = {
  sm: { box: 'h-9 w-9 rounded-lg', letter: 'text-base' },
  md: { box: 'h-12 w-12 rounded-xl', letter: 'text-xl' },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '' }) => {
  const styles = sizeStyles[size];

  return (
    <div
      aria-hidden="true"
      className={`inline-flex ${styles.box} items-center justify-center border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm ${className}`}
    >
      <span className={`${styles.letter} font-black leading-none tracking-tight`}>K</span>
    </div>
  );
};

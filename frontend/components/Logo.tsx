'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Fallback avec icône si le logo n'est pas encore disponible
  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 ${className}`}>
        <Sparkles className={`${iconSizes[size]} text-white`} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center ${className}`}>
      <img
        src="/logo.png"
        alt="TruthLens Logo"
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}


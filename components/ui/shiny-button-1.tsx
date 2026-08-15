'use client';

import React, { useId } from 'react';
import Link from 'next/link';

interface GlowButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

const GlowButton: React.FC<GlowButtonProps> = ({
  children = 'Register',
  onClick,
  href,
  type = 'button',
  className = '',
  disabled = false,
}) => {
  const id = useId().replace(/:/g, '');
  const filters = {
    unopaq: `unopaq-${id}`,
    unopaq2: `unopaq2-${id}`,
    unopaq3: `unopaq3-${id}`,
  };

  const buttonContent = (
    <div className={`relative inline-block group cursor-pointer ${className}`}>
      {/* SVG Filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq}>
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 9 0" />
        </filter>
        <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq2}>
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 3 0" />
        </filter>
        <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq3}>
          <feColorMatrix values="1 0 0 0.2 0 0 1 0 0.2 0 0 0 1 0.2 0 0 0 0 2 0" />
        </filter>
      </svg>

      {/* Button Container */}
      <div className="relative">
        {/* Outer Glow Layer */}
        <div 
          className="absolute inset-0 -z-20 opacity-60 overflow-hidden transition-opacity duration-300 group-hover:opacity-90 group-active:opacity-100 rounded-[14px]"
          style={{ filter: `blur(1.5em) url(#${filters.unopaq})` }}
        >
          <div 
            className="absolute inset-[-150%] animate-[speen_8s_cubic-bezier(0.56,0.15,0.28,0.86)_infinite,woah_4s_infinite]"
            style={{ 
              background: 'linear-gradient(90deg, #f50 30%, #0000 50%, #05f 70%)',
            }}
          />
        </div>

        {/* Middle Glow Layer */}
        <div 
          className="absolute inset-[-0.125em] -z-20 opacity-60 overflow-hidden transition-opacity duration-300 group-hover:opacity-90 group-active:opacity-100"
          style={{ 
            filter: `blur(0.25em) url(#${filters.unopaq2})`,
            borderRadius: '0.875em'
          }}
        >
          <div 
            className="absolute inset-[-150%] animate-[speen_8s_cubic-bezier(0.56,0.15,0.28,0.86)_infinite,woah_4s_infinite]"
            style={{ 
              background: 'linear-gradient(90deg, #f95 20%, #0000 45% 55%, #59f 80%)',
            }}
          />
        </div>

        {/* Button Border */}
        <div className="p-[1.5px] bg-[#0008] rounded-[0.875em] transition-transform duration-200 group-hover:scale-[1.02]">
          <div className="relative rounded-[0.75em] overflow-hidden">
            {/* Inner Glow Layer */}
            <div 
              className="absolute inset-[-2px] -z-10 opacity-60 overflow-hidden transition-opacity duration-300 group-hover:opacity-90 group-active:opacity-100"
              style={{ 
                filter: `blur(2px) url(#${filters.unopaq3})`,
                borderRadius: 'inherit'
              }}
            >
              <div 
                className="absolute inset-[-150%] animate-[speen_8s_cubic-bezier(0.56,0.15,0.28,0.86)_infinite,woah_4s_infinite]"
                style={{ 
                  background: 'linear-gradient(90deg, #fc9 30%, #0000 45% 55%, #9cf 70%)',
                }}
              />
            </div>
            
            {/* Button Surface */}
            <div 
              className="flex items-center justify-center min-h-[44px] px-6 py-2.5 bg-[#14151a] text-white text-sm font-normal tracking-wide whitespace-nowrap"
              style={{ 
                borderRadius: '0.75em'
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes speen {
          0% { transform: rotate(10deg); }
          50% { transform: rotate(190deg); }
          100% { transform: rotate(370deg); }
        }
        @keyframes woah {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.85); }
        }
      `}</style>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block no-underline">
        {buttonContent}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className="cursor-pointer border-none bg-transparent p-0 text-left appearance-none">
      {buttonContent}
    </button>
  );
};

export { GlowButton };

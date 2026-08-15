'use client';

import React, { useRef, useState } from 'react';
import { X, ArrowDownCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import clsx from 'clsx';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderGlowColor?: string;
  status?: 'uploading' | 'success' | 'error' | 'info' | 'active' | 'warning' | 'default';
  progress?: number;
  title?: string;
  description?: string;
  showClose?: boolean;
  onClose?: () => void;
  showIcon?: boolean;
  statusIcon?: React.ReactNode;
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(217, 119, 6, 0.08)',
  borderGlowColor = 'rgba(245, 158, 11, 0.25)',
  status = 'default',
  progress,
  title,
  description,
  showClose = true, 
  onClose,
  showIcon = true, 
  statusIcon,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  // Map status to prompt color states
  const cardColorClass = clsx({
    'blue': status === 'uploading' || status === 'info',
    'green': status === 'success' || status === 'active',
    'red': status === 'error' || status === 'warning',
  });

  const renderIcon = () => {
    if (!showIcon) return null;
    if (statusIcon) return statusIcon;
    switch (status) {
      case 'uploading':
        return <ArrowDownCircle className="icon" />;
      case 'info':
        return <Info className="icon" />;
      case 'success':
      case 'active':
        return <CheckCircle className="icon" />;
      case 'error':
      case 'warning':
        return <XCircle className="icon" />;
      default:
        return <Info className="icon" />;
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        'card',
        cardColorClass,
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Background Overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />

      {/* Dynamic Border Glow Tracking Effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          opacity,
          background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, ${borderGlowColor}, transparent 40%)`,
          maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      {/* Card Header with X close button exactly as prompt design */}
      {showClose && (
        <div className="card-header">
          <X className="close" onClick={onClose} />
        </div>
      )}

      {/* Content Layout - Adapts depending on showIcon setting */}
      <div className="card-body">
        {renderIcon()}
        <div className="flex-1 min-w-0">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
          
          {children}

          {status === 'uploading' && typeof progress === 'number' && (
            <div className="progress">
              <div>
                <span>{progress}%</span>
                <div className="progress-bar" style={{ '--progress-width': `${progress}%` } as React.CSSProperties}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


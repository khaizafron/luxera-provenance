'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

type ColorKey =
  | 'color1'
  | 'color2'
  | 'color3'
  | 'color4'
  | 'color5'
  | 'color6'
  | 'color7'
  | 'color8'
  | 'color9'
  | 'color10'
  | 'color11'
  | 'color12'
  | 'color13'
  | 'color14'
  | 'color15'
  | 'color16'
  | 'color17';

export type Colors = Record<ColorKey, string>;

const svgOrder = [
  'svg1',
  'svg2',
  'svg3',
  'svg4',
  'svg3',
  'svg2',
  'svg1',
] as const;

type SvgKey = (typeof svgOrder)[number];

type Stop = {
  offset: number;
  stopColor: string;
};

type SvgState = {
  gradientTransform: string;
  stops: Stop[];
};

type SvgStates = Record<SvgKey, SvgState>;

const createStopsArray = (
  svgStates: SvgStates,
  svgOrder: readonly SvgKey[],
  maxStops: number
): Stop[][] => {
  let stopsArray: Stop[][] = [];
  for (let i = 0; i < maxStops; i++) {
    let stopConfigurations = svgOrder.map((svgKey) => {
      let svg = svgStates[svgKey];
      return svg.stops[i] || svg.stops[svg.stops.length - 1];
    });
    stopsArray.push(stopConfigurations);
  }
  return stopsArray;
};

type GradientSvgProps = {
  className: string;
  isHovered: boolean;
  colors: Colors;
};

const GradientSvg: React.FC<GradientSvgProps> = ({
  className,
  isHovered,
  colors,
}) => {
  const svgStates: SvgStates = {
    svg1: {
      gradientTransform:
        'translate(287.5 280) rotate(-29.0546) scale(689.807 1000)',
      stops: [
        { offset: 0, stopColor: colors.color1 },
        { offset: 0.188423, stopColor: colors.color2 },
        { offset: 0.260417, stopColor: colors.color3 },
        { offset: 0.328792, stopColor: colors.color4 },
        { offset: 0.328892, stopColor: colors.color5 },
        { offset: 0.328992, stopColor: colors.color1 },
        { offset: 0.442708, stopColor: colors.color6 },
        { offset: 0.537556, stopColor: colors.color7 },
        { offset: 0.631738, stopColor: colors.color1 },
        { offset: 0.725645, stopColor: colors.color8 },
        { offset: 0.817779, stopColor: colors.color9 },
        { offset: 0.84375, stopColor: colors.color10 },
        { offset: 0.90569, stopColor: colors.color1 },
        { offset: 1, stopColor: colors.color11 },
      ],
    },
    svg2: {
      gradientTransform:
        'translate(126.5 418.5) rotate(-64.756) scale(533.444 773.324)',
      stops: [
        { offset: 0, stopColor: colors.color1 },
        { offset: 0.104167, stopColor: colors.color12 },
        { offset: 0.182292, stopColor: colors.color13 },
        { offset: 0.28125, stopColor: colors.color1 },
        { offset: 0.328792, stopColor: colors.color4 },
        { offset: 0.328892, stopColor: colors.color5 },
        { offset: 0.453125, stopColor: colors.color6 },
        { offset: 0.515625, stopColor: colors.color7 },
        { offset: 0.631738, stopColor: colors.color1 },
        { offset: 0.692708, stopColor: colors.color8 },
        { offset: 0.75, stopColor: colors.color14 },
        { offset: 0.817708, stopColor: colors.color9 },
        { offset: 0.869792, stopColor: colors.color10 },
        { offset: 1, stopColor: colors.color1 },
      ],
    },
    svg3: {
      gradientTransform:
        'translate(264.5 339.5) rotate(-42.3022) scale(946.451 1372.05)',
      stops: [
        { offset: 0, stopColor: colors.color1 },
        { offset: 0.188423, stopColor: colors.color2 },
        { offset: 0.307292, stopColor: colors.color1 },
        { offset: 0.328792, stopColor: colors.color4 },
        { offset: 0.328892, stopColor: colors.color5 },
        { offset: 0.442708, stopColor: colors.color15 },
        { offset: 0.537556, stopColor: colors.color16 },
        { offset: 0.631738, stopColor: colors.color1 },
        { offset: 0.725645, stopColor: colors.color17 },
        { offset: 0.817779, stopColor: colors.color9 },
        { offset: 0.84375, stopColor: colors.color10 },
        { offset: 0.90569, stopColor: colors.color1 },
        { offset: 1, stopColor: colors.color11 },
      ],
    },
    svg4: {
      gradientTransform:
        'translate(860.5 420) rotate(-153.984) scale(957.528 1388.11)',
      stops: [
        { offset: 0.109375, stopColor: colors.color11 },
        { offset: 0.171875, stopColor: colors.color2 },
        { offset: 0.260417, stopColor: colors.color13 },
        { offset: 0.328792, stopColor: colors.color4 },
        { offset: 0.328892, stopColor: colors.color5 },
        { offset: 0.328992, stopColor: colors.color1 },
        { offset: 0.442708, stopColor: colors.color6 },
        { offset: 0.515625, stopColor: colors.color7 },
        { offset: 0.631738, stopColor: colors.color1 },
        { offset: 0.692708, stopColor: colors.color8 },
        { offset: 0.817708, stopColor: colors.color9 },
        { offset: 0.869792, stopColor: colors.color10 },
        { offset: 1, stopColor: colors.color11 },
      ],
    },
  };

  const maxStops = Math.max(
    ...Object.values(svgStates).map((svg) => svg.stops.length)
  );
  const stopsAnimationArray = createStopsArray(svgStates, svgOrder, maxStops);
  const gradientTransform = svgOrder.map(
    (svgKey) => svgStates[svgKey].gradientTransform
  );

  const variants = {
    hovered: {
      gradientTransform: gradientTransform,
      transition: { duration: 50, repeat: Infinity, ease: 'linear' as const },
    },
    notHovered: {
      gradientTransform: gradientTransform,
      transition: { duration: 10, repeat: Infinity, ease: 'linear' as const },
    },
  };

  return (
    <svg
      className={className}
      width='1030'
      height='280'
      viewBox='0 0 1030 280'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect
        width='1030'
        height='280'
        rx='140'
        fill='url(#paint0_radial_905_231)'
      />
      <defs>
        <motion.radialGradient
          id='paint0_radial_905_231'
          cx='0'
          cy='0'
          r='1'
          gradientUnits='userSpaceOnUse'
          animate={(isHovered ? variants.hovered : variants.notHovered) as any}
        >
          {stopsAnimationArray.map((stopConfigs, index) => (
            <AnimatePresence key={index}>
              <motion.stop
                initial={{
                  offset: stopConfigs[0].offset,
                  stopColor: stopConfigs[0].stopColor,
                }}
                animate={{
                  offset: stopConfigs.map((config) => config.offset),
                  stopColor: stopConfigs.map((config) => config.stopColor),
                }}
                transition={{
                  duration: 0,
                  ease: 'linear' as const,
                  repeat: Infinity,
                }}
              />
            </AnimatePresence>
          ))}
        </motion.radialGradient>
      </defs>
    </svg>
  );
};

type LiquidProps = {
  isHovered: boolean;
  colors: Colors;
};

export const Liquid: React.FC<LiquidProps> = ({ isHovered, colors }) => {
  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className={`absolute ${
            index < 3 ? 'w-[443px] h-[121px]' : 'w-[756px] h-[207px]'
          } ${
            index === 0
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference'
              : index === 1
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[164.971deg] mix-blend-difference'
                : index === 2
                  ? 'top-1/2 left-1/2 -translate-x-[53%] -translate-y-[53%] rotate-[-11.61deg] mix-blend-difference'
                  : index === 3
                    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-[57%] rotate-[-179.012deg] mix-blend-difference'
                    : index === 4
                      ? 'top-1/2 left-1/2 -translate-x-[57%] -translate-y-1/2 rotate-[-29.722deg] mix-blend-difference'
                      : index === 5
                        ? 'top-1/2 left-1/2 -translate-x-[62%] -translate-y-[24%] rotate-[160.227deg] mix-blend-difference'
                        : 'top-1/2 left-1/2 -translate-x-[67%] -translate-y-[29%] rotate-180 mix-blend-hard-light'
          }`}
        >
          <GradientSvg
            className='w-full h-full'
            isHovered={isHovered}
            colors={colors}
          />
        </div>
      ))}
    </>
  );
};

export const DEFAULT_LIQUID_COLORS: Colors = {
  color1: '#FFFFFF',
  color2: '#EA580C', // Orange accent
  color3: '#F97316',
  color4: '#FCFCFE',
  color5: '#F9F9FD',
  color6: '#3B82F6', // Blue accent
  color7: '#2563EB',
  color8: '#1D4ED8',
  color9: '#F97316',
  color10: '#FB923C',
  color11: '#EA580C',
  color12: '#FED7AA',
  color13: '#C2410C',
  color14: '#93C5FD',
  color15: '#60A5FA',
  color16: '#1E40AF',
  color17: '#D97706',
};

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  colors?: Colors;
  className?: string;
  innerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LiquidButton({
  children,
  href,
  colors = DEFAULT_LIQUID_COLORS,
  className = '',
  innerClassName = '',
  size = 'md',
  onClick,
  ...props
}: LiquidButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: {
      container: 'rounded-lg p-[1.5px] h-8 sm:h-9',
      glow: 'rounded-lg',
      surface: 'px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-[6px] text-xs font-medium',
    },
    md: {
      container: 'rounded-xl p-[2px]',
      glow: 'rounded-xl',
      surface: 'px-6 py-3 rounded-[10px] text-sm font-normal',
    },
    lg: {
      container: 'rounded-2xl p-[2.5px]',
      glow: 'rounded-2xl',
      surface: 'px-8 py-4 rounded-[14px] text-base font-medium',
    },
  }[size];

  const innerContent = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center group overflow-hidden border border-orange-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${sizeClasses.container} ${className}`}
    >
      {/* Liquid background glow */}
      <div className={`absolute inset-0 w-full h-full overflow-hidden bg-black ${sizeClasses.glow}`}>
        <Liquid isHovered={isHovered} colors={colors} />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] group-hover:bg-black/20 transition-all duration-300" />
      </div>

      {/* Button content surface */}
      <div className={`relative z-10 w-full h-full bg-[#14151a]/85 text-white flex items-center justify-center gap-1.5 group-hover:text-amber-200 transition-colors ${sizeClasses.surface} ${innerClassName}`}>
        {children}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{innerContent}</Link>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      {...props}
      className="inline-block bg-transparent p-0 border-none outline-none cursor-pointer"
    >
      {innerContent}
    </button>
  );
}

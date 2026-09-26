// src/components/Overview/KpiCard.tsx
import React from 'react';

export type KpiBadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'indigo';
export type KpiTrendDirection = 'UP' | 'DOWN' | 'NEUTRAL';

export interface KpiCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  subtextTooltip?: string;
  badgeText?: string;
  badgeVariant?: KpiBadgeVariant;
  pulse?: boolean;
  icon?: React.ReactNode;
  trend?: KpiTrendDirection;
  trendValue?: string;
  isSelected?: boolean;
  className?: string;
  onClick?: () => void;
}

const BADGE_STYLES: Record<KpiBadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  primary: {
    container: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500'
  },
  indigo: {
    container: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500'
  },
  warning: {
    container: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500'
  },
  danger: {
    container: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500'
  },
  neutral: {
    container: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  }
};

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  title,
  value,
  unit,
  subtext,
  subtextTooltip,
  badgeText,
  badgeVariant = 'neutral',
  pulse = false,
  icon,
  trend,
  trendValue,
  isSelected = false,
  className = '',
  onClick
}) => {
  const badgeStyle = BADGE_STYLES[badgeVariant] || BADGE_STYLES.neutral;

  const getTrendStyle = () => {
    switch (trend) {
      case 'UP':
        return 'text-emerald-600';
      case 'DOWN':
        return 'text-rose-600';
      case 'NEUTRAL':
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div
      id={id}
      data-testid={id ? `kpi-card-${id}` : 'kpi-card'}
      onClick={onClick}
      className={`group relative bg-white border rounded-[16px] p-4 sm:p-5 flex flex-col justify-between min-h-[148px] shadow-xs transition-all duration-200 cursor-pointer select-none hover:border-[#2B7FFF] hover:-translate-y-0.5 hover:shadow-md ${
        isSelected
          ? 'border-[#2B7FFF] bg-[#FAFCFF] ring-2 ring-[#2B7FFF]/25 shadow-md'
          : 'border-[#D0DFEE]'
      } ${className}`}
    >
      {/* Card Header: Title, Selected Tag & Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 tracking-tight leading-tight">
            {title}
          </span>
          {isSelected && (
            <span className="font-mono text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-[4px] px-1.5 py-0.2 tracking-wider">
              SELECTED
            </span>
          )}
        </div>

        {badgeText && (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold border rounded-[4px] whitespace-nowrap shrink-0 ${badgeStyle.container}`}
          >
            {pulse && (
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${badgeStyle.dot} opacity-75`}
                />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${badgeStyle.dot}`} />
              </span>
            )}
            <span>{badgeText}</span>
          </span>
        )}
      </div>

      {/* Card Body: Numeric Value & Unit */}
      <div className="flex items-baseline gap-1.5 my-1.5">
        <span className="text-2xl sm:text-[28px] font-bold font-mono text-[#0F172A] tracking-tight leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-slate-500 font-sans">
            {unit}
          </span>
        )}
      </div>

      {/* Card Footer: Trend & Subtext */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-auto text-xs">
        {trendValue ? (
          <span className={`font-mono font-semibold inline-flex items-center gap-1 ${getTrendStyle()}`}>
            {trendValue}
          </span>
        ) : (
          <span className="text-slate-400 font-mono text-[11px]">—</span>
        )}

        {subtext && (
          <span
            className="text-[11px] text-slate-400 font-medium truncate max-w-[130px] sm:max-w-none text-right"
            title={subtextTooltip || subtext}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

// src/components/Common/Card.tsx
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', action }) => {
  return (
    <div
      className={`bg-white border border-[#D0DFEE] rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md ${className}`}
      style={{ borderRadius: '16px' }}
    >
      {title && (
        <div className="flex items-center justify-between mb-4 border-b border-[#F0F6FC] pb-3">
          <h3 className="text-base font-semibold text-[#0F172A] tracking-tight">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

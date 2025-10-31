
import React from 'react';
import InfoTooltip from './common/InfoTooltip';

interface ReportSectionProps {
  // Fix: Changed title type from string to React.ReactNode to allow passing JSX elements.
  title: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tooltipText?: string;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, icon, children, className, style, tooltipText }) => {
  return (
    <div 
      className={`bg-void-tint/50 backdrop-blur-md rounded-2xl p-6 border border-lunar-grey/20 shadow-lg transition-all duration-300 ${className || ''}`}
      style={style}
    >
      <div className="flex items-center mb-4">
        <div className="text-cosmic-gold mr-3">{icon}</div>
        <h3 className="text-2xl font-bold text-starlight font-display">{title}</h3>
        {tooltipText && <InfoTooltip text={tooltipText} />}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default ReportSection;

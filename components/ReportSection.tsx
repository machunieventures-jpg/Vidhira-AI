import React from 'react';
import InfoTooltip from './common/InfoTooltip';

interface ReportSectionProps {
  title: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tooltipText?: string;
  sectionKey: string; // Added for generating unique IDs for accessibility
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, icon, children, className, style, tooltipText, sectionKey }) => {
  const titleId = `section-title-${sectionKey}`;
  const tooltipId = `section-tooltip-${sectionKey}`;

  return (
    <section 
      aria-labelledby={titleId}
      className={`bg-white/50 dark:bg-[--deep-space]/50 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700/20 shadow-lg transition-all duration-300 ${className || ''}`}
      style={style}
    >
      <div className="flex items-center mb-4">
        <div className="text-[--gold-accent] mr-3" aria-hidden="true">{icon}</div>
        <h3 id={titleId} className="text-2xl font-bold text-[--cosmic-blue] dark:text-[--stardust] font-display">{title}</h3>
        {tooltipText && <InfoTooltip text={tooltipText} id={tooltipId} />}
      </div>
      <div>{children}</div>
    </section>
  );
};

export default ReportSection;
import React, { useState } from 'react';
import InfoTooltip from './common/InfoTooltip';
import { ChevronDown } from './common/Icons';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  'data-section-key': string;
  animationDelay?: number;
  tooltipText?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, 'data-section-key': dataSectionKey, animationDelay = 0, tooltipText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = `tooltip-${dataSectionKey}`;

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="collapsible-section bg-white dark:bg-[--cosmic-blue] rounded-xl shadow-lg border-l-4 border-[--cosmic-purple] transition-all duration-300 animate-slide-up hover:shadow-xl hover:border-[--gold-accent] hover:-translate-y-1"
      data-section-key={dataSectionKey}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <header
        className="flex items-center p-4 md:p-6 cursor-pointer"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={`section-content-${dataSectionKey}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOpen() }}
      >
        <div className="mr-4" aria-hidden="true">{icon}</div>
        <div className="flex-1 flex items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          {tooltipText && <InfoTooltip text={tooltipText} id={tooltipId} />}
        </div>
        <ChevronDown className={`ml-4 text-purple-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </header>
      <div
        id={`section-content-${dataSectionKey}`}
        className={`collapsible-content transition-[max-height,padding] duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[5000px]' : 'max-h-0'}`}
      >
        <div className="px-4 md:px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
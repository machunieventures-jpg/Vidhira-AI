import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  'data-section-key': string;
  animationDelay?: number;
}

const ChevronDown = ({ size = 24, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>;

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, 'data-section-key': dataSectionKey, animationDelay = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="mr-4">{icon}</div>
        <h3 className="flex-1 text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        <ChevronDown className={`ml-4 text-purple-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </header>
      <div
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

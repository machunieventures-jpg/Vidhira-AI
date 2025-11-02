import React from 'react';

interface Section {
  key: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
  activeSection: string;
  onNavigate: (key: string) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, activeSection, onNavigate }) => {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-8 card-base p-4">
        <h3 className="font-display text-lg font-bold text-suryansh-gold mb-4">Report Navigation</h3>
        <nav>
          <ul className="space-y-1">
            {sections.map(section => (
              <li key={section.key}>
                <a
                  href={`#${section.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(section.key);
                  }}
                  className={`
                    block text-sm p-2 rounded-md transition-all duration-200 relative
                    ${activeSection === section.key
                      ? 'text-suryansh-gold font-semibold'
                      : 'text-stone-brown/80 dark:text-manuscript-parchment/80 hover:bg-stone-brown/5 dark:hover:bg-manuscript-parchment/5'
                    }
                  `}
                >
                    {activeSection === section.key && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-1 bg-suryansh-gold rounded-r-full"></span>
                    )}
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default TableOfContents;

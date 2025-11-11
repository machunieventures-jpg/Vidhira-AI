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
    <aside className="hidden lg:block w-64 flex-shrink-0 no-print">
      <div className="sticky top-8 glass-card p-4">
        <h3 className="font-bold text-lg gradient-text mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Report Navigation
        </h3>
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
                      ? 'text-[--cosmic-purple] dark:text-[--gold-accent] font-semibold bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  {activeSection === section.key && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-1 bg-[--cosmic-purple] dark:bg-[--gold-accent] rounded-r-full"></span>
                  )}
                  <span className="ml-3">{section.title}</span>
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
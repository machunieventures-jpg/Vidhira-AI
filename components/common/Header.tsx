import React from 'react';

interface HeaderProps {
    toggleTheme: () => void;
    theme: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, theme }) => {
  const subtitle = "Know yourself.";

  return (
    <header className="relative w-full py-4 px-6 text-center">
      <h2 className="text-4xl md:text-5xl tracking-wider font-title vedic-title-animation">Vidhira</h2>
      <p className="text-sm md:text-base text-suryansh-gold/80 mt-2 font-elegant">
        {subtitle}
      </p>
       <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/5 text-suryansh-gold hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300"
          aria-label="Toggle color theme"
      >
          {theme === 'dark' ? (
              // Sun icon for dark mode
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
          ) : (
              // Moon icon for light mode
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
          )}
      </button>
    </header>
  );
};

export default Header;
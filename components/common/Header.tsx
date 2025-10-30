
import React from 'react';

// Base64 encoded logo image
const LOGO_BASE64 = "Vidhira";

const Header: React.FC = () => {
  const subtitle = "Know yourself.";

  return (
    <header className="py-4 px-6 text-center text-starlight">
      <img src={LOGO_BASE64} alt="Vidhira Logo" className="w-40 h-auto mx-auto" />
      <p className="text-sm md:text-base text-cosmic-gold/80 mt-2 animate-letter-reveal">
        {subtitle.split('').map((char, index) => (
          <span
            key={index}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </p>
    </header>
  );
};

export default Header;

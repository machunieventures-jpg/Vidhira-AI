import React from 'react';

const Header: React.FC = () => {
  const subtitle = "Know yourself.";

  return (
    <header className="py-4 px-6 text-center text-starlight">
      <h1 className="text-3xl md:text-4xl text-cosmic-gold mb-2 animate-text-glow" style={{ fontFamily: "'Hind', sans-serif" }} lang="hi" title="Om Gan Ganapataye Namah">ॐ गण गणपतये नमः</h1>
      <h2 className="text-4xl md:text-5xl tracking-wider vidhira-animated-title">Vidhira</h2>
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
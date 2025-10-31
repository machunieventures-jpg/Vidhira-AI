
import React, { useMemo } from 'react';
import type { PlanetaryPlacement } from '../../types';
import { ZODIAC_SIGNS, PLANET_GLYPHS } from '../common/AstroData';

interface RasiChartProps {
  placements: PlanetaryPlacement[];
  ascendant: string;
}

const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

const RasiChart: React.FC<RasiChartProps> = ({ placements, ascendant }) => {
  const chartElements = useMemo(() => {
    const SIZE = 400;
    const CENTER = SIZE / 2;
    const ZODIAC_RADIUS = 180;
    const HOUSE_RADIUS = 150;
    const PLANET_BASE_RADIUS = 115;

    const ascendantIndex = ZODIAC_SIGNS.findIndex(sign => sign.name === ascendant);
    if (ascendantIndex === -1) return null;

    const houses = Array.from({ length: 12 }, (_, i) => {
      const houseNumber = i + 1;
      const signIndex = (ascendantIndex + i) % 12;
      const sign = ZODIAC_SIGNS[signIndex];
      const angle = -15 + i * -30; // Start at top-right and go counter-clockwise

      const planetsInHouse = placements.filter(p => p.house === houseNumber);

      return { houseNumber, sign, angle, planetsInHouse };
    });

    return {
      houses,
      zodiac: ZODIAC_SIGNS.map((sign, i) => ({
        ...sign,
        angle: 15 + i * 30, // clockwise for zodiac ring
      })),
      constants: { SIZE, CENTER, ZODIAC_RADIUS, HOUSE_RADIUS, PLANET_BASE_RADIUS }
    };
  }, [placements, ascendant]);

  if (!chartElements) {
    return <div className="text-center text-lunar-grey">Could not render chart: Invalid ascendant sign provided.</div>;
  }
  
  const { houses, zodiac, constants } = chartElements;
  const { SIZE, CENTER, ZODIAC_RADIUS, HOUSE_RADIUS, PLANET_BASE_RADIUS } = constants;

  return (
    <div>
      <h4 className="text-xl font-bold text-cosmic-gold font-display text-center mb-2">
        Rasi Chart (Natal Chart)
      </h4>
      <p className="text-center text-sm text-lunar-grey mb-4">
        A snapshot of the heavens at your moment of birth. This chart shows which signs and planets occupy the 12 houses of your life.
      </p>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-md mx-auto">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer Zodiac Ring */}
        <circle cx={CENTER} cy={CENTER} r={ZODIAC_RADIUS} fill="none" stroke="var(--lucky-color, #FFD700)" strokeOpacity="0.2" />

        {/* House dividing lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`line-${i}`}
            x1={polarToCartesian(CENTER, CENTER, 50, i * 30).x}
            y1={polarToCartesian(CENTER, CENTER, 50, i * 30).y}
            x2={polarToCartesian(CENTER, CENTER, ZODIAC_RADIUS, i * 30).x}
            y2={polarToCartesian(CENTER, CENTER, ZODIAC_RADIUS, i * 30).y}
            stroke="#8B949E"
            strokeOpacity="0.2"
          />
        ))}

        {/* Zodiac Sign Glyphs */}
        {zodiac.map(({ name, glyph, angle }) => {
          const { x, y } = polarToCartesian(CENTER, CENTER, ZODIAC_RADIUS - 15, -angle + 180);
          return (
            <text key={name} x={x} y={y} fill="#8B949E" fontSize="18" textAnchor="middle" dominantBaseline="middle">
              {glyph}
            </text>
          );
        })}

        {/* Houses and Planets */}
        {houses.map(({ houseNumber, sign, angle, planetsInHouse }) => {
          // House Number
          const housePos = polarToCartesian(CENTER, CENTER, HOUSE_RADIUS, angle);
          // Planets
          const planetPositions = planetsInHouse.map((planet, i) => {
              const planetAngle = angle + (planetsInHouse.length > 1 ? (i - (planetsInHouse.length - 1) / 2) * 7 : 0);
              const planetRadius = PLANET_BASE_RADIUS - (planetsInHouse.length > 3 ? (i % 2) * 20 : 0);
              return {
                  ...polarToCartesian(CENTER, CENTER, planetRadius, planetAngle),
                  name: planet.planet
              };
          });

          return (
            <g key={`house-${houseNumber}`}>
              {/* House Number Text */}
              <text x={housePos.x} y={housePos.y} fill="#F0F6FC" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                {houseNumber}
              </text>
               {/* Ascendant Marker */}
              {houseNumber === 1 && (
                  <text x={housePos.x} y={housePos.y + 14} fill="var(--lucky-color, #FFD700)" fontSize="10" textAnchor="middle" dominantBaseline="middle" filter="url(#glow)">
                    {PLANET_GLYPHS.Ascendant}
                  </text>
              )}
              {/* Planet Glyphs */}
              {planetPositions.map(pos => (
                 <text key={pos.name} x={pos.x} y={pos.y} fill="#F0F6FC" fontSize="16" textAnchor="middle" dominantBaseline="middle">
                    {PLANET_GLYPHS[pos.name] || '?'}
                 </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default RasiChart;

import React, { useMemo } from 'react';
import type { PlanetaryPlacement } from '../../types';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface PlanetaryChartProps {
  data: PlanetaryPlacement[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.planets.length === 0) return null;

    return (
      <div className="glass-card p-3 text-sm">
        <p className="font-bold text-[--cosmic-purple] dark:text-[--gold-accent] mb-1">{`House ${label}`}</p>
        <ul className="text-gray-700 dark:text-gray-300 space-y-1">
          {data.planets.map((p: string) => <li key={p}>{p}</li>)}
        </ul>
      </div>
    );
  }
  return null;
};

const PlanetaryChart: React.FC<PlanetaryChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const houseData: { house: number; value: number; planets: string[] }[] = Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      value: 0,
      planets: [],
    }));

    data.forEach(planet => {
      if (planet.house >= 1 && planet.house <= 12) {
        const houseIndex = planet.house - 1;
        houseData[houseIndex].value += 1;
        houseData[houseIndex].planets.push(`${planet.planet} in ${planet.sign}`);
      }
    });

    return houseData;
  }, [data]);

  const maxPlanetsInHouse = Math.max(...chartData.map(h => h.value), 0);

  return (
    <div>
      <h4 className="text-xl font-bold gradient-text font-display text-center mb-2">
        Planetary Positions by House
      </h4>
      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
        This chart shows the distribution of planets (Grahas) across the 12 houses (Bhavas) of your Vedic chart. Hover over a house to see details.
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="var(--cosmic-purple)" strokeOpacity={0.2} />
          <PolarAngleAxis dataKey="house" tick={{ fill: 'var(--cosmic-purple)', opacity: 0.8, fontSize: 14 }} className="dark:!fill-[--stardust]" />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, maxPlanetsInHouse > 0 ? maxPlanetsInHouse + 1 : 1]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar 
            name="Placements" 
            dataKey="value" 
            stroke="var(--gold-accent)" 
            fill="var(--gold-accent)" 
            fillOpacity={0.6} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--gold-accent)', strokeOpacity: 0.5 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlanetaryChart;
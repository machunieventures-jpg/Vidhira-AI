import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PlanetaryStrength } from '../../types';

interface GrahaBalaChartProps {
    data: PlanetaryStrength[];
}

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white/80 dark:bg-[--cosmic-blue]/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg">
                <p className="font-bold text-gray-800 dark:text-gray-100">{`${label} - Score: ${payload[0].value}`}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{payload[0].payload.summary}</p>
            </div>
        );
    }
    return null;
};

const GrahaBalaChart: React.FC<GrahaBalaChartProps> = ({ data }) => {
    
    const getColor = (score: number) => {
        if (score >= 75) return 'var(--sage-green)'; // Strong
        if (score >= 50) return 'var(--gold-accent)'; // Average
        return 'var(--rose-accent)'; // Challenged
    };

    return (
        <div className="mt-6">
            <h4 className="text-xl font-bold gradient-text mb-4 text-center">Planetary Strength (Graha Bala)</h4>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                This chart scores each planet's strength and influence in your life. Higher scores indicate stronger, more supportive planetary energies.
            </p>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis type="number" domain={[0, 100]} stroke="var(--stardust)" />
                        <YAxis dataKey="planet" type="category" width={80} stroke="var(--stardust)" />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                        <Bar dataKey="score" background={{ fill: 'rgba(255, 255, 255, 0.05)' }}>
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GrahaBalaChart;
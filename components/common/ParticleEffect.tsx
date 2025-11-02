
import React, { useState, useImperativeHandle } from 'react';

interface Particle {
  id: number;
  style: React.CSSProperties;
}

interface ParticleEffectProps {
  triggerRef: React.Ref<(() => void) | null>;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ triggerRef }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useImperativeHandle(triggerRef, () => () => {
    const newParticles: Particle[] = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 360;
      const distance = 50 + Math.random() * 50;
      const size = 2 + Math.random() * 3;
      newParticles.push({
        id: Date.now() + i,
        style: {
          '--x': `${Math.cos(angle) * distance}px`,
          '--y': `${Math.sin(angle) * distance}px`,
          width: `${size}px`,
          height: `${size}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        } as React.CSSProperties,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={p.style}
          onAnimationEnd={() => setParticles([])}
        />
      ))}
    </>
  );
};

export default ParticleEffect;
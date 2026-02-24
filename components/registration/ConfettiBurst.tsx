
import React from 'react';

export const ConfettiBurst: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#D72638', '#FCE7BB', '#FFD700', '#ffffff'][Math.floor(Math.random() * 4)],
            animation: `confetti-fall ${1 + Math.random() * 2}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            width: `${5 + Math.random() * 10}px`,
            height: `${5 + Math.random() * 10}px`,
          }}
        />
      ))}
    </div>
  );
};

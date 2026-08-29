'use client';

import React from 'react';
import { useGameContext } from '@/contexts/GameContext';
import './AffectionDisplay.css';

const AffectionDisplay = ({ affection }) => {
  const { characters } = useGameContext();
  return (
    <div className="affection-display">
      <h3>호감도</h3>
      <div className="affection-bars">
        {Object.values(characters).map(char => (
          <div key={char.id} className="affection-item">
            <div className="character-name" style={{ color: char.color }}>
              {char.name}
            </div>
            <div className="affection-bar-container">
              <div
                className="affection-bar"
                style={{
                  width: `${Math.min(100, Math.max(0, affection[char.id] * 10))}%`,
                  background: char.color
                }}
              />
            </div>
            <div className="affection-value">{affection[char.id]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AffectionDisplay;

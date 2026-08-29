'use client';

import React from "react";
import { useGameContext } from "@/contexts/GameContext";
import { getAffectionBarWidth } from "@/utils/affectionHelper";
import "./EndingResult.css";

const EndingResult = ({ endingInfo, affection, onRestart, onBackToTitle }) => {
  const { characters } = useGameContext();
  return (
    <div className="ending-result-overlay">
      <div className="ending-result-card">
        <div className="ending-title-content">
          <div className="ending-type-badge">
            {endingInfo.type === "best" && "BEST ENDING"}
            {endingInfo.type === "good" && "GOOD ENDING"}
            {endingInfo.type === "normal" && "NORMAL ENDING"}
            {endingInfo.type === "bad" && "BAD ENDING"}
            {endingInfo.type === "duo" && "DUO ENDING"}
          </div>
          <div className="ending-title-box">
            <h2 className="ending-title">{endingInfo.title}</h2>
            <span className="line-deco left"></span>
            <span className="line-deco right"></span>
          </div>
          <p className="ending-message">
            <span className="icon-ending-message"></span>
            {endingInfo.message}
          </p>
        </div>
        <div className="final-affection">
          <h3>최종 호감도</h3>
          <div className="affection-summary">
            {Object.values(characters).map((character) => {
              const affectionValue =
                affection[character.id] ?? character.initialAffection ?? 0;
              const barWidth = getAffectionBarWidth(
                character.id,
                affectionValue
              );

              return (
                <div className="affection-row" key={character.id}>
                  <span
                    className="char-name"
                    style={{ color: character.color }}
                  >
                    {character.name}
                  </span>
                  <span className="affection-bar-small">
                    <span
                      className="affection-fill"
                      style={{
                        width: barWidth,
                        background: character.color,
                      }}
                    />
                  </span>
                  <span className="affection-num">{affectionValue}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ending-buttons">
          <button className="title-button secondary" onClick={onBackToTitle}>
            <span className="line-deco left"></span>처음으로
            <span className="line-deco right"></span>
          </button>
          <button className="restart-button primary" onClick={onRestart}>
            <span className="line-deco left"></span>다시 시작
            <span className="line-deco right"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndingResult;

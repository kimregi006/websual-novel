'use client';

import React from "react";
import CharacterSprite from "./CharacterSprite";
import "./CharacterDisplay.css";

/**
 * 캐릭터 디스플레이 컴포넌트
 * characterMap: { characterId: { emotion, position } } 형태의 객체를 받음
 * React.memo로 최적화하여 props가 변경되지 않으면 재렌더링하지 않음
 */
const CharacterDisplay = React.memo(({ characterMap }) => {
  // characterMap이 없거나 비어있으면 아무것도 렌더링하지 않음
  if (
    !characterMap ||
    typeof characterMap !== "object" ||
    Object.keys(characterMap).length === 0
  ) {
    return null;
  }

  return (
    <div className="character-display">
      {Object.entries(characterMap).map(([id, char]) => {
        // char 객체가 유효한지 확인
        if (!char || !char.emotion) {
          return null;
        }

        return (
          <CharacterSprite
            key={id}
            id={id}
            emotion={char.emotion}
            position={char.position}
            active={char.active}
            isNew={char.isNew}
          />
        );
      })}
    </div>
  );
});

CharacterDisplay.displayName = "CharacterDisplay";

export default CharacterDisplay;

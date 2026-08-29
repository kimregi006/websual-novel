'use client';

import React from "react";
import { useGameContext } from "@/contexts/GameContext";
import "./CharacterDisplay.css";

/**
 * 개별 캐릭터를 렌더링하는 컴포넌트
 * React.memo로 최적화하여 props가 변경되지 않으면 재렌더링하지 않음
 * 마운트 시에만 등장 애니메이션이 재생되고, emotion/position 변경 시에는 재생되지 않음
 */
const CharacterSprite = React.memo(
  ({ id, emotion, position, active, isNew }) => {
    const { characters } = useGameContext();

    const getCharacterImage = (charId, emotion) => {
      if (!charId || !emotion) return null;

      const char = characters?.[charId];
      if (
        !char ||
        !char.imageFolder ||
        !char.emotions ||
        !char.emotions[emotion]
      ) {
        return null;
      }

      try {
        return `/assets/characters/${char.imageFolder}/${char.emotions[emotion]}`;
      } catch (error) {
        console.error(
          `Failed to load image for ${charId} with emotion ${emotion}:`,
          error
        );
        return null;
      }
    };

    const imageSrc = getCharacterImage(id, emotion);
    if (!imageSrc) return null;
    console.log("CharacterSprite LOADED - NEW VERSION");
    console.log(
      id,
      "isNew:",
      isNew,
      "class:",
      ["sprite", position, active ? "active" : "", isNew ? "fade-in" : ""].join(
        " "
      )
    );
    return (
      <div
        className={`character-sprite character-${
          position || "center"
        } emotion-${emotion}${active ? " active-character" : ""}`}
      >
        <img
          src={imageSrc}
          alt={id}
          className={[
            "sprite",
            position,
            active ? "active" : "",
            isNew ? "fade-in" : "", // ✅ 처음 등장만
          ].join(" ")}
          onError={(e) => {
            console.error(`Image load error for ${id}:`, e);
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.emotion === nextProps.emotion &&
      prevProps.position === nextProps.position &&
      prevProps.active === nextProps.active &&
      prevProps.isNew === nextProps.isNew // ✅ 추가
    );
  }
);

CharacterSprite.displayName = "CharacterSprite";

export default CharacterSprite;

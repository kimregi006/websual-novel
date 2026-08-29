"use client";

/**
 * GameHeader.jsx - 게임 헤더 컴포넌트
 *
 * 장소 표시 바와 게임 컨트롤 버튼(저장/불러오기/처음으로)을 담당
 */

import React from "react";
import { useGameContext } from "@/contexts/GameContext";

const GameHeader = ({
  currentPlaceId,
  onSaveClick,
  onLoadClick,
  onResetClick,
  isMuted,
  onToggleMute,
}) => {
  const { places } = useGameContext();
  return (
    <div className="header-content">
      <div className="place-bar">
        <span className="icon-place-bar"></span>
        <h1 className="place-name">
          {places[currentPlaceId]?.name || "알 수 없는 장소"}
        </h1>
      </div>
      <div className="game-buttons">
        <button className="game-button" onClick={onSaveClick}>
          <span className="game-button-icon save"></span>
          <span className="game-button-text">저장하기</span>
        </button>
        <button className="game-button" onClick={onLoadClick}>
          <span className="game-button-icon load"></span>
          <span className="game-button-text">불러오기</span>
        </button>
        <button className="game-button" onClick={onResetClick}>
          <span className="game-button-icon exit"></span>
          <span className="game-button-text">처음으로</span>
        </button>
        <button
          className={`game-button ${isMuted ? "music-off" : "music-on"}`}
          onClick={onToggleMute}
        >
          <span className="game-button-icon"></span>
        </button>
      </div>
    </div>
  );
};

export default GameHeader;

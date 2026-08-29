"use client";

import React from "react";
import "./TitleScreen.css";
import { useGameContext } from "@/contexts/GameContext";

const TitleScreen = ({ onStart, onLoad, isMuted, onToggleMute }) => {
  const { gameInfo } = useGameContext();
  return (
    <div className="title-screen">
      {/* 음소거 버튼 (우측 상단) */}
      <div className="title-music-button-container">
        <button
          className={`title-music-button ${isMuted ? "music-off" : "music-on"}`}
          onClick={onToggleMute}
        >
          <span className="game-button-icon"></span>
        </button>
      </div>

      <div className="title-container">
        <div className="title-content">
          <div className="title-box">
            <h1 className="game-title">{gameInfo.title}</h1>
            <span className="line-deco left"></span>
            <span className="line-deco right"></span>
          </div>
          <div className="game-subtitle">
            <span className="icon-subtitle"></span>
            {gameInfo.subtitle}
          </div>
        </div>
        <div className="title-buttons">
          <button className="start-button" onClick={onStart}>
            <span className="line-deco left"></span>시작하기
            <span className="line-deco right"></span>
          </button>
          <button className="load-button" onClick={onLoad}>
            <span className="line-deco left"></span>불러오기
            <span className="line-deco right"></span>
          </button>
        </div>
      </div>
      <p className="copyright">Websual-Novel.v1.4 made @rr11gg22</p>
    </div>
  );
};

export default TitleScreen;

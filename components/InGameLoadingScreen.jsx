'use client';

/**
 * InGameLoadingScreen.jsx - 게임 진행 중 로딩 화면
 *
 * 게임 도중 필요한 리소스 로딩 시 표시
 * - scene 전환 시 배경 이미지 로딩
 * - 컷씬, 이벤트, reaction 등 대용량 이미지 로딩
 * - 간결하고 빠른 디자인으로 스토리 흐름을 해치지 않음
 */

import React from "react";
import "./InGameLoadingScreen.css";

const InGameLoadingScreen = ({ message = "로딩 중..." }) => {
  return (
    <div className="ingame-loading-screen">
      <div className="ingame-loading-overlay">
        <div className="ingame-loading-content">
          <div className="ingame-spinner"></div>
          <p className="ingame-loading-message">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default InGameLoadingScreen;

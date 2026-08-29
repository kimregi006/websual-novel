'use client';

import React from "react";
import { getSpeakerInfo } from "@/utils/speakerHelper";
import "./DialogueBox.css";

const DialogueBox = ({ speaker, text, onNext }) => {
  const { displayName, speakerColor } = getSpeakerInfo(speaker);

  return (
    <div className="dialogue-box" onClick={onNext}>
      <div className="dialogue-content">
        {displayName && (
          <div className="speaker-name" style={{ color: speakerColor }}>
            <p className="speaker-text">{displayName}</p>
            <span className="line-deco left"></span>
            <span className="line-deco right"></span>
          </div>
        )}
        <div className="dialogue-text">
          {text}
          <button className="next-button"></button>
        </div>
      </div>
    </div>
  );
};

export default DialogueBox;

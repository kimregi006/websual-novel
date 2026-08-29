'use client';

import React from "react";
import "./ChoiceBox.css";

const ChoiceBox = ({ choices, onChoice }) => {
  return (
    <div className="choice-box">
      <div className="choices-container">
        {choices.map((choice, index) => (
          <button
            key={index}
            className="choice-button"
            onClick={() => onChoice(choice)}
          >
            <div className="icon-choice-button"></div>
            <p className="choice-button-text">{choice.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChoiceBox;

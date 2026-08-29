'use client';

/**
 * SceneContent.jsx - 씬 내용 렌더링 컴포넌트
 * 캐릭터, 컷신, 대사, 선택지를 표시
 */

import React from "react";
import CharacterDisplay from "./CharacterDisplay";
import DialogueBox from "./DialogueBox";
import ChoiceBox from "./ChoiceBox";
import Cutscene from "./Cutscene";

const SceneContent = ({
  displayedCharacters,
  shouldShowCutscene,
  currentScene,
  showReaction,
  currentReaction,
  handleReactionNext,
  shouldShowChoices,
  dialogueForChoice,
  currentLine,
  handleNext,
  onChoice,
}) => {
  return (
    <>
      <CharacterDisplay characterMap={displayedCharacters} />

      <div className="scene-content">
        {shouldShowCutscene && (
          <Cutscene
            imagePath={currentScene.cutsceneImage}
            alt="Cutscene"
          />
        )}

        {(() => {
          if (showReaction && currentReaction) {
            return (
              <DialogueBox
                speaker={currentReaction.speaker}
                text={currentReaction.text}
                onNext={handleReactionNext}
              />
            );
          }

          const lineToDisplay = shouldShowChoices
            ? dialogueForChoice
            : currentLine;
          return (
            lineToDisplay && (
              <DialogueBox
                speaker={lineToDisplay.speaker}
                text={lineToDisplay.text}
                onNext={shouldShowChoices ? undefined : handleNext}
              />
            )
          );
        })()}

        {shouldShowChoices && !showReaction && (
          <ChoiceBox
            question={currentScene.question}
            choices={currentScene.choices}
            onChoice={onChoice}
          />
        )}
      </div>
    </>
  );
};

export default SceneContent;

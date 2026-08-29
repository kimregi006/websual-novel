/**
 * convertStoryData.js
 * storyData.js를 JSON으로 변환하여 public 폴더에 저장하는 스크립트
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES modules에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertStoryData() {
  try {
    // storyData.js에서 모든 export 가져오기
    const storyData = await import('../data/storyData.js');

    // JSON 객체 생성
    const jsonData = {
      gameInfo: storyData.gameInfo,
      characters: storyData.characters,
      places: storyData.places,
      storyScenes: storyData.storyScenes,
      endingConfig: storyData.endingConfig,
    };

    // JSON 파일로 저장
    const outputPath = join(__dirname, '../public/storyData.json');
    writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log('✅ storyData.json 파일이 public 폴더에 생성되었습니다.');
    console.log(`📁 경로: ${outputPath}`);
  } catch (error) {
    console.error('❌ 변환 중 오류 발생:', error);
    process.exit(1);
  }
}

convertStoryData();

// 동적으로 설정 가능한 스토리 데이터
let places = {};

/**
 * 스토리 데이터 설정
 * @param {Object} data - storyData 객체
 */
export const setStoryData = (data) => {
  if (data && data.places) {
    places = data.places;
  }
};

/**
 * 장소 ID로부터 배경 스타일을 가져옵니다
 * @param {string} placeId - 장소 ID
 * @returns {object} - background 스타일 객체
 */
export const getBackgroundStyle = (placeId) => {
  // placeId가 없으면 기본 배경
  if (!placeId) {
    return {
      background: '#f5f5f5'
    };
  }

  const place = places[placeId];

  // 장소 정보가 없으면 기본 배경
  if (!place) {
    return {
      background: '#f5f5f5'
    };
  }

  // 이미지가 있으면 이미지를 배경으로
  if (place.image) {
    try {
      const imageUrl = `/assets/places/${place.image}`;

      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } catch (error) {
      console.error(`Failed to load background image for ${placeId}:`, error);
      // 이미지 로드 실패 시 색상 배경으로 폴백
      return {
        background: place.color || '#f5f5f5'
      };
    }
  }

  // 이미지가 없으면 색상 배경
  return {
    background: place.color || '#f5f5f5'
  };
};

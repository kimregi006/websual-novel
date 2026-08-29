/**
 * imagePreloader.js - 이미지 preload 유틸리티
 *
 * 기능:
 * - 이미지 중복 로드 방지 (캐시 관리)
 * - 비동기 이미지 preload
 * - 렌더링 차단 없이 백그라운드에서 로드
 */

// 이미 preload 되었거나 요청된 이미지를 추적하는 캐시
const preloadedImages = new Set();
const preloadingImages = new Map(); // URL -> Promise

/**
 * 이미지가 이미 preload 되었는지 확인
 * @param {string} url - 이미지 URL
 * @returns {boolean}
 */
export const isImagePreloaded = (url) => {
  if (!url) return false;
  return preloadedImages.has(url);
};

/**
 * 단일 이미지를 preload
 * @param {string} url - 이미지 URL
 * @returns {Promise<string>} - 로드된 이미지 URL
 */
export const preloadImage = (url) => {
  if (!url) {
    return Promise.resolve(null);
  }

  // 이미 preload 완료된 이미지
  if (preloadedImages.has(url)) {
    return Promise.resolve(url);
  }

  // 이미 preload 중인 이미지 - 기존 Promise 반환
  if (preloadingImages.has(url)) {
    return preloadingImages.get(url);
  }

  // 새로운 이미지 preload
  const promise = new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      preloadedImages.add(url);
      preloadingImages.delete(url);
      resolve(url);
    };

    img.onerror = (error) => {
      preloadingImages.delete(url);
      console.warn(`[ImagePreloader] Failed to preload: ${url}`, error);
      // 에러가 나도 resolve - preload 실패가 렌더링을 차단하면 안 됨
      resolve(null);
    };

    img.src = url;
  });

  preloadingImages.set(url, promise);
  return promise;
};

/**
 * 여러 이미지를 병렬로 preload (백그라운드, non-blocking)
 * @param {string[]} urls - 이미지 URL 배열
 * @returns {Promise<string[]>} - 로드된 이미지 URL 배열
 */
export const preloadImages = async (urls) => {
  if (!urls || urls.length === 0) {
    return [];
  }

  // null이나 undefined 제거
  const validUrls = urls.filter(url => url);

  // 아직 preload 되지 않은 이미지만 필터링
  const urlsToPreload = validUrls.filter(url => !preloadedImages.has(url));

  if (urlsToPreload.length === 0) {
    return validUrls;
  }

  console.log(`[ImagePreloader] Preloading ${urlsToPreload.length} images`);

  try {
    // 모든 이미지를 병렬로 preload (Promise.all 사용하지 않음 - 하나라도 실패해도 계속 진행)
    const promises = urlsToPreload.map(url => preloadImage(url));
    const results = await Promise.allSettled(promises);

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`[ImagePreloader] Successfully preloaded ${successCount}/${urlsToPreload.length} images`);

    return validUrls;
  } catch (error) {
    console.error('[ImagePreloader] Error during batch preload:', error);
    return validUrls;
  }
};

/**
 * 여러 이미지를 병렬로 preload (차단형, 모든 이미지가 로드될 때까지 대기)
 * 타이틀 화면이나 필수 리소스 로딩에 사용
 * @param {string[]} urls - 이미지 URL 배열
 * @param {object} options - 옵션
 * @param {number} options.timeout - 타임아웃 (ms, 기본: 30000)
 * @returns {Promise<{success: boolean, loaded: number, total: number, failed: string[]}>}
 */
export const preloadImagesBlocking = async (urls, options = {}) => {
  const { timeout = 30000 } = options;

  if (!urls || urls.length === 0) {
    return { success: true, loaded: 0, total: 0, failed: [] };
  }

  // null이나 undefined 제거
  const validUrls = urls.filter(url => url);

  // 아직 preload 되지 않은 이미지만 필터링
  const urlsToPreload = validUrls.filter(url => !preloadedImages.has(url));

  if (urlsToPreload.length === 0) {
    return { success: true, loaded: validUrls.length, total: validUrls.length, failed: [] };
  }

  console.log(`[ImagePreloader] Blocking preload for ${urlsToPreload.length} images`);

  try {
    // 타임아웃과 함께 모든 이미지 preload
    const promises = urlsToPreload.map(url => preloadImage(url));
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Preload timeout')), timeout)
    );

    const results = await Promise.race([
      Promise.allSettled(promises),
      timeoutPromise
    ]);

    const successResults = results.filter(r => r.status === 'fulfilled' && r.value);
    const failedResults = results.filter(r => r.status === 'rejected' || !r.value);
    const failedUrls = failedResults.map((_, index) => urlsToPreload[index]).filter(Boolean);

    const loaded = successResults.length;
    const total = urlsToPreload.length;
    const success = loaded === total;

    console.log(
      `[ImagePreloader] Blocking preload ${success ? 'completed' : 'partial'}: ${loaded}/${total} images`
    );

    if (!success) {
      console.warn(`[ImagePreloader] Failed to load ${failedUrls.length} images:`, failedUrls);
    }

    return { success, loaded, total, failed: failedUrls };
  } catch (error) {
    console.error('[ImagePreloader] Blocking preload error:', error);
    return { success: false, loaded: 0, total: urlsToPreload.length, failed: urlsToPreload };
  }
};

/**
 * 캐시 초기화 (게임 리셋 시 사용)
 */
export const clearPreloadCache = () => {
  preloadedImages.clear();
  preloadingImages.clear();
  console.log('[ImagePreloader] Cache cleared');
};

/**
 * 현재 캐시 상태 확인 (디버깅용)
 */
export const getPreloadStats = () => {
  return {
    preloaded: preloadedImages.size,
    preloading: preloadingImages.size,
  };
};

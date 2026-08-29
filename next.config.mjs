/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 비활성화 (현재 <img> 태그 방식 유지)
  images: {
    unoptimized: true,
  },

  // React Strict Mode
  reactStrictMode: true,

  // 정적 export 설정
  output: "export",

  // 빌드 결과물에서 _next 대신 next 폴더 사용
  assetPrefix: "",

  // Trailing slash 추가 (일부 서버 호환성)
  trailingSlash: true,
};

export default nextConfig;

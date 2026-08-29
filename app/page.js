'use client';

import dynamic from 'next/dynamic';
import InitialLoadingScreen from '@/components/InitialLoadingScreen';

const VisualNovel = dynamic(() => import('@/components/VisualNovel'), {
  ssr: false,
  loading: () => <InitialLoadingScreen progress={null} />,
});

export default function Home() {
  return <VisualNovel />;
}

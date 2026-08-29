import { GameContextProvider } from '@/contexts/GameContext';
import './globals.css';
import DynamicTitle from '@/components/DynamicTitle';

export const metadata = {
  description: 'Interactive Visual Novel Game',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <DynamicTitle />
        <GameContextProvider>
          {children}
        </GameContextProvider>
      </body>
    </html>
  );
}

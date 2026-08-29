'use client';

import { useEffect, useState } from 'react';

export default function DynamicTitle() {
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch('/storyData.json')
      .then(res => res.json())
      .then(data => {
        const gameTitle = data.gameInfo?.title || 'Visual Novel';
        setTitle(gameTitle);
        document.title = gameTitle;
      })
      .catch(err => {
        console.error('Failed to load title from storyData:', err);
        document.title = 'Visual Novel';
      });
  }, []);

  return null;
}

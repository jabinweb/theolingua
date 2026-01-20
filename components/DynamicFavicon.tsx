'use client';

import { useEffect } from 'react';

export default function DynamicFavicon() {
  useEffect(() => {
    const updateFavicon = () => {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      
      if (favicon) {
        favicon.href = '/logo.png';
      }
      
      if (appleTouchIcon) {
        appleTouchIcon.href = '/logo.png';
      }
    };

    // Initial favicon set
    updateFavicon();

    // Listen for dark mode changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateFavicon);

    return () => {
      mediaQuery.removeEventListener('change', updateFavicon);
    };
  }, []);

  return null;
}

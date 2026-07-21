import React, { Suspense } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const AuroraBackground = React.lazy(() => import('./AuroraBackground'));
const ParticlesBackground = React.lazy(() => import('./ParticlesBackground'));

export const BackgroundManager: React.FC = () => {
  const { designSystem, bgTheme, mode } = useTheme();

  if (designSystem === 'brutal') {
    return null;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div id="bg-canvas-container">
      <Suspense fallback={null}>
        {bgTheme === 'default' && <AuroraBackground isDark={mode === 'dark'} />}
        {bgTheme === 'hello-kitty' && <ParticlesBackground theme="hello-kitty" />}
      </Suspense>
    </div>
  );
};
export default BackgroundManager;

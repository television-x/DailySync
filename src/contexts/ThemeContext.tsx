import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type BackgroundTheme = 'default' | 'hello-kitty' | 'noir';
type DesignSystem = 'glass' | 'brutal';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  bgTheme: BackgroundTheme;
  setBgTheme: (theme: BackgroundTheme) => void;
  designSystem: DesignSystem;
  setDesignSystem: (system: DesignSystem) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'system';
  });

  const [bgTheme, setBgTheme] = useState<BackgroundTheme>(() => {
    return (localStorage.getItem('theme-bg') as BackgroundTheme) || 'default';
  });

  const [designSystem, setDesignSystem] = useState<DesignSystem>(() => {
    return (localStorage.getItem('theme-design-system') as DesignSystem) || 'glass';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old classes
    root.classList.remove('light', 'dark', 'theme-hello-kitty', 'theme-noir', 'design-glass', 'design-brutal');

    // Handle Light/Dark Mode
    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }

    // Handle Background Theme (e.g. Hello Kitty)
    if (bgTheme !== 'default') {
      root.classList.add(`theme-${bgTheme}`);
    }

    // Handle Design System (Glass vs Brutal)
    root.classList.add(`design-${designSystem}`);

    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-bg', bgTheme);
    localStorage.setItem('theme-design-system', designSystem);
  }, [mode, bgTheme, designSystem]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, bgTheme, setBgTheme, designSystem, setDesignSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

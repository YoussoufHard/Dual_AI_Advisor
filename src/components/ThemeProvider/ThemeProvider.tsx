import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type BorderRadius = 'none' | 'small' | 'medium' | 'large';
export type FontSize = 'small' | 'medium' | 'large';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  borderRadius: BorderRadius;
  fontSize: FontSize;
  animations: boolean;
  reducedMotion: boolean;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleDarkMode: () => void;
  resetTheme: () => void;
  isDark: boolean;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: '#3B82F6',
  accentColor: '#8B5CF6',
  borderRadius: 'medium',
  fontSize: 'medium',
  animations: true,
  reducedMotion: false
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('theme-config');
    return saved ? { ...defaultTheme, ...JSON.parse(saved) } : defaultTheme;
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateDarkMode = () => {
      if (theme.mode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      } else {
        setIsDark(theme.mode === 'dark');
      }
    };

    updateDarkMode();

    if (theme.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateDarkMode);
      return () => mediaQuery.removeEventListener('change', updateDarkMode);
    }
  }, [theme.mode]);

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme classes
    root.className = '';
    root.classList.add(isDark ? 'dark' : 'light');
    root.classList.add(`radius-${theme.borderRadius}`);
    root.classList.add(`font-${theme.fontSize}`);
    
    if (!theme.animations) {
      root.classList.add('no-animations');
    }
    
    if (theme.reducedMotion) {
      root.classList.add('reduced-motion');
    }

    // Apply CSS custom properties
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    
    // Save to localStorage
    localStorage.setItem('theme-config', JSON.stringify(theme));
  }, [theme, isDark]);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }));
  };

  const toggleDarkMode = () => {
    setTheme({ mode: isDark ? 'light' : 'dark' });
  };

  const resetTheme = () => {
    setThemeState(defaultTheme);
    localStorage.removeItem('theme-config');
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleDarkMode,
      resetTheme,
      isDark
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
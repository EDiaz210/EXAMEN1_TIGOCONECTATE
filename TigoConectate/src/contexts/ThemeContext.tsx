import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../styles/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  colors: typeof lightColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        setThemeMode(saved);
      }
    } catch {
      // Si falla, usar tema claro por defecto
    }
  };

  const toggleTheme = async () => {
    const newTheme: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch {
      // Ignorar error de guardado
    }
  };

  const colors = themeMode === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ colors, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

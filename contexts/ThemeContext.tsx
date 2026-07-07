import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeColors } from '@/types';
import { lightTheme, darkTheme } from '@/constants/theme';
import { useDatabaseState } from './DatabaseContext';
import { getThemePreference, setThemePreference } from '@/services/repositories/preferencesRepository';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, loading: dbLoading } = useDatabaseState();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Load theme preference from SQLite when database is ready
  useEffect(() => {
    if (!dbLoading && db) {
      getThemePreference(db)
        .then((savedTheme) => {
          setThemeMode(savedTheme);
        })
        .catch((err) => {
          console.error('Failed to load theme preference:', err);
        });
    }
  }, [db, dbLoading]);

  const toggleTheme = async () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);

    if (db) {
      try {
        await setThemePreference(db, nextTheme);
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      }
    }
  };

  const colors = themeMode === 'light' ? lightTheme : darkTheme;
  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

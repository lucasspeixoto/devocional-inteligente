import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { BibleVersion } from '@/types';
import { getVersions as fetchVersionsFromApi } from '@/services/api';
import {
  getSelectedVersion,
  setSelectedVersion as saveSelectedVersion,
  getThemePreference,
  setThemePreference as saveThemePreference
} from '@/services/repositories/preferencesRepository';

export function useSettings() {
  const db = useDatabase();
  const [version, setVersionState] = useState<string>('nvi');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeVersion = await getSelectedVersion(db);
      const activeTheme = await getThemePreference(db);
      setVersionState(activeVersion);
      setThemeState(activeTheme);

      // Fetch versions from API
      const apiVersions = await fetchVersionsFromApi();
      setVersions(apiVersions);
    } catch (e: any) {
      console.error('Error loading settings:', e);
      setError(e instanceof Error ? e : new Error(String(e)));
      // Fallback/Defaults if API fails but DB is okay
      try {
        const activeVersion = await getSelectedVersion(db);
        const activeTheme = await getThemePreference(db);
        setVersionState(activeVersion);
        setThemeState(activeTheme);
      } catch (innerErr) {
        // use default states
      }
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const setVersion = useCallback(async (newVersion: string) => {
    try {
      await saveSelectedVersion(db, newVersion);
      setVersionState(newVersion);
    } catch (e) {
      console.error('Error saving version setting:', e);
    }
  }, [db]);

  const setTheme = useCallback(async (newTheme: 'light' | 'dark') => {
    try {
      await saveThemePreference(db, newTheme);
      setThemeState(newTheme);
    } catch (e) {
      console.error('Error saving theme setting:', e);
    }
  }, [db]);

  return {
    version,
    setVersion,
    theme,
    setTheme,
    versions,
    loading,
    error,
    refresh: loadSettings
  };
}

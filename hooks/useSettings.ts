import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { BIBLE_VERSION, BibleVersion } from "@/types";
import {
  getThemePreference,
  setThemePreference as saveThemePreference,
} from "@/services/repositories/preferencesRepository";

export function useSettings() {
  const db = useDatabase();
  const version: BibleVersion = BIBLE_VERSION;
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeTheme = await getThemePreference(db);
      setThemeState(activeTheme);
    } catch (e: unknown) {
      console.error("Error loading settings:", e);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const setTheme = useCallback(
    async (newTheme: "light" | "dark") => {
      try {
        await saveThemePreference(db, newTheme);
        setThemeState(newTheme);
      } catch (e) {
        console.error("Error saving theme setting:", e);
      }
    },
    [db],
  );

  return {
    version,
    theme,
    setTheme,
    loading,
    error,
    refresh: loadSettings,
  };
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { initDatabase } from '@/services/database';

// Prevent auto hiding of splash screen
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore errors if already prevented or not running in expo native context */
});

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  loading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  loading: true,
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        const initializedDb = await initDatabase();
        setDb(initializedDb);
      } catch (e) {
        console.error('Error during database initialization:', e);
      } finally {
        setLoading(false);
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // Ignore splash screen errors
        }
      }
    }

    prepare();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <DatabaseContext.Provider value={{ db, loading }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export function useDatabase(): SQLite.SQLiteDatabase {
  const context = useContext(DatabaseContext);
  if (!context.db) {
    throw new Error('useDatabase must be used within a DatabaseProvider and after it has finished loading.');
  }
  return context.db;
}

export function useDatabaseState() {
  return useContext(DatabaseContext);
}

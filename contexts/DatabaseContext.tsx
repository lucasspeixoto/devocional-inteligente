import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SQLite from "expo-sqlite";
import * as SplashScreen from "expo-splash-screen";
import { initDatabase } from "@/services/database";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Prevent auto hiding of splash screen
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore errors if already prevented or not running in expo native context */
});

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  loading: true,
  error: null,
  retry: () => undefined,
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    async function prepare() {
      setLoading(true);
      setError(null);
      try {
        const initializedDb = await initDatabase();
        setDb(initializedDb);
      } catch (cause) {
        const initializationError =
          cause instanceof Error ? cause : new Error(String(cause));
        console.error(
          "Error during local database initialization:",
          initializationError,
        );
        setDb(null);
        setError(initializationError);
      } finally {
        setLoading(false);
        try {
          await SplashScreen.hideAsync();
        } catch {
          // Ignore splash screen errors
        }
      }
    }

    prepare();
  }, [attempt]);

  if (loading) {
    return null;
  }

  if (error || !db) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Conteúdo local indisponível</Text>
        <Text style={styles.errorMessage}>
          Não foi possível preparar a Bíblia NVI armazenada no aplicativo.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={retry}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ db, loading, error, retry }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export function useDatabase(): SQLite.SQLiteDatabase {
  const context = useContext(DatabaseContext);
  if (!context.db) {
    throw new Error(
      "useDatabase must be used within a DatabaseProvider and after it has finished loading.",
    );
  }
  return context.db;
}

export function useDatabaseState() {
  return useContext(DatabaseContext);
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFF8F0",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A2E17",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#5C5C5C",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#6B4226",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { color: "#FFFFFF", fontWeight: "700" },
});

import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { QuoteCard } from "@/components/ui/QuoteCard";
import { typography } from "@/constants/typography";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useBooks } from "@/hooks/useBooks";
import { getBookByAbbrev } from "@/services/repositories/booksRepository";
import { getPreferences } from "@/services/repositories/preferencesRepository";
import { getChapterVerses } from "@/services/repositories/versesRepository";
import { LocalVerse } from "@/types";
import { BIBLE_VERSION } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeIndex() {
  const db = useDatabase();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    books,
    loading: booksLoading,
    error: booksError,
    refresh: refreshBooks,
  } = useBooks();

  const [lastBookAbbrev, setLastBookAbbrev] = useState<string>("gn");
  const [lastBookName, setLastBookName] = useState<string>("Gênesis");
  const [lastChapter, setLastChapter] = useState<number>(1);
  const [lastVerse, setLastVerse] = useState<number | null>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [previewVerses, setPreviewVerses] = useState<LocalVerse[]>([]);

  const loadPreferences = useCallback(async () => {
    try {
      setLoadingPrefs(true);
      const prefs = await getPreferences(db);

      const abbrev = prefs.last_book_abbrev || "gn";
      const chap = prefs.last_chapter || 1;
      const vers = prefs.last_verse || null;

      setLastBookAbbrev(abbrev);
      setLastChapter(chap);
      setLastVerse(vers);

      // Fetch book name
      const book = await getBookByAbbrev(db, abbrev);
      if (book) {
        setLastBookName(book.name);
      }

      // Fetch preview verses
      const verses = await getChapterVerses(db, abbrev, chap, BIBLE_VERSION);
      setPreviewVerses(verses.slice(0, 3)); // show first 3 verses as preview
    } catch (e) {
      console.error("Error loading preferences on Home:", e);
    } finally {
      setLoadingPrefs(false);
    }
  }, [db]);

  // Load preferences every time screen is focused (to capture updates from settings/reading)
  useFocusEffect(
    useCallback(() => {
      if (!booksLoading && books.length > 0) {
        loadPreferences();
      }
    }, [booksLoading, books.length, loadPreferences]),
  );

  if (booksLoading || (loadingPrefs && books.length > 0)) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <LoadingIndicator message="Inicializando biblioteca..." />
      </View>
    );
  }

  if (booksError) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ErrorState
          message="Não foi possível carregar os livros da Bíblia."
          onRetry={refreshBooks}
        />
      </View>
    );
  }

  const handleOpenReading = () => {
    router.push(`/reading/${lastBookAbbrev}/${lastChapter}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.welcomeText,
            typography.bodySmall,
            { color: colors.textSecondary },
          ]}
        >
          Bem-vindo ao
        </Text>
        <Text
          style={[styles.title, typography.heading1, { color: colors.primary }]}
        >
          Devocional Inteligente
        </Text>
      </View>

      <Animated.View entering={FadeInUp.duration(600).delay(200)}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text
              style={[
                styles.cardTitle,
                typography.label,
                { color: colors.textSecondary },
              ]}
            >
              Última Leitura
            </Text>
          </View>

          <Text
            style={[
              styles.bookName,
              typography.heading1,
              { color: colors.textPrimary },
            ]}
          >
            {lastBookName}
          </Text>

          <Text
            style={[
              styles.chapterText,
              typography.heading2,
              { color: colors.primary },
            ]}
          >
            Capítulo {lastChapter} {lastVerse ? `: ${lastVerse}` : ""}
          </Text>

          {previewVerses.length > 0 ? (
            <View style={styles.previewContainer}>
              {previewVerses.map((verse) => (
                <Text
                  key={verse.verse_number}
                  numberOfLines={2}
                  style={[
                    styles.previewText,
                    typography.bodySmall,
                    { color: colors.textSecondary },
                  ]}
                >
                  <Text style={{ color: colors.secondary, fontWeight: "bold" }}>
                    {verse.verse_number}{" "}
                  </Text>
                  {verse.text}
                </Text>
              ))}
              <Text
                style={[
                  styles.dots,
                  typography.bodySmall,
                  { color: colors.textSecondary },
                ]}
              >
                ...
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.emptyPreview,
                typography.body,
                { color: colors.textSecondary },
              ]}
            >
              Nenhuma leitura iniciada ainda. Toque para iniciar uma nova.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleOpenReading}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                typography.label,
                { color: "#FFFFFF" },
              ]}
            >
              Continuar Leitura
            </Text>
            <Ionicons
              name="arrow-forward-outline"
              size={20}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </Card>
      </Animated.View>

      <QuoteCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 16,
  },
  welcomeText: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontWeight: "bold",
  },
  card: {
    padding: 24,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bookName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  chapterText: {
    fontWeight: "600",
    marginBottom: 16,
  },
  previewContainer: {
    borderLeftWidth: 2,
    borderLeftColor: "#E8D5C4",
    paddingLeft: 12,
    marginBottom: 20,
  },
  previewText: {
    marginBottom: 6,
    lineHeight: 18,
  },
  dots: {
    marginLeft: 12,
  },
  emptyPreview: {
    marginBottom: 20,
    fontStyle: "italic",
  },
  button: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    fontWeight: "bold",
  },
});

import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { typography } from "@/constants/typography";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getBookDetails as fetchBookDetailsFromApi } from "@/services/api";
import {
  getBookByAbbrev,
  updateBookComment,
} from "@/services/repositories/booksRepository";
import { LocalBook } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 40 - 24) / 5; // 5 columns in the grid

export default function BookDetailsScreen() {
  const { abbrev } = useLocalSearchParams<{ abbrev: string }>();
  const db = useDatabase();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [book, setBook] = useState<LocalBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [introModalVisible, setIntroModalVisible] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!abbrev) return;
    setLoading(true);
    setError(null);
    try {
      let localBook = await getBookByAbbrev(db, abbrev);

      if (localBook && !localBook.comment) {
        // Fetch details from API to get the comment field
        try {
          const apiDetails = await fetchBookDetailsFromApi(abbrev);
          if (apiDetails.comment) {
            await updateBookComment(db, abbrev, apiDetails.comment);
            localBook = await getBookByAbbrev(db, abbrev);
          }
        } catch (apiErr) {
          console.warn("API error fetching book details (comment):", apiErr);
          // Non-blocking: continue displaying basic info if API fails
        }
      }

      if (localBook) {
        setBook(localBook);
      } else {
        throw new Error("Livro não encontrado no banco local.");
      }
    } catch (err: unknown) {
      console.error("Error loading book details:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [db, abbrev]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (loading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <LoadingIndicator message="Carregando detalhes do livro..." />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ErrorState
          message={error?.message || "Erro ao carregar detalhes."}
          onRetry={loadDetails}
        />
      </View>
    );
  }

  const handleChapterPress = (chapNumber: number) => {
    router.push(`/reading/${book.abbrev_pt}/${chapNumber}`);
  };

  // Generate array [1, 2, ..., chapters]
  const chaptersArray = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.fixedContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              typography.heading2,
              { color: colors.textPrimary },
            ]}
          >
            Detalhes do Livro
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <Animated.View entering={FadeInUp.duration(400)}>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View>
                <Text
                  style={[
                    styles.bookName,
                    typography.heading1,
                    { color: colors.textPrimary },
                  ]}
                >
                  {book.name}
                </Text>
                <Text
                  style={[
                    styles.bookSubtitle,
                    typography.body,
                    { color: colors.primary, fontWeight: "600" },
                  ]}
                >
                  {book.group_name} •{" "}
                  {book.testament === "VT"
                    ? "Velho Testamento"
                    : "Novo Testamento"}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooterRow}>
              <View style={{ flex: 1 }}>
                {!!book.author && (
                  <View style={styles.metaRow}>
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        typography.bodySmall,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Autor: {book.author}
                    </Text>
                  </View>
                )}

                <View style={styles.metaRow}>
                  <Ionicons
                    name="list-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      typography.bodySmall,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Capítulos: {book.chapters}
                  </Text>
                </View>
              </View>

              {!!book.comment && (
                <TouchableOpacity
                  style={[
                    styles.introButton,
                    { borderColor: colors.secondary, borderWidth: 1 },
                  ]}
                  onPress={() => setIntroModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="book-outline"
                    size={16}
                    color={colors.secondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      typography.label,
                      { color: colors.secondary, fontWeight: "bold" },
                    ]}
                  >
                    Introdução
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </Animated.View>

        <Text
          style={[
            styles.sectionTitle,
            typography.label,
            {
              color: colors.primary,
              fontWeight: "700",
              marginTop: 16,
              marginBottom: 8,
            },
          ]}
        >
          Selecione o Capítulo
        </Text>
      </View>

      <ScrollView
        style={styles.chaptersScroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.duration(500).delay(200)}
          style={styles.chaptersSection}
        >
          <View style={styles.grid}>
            {chaptersArray.map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.gridItem,
                  {
                    width: COLUMN_WIDTH,
                    height: COLUMN_WIDTH,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleChapterPress(num)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.gridItemText,
                    typography.label,
                    { color: colors.textPrimary },
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Introduction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        visible={introModalVisible}
        onRequestClose={() => setIntroModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                paddingTop: insets.top > 0 ? insets.top + 16 : 24,
                paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 24,
              },
            ]}
          >
            {/* Modal Header */}
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text
                style={[
                  typography.heading2,
                  { color: colors.textPrimary, fontWeight: "bold", flex: 1 },
                ]}
                numberOfLines={1}
              >
                Introdução: {book.name}
              </Text>
              <TouchableOpacity
                onPress={() => setIntroModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable commentary */}
            <ScrollView
              style={styles.introScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={[
                  typography.body,
                  {
                    color: colors.textPrimary,
                    lineHeight: 26,
                    paddingBottom: 20,
                  },
                ]}
              >
                {book.comment}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  fixedContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  chaptersScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontWeight: "bold",
  },
  infoCard: {
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bookName: {
    fontWeight: "700",
    marginBottom: 2,
  },
  bookSubtitle: {
    fontSize: 14,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  metaText: {
    fontSize: 13,
  },
  commentCard: {
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  commentText: {
    lineHeight: 24,
  },
  chaptersSection: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  gridItem: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  gridItemText: {
    fontWeight: "bold",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 4,
  },
  expandButtonText: {
    fontWeight: "bold",
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 12,
  },
  introButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000050",
  },
  modalContent: {
    height: "100%",
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalCloseButton: {
    padding: 4,
  },
  introScroll: {
    flex: 1,
    marginTop: 8,
  },
});

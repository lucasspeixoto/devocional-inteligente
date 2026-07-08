import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useBooks } from "@/hooks/useBooks";
import { useChapter } from "@/hooks/useChapter";
import { useNotes } from "@/hooks/useNotes";
import {
  setLastReadPosition,
  getSelectedVersion,
} from "@/services/repositories/preferencesRepository";
import { getBookByAbbrev } from "@/services/repositories/booksRepository";
import { getNotesCountByChapter } from "@/services/repositories/notesRepository";
import { typography } from "@/constants/typography";
import { VersesSkeleton } from "@/components/ui/VersesSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReadingScreen() {
  const { abbrev, chapter } = useLocalSearchParams<{
    abbrev: string;
    chapter: string;
  }>();
  const db = useDatabase();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const currentChapterNum = parseInt(chapter || "1", 10);

  // Load books list to handle next/prev book logic
  const { books } = useBooks();

  const [selectedVersion, setSelectedVersion] = useState("nvi");
  const [currentBookName, setCurrentBookName] = useState("");
  const [maxChapters, setMaxChapters] = useState(50);

  // Verses state
  const { verses, loading, error, reload } = useChapter(
    abbrev,
    currentChapterNum,
    selectedVersion,
  );

  // Notes count map (verse_number -> notes count)
  const [notesCount, setNotesCount] = useState<Record<number, number>>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");

  // Delete confirm state
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<number | null>(null);

  // Error modal state
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);

  // Reference for ScrollView reset
  const scrollViewRef = useRef<ScrollView>(null);

  // Manual Keyboard padding for Android to fix stuck margin bug
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => setKbHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKbHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Swipe animation values
  const translationX = useSharedValue(0);
  const lastDirection = useRef<"next" | "prev" | null>(null);

  // Load preferences
  useEffect(() => {
    async function loadPrefs() {
      try {
        const ver = await getSelectedVersion(db);
        setSelectedVersion(ver);

        // Load book details
        const b = await getBookByAbbrev(db, abbrev);
        if (b) {
          setCurrentBookName(b.name);
          setMaxChapters(b.chapters);
        }

        // Save current position as last read position
        await setLastReadPosition(db, abbrev, currentChapterNum);
      } catch (e) {
        console.error("Error loading preferences/book info in reader:", e);
      }
    }
    loadPrefs();
  }, [db, abbrev, currentChapterNum]);

  // Load notes count for current chapter
  const loadNotesCount = useCallback(async () => {
    try {
      const counts = await getNotesCountByChapter(
        db,
        abbrev,
        currentChapterNum,
        selectedVersion,
      );
      setNotesCount(counts);
    } catch (e) {
      console.error("Error loading notes counts:", e);
    }
  }, [db, abbrev, currentChapterNum, selectedVersion]);

  useEffect(() => {
    loadNotesCount();
  }, [loadNotesCount]);

  // Hook into notes repository for current selected verse
  const {
    notes: verseNotes,
    addNote: createVerseNote,
    removeNote: deleteVerseNote,
  } = useNotes(
    modalVisible ? abbrev : null,
    modalVisible ? currentChapterNum : null,
    modalVisible ? selectedVerseNum : null,
    modalVisible ? selectedVersion : null,
  );

  // Animate slide-in when chapter changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }

    if (lastDirection.current === "next") {
      translationX.value = 400; // Slide from right
      translationX.value = withTiming(0, { duration: 250 });
    } else if (lastDirection.current === "prev") {
      translationX.value = -400; // Slide from left
      translationX.value = withTiming(0, { duration: 250 });
    } else {
      translationX.value = 0;
    }
    lastDirection.current = null;
  }, [abbrev, chapter, translationX]);

  // Determine current book index in canonical order
  const currentBookIndex = books.findIndex((b) => b.abbrev_pt === abbrev);
  const isFirstChapter = currentBookIndex === 0 && currentChapterNum === 1;
  const isLastChapter =
    currentBookIndex === books.length - 1 &&
    books[currentBookIndex] &&
    currentChapterNum === books[currentBookIndex].chapters;

  const navigateToChapter = (dir: "next" | "prev") => {
    if (dir === "next") {
      if (currentChapterNum < maxChapters) {
        lastDirection.current = "next";
        router.setParams({ chapter: (currentChapterNum + 1).toString() });
      } else if (currentBookIndex < books.length - 1) {
        // Next book, chapter 1
        const nextBook = books[currentBookIndex + 1];
        lastDirection.current = "next";
        router.setParams({ abbrev: nextBook.abbrev_pt, chapter: "1" });
      }
    } else {
      if (currentChapterNum > 1) {
        lastDirection.current = "prev";
        router.setParams({ chapter: (currentChapterNum - 1).toString() });
      } else if (currentBookIndex > 0) {
        // Prev book, last chapter
        const prevBook = books[currentBookIndex - 1];
        lastDirection.current = "prev";
        router.setParams({
          abbrev: prevBook.abbrev_pt,
          chapter: prevBook.chapters.toString(),
        });
      }
    }
  };

  const triggerBoundaryHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      let tx = e.translationX;
      if (isFirstChapter && tx > 0) {
        tx = Math.sqrt(tx) * 5; // Resistance bounce
      } else if (isLastChapter && tx < 0) {
        tx = -Math.sqrt(-tx) * 5; // Resistance bounce
      }
      translationX.value = tx;
    })
    .onEnd((e) => {
      if (e.translationX > 100) {
        if (isFirstChapter) {
          runOnJS(triggerBoundaryHaptic)();
          translationX.value = withSpring(0);
        } else {
          translationX.value = withTiming(500, { duration: 150 }, () => {
            runOnJS(navigateToChapter)("prev");
          });
        }
      } else if (e.translationX < -100) {
        if (isLastChapter) {
          runOnJS(triggerBoundaryHaptic)();
          translationX.value = withSpring(0);
        } else {
          translationX.value = withTiming(-500, { duration: 150 }, () => {
            runOnJS(navigateToChapter)("next");
          });
        }
      } else {
        translationX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
  }));

  const handleVerseLongPress = (verseNum: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVerseNum(verseNum);
    setNewNoteContent("");
    setModalVisible(true);
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      setErrorModalMessage("O texto da anotação é obrigatório.");
      return;
    }
    try {
      await createVerseNote(newNoteContent);
      setNewNoteContent("");
      await loadNotesCount();
    } catch (e) {
      console.error(e);
      setErrorModalMessage("Erro ao salvar anotação.");
    }
  };

  const handleDeleteNote = (noteId: number) => {
    setNoteIdToDelete(noteId);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteNote = async () => {
    if (noteIdToDelete === null) return;
    try {
      await deleteVerseNote(noteIdToDelete);
      await loadNotesCount();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteConfirmVisible(false);
      setNoteIdToDelete(null);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        {/* Reader Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text
              style={[
                styles.bookTitle,
                typography.heading2,
                { color: colors.primary, fontWeight: "700" },
              ]}
            >
              {currentBookName}
            </Text>
            <Text
              style={[
                styles.chapterTitle,
                typography.bodySmall,
                { color: colors.textSecondary },
              ]}
            >
              Capítulo {currentChapterNum} • {selectedVersion.toUpperCase()}
            </Text>
          </View>

          <View style={{ width: 32 }} />
        </View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.animatedContainer, animatedStyle]}>
            {loading && verses.length === 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VersesSkeleton />
              </ScrollView>
            ) : error ? (
              <View style={styles.centerContainer}>
                <ErrorState
                  message="Erro ao carregar versículos."
                  onRetry={reload}
                />
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: 60 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
              >
                {verses.length > 0 ? (
                  verses.map((verse) => {
                    const hasNotes = notesCount[verse.verse_number] > 0;
                    return (
                      <TouchableOpacity
                        key={verse.id || verse.verse_number}
                        style={styles.verseRow}
                        onLongPress={() =>
                          handleVerseLongPress(verse.verse_number)
                        }
                        activeOpacity={0.6}
                      >
                        <Text
                          style={[
                            styles.verseText,
                            typography.body,
                            { color: colors.textPrimary },
                          ]}
                        >
                          <Text
                            style={[
                              typography.verseNumber,
                              { color: colors.secondary, fontWeight: "bold" },
                            ]}
                          >
                            {verse.verse_number}{" "}
                          </Text>
                          {verse.text}
                          {hasNotes && (
                            <Text>
                              {"  "}
                              <Ionicons
                                name="document-text"
                                size={14}
                                color={colors.primary}
                              />
                            </Text>
                          )}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text
                      style={[
                        typography.body,
                        { color: colors.textSecondary, fontStyle: "italic" },
                      ]}
                    >
                      Nenhum versículo disponível.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </Animated.View>
        </GestureDetector>

        {/* Notes Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          navigationBarTranslucent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
              enabled={Platform.OS === "ios"}
            >
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.surface,
                  paddingTop: insets.top > 0 ? insets.top + 16 : 24,
                  paddingBottom: (insets.bottom > 0 ? insets.bottom + 16 : 24) + (Platform.OS === "android" ? kbHeight : 0),
                },
              ]}
            >
              {/* Modal Header */}
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    typography.heading2,
                    { color: colors.textPrimary, fontWeight: "bold" },
                  ]}
                >
                  Anotações: {currentBookName} {currentChapterNum}:
                  {selectedVerseNum}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Notes List */}
              <ScrollView style={styles.notesList}>
                {verseNotes.length > 0 ? (
                  verseNotes.map((note) => (
                    <Card key={note.id} style={styles.noteCard}>
                      <Text
                        style={[
                          typography.body,
                          { color: colors.textPrimary, marginBottom: 8 },
                        ]}
                      >
                        {note.content}
                      </Text>
                      <View style={styles.noteMetaRow}>
                        <Text
                          style={[
                            typography.bodySmall,
                            { color: colors.textSecondary, fontSize: 11 },
                          ]}
                        >
                          {new Date(note.updated_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteNote(note.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  ))
                ) : (
                  <Text
                    style={[
                      typography.body,
                      {
                        color: colors.textSecondary,
                        fontStyle: "italic",
                        textAlign: "center",
                        marginTop: 24,
                      },
                    ]}
                  >
                    Nenhuma anotação para este versículo.
                  </Text>
                )}
              </ScrollView>

              {/* Form Input */}
              <View
                style={[
                  styles.inputContainer,
                  { borderTopColor: colors.border },
                ]}
              >
                <TextInput
                  placeholder="Escreva sua reflexão..."
                  placeholderTextColor={colors.textSecondary}
                  value={newNoteContent}
                  onChangeText={setNewNoteContent}
                  multiline
                  style={[
                    styles.noteInput,
                    typography.body,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAddNote}
                >
                  <Text
                    style={[
                      typography.label,
                      { color: "#FFFFFF", fontWeight: "bold" },
                    ]}
                  >
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
          visible={deleteConfirmVisible}
          onRequestClose={() => setDeleteConfirmVisible(false)}
        >
          <View style={styles.confirmOverlay}>
            <Card
              style={[
                styles.confirmContent,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={44}
                color={colors.error}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={[
                  typography.heading2,
                  {
                    color: colors.textPrimary,
                    fontWeight: "bold",
                    marginBottom: 8,
                    textAlign: "center",
                  },
                ]}
              >
                Confirmar Exclusão
              </Text>
              <Text
                style={[
                  typography.body,
                  {
                    color: colors.textSecondary,
                    marginBottom: 24,
                    textAlign: "center",
                  },
                ]}
              >
                Deseja realmente excluir esta anotação permanentemente?
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { borderColor: colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setDeleteConfirmVisible(false)}
                >
                  <Text
                    style={[
                      typography.label,
                      { color: colors.textSecondary, fontWeight: "bold" },
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.error },
                  ]}
                  onPress={confirmDeleteNote}
                >
                  <Text
                    style={[
                      typography.label,
                      { color: "#FFFFFF", fontWeight: "bold" },
                    ]}
                  >
                    Excluir
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </Modal>

        {/* Error Message Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
          visible={errorModalMessage !== null}
          onRequestClose={() => setErrorModalMessage(null)}
        >
          <View style={styles.confirmOverlay}>
            <Card
              style={[
                styles.confirmContent,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={44}
                color={colors.error}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={[
                  typography.heading2,
                  {
                    color: colors.textPrimary,
                    fontWeight: "bold",
                    marginBottom: 8,
                    textAlign: "center",
                  },
                ]}
              >
                Atenção
              </Text>
              <Text
                style={[
                  typography.body,
                  {
                    color: colors.textSecondary,
                    marginBottom: 24,
                    textAlign: "center",
                  },
                ]}
              >
                {errorModalMessage}
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setErrorModalMessage(null)}
                >
                  <Text
                    style={[
                      typography.label,
                      { color: "#FFFFFF", fontWeight: "bold" },
                    ]}
                  >
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  bookTitle: {
    fontSize: 20,
  },
  chapterTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  verseRow: {
    paddingVertical: 10,
  },
  verseText: {
    lineHeight: 28,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
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
  notesList: {
    flex: 1,
  },
  noteCard: {
    padding: 12,
    marginBottom: 10,
  },
  noteMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#0000000a",
    paddingTop: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
  },
  noteInput: {
    minHeight: 120,
    maxHeight: 250,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlignVertical: "top",
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000060",
    padding: 24,
  },
  confirmContent: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    padding: 24,
    borderWidth: 1,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

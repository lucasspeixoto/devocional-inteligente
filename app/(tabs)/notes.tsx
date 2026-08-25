import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDatabase } from "@/contexts/DatabaseContext";
import {
  getNotesOrderedByBible,
  updateNote,
  deleteNote,
} from "@/services/repositories/notesRepository";
import { setLastReadPosition } from "@/services/repositories/preferencesRepository";
import { NoteWithBookAndVerseText } from "@/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { typography } from "@/constants/typography";
import { Ionicons } from "@expo/vector-icons";

interface VerseGroup {
  chapter: number;
  verseNumber: number;
  verseText?: string | null;
  notes: NoteWithBookAndVerseText[];
}

interface BookGroup {
  bookName: string;
  bookAbbrev: string;
  verses: VerseGroup[];
}

export default function NotesScreen() {
  const db = useDatabase();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [notes, setNotes] = useState<NoteWithBookAndVerseText[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Delete note states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingNote, setEditingNote] =
    useState<NoteWithBookAndVerseText | null>(null);
  const [editText, setEditText] = useState("");
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(
    null,
  );

  // Manual Keyboard padding for Android to fix stuck margin bug
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setKbHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKbHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotesOrderedByBible(db);
      setNotes(data);
    } catch (e) {
      console.error("Error loading notes journal:", e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes]),
  );

  const handleNavigateToVerse = async (bookAbbrev: string, chapter: number) => {
    try {
      await setLastReadPosition(db, bookAbbrev, chapter);
      router.push(`/reading/${bookAbbrev}/${chapter}`);
    } catch (e) {
      console.error("Error setting read position from notes:", e);
      router.push(`/reading/${bookAbbrev}/${chapter}`);
    }
  };

  const handleEditPress = (note: NoteWithBookAndVerseText) => {
    setEditingNote(note);
    setEditText(note.content);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      setErrorModalMessage("O texto da anotação é obrigatório.");
      return;
    }
    if (!editingNote) return;

    try {
      await updateNote(db, editingNote.id, editText);
      setEditModalVisible(false);
      setEditingNote(null);
      loadNotes();
    } catch (e) {
      console.error(e);
      setErrorModalMessage("Erro ao salvar alterações da anotação.");
    }
  };

  const handleDeletePress = async () => {
    if (!editingNote) return;
    try {
      await deleteNote(db, editingNote.id);
      setEditModalVisible(false);
      setEditingNote(null);
      loadNotes();
    } catch (e) {
      console.error(e);
      setErrorModalMessage("Erro ao excluir anotação.");
    }
  };

  const groupNotesByBookAndVerse = (
    flatNotes: NoteWithBookAndVerseText[],
  ): BookGroup[] => {
    const groups: BookGroup[] = [];

    flatNotes.forEach((note) => {
      let bookGroup = groups.find((g) => g.bookAbbrev === note.book_abbrev);
      if (!bookGroup) {
        bookGroup = {
          bookName: note.book_name || note.book_abbrev,
          bookAbbrev: note.book_abbrev,
          verses: [],
        };
        groups.push(bookGroup);
      }

      let verseGroup = bookGroup.verses.find(
        (v) =>
          v.chapter === note.chapter && v.verseNumber === note.verse_number,
      );
      if (!verseGroup) {
        verseGroup = {
          chapter: note.chapter,
          verseNumber: note.verse_number,
          verseText: note.verse_text,
          notes: [],
        };
        bookGroup.verses.push(verseGroup);
      }

      verseGroup.notes.push(note);
    });

    return groups;
  };

  const formatDate = (dateStr: string) => {
    try {
      const isoStr = dateStr.includes("Z")
        ? dateStr
        : dateStr.replace(" ", "T") + "Z";
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const groupedData = groupNotesByBookAndVerse(notes);

  if (loading && notes.length === 0) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <LoadingIndicator message="Carregando suas anotações..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text
          style={[
            styles.title,
            typography.heading1,
            { color: colors.textPrimary },
          ]}
        >
          Minhas Anotações
        </Text>
        <Text
          style={[
            styles.subtitle,
            typography.bodySmall,
            { color: colors.textSecondary },
          ]}
        >
          Suas reflexões bíblicas organizadas de Gênesis a Apocalipse
        </Text>
      </View>

      {groupedData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="document-text-outline"
            title="Diário Vazio"
            message={
              "Você ainda não fez nenhuma anotação nos versículos. " +
              "Comece a ler e segure um versículo para criar sua primeira reflexão!"
            }
          />
          <TouchableOpacity
            style={[styles.readButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/")}
          >
            <Ionicons
              name="book-outline"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                typography.label,
                { color: "#FFFFFF", fontWeight: "bold" },
              ]}
            >
              Começar Leitura
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {groupedData.map((book) => (
            <View key={book.bookAbbrev} style={styles.bookSection}>
              {/* Book Title Header */}
              <View style={styles.bookHeader}>
                <Ionicons
                  name="bookmarks"
                  size={18}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.bookNameText,
                    typography.heading2,
                    { color: colors.primary, fontWeight: "bold" },
                  ]}
                >
                  {book.bookName.toUpperCase()}
                </Text>
              </View>

              {/* Verses grouped under this book */}
              {book.verses.map((v, vIdx) => (
                <Card
                  key={`${book.bookAbbrev}-${v.chapter}-${v.verseNumber}`}
                  style={[styles.verseCard, { borderColor: colors.border }]}
                >
                  <TouchableOpacity
                    onPress={() =>
                      handleNavigateToVerse(book.bookAbbrev, v.chapter)
                    }
                    activeOpacity={0.7}
                  >
                    {/* Verse Citation and Read link */}
                    <View style={styles.verseHeaderRow}>
                      <Text
                        style={[
                          typography.label,
                          { color: colors.secondary, fontWeight: "bold" },
                        ]}
                      >
                        Capítulo {v.chapter}:{v.verseNumber}
                      </Text>
                      <View style={styles.readLinkRow}>
                        <Text
                          style={[
                            typography.bodySmall,
                            {
                              color: colors.primaryLight,
                              marginRight: 4,
                              fontWeight: "600",
                            },
                          ]}
                        >
                          Ler Capítulo
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={colors.primaryLight}
                        />
                      </View>
                    </View>

                    {/* The Bible Verse Text if cached */}
                    {v.verseText ? (
                      <View
                        style={[
                          styles.verseTextBox,
                          {
                            borderLeftColor: colors.secondaryLight,
                            backgroundColor: `${colors.secondaryLight}10`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            typography.bodySmall,
                            {
                              color: colors.textSecondary,
                              fontStyle: "italic",
                            },
                          ]}
                          numberOfLines={3}
                        >
                          {`"${v.verseText}"`}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>

                  {/* List of user notes for this verse */}
                  <View style={styles.notesContainer}>
                    {v.notes.map((note, nIdx) => (
                      <View key={note.id} style={styles.noteItem}>
                        {nIdx > 0 && (
                          <View
                            style={[
                              styles.noteDivider,
                              { backgroundColor: colors.border },
                            ]}
                          />
                        )}
                        <TouchableOpacity
                          onPress={() => handleEditPress(note)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              typography.body,
                              {
                                color: colors.textPrimary,
                                marginBottom: 8,
                                lineHeight: 22,
                              },
                            ]}
                          >
                            {note.content}
                          </Text>
                          <View style={styles.noteMetaRow}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                flex: 1,
                              }}
                            >
                              <Ionicons
                                name="time-outline"
                                size={12}
                                color={colors.textSecondary}
                                style={{ marginRight: 4 }}
                              />
                              <Text
                                style={[
                                  typography.bodySmall,
                                  { color: colors.textSecondary, fontSize: 11 },
                                ]}
                              >
                                {formatDate(note.updated_at || note.created_at)}
                              </Text>
                            </View>
                            <Ionicons
                              name="create-outline"
                              size={16}
                              color={colors.primaryLight}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </Card>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Edit Note Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          setEditingNote(null);
        }}
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
                  paddingBottom:
                    (insets.bottom > 0 ? insets.bottom + 16 : 24) +
                    (Platform.OS === "android" ? kbHeight : 0),
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
                    { color: colors.textPrimary, fontWeight: "bold", flex: 1 },
                  ]}
                  numberOfLines={1}
                >
                  Editar Anotação: {editingNote?.book_name}{" "}
                  {editingNote?.chapter}:{editingNote?.verse_number}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditingNote(null);
                  }}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Edit Form Input */}
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                  paddingVertical: 8,
                }}
              >
                <TextInput
                  placeholder="Escreva sua reflexão..."
                  placeholderTextColor={colors.textSecondary}
                  value={editText}
                  onChangeText={setEditText}
                  multiline
                  style={[
                    styles.noteInput,
                    typography.body,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      flex: 1,
                      marginBottom: 16,
                    },
                  ]}
                />

                {/* Actions (Save / Delete) */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      { borderColor: colors.error, borderWidth: 1 },
                    ]}
                    onPress={handleDeletePress}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        typography.label,
                        { color: colors.error, fontWeight: "bold" },
                      ]}
                    >
                      Excluir
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      { backgroundColor: colors.primary, flex: 2 },
                    ]}
                    onPress={handleSaveEdit}
                  >
                    <Text
                      style={[
                        typography.label,
                        { color: "#FFFFFF", fontWeight: "bold" },
                      ]}
                    >
                      Salvar Alterações
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#0000000a",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  readButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  bookSection: {
    marginBottom: 24,
  },
  bookHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  bookNameText: {
    letterSpacing: 1.5,
  },
  verseCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  verseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  readLinkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verseTextBox: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 6,
    marginBottom: 14,
    borderRadius: 4,
  },
  notesContainer: {
    marginTop: 4,
  },
  noteItem: {
    paddingVertical: 4,
  },
  noteDivider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.6,
  },
  noteMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.8,
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
  noteInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlignVertical: "top",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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

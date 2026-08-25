import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { LocalNote } from "@/types";
import { BIBLE_VERSION } from "@/types";
import {
  createNote,
  updateNote,
  deleteNote,
  getNotesByVerse,
  getAllNotes,
  NoteWithBookName,
} from "@/services/repositories/notesRepository";

export function useNotes(
  bookAbbrev?: string | null,
  chapter?: number | null,
  verseNumber?: number | null,
) {
  const db = useDatabase();
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [allNotes, setAllNotes] = useState<NoteWithBookName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (bookAbbrev && chapter && verseNumber) {
        const verseNotes = await getNotesByVerse(
          db,
          bookAbbrev,
          chapter,
          verseNumber,
          BIBLE_VERSION,
        );
        setNotes(verseNotes);
      } else {
        const list = await getAllNotes(db);
        setAllNotes(list);
      }
    } catch (e: unknown) {
      console.error("Error loading notes:", e);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [db, bookAbbrev, chapter, verseNumber]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const addNote = useCallback(
    async (content: string) => {
      if (!bookAbbrev || !chapter || !verseNumber) {
        throw new Error("Informações do versículo ausentes para criar nota");
      }
      await createNote(
        db,
        bookAbbrev,
        chapter,
        verseNumber,
        BIBLE_VERSION,
        content,
      );
      await loadNotes();
    },
    [db, bookAbbrev, chapter, verseNumber, loadNotes],
  );

  const editNote = useCallback(
    async (id: number, content: string) => {
      await updateNote(db, id, content);
      await loadNotes();
    },
    [db, loadNotes],
  );

  const removeNote = useCallback(
    async (id: number) => {
      await deleteNote(db, id);
      await loadNotes();
    },
    [db, loadNotes],
  );

  return {
    notes,
    allNotes,
    loading,
    error,
    addNote,
    editNote,
    removeNote,
    refresh: loadNotes,
  };
}
export type UseNotesType = ReturnType<typeof useNotes>;

import { SQLiteDatabase } from "expo-sqlite";
import { LocalNote, NoteWithBookAndVerseText } from "@/types";

export interface NoteWithBookName extends LocalNote {
  book_name: string;
}

export async function createNote(
  db: SQLiteDatabase,
  bookAbbrev: string,
  chapter: number,
  verseNumber: number,
  version: string,
  content: string,
): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Conteúdo da anotação é obrigatório");
  }

  await db.runAsync(
    `INSERT INTO notes (book_abbrev, chapter, verse_number, version, content, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [bookAbbrev, chapter, verseNumber, version, trimmed],
  );
}

export async function updateNote(
  db: SQLiteDatabase,
  id: number,
  content: string,
): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Conteúdo da anotação é obrigatório");
  }

  await db.runAsync(
    `UPDATE notes 
     SET content = ?, updated_at = datetime('now') 
     WHERE id = ?`,
    [trimmed, id],
  );
}

export async function deleteNote(
  db: SQLiteDatabase,
  id: number,
): Promise<number> {
  const result = await db.runAsync("DELETE FROM notes WHERE id = ?", [id]);
  return result.changes;
}

export async function getNotesByVerse(
  db: SQLiteDatabase,
  bookAbbrev: string,
  chapter: number,
  verseNumber: number,
  version: string,
): Promise<LocalNote[]> {
  const rows = await db.getAllAsync<LocalNote>(
    `SELECT id, book_abbrev, chapter, verse_number, content, created_at, updated_at 
     FROM notes 
     WHERE book_abbrev = ? AND chapter = ? AND verse_number = ? AND version = ?
     ORDER BY created_at DESC`,
    [bookAbbrev, chapter, verseNumber, version],
  );

  return rows.map((row) => ({
    id: row.id,
    book_abbrev: row.book_abbrev,
    chapter: row.chapter,
    verse_number: row.verse_number,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getAllNotes(
  db: SQLiteDatabase,
): Promise<NoteWithBookName[]> {
  const rows = await db.getAllAsync<LocalNote>(
    `SELECT n.id, n.book_abbrev, n.chapter, n.verse_number, n.content, n.created_at, n.updated_at, b.name as book_name
     FROM notes n
     JOIN books b ON n.book_abbrev = b.abbrev
     ORDER BY n.updated_at DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    book_abbrev: row.book_abbrev,
    chapter: row.chapter,
    verse_number: row.verse_number,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    book_name: row.book_name,
  }));
}

export async function getNotesCountByChapter(
  db: SQLiteDatabase,
  bookAbbrev: string,
  chapter: number,
  version: string,
): Promise<Record<number, number>> {
  const rows = await db.getAllAsync<{ verse_number: number; count: number }>(
    `SELECT verse_number, COUNT(*) as count 
     FROM notes 
     WHERE book_abbrev = ? AND chapter = ? AND version = ?
     GROUP BY verse_number`,
    [bookAbbrev, chapter, version],
  );

  const counts: Record<number, number> = {};
  for (const row of rows) {
    counts[row.verse_number] = row.count;
  }
  return counts;
}

export async function getNotesOrderedByBible(
  db: SQLiteDatabase,
  version: string,
): Promise<NoteWithBookAndVerseText[]> {
  const rows = await db.getAllAsync<NoteWithBookAndVerseText>(
    `SELECT n.id, n.book_abbrev, n.chapter, n.verse_number, n.content, n.created_at, n.updated_at, 
            b.name as book_name, v.text as verse_text
     FROM notes n
     JOIN books b ON n.book_abbrev = b.abbrev
     LEFT JOIN verses v ON n.book_abbrev = v.book_abbrev 
                       AND n.chapter = v.chapter 
                       AND n.verse_number = v.verse_number 
                       AND v.version = ?
     ORDER BY b.rowid ASC, n.chapter ASC, n.verse_number ASC, n.created_at DESC`,
    [version.toLowerCase()],
  );

  return rows.map((row) => ({
    id: row.id,
    book_abbrev: row.book_abbrev,
    chapter: row.chapter,
    verse_number: row.verse_number,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    book_name: row.book_name,
    verse_text: row.verse_text,
  }));
}

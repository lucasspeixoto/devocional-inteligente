import { SQLiteDatabase } from "expo-sqlite";
import { LocalBook } from "@/types";

export async function updateBookComment(
  db: SQLiteDatabase,
  abbrev: string,
  comment: string,
): Promise<void> {
  await db.runAsync("UPDATE books SET comment = ? WHERE abbrev = ?", [
    comment,
    abbrev,
  ]);
}

export async function getAllBooks(db: SQLiteDatabase): Promise<LocalBook[]> {
  const rows = await db.getAllAsync<LocalBook>(
    "SELECT abbrev as abbrev_pt, name, author, group_name, chapters, testament, comment FROM books ORDER BY rowid",
  );
  return rows.map((row) => ({
    abbrev_pt: row.abbrev_pt,
    abbrev_en: row.abbrev_pt, // Defaulting en to pt since we only need the key
    name: row.name,
    author: row.author,
    chapters: row.chapters,
    group_name: row.group_name,
    testament: row.testament,
    comment: row.comment,
  }));
}

export async function getBookByAbbrev(
  db: SQLiteDatabase,
  abbrev: string,
): Promise<LocalBook | null> {
  const row = await db.getFirstAsync<LocalBook>(
    "SELECT abbrev as abbrev_pt, name, author, group_name, chapters, testament, comment FROM books WHERE abbrev = ? COLLATE NOCASE",
    [abbrev],
  );
  if (!row) return null;
  return {
    abbrev_pt: row.abbrev_pt,
    abbrev_en: row.abbrev_pt,
    name: row.name,
    author: row.author,
    chapters: row.chapters,
    group_name: row.group_name,
    testament: row.testament,
    comment: row.comment,
  };
}

export async function getBooksByTestament(
  db: SQLiteDatabase,
  testament: string,
): Promise<LocalBook[]> {
  const rows = await db.getAllAsync<LocalBook>(
    "SELECT abbrev as abbrev_pt, name, author, group_name, chapters, testament, comment FROM books WHERE testament = ?",
    [testament],
  );
  return rows.map((row) => ({
    abbrev_pt: row.abbrev_pt,
    abbrev_en: row.abbrev_pt,
    name: row.name,
    author: row.author,
    chapters: row.chapters,
    group_name: row.group_name,
    testament: row.testament,
    comment: row.comment,
  }));
}

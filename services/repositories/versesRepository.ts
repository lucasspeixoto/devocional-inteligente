import { SQLiteDatabase } from "expo-sqlite";
import { Verse, LocalVerse } from "@/types";

export async function insertChapterVerses(
  db: SQLiteDatabase,
  verses: Verse[],
  bookAbbrev: string,
  chapter: number,
  version: string,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    // Delete existing verses for this chapter & version
    await db.runAsync(
      "DELETE FROM verses WHERE book_abbrev = ? AND chapter = ? AND version = ?",
      [bookAbbrev, chapter, version],
    );

    // Insert new verses
    for (const verse of verses) {
      await db.runAsync(
        `INSERT INTO verses (book_abbrev, chapter, verse_number, text, version) 
         VALUES (?, ?, ?, ?, ?)`,
        [bookAbbrev, chapter, verse.number, verse.text, version],
      );
    }
  });
}

export async function getChapterVerses(
  db: SQLiteDatabase,
  bookAbbrev: string,
  chapter: number,
  version: string,
): Promise<LocalVerse[]> {
  const rows = await db.getAllAsync<LocalVerse>(
    `SELECT id, book_abbrev, chapter, verse_number, text, version 
     FROM verses 
     WHERE book_abbrev = ? AND chapter = ? AND version = ? 
     ORDER BY verse_number ASC`,
    [bookAbbrev, chapter, version],
  );
  return rows.map((row) => ({
    id: row.id,
    book_abbrev: row.book_abbrev,
    chapter: row.chapter,
    verse_number: row.verse_number,
    text: row.text,
    version: row.version,
  }));
}

export async function hasChapterCached(
  db: SQLiteDatabase,
  bookAbbrev: string,
  chapter: number,
  version: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count 
     FROM verses 
     WHERE book_abbrev = ? AND chapter = ? AND version = ?`,
    [bookAbbrev, chapter, version],
  );
  return (row?.count ?? 0) > 0;
}

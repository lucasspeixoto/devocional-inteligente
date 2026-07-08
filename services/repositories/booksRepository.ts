import { SQLiteDatabase } from "expo-sqlite";
import { Book, LocalBook } from "@/types";

export async function insertBooks(
  db: SQLiteDatabase,
  books: Book[],
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const book of books) {
      await db.runAsync(
        `INSERT INTO books (abbrev, name, author, group_name, chapters, testament, version) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(abbrev) DO UPDATE SET
           name = excluded.name,
           author = excluded.author,
           group_name = excluded.group_name,
           chapters = excluded.chapters,
           testament = excluded.testament`,
        [
          book.abbrev.pt,
          book.name,
          book.author,
          book.group,
          book.chapters,
          book.testament,
          "all",
        ],
      );
    }
  });
}

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
    "SELECT abbrev as abbrev_pt, name, author, group_name, chapters, testament, comment FROM books",
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
    "SELECT abbrev as abbrev_pt, name, author, group_name, chapters, testament, comment FROM books WHERE abbrev = ?",
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

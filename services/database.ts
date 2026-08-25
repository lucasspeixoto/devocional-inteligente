import * as SQLite from "expo-sqlite";
import {
  BIBLE_DATA_REVISION,
  BIBLE_VERSION,
  getBibleBooks,
  getBibleData,
} from "@/services/bibleData";

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync("bible_reader.db");
  }
  return databaseInstance;
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();

  // Create tables according to spec and design
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS books (
      abbrev TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      author TEXT,
      group_name TEXT,
      chapters INTEGER NOT NULL,
      testament TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT 'all',
      comment TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_books_testament ON books (testament);

    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_abbrev TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      text TEXT NOT NULL,
      version TEXT NOT NULL,
      FOREIGN KEY (book_abbrev) REFERENCES books (abbrev),
      UNIQUE(book_abbrev, chapter, verse_number, version)
    );

    CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses (book_abbrev, chapter, version);

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_abbrev TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      version TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_abbrev) REFERENCES books (abbrev)
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      selected_version TEXT NOT NULL DEFAULT 'nvi',
      theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
      last_book_abbrev TEXT,
      last_chapter INTEGER,
      last_verse INTEGER
    );

    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Initialize default preferences if empty
  const defaultPrefs = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM user_preferences WHERE id = 1",
  );
  if (!defaultPrefs) {
    await db.runAsync(
      `INSERT INTO user_preferences (id, selected_version, theme, last_book_abbrev, last_chapter, last_verse) 
       VALUES (1, 'nvi', 'light', NULL, NULL, NULL)`,
    );
  }

  await db.runAsync(
    "UPDATE user_preferences SET selected_version = ? WHERE id = 1 AND selected_version <> ?",
    [BIBLE_VERSION, BIBLE_VERSION],
  );

  await prepareOfflineBible(db);

  return db;
}

async function prepareOfflineBible(db: SQLite.SQLiteDatabase): Promise<void> {
  const current = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_metadata WHERE key = 'bible_data_revision'",
  );
  if (current?.value === BIBLE_DATA_REVISION) return;

  const data = getBibleData();
  const books = getBibleBooks();
  await db.withTransactionAsync(async () => {
    const legacyBooks = await db.getAllAsync<{
      abbrev: string;
      comment: string | null;
    }>("SELECT abbrev, comment FROM books");

    for (const book of books) {
      await db.runAsync(
        `INSERT INTO books (abbrev, name, author, group_name, chapters, testament, version)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(abbrev) DO UPDATE SET
           name = excluded.name,
           author = excluded.author,
           group_name = excluded.group_name,
           chapters = excluded.chapters,
           testament = excluded.testament,
           version = excluded.version`,
        [
          book.abbrev,
          book.name,
          book.author,
          book.group,
          book.chapters,
          book.testament,
          BIBLE_VERSION,
        ],
      );
    }

    const canonicalByKey = new Map(
      books.map((book) => [normalizeAbbrev(book.abbrev), book.abbrev]),
    );
    for (const legacyBook of legacyBooks) {
      const canonical = canonicalByKey.get(normalizeAbbrev(legacyBook.abbrev));
      if (!canonical || canonical === legacyBook.abbrev) continue;

      if (legacyBook.comment) {
        await db.runAsync(
          "UPDATE books SET comment = COALESCE(comment, ?) WHERE abbrev = ?",
          [legacyBook.comment, canonical],
        );
      }
      await db.runAsync(
        "UPDATE notes SET book_abbrev = ? WHERE book_abbrev = ?",
        [canonical, legacyBook.abbrev],
      );
      await db.runAsync(
        "UPDATE user_preferences SET last_book_abbrev = ? WHERE last_book_abbrev = ?",
        [canonical, legacyBook.abbrev],
      );
      await db.runAsync("DELETE FROM verses WHERE book_abbrev = ?", [
        legacyBook.abbrev,
      ]);
      await db.runAsync("DELETE FROM books WHERE abbrev = ?", [
        legacyBook.abbrev,
      ]);
    }

    await db.runAsync("DELETE FROM verses WHERE version = ?", [BIBLE_VERSION]);
    const rows: Array<[string, number, number, string, string]> = [];
    data.forEach((book) => {
      book.chapters.forEach((chapter, chapterIndex) => {
        chapter.forEach((text, verseIndex) => {
          rows.push([
            book.abbrev,
            chapterIndex + 1,
            verseIndex + 1,
            text,
            BIBLE_VERSION,
          ]);
        });
      });
    });

    const batchSize = 100;
    for (let offset = 0; offset < rows.length; offset += batchSize) {
      const batch = rows.slice(offset, offset + batchSize);
      const placeholders = batch.map(() => "(?, ?, ?, ?, ?)").join(", ");
      await db.runAsync(
        `INSERT INTO verses (book_abbrev, chapter, verse_number, text, version) VALUES ${placeholders}`,
        batch.flat(),
      );
    }

    await db.runAsync(
      `INSERT INTO app_metadata (key, value) VALUES ('bible_data_revision', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [BIBLE_DATA_REVISION],
    );
  });
}

function normalizeAbbrev(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

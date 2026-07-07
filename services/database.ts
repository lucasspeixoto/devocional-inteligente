import * as SQLite from 'expo-sqlite';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync('bible_reader.db');
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
  `);

  // Initialize default preferences if empty
  const defaultPrefs = await db.getFirstAsync<{ id: number }>('SELECT id FROM user_preferences WHERE id = 1');
  if (!defaultPrefs) {
    await db.runAsync(
      `INSERT INTO user_preferences (id, selected_version, theme, last_book_abbrev, last_chapter, last_verse) 
       VALUES (1, 'nvi', 'light', NULL, NULL, NULL)`
    );
  }

  return db;
}

import { SQLiteDatabase } from "expo-sqlite";
import { UserPreferences } from "@/types";

export async function getPreferences(
  db: SQLiteDatabase,
): Promise<UserPreferences> {
  const row = await db.getFirstAsync<UserPreferences>(
    "SELECT id, selected_version, theme, last_book_abbrev, last_chapter, last_verse FROM user_preferences WHERE id = 1",
  );
  if (!row) {
    return {
      id: 1,
      selected_version: "nvi",
      theme: "light",
      last_book_abbrev: null,
      last_chapter: null,
      last_verse: null,
    };
  }
  return row;
}

export async function setLastReadPosition(
  db: SQLiteDatabase,
  bookAbbrev: string | null,
  chapter: number | null,
  verse: number | null = null,
): Promise<void> {
  await db.runAsync(
    `UPDATE user_preferences 
     SET last_book_abbrev = ?, last_chapter = ?, last_verse = ? 
     WHERE id = 1`,
    [bookAbbrev, chapter, verse],
  );
}

export async function getSelectedVersion(db: SQLiteDatabase): Promise<string> {
  const row = await db.getFirstAsync<{ selected_version: string }>(
    "SELECT selected_version FROM user_preferences WHERE id = 1",
  );
  return row?.selected_version ?? "nvi";
}

export async function setSelectedVersion(
  db: SQLiteDatabase,
  version: string,
): Promise<void> {
  await db.runAsync(
    "UPDATE user_preferences SET selected_version = ? WHERE id = 1",
    [version],
  );
}

export async function getThemePreference(
  db: SQLiteDatabase,
): Promise<"light" | "dark"> {
  const row = await db.getFirstAsync<{ theme: "light" | "dark" }>(
    "SELECT theme FROM user_preferences WHERE id = 1",
  );
  return row?.theme ?? "light";
}

export async function setThemePreference(
  db: SQLiteDatabase,
  theme: "light" | "dark",
): Promise<void> {
  if (theme !== "light" && theme !== "dark") {
    throw new Error("Theme must be 'light' or 'dark'");
  }
  await db.runAsync("UPDATE user_preferences SET theme = ? WHERE id = 1", [
    theme,
  ]);
}

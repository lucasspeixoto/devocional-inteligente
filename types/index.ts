export interface BookAbbrev {
  pt: string;
  en: string;
}

export interface Book {
  abbrev: BookAbbrev;
  author: string;
  chapters: number;
  group: string;
  name: string;
  testament: string;
}

export interface BookDetails extends Book {
  comment: string | null;
}

export interface Verse {
  number: number;
  text: string;
}

export interface ChapterResponse {
  book: {
    abbrev: BookAbbrev;
    name: string;
    author: string;
    group: string;
    version: string;
  };
  chapter: {
    number: number;
    verses: number;
  };
  verses: Verse[];
}

export interface BibleVersion {
  version: string;
  verses: number;
}

export interface LocalBook {
  abbrev_pt: string;
  abbrev_en: string;
  name: string;
  author: string;
  chapters: number;
  group_name: string;
  testament: string;
  comment?: string | null;
}

export interface LocalVerse {
  id?: number;
  book_abbrev: string;
  chapter: number;
  verse_number: number;
  text: string;
  version: string;
}

export interface LocalNote {
  id: number;
  book_abbrev: string;
  chapter: number;
  verse_number: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: number;
  selected_version: string;
  theme: "light" | "dark";
  last_book_abbrev: string | null;
  last_chapter: number | null;
  last_verse: number | null;
}

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export interface NoteWithBookAndVerseText extends LocalNote {
  book_name: string;
  verse_text?: string | null;
}

import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { LocalVerse } from "@/types";
import { BIBLE_VERSION } from "@/types";
import { getChapterVerses } from "@/services/repositories/versesRepository";

export function useChapter(
  bookAbbrev: string | null,
  chapterNumber: number | null,
) {
  const db = useDatabase();
  const [verses, setVerses] = useState<LocalVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadChapter = useCallback(async () => {
    if (!bookAbbrev || !chapterNumber) {
      setVerses([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const localVerses = await getChapterVerses(
        db,
        bookAbbrev,
        chapterNumber,
        BIBLE_VERSION,
      );
      if (localVerses.length === 0)
        throw new Error(
          `Referência bíblica inválida: ${bookAbbrev} ${chapterNumber}.`,
        );
      setVerses(localVerses);
    } catch (e: unknown) {
      console.error(`Error loading chapter ${bookAbbrev} ${chapterNumber}:`, e);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [db, bookAbbrev, chapterNumber]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  return { verses, loading, error, reload: loadChapter };
}

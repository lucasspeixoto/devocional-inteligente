import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { LocalVerse } from "@/types";
import {
  getChapterVerses,
  hasChapterCached,
  insertChapterVerses,
} from "@/services/repositories/versesRepository";
import { getChapterVerses as fetchChapterVersesFromApi } from "@/services/api";

export function useChapter(
  bookAbbrev: string | null,
  chapterNumber: number | null,
  version: string,
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
      const isCached = await hasChapterCached(
        db,
        bookAbbrev,
        chapterNumber,
        version,
      );

      if (isCached) {
        const localVerses = await getChapterVerses(
          db,
          bookAbbrev,
          chapterNumber,
          version,
        );
        setVerses(localVerses);
      } else {
        // Clear verses immediately to show loading indicator during API fetch
        setVerses([]);

        // Fetch from API
        const apiResponse = await fetchChapterVersesFromApi(
          version,
          bookAbbrev,
          chapterNumber,
        );
        // Insert into local DB
        await insertChapterVerses(
          db,
          apiResponse.verses,
          bookAbbrev,
          chapterNumber,
          version,
        );
        // Load from local DB
        const localVerses = await getChapterVerses(
          db,
          bookAbbrev,
          chapterNumber,
          version,
        );
        setVerses(localVerses);
      }
    } catch (e: unknown) {
      console.error(`Error loading chapter ${bookAbbrev} ${chapterNumber}:`, e);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [db, bookAbbrev, chapterNumber, version]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  return { verses, loading, error, reload: loadChapter };
}

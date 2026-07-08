import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { LocalBook } from "@/types";
import {
  getAllBooks,
  insertBooks,
} from "@/services/repositories/booksRepository";
import { getBooks as fetchBooksFromApi } from "@/services/api";

export function useBooks() {
  const db = useDatabase();
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBooks = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      try {
        let localBooks = await getAllBooks(db);

        if (localBooks.length === 0 || forceRefresh) {
          // Fetch from API
          const apiBooks = await fetchBooksFromApi();
          // Insert into local DB
          await insertBooks(db, apiBooks);
          // Reload from local DB
          localBooks = await getAllBooks(db);
        }

        setBooks(localBooks);
      } catch (e: unknown) {
        console.error("Error loading books:", e);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    },
    [db],
  );

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const refresh = useCallback(() => {
    return loadBooks(true);
  }, [loadBooks]);

  return { books, loading, error, refresh };
}

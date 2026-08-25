import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { LocalBook } from "@/types";
import { getAllBooks } from "@/services/repositories/booksRepository";

export function useBooks() {
  const db = useDatabase();
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const localBooks = await getAllBooks(db);
      if (localBooks.length !== 66)
        throw new Error("O catálogo bíblico local está incompleto.");
      setBooks(localBooks);
    } catch (e: unknown) {
      console.error("Error loading books:", e);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const refresh = useCallback(() => {
    return loadBooks();
  }, [loadBooks]);

  return { books, loading, error, refresh };
}

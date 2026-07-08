import { Book, BookDetails, ChapterResponse, BibleVersion } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VERSIONS_CACHE_KEY = "@bible_versions_cache";

const BASE_URL = "https://www.abibliadigital.com.br";

async function apiFetch<T>(endpoint: string): Promise<T> {
  const token = process.env.EXPO_PUBLIC_ACCESS_TOKEN || "";

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Network errors (no internet, timeout)
    throw error;
  }

  if (!response.ok) {
    // Propagate HTTP error (401, 404, 500, etc.)
    const errorData = {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    };
    throw new Error(JSON.stringify(errorData));
  }

  return response.json();
}

export async function getBooks(): Promise<Book[]> {
  return apiFetch<Book[]>("/api/books");
}

export async function getBookDetails(abbrev: string): Promise<BookDetails> {
  return apiFetch<BookDetails>(`/api/books/${abbrev}`);
}

export async function getChapterVerses(
  version: string,
  abbrev: string,
  chapter: number,
): Promise<ChapterResponse> {
  return apiFetch<ChapterResponse>(
    `/api/verses/${version}/${abbrev}/${chapter}`,
  );
}

export async function getVersions(): Promise<BibleVersion[]> {
  try {
    const cachedVersions = await AsyncStorage.getItem(VERSIONS_CACHE_KEY);
    if (cachedVersions) {
      const parsed = JSON.parse(cachedVersions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read versions from cache:", e);
  }

  const versions = await apiFetch<BibleVersion[]>("/api/versions");

  try {
    if (versions && versions.length > 0) {
      await AsyncStorage.setItem(VERSIONS_CACHE_KEY, JSON.stringify(versions));
    }
  } catch (e) {
    console.error("Failed to save versions to cache:", e);
  }

  return versions;
}

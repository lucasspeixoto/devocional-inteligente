import nviJson from "@/databases/NVI.json";
import {
  BIBLE_VERSION,
  BIBLE_VERSION_LABEL,
  BibleJsonBook,
  Book,
  Verse,
} from "@/types";

export { BIBLE_VERSION, BIBLE_VERSION_LABEL };
export const BIBLE_DATA_REVISION = "nvi-2026-08-24-v1";

type CatalogEntry = Omit<Book, "chapters">;

const CATALOG: readonly CatalogEntry[] = [
  ["Gn", "Gênesis", "Moisés", "Pentateuco", "VT"],
  ["Êx", "Êxodo", "Moisés", "Pentateuco", "VT"],
  ["Lv", "Levítico", "Moisés", "Pentateuco", "VT"],
  ["Nm", "Números", "Moisés", "Pentateuco", "VT"],
  ["Dt", "Deuteronômio", "Moisés", "Pentateuco", "VT"],
  ["Js", "Josué", "Josué", "Históricos", "VT"],
  ["Jz", "Juízes", "Desconhecido", "Históricos", "VT"],
  ["Rt", "Rute", "Desconhecido", "Históricos", "VT"],
  ["1Sm", "1 Samuel", "Samuel e outros", "Históricos", "VT"],
  ["2Sm", "2 Samuel", "Samuel e outros", "Históricos", "VT"],
  ["1Rs", "1 Reis", "Desconhecido", "Históricos", "VT"],
  ["2Rs", "2 Reis", "Desconhecido", "Históricos", "VT"],
  ["1Cr", "1 Crônicas", "Esdras", "Históricos", "VT"],
  ["2Cr", "2 Crônicas", "Esdras", "Históricos", "VT"],
  ["Ed", "Esdras", "Esdras", "Históricos", "VT"],
  ["Ne", "Neemias", "Neemias", "Históricos", "VT"],
  ["Et", "Ester", "Desconhecido", "Históricos", "VT"],
  ["Jó", "Jó", "Desconhecido", "Poéticos", "VT"],
  ["Sl", "Salmos", "Diversos", "Poéticos", "VT"],
  ["Pv", "Provérbios", "Salomão e outros", "Poéticos", "VT"],
  ["Ec", "Eclesiastes", "Salomão", "Poéticos", "VT"],
  ["Ct", "Cânticos", "Salomão", "Poéticos", "VT"],
  ["Is", "Isaías", "Isaías", "Profetas Maiores", "VT"],
  ["Jr", "Jeremias", "Jeremias", "Profetas Maiores", "VT"],
  ["Lm", "Lamentações", "Jeremias", "Profetas Maiores", "VT"],
  ["Ez", "Ezequiel", "Ezequiel", "Profetas Maiores", "VT"],
  ["Dn", "Daniel", "Daniel", "Profetas Maiores", "VT"],
  ["Os", "Oséias", "Oséias", "Profetas Menores", "VT"],
  ["Jl", "Joel", "Joel", "Profetas Menores", "VT"],
  ["Am", "Amós", "Amós", "Profetas Menores", "VT"],
  ["Ob", "Obadias", "Obadias", "Profetas Menores", "VT"],
  ["Jn", "Jonas", "Jonas", "Profetas Menores", "VT"],
  ["Mq", "Miquéias", "Miquéias", "Profetas Menores", "VT"],
  ["Na", "Naum", "Naum", "Profetas Menores", "VT"],
  ["Hc", "Habacuque", "Habacuque", "Profetas Menores", "VT"],
  ["Sf", "Sofonias", "Sofonias", "Profetas Menores", "VT"],
  ["Ag", "Ageu", "Ageu", "Profetas Menores", "VT"],
  ["Zc", "Zacarias", "Zacarias", "Profetas Menores", "VT"],
  ["Ml", "Malaquias", "Malaquias", "Profetas Menores", "VT"],
  ["Mt", "Mateus", "Mateus", "Evangelhos", "NT"],
  ["Mc", "Marcos", "Marcos", "Evangelhos", "NT"],
  ["Lc", "Lucas", "Lucas", "Evangelhos", "NT"],
  ["Jo", "João", "João", "Evangelhos", "NT"],
  ["At", "Atos", "Lucas", "Históricos", "NT"],
  ["Rm", "Romanos", "Paulo", "Cartas de Paulo", "NT"],
  ["1Co", "1 Coríntios", "Paulo", "Cartas de Paulo", "NT"],
  ["2Co", "2 Coríntios", "Paulo", "Cartas de Paulo", "NT"],
  ["Gl", "Gálatas", "Paulo", "Cartas de Paulo", "NT"],
  ["Ef", "Efésios", "Paulo", "Cartas de Paulo", "NT"],
  ["Fp", "Filipenses", "Paulo", "Cartas de Paulo", "NT"],
  ["Cl", "Colossenses", "Paulo", "Cartas de Paulo", "NT"],
  ["1Ts", "1 Tessalonicenses", "Paulo", "Cartas de Paulo", "NT"],
  ["2Ts", "2 Tessalonicenses", "Paulo", "Cartas de Paulo", "NT"],
  ["1Tm", "1 Timóteo", "Paulo", "Cartas de Paulo", "NT"],
  ["2Tm", "2 Timóteo", "Paulo", "Cartas de Paulo", "NT"],
  ["Tt", "Tito", "Paulo", "Cartas de Paulo", "NT"],
  ["Fm", "Filemom", "Paulo", "Cartas de Paulo", "NT"],
  ["Hb", "Hebreus", "Desconhecido", "Cartas Gerais", "NT"],
  ["Tg", "Tiago", "Tiago", "Cartas Gerais", "NT"],
  ["1Pe", "1 Pedro", "Pedro", "Cartas Gerais", "NT"],
  ["2Pe", "2 Pedro", "Pedro", "Cartas Gerais", "NT"],
  ["1Jo", "1 João", "João", "Cartas Gerais", "NT"],
  ["2Jo", "2 João", "João", "Cartas Gerais", "NT"],
  ["3Jo", "3 João", "João", "Cartas Gerais", "NT"],
  ["Jd", "Judas", "Judas", "Cartas Gerais", "NT"],
  ["Ap", "Apocalipse", "João", "Profecia", "NT"],
].map(([abbrev, name, author, group, testament]) => ({
  abbrev,
  name,
  author,
  group,
  testament,
})) as CatalogEntry[];

export class BibleDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BibleDataError";
  }
}

export function validateBibleData(value: unknown): BibleJsonBook[] {
  if (!Array.isArray(value) || value.length !== 66) {
    throw new BibleDataError(
      "A base NVI local deve conter exatamente 66 livros.",
    );
  }
  const seen = new Set<string>();
  return value.map((item, bookIndex) => {
    if (!item || typeof item !== "object")
      throw new BibleDataError(`Livro inválido na posição ${bookIndex + 1}.`);
    const book = item as Partial<BibleJsonBook>;
    if (
      typeof book.abbrev !== "string" ||
      !book.abbrev.trim() ||
      !Array.isArray(book.chapters) ||
      book.chapters.length === 0
    ) {
      throw new BibleDataError(`Estrutura inválida no livro ${bookIndex + 1}.`);
    }
    const key = book.abbrev.toLocaleLowerCase("pt-BR");
    if (seen.has(key))
      throw new BibleDataError(`Abreviação duplicada: ${book.abbrev}.`);
    seen.add(key);
    book.chapters.forEach((chapter, chapterIndex) => {
      if (
        !Array.isArray(chapter) ||
        chapter.length === 0 ||
        chapter.some((verse) => typeof verse !== "string" || !verse.trim())
      ) {
        throw new BibleDataError(
          `Capítulo inválido em ${book.abbrev} ${chapterIndex + 1}.`,
        );
      }
    });
    return book as BibleJsonBook;
  });
}

let cachedData: BibleJsonBook[] | null = null;
export function getBibleData(): BibleJsonBook[] {
  cachedData ??= validateBibleData(nviJson);
  const dataKeys = cachedData.map((book) =>
    book.abbrev.toLocaleLowerCase("pt-BR"),
  );
  const catalogKeys = CATALOG.map((book) =>
    book.abbrev.toLocaleLowerCase("pt-BR"),
  );
  if (dataKeys.some((key, index) => key !== catalogKeys[index]))
    throw new BibleDataError(
      "O catálogo local não corresponde à ordem da base NVI.",
    );
  return cachedData;
}

export function getBibleBooks(): Book[] {
  const data = getBibleData();
  return CATALOG.map((book, index) => ({
    ...book,
    chapters: data[index].chapters.length,
  }));
}

export function getBibleBook(abbrev: string): Book | null {
  return (
    getBibleBooks().find(
      (book) =>
        book.abbrev.toLocaleLowerCase("pt-BR") ===
        abbrev.toLocaleLowerCase("pt-BR"),
    ) ?? null
  );
}

export function getBibleChapter(abbrev: string, chapter: number): Verse[] {
  const data = getBibleData();
  const book = data.find(
    (item) =>
      item.abbrev.toLocaleLowerCase("pt-BR") ===
      abbrev.toLocaleLowerCase("pt-BR"),
  );
  if (
    !book ||
    !Number.isInteger(chapter) ||
    chapter < 1 ||
    chapter > book.chapters.length
  ) {
    throw new BibleDataError(
      `Referência bíblica inválida: ${abbrev} ${chapter}.`,
    );
  }
  return book.chapters[chapter - 1].map((text, index) => ({
    number: index + 1,
    text,
  }));
}

export function getBibleStats() {
  const data = getBibleData();
  return {
    books: data.length,
    chapters: data.reduce((total, book) => total + book.chapters.length, 0),
    verses: data.reduce(
      (total, book) =>
        total + book.chapters.reduce((sum, chapter) => sum + chapter.length, 0),
      0,
    ),
  };
}

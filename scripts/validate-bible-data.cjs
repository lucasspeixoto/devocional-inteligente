const bible = require("../databases/NVI.json");

const expectedAbbreviations = [
  "Gn",
  "Êx",
  "Lv",
  "Nm",
  "Dt",
  "Js",
  "Jz",
  "Rt",
  "1Sm",
  "2Sm",
  "1Rs",
  "2Rs",
  "1Cr",
  "2Cr",
  "Ed",
  "Ne",
  "Et",
  "Jó",
  "Sl",
  "Pv",
  "Ec",
  "Ct",
  "Is",
  "Jr",
  "Lm",
  "Ez",
  "Dn",
  "Os",
  "Jl",
  "Am",
  "Ob",
  "Jn",
  "Mq",
  "Na",
  "Hc",
  "Sf",
  "Ag",
  "Zc",
  "Ml",
  "Mt",
  "Mc",
  "Lc",
  "Jo",
  "At",
  "Rm",
  "1Co",
  "2Co",
  "Gl",
  "Ef",
  "Fp",
  "Cl",
  "1Ts",
  "2Ts",
  "1Tm",
  "2Tm",
  "Tt",
  "Fm",
  "Hb",
  "Tg",
  "1Pe",
  "2Pe",
  "1Jo",
  "2Jo",
  "3Jo",
  "Jd",
  "Ap",
];

if (!Array.isArray(bible) || bible.length !== 66)
  throw new Error("A base NVI deve conter 66 livros.");
let chapters = 0;
let verses = 0;
const seen = new Set();
bible.forEach((book, bookIndex) => {
  if (book.abbrev !== expectedAbbreviations[bookIndex])
    throw new Error(`Livro fora de ordem na posição ${bookIndex + 1}.`);
  const key = book.abbrev.toLocaleLowerCase("pt-BR");
  if (seen.has(key)) throw new Error(`Abreviação duplicada: ${book.abbrev}.`);
  seen.add(key);
  if (!Array.isArray(book.chapters) || book.chapters.length === 0)
    throw new Error(`Livro sem capítulos: ${book.abbrev}.`);
  chapters += book.chapters.length;
  book.chapters.forEach((chapter, chapterIndex) => {
    if (!Array.isArray(chapter) || chapter.length === 0)
      throw new Error(`Capítulo vazio: ${book.abbrev} ${chapterIndex + 1}.`);
    chapter.forEach((verse, verseIndex) => {
      if (typeof verse !== "string" || !verse.trim())
        throw new Error(
          `Versículo inválido: ${book.abbrev} ${chapterIndex + 1}:${verseIndex + 1}.`,
        );
      verses += 1;
    });
  });
});

if (bible[0].chapters[0][0] !== "No princípio Deus criou os céus e a terra.")
  throw new Error("Gênesis 1:1 não corresponde à NVI esperada.");
if (bible.at(-1).chapters.length !== 22)
  throw new Error("Apocalipse deve terminar no capítulo 22.");

process.stdout.write(
  `NVI válida: ${bible.length} livros, ${chapters} capítulos, ${verses} versículos.\n`,
);

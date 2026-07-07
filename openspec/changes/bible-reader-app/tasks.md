## 1. Setup e Dependências

- [x] 1.1 Instalar dependências: `expo-sqlite` para banco de dados local
- [x] 1.2 Criar estrutura de diretórios: `constants/`, `services/`, `services/repositories/`, `types/`, `contexts/`, `hooks/`, `components/`, `components/ui/`
- [x] 1.3 Criar arquivo de tipos TypeScript em `types/index.ts` com interfaces para Book, Verse, Chapter, Note, Preference, Version e respostas da API

## 2. Sistema de Temas

- [x] 2.1 Criar constantes de cores e temas em `constants/theme.ts` com paletas light (marrom `#6B4226`, amarelo `#D4A017`, fundo creme `#FFF8F0`) e dark (marrom claro `#A67B5B`, amarelo `#E8B830`, fundo `#1A1210`), incluindo tokens semânticos (primary, secondary, background, surface, text, textSecondary, border, accent)
- [x] 2.2 Criar `contexts/ThemeContext.tsx` com ThemeProvider, estado do tema (light/dark), função `toggleTheme`, hook `useTheme()` que retorna `{ colors, isDark, toggleTheme }`, e integração com preferências do banco de dados
- [x] 2.3 Definir escala tipográfica em `constants/typography.ts` com estilos: heading1, heading2, body, bodySmall, label, verseNumber — sem cores fixas, apenas tamanhos e pesos

## 3. Serviço de API da Bíblia

- [x] 3.1 Criar `services/api.ts` com cliente HTTP usando `fetch` nativo, base URL `https://www.abibliadigital.com.br`, header `Authorization: Bearer ${EXPO_PUBLIC_ACCESS_TOKEN}`, e tratamento de erros (rede, 4xx, 5xx)
- [x] 3.2 Implementar funções: `getBooks()`, `getBookDetails(abbrev)`, `getChapterVerses(version, abbrev, chapter)`, `getVersions()` — todas tipadas com interfaces TypeScript

## 4. Banco de Dados Local (SQLite)

- [x] 4.1 Criar `services/database.ts` com inicialização do banco via `expo-sqlite`, criação das tabelas (books, verses, notes, preferences) com schema definido no design, e função `initDatabase()`
- [x] 4.2 Criar `services/repositories/booksRepository.ts` com funções: `insertBooks(books[])`, `getAllBooks()`, `getBookByAbbrev(abbrev)`, `getBooksByTestament(testament)` — com upsert on conflict
- [x] 4.3 Criar `services/repositories/versesRepository.ts` com funções: `insertChapterVerses(verses[], bookAbbrev, chapter, version)`, `getChapterVerses(bookAbbrev, chapter, version)`, `hasChapterCached(bookAbbrev, chapter, version)`
- [x] 4.4 Criar `services/repositories/notesRepository.ts` com funções: `createNote(bookAbbrev, chapter, verseNumber, content)`, `updateNote(id, content)`, `deleteNote(id)`, `getNotesByVerse(bookAbbrev, chapter, verseNumber)`, `getAllNotes()`
- [x] 4.5 Criar `services/repositories/preferencesRepository.ts` com funções: `getPreference(key)`, `setPreference(key, value)`, `getLastReadPosition()`, `setLastReadPosition(bookAbbrev, chapter)`, `getSelectedVersion()`, `setSelectedVersion(version)`, `getThemePreference()`, `setThemePreference(theme)`

## 5. Contextos e Hooks

- [x] 5.1 Criar `contexts/DatabaseContext.tsx` com DatabaseProvider que inicializa o banco no mount, expõe instância db via context, e mostra splash screen até banco estar pronto
- [x] 5.2 Criar `hooks/useBooks.ts` — hook que busca livros do SQLite (ou sincroniza da API se vazio), retorna `{ books, loading, error, refresh }`
- [x] 5.3 Criar `hooks/useChapter.ts` — hook que busca versículos de um capítulo do SQLite (ou da API se não cacheado), retorna `{ verses, chapter, loading, error }`
- [x] 5.4 Criar `hooks/useNotes.ts` — hook para CRUD de anotações de um versículo, retorna `{ notes, addNote, updateNote, deleteNote, loading }`
- [x] 5.5 Criar `hooks/useSettings.ts` — hook para ler/atualizar preferências (versão da Bíblia selecionada), retorna `{ version, setVersion, versions, loading }`

## 6. Componentes UI Base

- [x] 6.1 Criar `components/ui/Card.tsx` — componente card estilizado com sombra, bordas arredondadas, respeitando o tema ativo
- [x] 6.2 Criar `components/ui/LoadingIndicator.tsx` — indicador de carregamento animado com cores do tema
- [x] 6.3 Criar `components/ui/ErrorState.tsx` — componente de estado de erro com mensagem e botão "Tentar novamente"
- [x] 6.4 Criar `components/ui/EmptyState.tsx` — componente para estados vazios com ícone e mensagem

## 7. Navegação (Expo Router)

- [x] 7.1 Reestruturar `app/_layout.tsx` como Root Layout: envelopar com `DatabaseProvider` e `ThemeProvider`, configurar splash screen, aplicar cores do tema ao status bar
- [x] 7.2 Criar `app/(tabs)/_layout.tsx` com TabNavigator de 3 tabs: Leitura (ícone book-open), Livros (ícone library), Configurações (ícone settings) — com estilização usando cores do tema (marrom/amarelo)
- [x] 7.3 Criar estrutura de rotas: `app/(tabs)/index.tsx`, `app/(tabs)/books/_layout.tsx`, `app/(tabs)/books/index.tsx`, `app/(tabs)/books/[abbrev].tsx`, `app/(tabs)/settings.tsx`
- [x] 7.4 Criar rota de leitura fora das tabs: `app/reading/[abbrev]/[chapter].tsx`

## 8. Tela Home / Leitura (Tab 1)

- [x] 8.1 Implementar `app/(tabs)/index.tsx` — tela inicial que exibe o último capítulo lido (restaurado do SQLite), com cabeçalho mostrando nome do livro e número do capítulo, botão para abrir tela de leitura completa
- [x] 8.2 Implementar lógica de primeiro acesso: se não há posição salva, redirecionar para Gênesis capítulo 1
- [x] 8.3 Adicionar animações de entrada (fade-in) usando Reanimated nos elementos da tela

## 9. Tela de Leitura com Swipe

- [x] 9.1 Implementar `app/reading/[abbrev]/[chapter].tsx` — tela de leitura com ScrollView vertical para versículos, cabeçalho com nome do livro e capítulo
- [x] 9.2 Implementar navegação por swipe horizontal usando `Gesture.Pan()` do react-native-gesture-handler com Reanimated: swipe esquerda → próximo capítulo, swipe direita → capítulo anterior, com animação de translateX e spring
- [x] 9.3 Implementar tratamento de limites: bloquear swipe antes de Gênesis 1 e após último capítulo de Apocalipse, com feedback háptico (expo-haptics) nos limites
- [x] 9.4 Salvar posição de leitura no SQLite ao navegar entre capítulos
- [x] 9.5 Implementar reset de scroll para o topo ao trocar de capítulo
- [x] 9.6 Adicionar indicador visual de versículos que possuem anotações (ícone pequeno ao lado do número do versículo)
- [x] 9.7 Implementar modal/bottom sheet para criar/editar anotação ao pressionar longamente um versículo

## 10. Tela de Livros (Tab 2)

- [x] 10.1 Implementar `app/(tabs)/books/index.tsx` — listagem de livros agrupados por grupo (Pentateuco, Históricos, etc.) usando SectionList, com cabeçalhos de seção estilizados
- [x] 10.2 Implementar filtro por testamento (VT/NT/Todos) com toggle buttons no topo
- [x] 10.3 Implementar busca de livros por nome/abreviação com campo de texto e filtro em tempo real
- [x] 10.4 Adicionar animações de entrada stagger na listagem usando Reanimated

## 11. Tela de Detalhes do Livro

- [x] 11.1 Implementar `app/(tabs)/books/[abbrev].tsx` — exibição dos detalhes do livro (nome, autor, grupo, testamento, número de capítulos, comentário), com dados buscados da API e cacheados no SQLite
- [x] 11.2 Implementar grade de capítulos (grid) para navegação direta a um capítulo específico, redirecionando para a tela de leitura
- [x] 11.3 Adicionar estados de carregamento e erro

## 12. Tela de Configurações (Tab 3)

- [x] 12.1 Implementar `app/(tabs)/settings.tsx` — toggle switch para alternar tema (light/dark) com animação de transição, e seletor de versão da Bíblia (lista das versões da API: acf, apee, bbe, kjv, nvi, ra, rvr)
- [x] 12.2 Implementar persistência imediata das configurações no SQLite ao alterar
- [x] 12.3 Definir valores padrão: tema light, versão nvi
- [x] 12.4 Implementar aplicação imediata das mudanças (tema muda em todas as telas, versão recarrega os versículos da versão selecionada)

## 13. Sincronização de Dados

- [x] 13.1 Implementar sincronização inicial de livros na primeira abertura do app (buscar `/api/books` e salvar no SQLite)
- [x] 13.2 Implementar sincronização sob demanda de capítulos: ao abrir um capítulo que não existe no SQLite para a versão selecionada, buscar da API e cachear
- [x] 13.3 Implementar tratamento de falha de sincronização com tela de erro e botão "Tentar novamente"

## 14. Polimento e Animações

- [x] 14.1 Adicionar animações de transição entre telas usando Reanimated (fade, slide)
- [x] 14.2 Implementar feedback visual de press em itens tocáveis (scale down com spring)
- [x] 14.3 Verificar e respeitar preferência "Reduzir Movimento" do sistema operacional
- [x] 14.4 Testar e ajustar contraste WCAG AA em ambos os temas
- [x] 14.5 Revisar e ajustar responsividade em diferentes tamanhos de tela

## Context

O projeto "Devocional Inteligente" é um app React Native com Expo SDK 54 usando Expo Router v6 para navegação baseada em arquivos. O projeto atual é um scaffold vazio com apenas `app/_layout.tsx` (Stack) e `app/index.tsx` (placeholder). As dependências base já incluem `react-native-gesture-handler`, `react-native-reanimated`, `@expo/vector-icons`, e `expo-haptics`.

A aplicação precisa se integrar com a API da Bíblia Digital (`abibliadigital.com.br`) para buscar dados e armazená-los localmente via SQLite. Toda a leitura ocorre a partir do banco local — a API é usada apenas para sincronização de dados.

**Restrições:**
- Expo SDK 54 / React Native 0.81
- Expo Router v6 (file-based routing)
- TypeScript strict mode
- Dados locais via SQLite (expo-sqlite)
- Token de autenticação via `EXPO_PUBLIC_ACCESS_TOKEN`

## Goals / Non-Goals

**Goals:**
- Criar um app de leitura bíblica com UX premium e intuitiva
- Armazenamento local completo via SQLite para uso offline após sincronização
- Navegação por gestos entre capítulos (swipe)
- Sistema de anotações vinculadas a versículos
- Temas light/dark com paleta marrom/amarelo
- Múltiplas versões da Bíblia selecionáveis

**Non-Goals:**
- Busca textual avançada (full-text search) nos versículos
- Sistema de favoritos/marcadores separado das anotações
- Compartilhamento social de versículos
- Notificações push com versículo do dia
- Sistema de planos de leitura
- Autenticação de usuário / sincronização em nuvem
- Suporte offline total (primeira carga requer internet)

## Decisions

### 1. Arquitetura de Navegação: Expo Router com Tabs + Stack

**Decisão:** Usar Expo Router v6 com layout de tabs (3 tabs: Leitura, Livros, Configurações) e stacks aninhadas para navegação interna.

**Estrutura de rotas:**
```
app/
  _layout.tsx          → Root layout (providers: Theme, Database)
  (tabs)/
    _layout.tsx        → Tab navigator (3 tabs)
    index.tsx          → Tab 1: Tela de Leitura (Home)
    books/
      _layout.tsx      → Stack para navegação de livros
      index.tsx        → Tab 2: Listagem de livros
      [abbrev].tsx     → Detalhes do livro
    settings.tsx       → Tab 3: Configurações
  reading/
    [abbrev]/
      [chapter].tsx    → Tela de leitura de capítulo (fora das tabs)
```

**Alternativa considerada:** Single Stack com navegação manual. Rejeitada por ser menos intuitiva e não oferecer tabs persistentes.

**Rationale:** Tabs são o padrão para apps de leitura/referência. O Expo Router v6 suporta nativamente grupos de rotas `(tabs)` com file-based routing.

### 2. Armazenamento: expo-sqlite com ORM leve

**Decisão:** Usar `expo-sqlite` diretamente com um módulo de acesso a dados customizado (repository pattern), sem ORM externo.

**Schema do banco:**
```sql
-- Livros da Bíblia
CREATE TABLE books (
  abbrev_pt TEXT PRIMARY KEY,
  abbrev_en TEXT NOT NULL,
  name TEXT NOT NULL,
  author TEXT,
  chapters INTEGER NOT NULL,
  group_name TEXT NOT NULL,
  testament TEXT NOT NULL,
  comment TEXT
);

-- Versículos
CREATE TABLE verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_abbrev TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  version TEXT NOT NULL,
  FOREIGN KEY (book_abbrev) REFERENCES books(abbrev_pt),
  UNIQUE(book_abbrev, chapter, verse_number, version)
);

-- Anotações
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_abbrev TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (book_abbrev) REFERENCES books(abbrev_pt)
);

-- Preferências do usuário
CREATE TABLE preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

**Alternativa considerada:** Drizzle ORM ou WatermelonDB. Rejeitados — Drizzle adiciona complexidade desnecessária para um schema simples; WatermelonDB é overkill para dados unidirecionais da API.

**Rationale:** O schema é pequeno e bem definido. Um repository pattern simples mantém o código organizado sem overhead de ORM.

### 3. Estratégia de Sincronização: Lazy Loading com Cache

**Decisão:** Sincronização sob demanda (lazy) — dados são buscados da API quando o usuário acessa um livro/capítulo pela primeira vez, e então armazenados no SQLite. Livros são sincronizados na primeira abertura do app.

**Fluxo:**
1. Primeiro launch → busca `/api/books` → salva no SQLite
2. Usuário abre um capítulo → verifica se existe no SQLite para a versão selecionada
3. Se não existe → busca da API → salva localmente
4. Próximos acessos → lê do SQLite

**Alternativa considerada:** Sincronização completa na primeira abertura (todos os versículos). Rejeitada — seriam ~31.000 requisições individuais ou dados muito grandes, inviável.

**Rationale:** Lazy loading oferece primeira abertura rápida e download incremental conforme o uso real.

### 4. Navegação por Gestos: react-native-gesture-handler + Reanimated

**Decisão:** Usar `react-native-gesture-handler` com `GestureDetector` (API v2) combinado com `react-native-reanimated` para animação fluida de swipe entre capítulos.

**Implementação:**
- `Gesture.Pan()` para detectar swipe horizontal
- Shared values do Reanimated para controlar translateX da view
- Threshold de 100px para ativar navegação
- Animação de spring para transição suave
- Prevenção de conflito com scroll vertical

**Alternativa considerada:** FlatList horizontal com paginação. Rejeitada — necessitaria pré-carregar capítulos adjacentes e a UX de scroll vs page seria ambígua.

### 5. Sistema de Temas: React Context + Reanimated

**Decisão:** Context API do React para gerenciar o tema ativo, com `useAnimatedStyle` do Reanimated para transições suaves entre temas.

**Paleta de cores:**

| Token | Light | Dark |
|-------|-------|------|
| primary | `#6B4226` (marrom) | `#A67B5B` (marrom claro) |
| primaryLight | `#8B6914` | `#C4956A` |
| secondary | `#D4A017` (amarelo ouro) | `#E8B830` (amarelo) |
| secondaryLight | `#F0C75E` | `#F5D76E` |
| background | `#FFF8F0` (creme) | `#1A1210` (marrom escuro) |
| surface | `#FFFFFF` | `#2D2220` |
| text | `#2C1810` | `#F5E6D3` |
| textSecondary | `#6B5B4F` | `#B8A99E` |
| border | `#E8D5C4` | `#3D2E24` |
| accent | `#8B4513` | `#CD853F` |

**Rationale:** Context é simples e suficiente. Reanimated permite transição animada entre temas sem re-render completo.

### 6. Estrutura de Código: Feature-based

**Decisão:** Organização por feature/domínio, não por tipo de arquivo.

```
app/                   → Rotas (Expo Router)
components/            → Componentes reutilizáveis
  ui/                  → Componentes base (Button, Card, etc.)
constants/             → Cores, temas, configurações
hooks/                 → Custom hooks
services/
  api.ts               → Cliente HTTP para API da Bíblia
  database.ts          → Inicialização e helpers do SQLite
  repositories/        → Repositórios de dados (books, verses, notes, preferences)
types/                 → Interfaces TypeScript
contexts/              → React Contexts (theme, database)
```

### 7. Cliente HTTP: Fetch API nativa

**Decisão:** Usar `fetch` nativo do React Native com wrapper customizado para auth e error handling. Sem Axios ou outra lib.

**Rationale:** O app faz poucas chamadas simples (GET only). `fetch` é nativo, não adiciona dependência, e é suficiente para o caso de uso.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| API da Bíblia Digital fora do ar durante primeiro uso | Mostrar tela de erro com botão "Tentar novamente". App requer internet na primeira sincronização de cada capítulo. |
| Volume de dados no SQLite (31k+ versículos ao longo do tempo) | Lazy loading por capítulo. Índices nas colunas mais consultadas. |
| Swipe horizontal conflitando com scroll vertical | `activeOffsetX` com threshold para distinguir gestos. Swipe só ativa se deslocamento X > Y. |
| Token da API exposto no .env do cliente | Risco aceito — a API é pública e o token é de leitura. EXPO_PUBLIC_ é por design exposto ao cliente. |
| Mudança na API da Bíblia Digital sem aviso | Tipagem forte nos responses. Tratamento de erro gracioso com fallback para dados locais já cacheados. |

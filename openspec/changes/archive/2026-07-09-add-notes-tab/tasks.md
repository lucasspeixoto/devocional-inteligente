## 1. Banco de Dados e Repositórios

- [x] 1.1 Criar a função `getNotesOrderedByBible(db, version)` no repositório `services/repositories/notesRepository.ts` utilizando INNER JOIN com `books` (ordenando por `rowid` do SQLite) e LEFT JOIN com `verses` para recuperar o texto bíblico.
- [x] 1.2 Declarar e exportar a interface `NoteWithBookAndVerseText` em `types/index.ts` estendendo os campos de `LocalNote` com as propriedades `book_name` e `verse_text` opcionais.

## 2. Rota de Navegação (Tabs)

- [x] 2.1 Adicionar a rota `notes` no layout de abas do arquivo `app/(tabs)/_layout.tsx` posicionada antes da aba de `settings` (Configurações).
- [x] 2.2 Configurar o ícone `document-text` para o estado ativo e `document-text-outline` para o estado inativo na barra de navegação, utilizando as cores corretas do tema do app.
- [x] 2.3 Criar o arquivo de tela correspondente em `app/(tabs)/notes.tsx`.

## 3. Tela de Diário de Anotações (UI & UX)

- [x] 3.1 Desenvolver a tela em `app/(tabs)/notes.tsx` importando os hooks de tema, safe area insets e banco de dados.
- [x] 3.2 Implementar o carregamento reativo da lista de anotações usando `useFocusEffect` do `expo-router` de forma que as notas se atualizem sempre que o usuário retornar a esta tab.
- [x] 3.3 Criar uma lógica para agrupar as anotações no front-end por Livro e depois por Versículo (ou capítulo/versículo) para exibição organizada em seções.
- [x] 3.4 Implementar o estado vazio (Empty State) utilizando o componente `EmptyState` se a lista de anotações retornar vazia, com um botão ou texto direcionando o usuário a ler a Bíblia.
- [x] 3.5 Implementar a ação de clique nas notas: redirecionar para a tela de leitura `app/reading/[abbrev]/[chapter]` utilizando `router.push` e atualizando a última posição de leitura no SQLite.
- [x] 3.6 Estilizar o visual respeitando as cores e tipografia globais: cabeçalho do livro, box do versículo em itálico e o texto do usuário formatado em um Card com suporte a modo escuro e claro.

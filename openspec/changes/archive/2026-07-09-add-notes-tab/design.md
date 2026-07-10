## Context

A implementação atual do banco de dados suporta anotações por versículo na tabela `notes`, que armazena a abreviação do livro, capítulo, versículo e o conteúdo textual. No entanto, para recuperar todas as anotações organizadas pela ordem dos livros da Bíblia (Gênesis a Apocalipse), a ordenação padrão alfabética das abreviações de livros falharia (ex: "ap" viria antes de "gn").
Precisamos garantir que a listagem de anotações use uma junção com a tabela `books` para ordenar as anotações com base na ordem canônica de inserção dos livros (ou ordem física dos livros no banco).

Além disso, adicionaremos uma nova aba de navegação de nível superior (`app/(tabs)/notes.tsx`) que precisará ler as anotações do banco de dados e atualizar de forma reativa sempre que a tela for focada (usando hooks como `useFocusEffect` do React Navigation).

## Goals / Non-Goals

**Goals:**
- Prover uma tela centralizada que exiba todas as anotações organizadas pela ordem canônica da Bíblia.
- Permitir navegação rápida para o texto bíblico clicando na anotação.
- Otimizar a query SQL para carregar todas as anotações com junção para obter os nomes corretos dos livros e manter a ordenação correta.

**Non-Goals:**
- Criar novos fluxos de edição ou exclusão de anotações diretamente nesta lista (exclusão e edição continuam sendo feitas no modal de leitura por questão de simplificação de escopo, embora seja possível navegar até lá).
- Adicionar filtros complexos de busca textual nesta primeira iteração.

## Decisions

### 1. Estrutura da Query SQL para Ordenação Bíblica
Para ordenar as anotações de acordo com a Bíblia, não podemos ordenar apenas por `book_abbrev` alfabeticamente. Devemos fazer uma junção (JOIN) com a tabela `books` e ordenar pelo ID do livro (ou ordem canônica de inserção). No nosso schema atual:
```sql
CREATE TABLE IF NOT EXISTS books (
  abbrev_pt TEXT PRIMARY KEY,
  ...
);
```
Como a tabela `books` foi populada na primeira sincronização seguindo a ordem canônica da Bíblia (Gênesis = 1º, Êxodo = 2º, etc.), a ordem padrão das linhas de `books` reflete a ordem bíblica. Se o SQLite não expõe um ID autoincremento explícito na tabela `books` além da PK de texto, podemos usar o `rowid` nativo do SQLite da tabela `books` para fazer a ordenação estável!
**Decisão:** Utilizar a query com JOIN:
```sql
SELECT n.id, n.book_abbrev, n.chapter, n.verse_number, n.content, n.created_at, n.updated_at, b.name as book_name, v.text as verse_text
FROM notes n
JOIN books b ON n.book_abbrev = b.abbrev_pt
LEFT JOIN verses v ON n.book_abbrev = v.book_abbrev AND n.chapter = v.chapter AND n.verse_number = v.verse_number AND v.version = 'nvi' -- ou versão ativa
ORDER BY b.rowid ASC, n.chapter ASC, n.verse_number ASC, n.created_at DESC
```
Isso garante a ordenação perfeita.

### 2. Atualização Reativa das Notas
Como o usuário pode adicionar/remover anotações na tela de leitura e depois voltar para a aba de Notas, a lista de notas precisa ser recarregada sempre que a tela de Notas ganhar foco.
**Decisão:** Usar `useFocusEffect` do `expo-router`/`@react-navigation/native` na tela `app/(tabs)/notes.tsx` para disparar a consulta SQL sempre que a tab for exibida.

## Risks / Trade-offs

- **[Risco]** Versículos deletados ou sem cache na tabela `verses` podem fazer a junção `LEFT JOIN` com `verses` falhar em trazer o texto do versículo.
  - *Mitigação:* O texto da anotação e a referência (ex: "Gênesis 1:1") serão sempre exibidos de forma destacada. Se o texto bíblico não estiver no cache local (`verse_text` retornar nulo), renderizaremos uma indicação genérica ou apenas omitiremos o bloco do versículo, mas a anotação do usuário ainda será perfeitamente legível e clicável para abrir a leitura (que fará o fetch caso necessário).

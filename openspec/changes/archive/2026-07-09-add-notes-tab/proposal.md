## Why

Atualmente, o usuário só consegue visualizar as anotações feitas em versículos acessando diretamente o capítulo específico da Bíblia na tela de leitura. Não existe uma centralização que permita rever todas as anotações já feitas de forma organizada e estruturada. Esta mudança resolve isso introduzindo uma tela dedicada para consulta e gerenciamento de todas as anotações do usuário.

## What Changes

- Adição de uma nova Tab no menu inferior (Tab Navigator) chamada "Anotações", posicionada antes da Tab de "Configurações".
- Criação de uma tela de gerenciamento de anotações agrupadas por Livro e Versículo.
- Ordenação das anotações com base na sequência clássica dos livros na Bíblia (Gênesis a Apocalipse), depois por capítulo e número do versículo.
- Capacidade de exibir múltiplas anotações feitas no mesmo versículo.
- Atalho para navegar diretamente para a tela de leitura correspondente ao versículo da anotação selecionada.

## Capabilities

### New Capabilities
- `notes-journal`: Tela dedicada a listar e gerenciar as anotações salvas pelo usuário, agrupadas por livro e ordenadas pela sequência dos livros na Bíblia.

### Modified Capabilities
- `bible-reader`: Adição do ícone e da rota da nova tab no menu inferior principal (Tabs Layout).

## Impact

- `app/(tabs)/_layout.tsx`: Modificação para adicionar a nova tab de Anotações.
- `app/(tabs)/notes.tsx`: Criação da nova rota e tela de exibição das anotações.
- `services/repositories/notesRepository.ts`: Implementação de queries para buscar anotações ordenadas pela sequência dos livros bíblicos.

# notes-journal Specification

## Purpose
TBD - created by archiving change add-notes-tab. Update Purpose after archive.
## Requirements
### Requirement: Visualização centralizada das anotações ordenadas por ordem bíblica

O sistema SHALL prover uma tela para listar todas as anotações do usuário agrupadas por livro e ordenadas sequencialmente de acordo com a ordem dos livros na Bíblia (Gênesis a Apocalipse), depois por capítulo e número do versículo. Cada item na lista SHALL mostrar o nome do livro, capítulo, número do versículo, o texto bíblico correspondente (se disponível), a data de criação/atualização e o conteúdo da anotação.

#### Scenario: Carregar a lista de anotações com anotações existentes
- **WHEN** o usuário abre a tela de Anotações
- **AND** existem anotações salvas no banco de dados local
- **THEN** o sistema DEVE renderizar as anotações organizadas por livro e versículo
- **AND** a ordenação DEVE respeitar a ordem canônica dos livros (ex: anotações de Gênesis aparecem antes de Êxodo)
- **AND** anotações do mesmo livro DEVEM ser ordenadas pelo número do capítulo e versículo de forma crescente

#### Scenario: Múltiplas anotações no mesmo versículo
- **WHEN** existem duas ou mais anotações registradas para o mesmo versículo (ex: Gênesis 1:1)
- **THEN** o sistema DEVE agrupar essas anotações sob o mesmo cabeçalho de versículo
- **AND** listá-las cronologicamente de forma que o usuário veja todas as notas daquele versículo específico

#### Scenario: Tela vazia quando não há anotações
- **WHEN** o usuário abre a tela de Anotações
- **AND** não há nenhuma anotação salva no banco de dados local
- **THEN** o sistema DEVE exibir um estado vazio personalizado (Empty State) utilizando o componente padronizado do app
- **AND** exibir uma mensagem amigável convidando o usuário a fazer sua primeira anotação na tela de leitura

---

### Requirement: Navegação para a tela de leitura a partir de uma anotação

O sistema SHALL permitir que o usuário clique em uma anotação ou em seu agrupamento para ser redirecionado imediatamente para a tela de leitura da Bíblia na posição exata daquela anotação.

#### Scenario: Clicar em uma anotação para ler o versículo correspondente
- **WHEN** o usuário toca em um item de anotação na lista
- **THEN** o sistema DEVE navegar para a tela de leitura `app/reading/[abbrev]/[chapter]` correspondente ao livro e capítulo da anotação
- **AND** salvar essa posição como a última posição de leitura no banco de dados

---

### Requirement: Responsividade e Estilização Visual

A tela de Anotações SHALL respeitar e refletir dinamicamente o tema ativo (Light/Dark) e utilizar as escalas tipográficas estabelecidas no projeto.

#### Scenario: Alternar tema ativo
- **WHEN** o tema do aplicativo é alterado para Dark nas Configurações
- **THEN** a tela de Anotações DEVE transitar suas cores de fundo e texto suavemente para a paleta Dark
- **AND** utilizar as cores semânticas corretas do tema ativo (`background`, `surface`, `textPrimary`, `textSecondary`, `border`, `primary`)


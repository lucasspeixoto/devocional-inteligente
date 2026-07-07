# notes-system

Sistema de anotações vinculadas a versículos específicos, permitindo ao usuário criar, editar, visualizar e excluir notas pessoais associadas a passagens bíblicas. As anotações são armazenadas localmente via SQLite para funcionamento offline.

## ADDED Requirements

### Requirement: Criar anotação em um versículo

O sistema DEVE permitir que o usuário crie uma anotação de texto vinculada a um versículo específico. Cada anotação DEVE ser associada obrigatoriamente a um livro (`book`), capítulo (`chapter`) e número do versículo (`verse`). A anotação DEVE conter um campo de texto livre com o conteúdo da nota. O sistema DEVE registrar automaticamente a data/hora de criação (`createdAt`) e a data/hora de última atualização (`updatedAt`). A anotação DEVE ser persistida na tabela `notes` do banco de dados SQLite local.

#### Scenario: Criar anotação com texto válido

WHEN o usuário seleciona um versículo (ex: livro="gn", capítulo=1, versículo=1) e insere um texto de anotação "Reflexão sobre a criação" e confirma a criação
THEN o sistema DEVE inserir um novo registro na tabela `notes` com os campos `book_id`, `chapter`, `verse_number` e `content` preenchidos
AND o campo `createdAt` DEVE ser preenchido com o timestamp atual
AND o campo `updatedAt` DEVE ser igual ao `createdAt`
AND o sistema DEVE exibir uma confirmação visual de que a anotação foi salva com sucesso

#### Scenario: Impedir criação de anotação com texto vazio

WHEN o usuário tenta criar uma anotação sem inserir nenhum texto (string vazia ou apenas espaços em branco)
THEN o sistema DEVE impedir a criação da anotação
AND DEVE exibir uma mensagem informando que o texto da anotação é obrigatório
AND nenhum registro DEVE ser inserido no banco de dados

#### Scenario: Criar múltiplas anotações no mesmo versículo

WHEN o usuário já possui uma anotação no versículo (livro="gn", capítulo=1, versículo=1) e cria uma segunda anotação no mesmo versículo
THEN o sistema DEVE permitir a criação e armazenar ambas as anotações como registros distintos no banco de dados
AND ambas DEVEM ser visíveis na listagem de anotações do versículo

---

### Requirement: Editar anotação existente

O sistema DEVE permitir que o usuário edite o conteúdo textual de uma anotação já existente. A edição DEVE atualizar apenas o campo `content` e o campo `updatedAt`. Os campos de vínculo com o versículo (`book_id`, `chapter`, `verse_number`) e o campo `createdAt` NÃO DEVEM ser alterados durante a edição.

#### Scenario: Editar o texto de uma anotação existente

WHEN o usuário abre uma anotação existente com conteúdo "Texto original" e altera o conteúdo para "Texto atualizado" e confirma a edição
THEN o campo `content` do registro DEVE ser atualizado para "Texto atualizado"
AND o campo `updatedAt` DEVE ser atualizado com o timestamp atual
AND o campo `createdAt` DEVE permanecer inalterado

#### Scenario: Cancelar edição de anotação

WHEN o usuário abre uma anotação para edição, modifica o texto, e cancela a operação
THEN o conteúdo original da anotação DEVE ser mantido no banco de dados
AND nenhuma alteração DEVE ser persistida

#### Scenario: Impedir salvamento de edição com texto vazio

WHEN o usuário edita uma anotação existente e limpa todo o texto (campo vazio ou apenas espaços)
THEN o sistema DEVE impedir o salvamento
AND DEVE exibir uma mensagem informando que o texto da anotação é obrigatório
AND o conteúdo anterior DEVE ser preservado no banco de dados

---

### Requirement: Excluir anotação

O sistema DEVE permitir que o usuário exclua uma anotação existente. A exclusão DEVE requerer uma confirmação explícita do usuário antes de remover permanentemente o registro do banco de dados. Após a exclusão, o registro DEVE ser removido permanentemente da tabela `notes`.

#### Scenario: Excluir anotação com confirmação

WHEN o usuário solicita a exclusão de uma anotação existente
THEN o sistema DEVE exibir um diálogo de confirmação perguntando se deseja realmente excluir a anotação
AND quando o usuário confirmar, o registro DEVE ser removido permanentemente do banco de dados
AND a anotação NÃO DEVE mais aparecer na listagem de anotações do versículo

#### Scenario: Cancelar exclusão de anotação

WHEN o usuário solicita a exclusão de uma anotação e o diálogo de confirmação é exibido
AND o usuário cancela a operação
THEN a anotação DEVE permanecer intacta no banco de dados
AND DEVE continuar visível na listagem de anotações

#### Scenario: Excluir última anotação de um versículo

WHEN o usuário exclui a única anotação existente em um versículo
THEN o registro DEVE ser removido do banco de dados
AND o indicador visual de anotação no versículo DEVE ser removido
AND a listagem de anotações do versículo DEVE exibir um estado vazio

---

### Requirement: Visualizar anotações de um versículo

O sistema DEVE permitir que o usuário visualize todas as anotações associadas a um versículo específico. A visualização DEVE exibir o conteúdo completo de cada anotação, a data de criação e a data da última atualização. As anotações DEVEM ser ordenadas da mais recente para a mais antiga com base no campo `updatedAt`.

#### Scenario: Visualizar anotações de um versículo que possui anotações

WHEN o usuário acessa as anotações do versículo (livro="gn", capítulo=1, versículo=1) que possui 3 anotações
THEN o sistema DEVE exibir todas as 3 anotações associadas ao versículo
AND cada anotação DEVE mostrar o conteúdo do texto, a data de criação e a data da última atualização
AND as anotações DEVEM ser ordenadas da mais recentemente atualizada para a mais antiga

#### Scenario: Visualizar anotações de um versículo sem anotações

WHEN o usuário acessa as anotações de um versículo que não possui nenhuma anotação
THEN o sistema DEVE exibir um estado vazio com uma mensagem indicativa (ex: "Nenhuma anotação para este versículo")
AND DEVE oferecer uma opção visível para criar a primeira anotação

---

### Requirement: Indicador visual em versículos com anotações

O sistema DEVE exibir um indicador visual nos versículos que possuem pelo menos uma anotação associada. O indicador DEVE ser visível diretamente na tela de leitura, junto ao texto do versículo, sem necessidade de interação adicional. O indicador DEVE ser atualizado em tempo real quando anotações são criadas ou excluídas.

#### Scenario: Exibir indicador em versículo com anotações

WHEN a tela de leitura exibe um capítulo que contém versículos com anotações
THEN cada versículo que possua ao menos uma anotação DEVE exibir um ícone ou marcador visual distinto junto ao seu texto
AND versículos sem anotações NÃO DEVEM exibir o indicador

#### Scenario: Atualizar indicador ao criar anotação

WHEN o usuário cria uma anotação em um versículo que anteriormente não possuía nenhuma anotação
THEN o indicador visual DEVE aparecer imediatamente junto ao versículo na tela de leitura, sem necessidade de recarregar a tela

#### Scenario: Remover indicador ao excluir última anotação

WHEN o usuário exclui a última anotação de um versículo (nenhuma anotação restante)
THEN o indicador visual DEVE ser removido imediatamente do versículo na tela de leitura, sem necessidade de recarregar a tela

#### Scenario: Acessar anotações pelo indicador visual

WHEN o usuário toca no indicador visual de anotação de um versículo
THEN o sistema DEVE navegar para a visualização de anotações daquele versículo específico

---

### Requirement: Listagem geral de anotações

O sistema DEVE fornecer uma tela de listagem geral que exiba todas as anotações do usuário, independentemente do versículo ao qual estão vinculadas. A listagem DEVE exibir a referência bíblica (livro, capítulo e versículo), um trecho do conteúdo da anotação e a data da última atualização. A listagem DEVE ser ordenada pela data de última atualização, da mais recente para a mais antiga.

#### Scenario: Exibir lista de todas as anotações

WHEN o usuário acessa a tela de listagem geral de anotações e existem anotações salvas
THEN o sistema DEVE exibir todas as anotações em formato de lista
AND cada item DEVE mostrar a referência bíblica formatada (ex: "Gênesis 1:1"), um trecho do texto da anotação e a data da última atualização
AND a lista DEVE estar ordenada da anotação mais recentemente atualizada para a mais antiga

#### Scenario: Exibir estado vazio na listagem geral

WHEN o usuário acessa a tela de listagem geral de anotações e não existem anotações salvas
THEN o sistema DEVE exibir um estado vazio com uma mensagem indicativa (ex: "Você ainda não tem anotações")

#### Scenario: Navegar para anotação a partir da listagem geral

WHEN o usuário toca em um item da listagem geral de anotações
THEN o sistema DEVE navegar para a visualização completa da anotação selecionada
AND DEVE exibir o contexto do versículo ao qual a anotação está vinculada

#### Scenario: Refletir exclusão na listagem geral

WHEN o usuário exclui uma anotação a partir da visualização detalhada
THEN ao retornar à listagem geral, a anotação excluída NÃO DEVE mais aparecer na lista
AND a contagem total de anotações DEVE ser atualizada

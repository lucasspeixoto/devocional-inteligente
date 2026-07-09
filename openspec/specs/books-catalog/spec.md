# Spec: books-catalog

Listagem e detalhes dos livros da Bíblia com informações da API da Bíblia Digital.

## Requirements

### Requirement: Listagem de livros agrupados

A tela de livros DEVE exibir todos os 66 livros da Bíblia retornados pelo endpoint `/api/books`, organizados em seções por grupo. Cada seção DEVE ter um cabeçalho visível com o nome do grupo. Os grupos DEVEM aparecer na seguinte ordem: Pentateuco, Históricos, Poéticos, Profetas Maiores, Profetas Menores (para o Velho Testamento — VT), seguidos de Evangelhos, Cartas de Paulo, Cartas Gerais, Profecia (para o Novo Testamento — NT). Dentro de cada grupo, os livros DEVEM manter a ordem retornada pela API.

#### Scenario: Exibição dos livros do Velho Testamento agrupados

WHEN a tela de livros é carregada com sucesso
THEN os livros do Velho Testamento DEVEM ser exibidos em seções separadas: "Pentateuco", "Históricos", "Poéticos", "Profetas Maiores" e "Profetas Menores"
AND cada seção DEVE ter um cabeçalho visível com o nome do grupo
AND os livros dentro de cada seção DEVEM seguir a ordem retornada pela API

#### Scenario: Exibição dos livros do Novo Testamento agrupados

WHEN a tela de livros é carregada com sucesso
THEN os livros do Novo Testamento DEVEM ser exibidos em seções separadas: "Evangelhos", "Cartas de Paulo", "Cartas Gerais" e "Profecia"
AND cada seção DEVE ter um cabeçalho visível com o nome do grupo
AND as seções do Novo Testamento DEVEM aparecer após as seções do Velho Testamento

#### Scenario: Ordem dos grupos na listagem

WHEN a tela de livros exibe todos os livros
THEN a ordem dos grupos DEVE ser: Pentateuco → Históricos → Poéticos → Profetas Maiores → Profetas Menores → Evangelhos → Cartas de Paulo → Cartas Gerais → Profecia

### Requirement: Informações visíveis de cada livro na listagem

Cada item de livro na lista DEVE exibir pelo menos o nome do livro e a abreviação em português. A quantidade de capítulos DEVE estar visível para cada livro. O testamento (VT ou NT) PODE ser indicado visualmente (ex.: cor, ícone ou badge), mas NÃO é obrigatório dado que o agrupamento já separa VT de NT.

#### Scenario: Exibição do nome e abreviação do livro

WHEN um livro é exibido na lista (ex.: Gênesis)
THEN o nome completo do livro DEVE ser exibido (ex.: "Gênesis")
AND a abreviação em português DEVE ser exibida (ex.: "gn")

#### Scenario: Exibição da quantidade de capítulos

WHEN um livro é exibido na lista (ex.: Gênesis com 50 capítulos)
THEN a quantidade de capítulos DEVE ser exibida (ex.: "50 capítulos")

#### Scenario: Exibição do autor do livro

WHEN um livro é exibido na lista (ex.: Salmos com autor "David, Moisés, Salomão")
THEN o autor do livro DEVE ser exibido

### Requirement: Navegação para tela de detalhes do livro

O usuário DEVE poder tocar em qualquer livro da lista para navegar à tela de detalhes desse livro. A navegação DEVE usar a abreviação do livro (`abbrev.pt`) como parâmetro de rota para buscar os dados do endpoint `/api/books/:abbrev`.

#### Scenario: Toque em um livro navega para detalhes

WHEN o usuário toca no livro "Gênesis" na lista
THEN o app DEVE navegar para a tela de detalhes do livro
AND a rota DEVE conter a abreviação do livro (ex.: `gn`)

#### Scenario: Carregamento dos detalhes via API

WHEN a tela de detalhes é aberta para o livro com abreviação "gn"
THEN o app DEVE fazer uma requisição GET para `/api/books/gn`
AND a requisição DEVE incluir o header `Authorization: Bearer {{ACCESS_TOKEN}}`

### Requirement: Tela de detalhes do livro

A tela de detalhes DEVE exibir todas as informações retornadas pelo endpoint `/api/books/:abbrev`: nome, abreviação (pt e en), autor, quantidade de capítulos, grupo, testamento e o campo `comment` com informações estendidas sobre o livro. O campo `comment` DEVE ser exibido de forma legível, com rolagem caso o texto seja extenso.

#### Scenario: Exibição completa dos dados de detalhes

WHEN a tela de detalhes é carregada com sucesso para o livro "Gênesis"
THEN o nome "Gênesis" DEVE ser exibido
AND a abreviação em português "gn" DEVE ser exibida
AND a abreviação em inglês "gn" DEVE ser exibida
AND o autor "Moisés" DEVE ser exibido
AND a quantidade de capítulos "50" DEVE ser exibida
AND o grupo "Pentateuco" DEVE ser exibido
AND o testamento "VT" DEVE ser exibido

#### Scenario: Exibição do comentário estendido

WHEN a tela de detalhes é carregada e o campo `comment` possui conteúdo
THEN o comentário completo DEVE ser exibido na tela
AND o conteúdo DEVE ser rolável caso ultrapasse a área visível da tela

#### Scenario: Comentário ausente ou vazio

WHEN a tela de detalhes é carregada e o campo `comment` está vazio ou ausente
THEN a seção de comentário NÃO DEVE ser exibida ou DEVE exibir uma mensagem indicativa (ex.: "Nenhuma informação adicional disponível")

### Requirement: Busca e filtro de livros

A tela de livros DEVE fornecer uma funcionalidade de busca/filtro que permita ao usuário encontrar livros rapidamente. O filtro DEVE buscar pelo nome do livro e pela abreviação. O filtro DEVE ser aplicado em tempo real conforme o usuário digita. Os resultados filtrados DEVEM manter o agrupamento por grupo.

#### Scenario: Filtragem por nome do livro

WHEN o usuário digita "salm" no campo de busca
THEN apenas o livro "Salmos" (e quaisquer outros que contenham "salm" no nome) DEVE ser exibido
AND o livro DEVE permanecer dentro de sua seção de grupo ("Poéticos")

#### Scenario: Filtragem por abreviação

WHEN o usuário digita "gn" no campo de busca
THEN o livro "Gênesis" (abreviação "gn") DEVE ser exibido nos resultados

#### Scenario: Filtro sem resultados

WHEN o usuário digita um texto que não corresponde a nenhum livro (ex.: "xyz")
THEN a lista DEVE exibir um estado vazio com mensagem indicativa (ex.: "Nenhum livro encontrado")

#### Scenario: Limpeza do filtro

WHEN o usuário limpa o campo de busca
THEN todos os livros DEVEM ser exibidos novamente com o agrupamento completo

#### Scenario: Filtro case-insensitive

WHEN o usuário digita "GENESIS" ou "gênesis" ou "genesis" no campo de busca
THEN o livro "Gênesis" DEVE aparecer nos resultados (busca sem distinção de maiúsculas/minúsculas e acentos)

### Requirement: Filtro por testamento

A tela de livros DEVE oferecer uma forma de filtrar entre Velho Testamento (VT), Novo Testamento (NT) ou Todos. O filtro PODE ser implementado como tabs, botões segmentados ou outra forma de controle visível.

#### Scenario: Filtrar por Velho Testamento

WHEN o usuário seleciona o filtro "Velho Testamento"
THEN apenas os livros com `testament: "VT"` DEVEM ser exibidos
AND os grupos exibidos DEVEM ser apenas: Pentateuco, Históricos, Poéticos, Profetas Maiores, Profetas Menores

#### Scenario: Filtrar por Novo Testamento

WHEN o usuário seleciona o filtro "Novo Testamento"
THEN apenas os livros com `testament: "NT"` DEVEM ser exibidos
AND os grupos exibidos DEVEM ser apenas: Evangelhos, Cartas de Paulo, Cartas Gerais, Profecia

#### Scenario: Mostrar todos os livros

WHEN o usuário seleciona o filtro "Todos" (ou estado padrão)
THEN todos os 66 livros DEVEM ser exibidos com todos os grupos

### Requirement: Estados de carregamento e erro na listagem

A tela de livros DEVE exibir indicadores de estado durante o carregamento e em caso de erro. O estado de carregamento DEVE ser visível enquanto os dados são buscados. Em caso de falha na requisição, uma mensagem de erro DEVE ser exibida com opção de tentar novamente.

#### Scenario: Estado de carregamento na listagem

WHEN a tela de livros está buscando dados da API ou do banco local
THEN um indicador de carregamento (spinner, skeleton ou shimmer) DEVE ser exibido

#### Scenario: Erro na listagem com retry

WHEN a requisição de livros falha (ex.: sem conexão, erro de servidor)
THEN uma mensagem de erro DEVE ser exibida ao usuário
AND um botão "Tentar novamente" DEVE estar disponível
AND ao tocar em "Tentar novamente", a requisição DEVE ser refeita

### Requirement: Estados de carregamento e erro nos detalhes

A tela de detalhes DEVE exibir indicadores de estado durante o carregamento e em caso de erro, de forma similar à tela de listagem.

#### Scenario: Estado de carregamento nos detalhes

WHEN a tela de detalhes está buscando dados do endpoint `/api/books/:abbrev`
THEN um indicador de carregamento DEVE ser exibido

#### Scenario: Erro nos detalhes com retry

WHEN a requisição de detalhes do livro falha
THEN uma mensagem de erro DEVE ser exibida
AND um botão "Tentar novamente" DEVE estar disponível

### Requirement: Apresentação visual consistente com o tema

A tela de livros e a tela de detalhes DEVEM respeitar o sistema de temas do app (light/dark). Os cabeçalhos de grupo DEVEM ter destaque visual (ex.: cor de fundo, tipografia diferenciada). Os itens da lista DEVEM ser facilmente distinguíveis (separadores, cards ou espaçamento). A paleta de cores DEVE seguir o padrão do app: tons de marrom como cor primária e amarelo como cor secundária.

#### Scenario: Tema light aplicado na listagem

WHEN o app está configurado com tema light
THEN a tela de livros DEVE usar as cores do tema light
AND os textos DEVEM ter contraste adequado com o fundo claro

#### Scenario: Tema dark aplicado na listagem

WHEN o app está configurado com tema dark
THEN a tela de livros DEVE usar as cores do tema dark
AND os textos DEVEM ter contraste adequado com o fundo escuro

#### Scenario: Cabeçalhos de grupo com destaque visual

WHEN os grupos são exibidos na lista de livros
THEN cada cabeçalho de grupo DEVE ter destaque visual diferenciado dos itens de livro (ex.: tipografia maior/bold, cor de fundo diferente ou separador visual)

#### Scenario: Tema aplicado na tela de detalhes

WHEN o app alterna entre tema light e dark
THEN a tela de detalhes DEVE atualizar suas cores para refletir o tema ativo

### Requirement: Navegação de retorno dos detalhes

O usuário DEVE poder retornar da tela de detalhes para a tela de listagem de livros. A navegação de retorno DEVE preservar a posição de scroll e o estado de filtro/busca da lista.

#### Scenario: Retorno via botão voltar

WHEN o usuário está na tela de detalhes de um livro
AND o usuário pressiona o botão de voltar (hardware ou header)
THEN o app DEVE navegar de volta para a tela de listagem de livros

#### Scenario: Preservação do estado da lista ao retornar

WHEN o usuário aplicou um filtro ou rolou até determinada posição na lista
AND o usuário navega para detalhes de um livro e retorna
THEN a posição de scroll e os filtros aplicados DEVEM ser preservados

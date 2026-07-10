# Spec: bible-api-service

Serviço de integração com a API da Bíblia Digital (https://www.abibliadigital.com.br) para consulta de livros, versículos, detalhes de livros e versões disponíveis, com autenticação Bearer token.

## Requirements

### Requirement: Configuração do cliente HTTP com autenticação

O serviço DEVE criar um cliente HTTP (ex: axios instance) pré-configurado com a base URL `https://www.abibliadigital.com.br` e o header `Authorization` com valor `Bearer {{ACCESS_TOKEN}}`, onde `ACCESS_TOKEN` é lido da variável de ambiente `EXPO_PUBLIC_ACCESS_TOKEN`. Todas as requisições realizadas pelo serviço DEVEM utilizar esse cliente pré-configurado.

#### Scenario: Cliente HTTP é criado com base URL e header de autorização corretos

WHEN o serviço é inicializado
THEN o cliente HTTP DEVE ter a base URL configurada como `https://www.abibliadigital.com.br`
AND o header padrão `Authorization` DEVE conter o valor `Bearer <token>` onde `<token>` é o valor de `EXPO_PUBLIC_ACCESS_TOKEN`

#### Scenario: Todas as requisições incluem o header de autorização

WHEN qualquer função do serviço realiza uma requisição à API
THEN a requisição DEVE incluir o header `Authorization: Bearer <token>`

---

### Requirement: Leitura do token de acesso da variável de ambiente

O serviço DEVE ler o token de acesso exclusivamente da variável de ambiente `EXPO_PUBLIC_ACCESS_TOKEN` disponível via `process.env`. O token NÃO DEVE ser hardcoded no código-fonte.

#### Scenario: Token é lido de EXPO_PUBLIC_ACCESS_TOKEN

WHEN o serviço é configurado
THEN o valor do token DEVE ser obtido de `process.env.EXPO_PUBLIC_ACCESS_TOKEN`
AND nenhum token DEVE estar hardcoded no código-fonte

#### Scenario: Variável de ambiente não definida

WHEN `EXPO_PUBLIC_ACCESS_TOKEN` não está definida ou está vazia
THEN o serviço DEVE utilizar uma string vazia como token (comportamento gracioso)
AND as requisições serão enviadas com `Authorization: Bearer ` (sem token), delegando o tratamento de erro 401 ao fluxo de erro padrão

---

### Requirement: Listar todos os livros da Bíblia

O serviço DEVE expor uma função `getBooks()` que realiza uma requisição `GET /api/books` e retorna a lista de todos os livros da Bíblia.

#### Scenario: Requisição bem-sucedida retorna lista de livros

WHEN `getBooks()` é chamada
AND a API retorna status 200 com um array de livros
THEN a função DEVE retornar o array de livros contido em `response.data`

#### Scenario: Estrutura esperada de cada livro na lista

WHEN `getBooks()` retorna com sucesso
THEN cada item do array DEVE conter pelo menos os campos:
  - `abbrev` (objeto com `pt` e `en`) — abreviação do livro
  - `name` (string) — nome do livro
  - `author` (string) — autor do livro
  - `group` (string) — grupo (ex: "Pentateuco", "Evangelhos")
  - `chapters` (number) — quantidade de capítulos

---

### Requirement: Obter detalhes de um livro específico

O serviço DEVE expor uma função `getBookDetails(abbrev)` que realiza uma requisição `GET /api/books/:abbrev` e retorna os detalhes do livro correspondente à abreviação informada.

#### Scenario: Requisição bem-sucedida retorna detalhes do livro

WHEN `getBookDetails("gn")` é chamada
AND a API retorna status 200 com os detalhes do livro Gênesis
THEN a função DEVE retornar o objeto de detalhes contido em `response.data`

#### Scenario: Abreviação inválida resulta em erro

WHEN `getBookDetails("xyz")` é chamada com uma abreviação que não existe
AND a API retorna status 404
THEN a função DEVE propagar o erro para o chamador (throw/reject)

---

### Requirement: Obter versículos de um capítulo

O serviço DEVE expor uma função `getChapterVerses(version, abbrev, chapter)` que realiza uma requisição `GET /api/verses/:version/:abbrev/:chapter` e retorna os versículos do capítulo solicitado.

#### Scenario: Requisição bem-sucedida retorna versículos do capítulo

WHEN `getChapterVerses("nvi", "gn", 1)` é chamada
AND a API retorna status 200
THEN a função DEVE retornar o objeto contido em `response.data`
AND o objeto retornado DEVE conter o campo `verses` com um array de versículos

#### Scenario: Estrutura esperada de cada versículo

WHEN `getChapterVerses()` retorna com sucesso
THEN cada item do array `verses` DEVE conter pelo menos:
  - `number` (number) — número do versículo
  - `text` (string) — texto do versículo

#### Scenario: Capítulo inexistente resulta em erro

WHEN `getChapterVerses("nvi", "gn", 999)` é chamada com um capítulo que não existe
AND a API retorna status 404
THEN a função DEVE propagar o erro para o chamador

#### Scenario: Versão inexistente resulta em erro

WHEN `getChapterVerses("xxx", "gn", 1)` é chamada com uma versão que não existe
AND a API retorna um erro (status 4xx)
THEN a função DEVE propagar o erro para o chamador

---

### Requirement: Listar versões disponíveis da Bíblia

O serviço DEVE expor uma função `getVersions()` que realiza uma requisição `GET /api/versions` e retorna a lista de versões (traduções) disponíveis da Bíblia.

#### Scenario: Requisição bem-sucedida retorna lista de versões

WHEN `getVersions()` é chamada
AND a API retorna status 200 com um array de versões
THEN a função DEVE retornar o array de versões contido em `response.data`

#### Scenario: Estrutura esperada de cada versão

WHEN `getVersions()` retorna com sucesso
THEN cada item do array DEVE conter pelo menos:
  - `version` (string) — identificador da versão (ex: "nvi", "acf")
  - `verses` (number) — quantidade total de versículos

---

### Requirement: Tratamento de erros de rede e servidor

O serviço DEVE tratar erros de rede (timeout, sem conexão) e erros do servidor (status 5xx) de forma consistente em todas as funções, propagando o erro para o chamador.

#### Scenario: Erro de rede é propagado

WHEN qualquer função do serviço é chamada
AND a requisição falha por erro de rede (ex: timeout, DNS, sem internet)
THEN a função DEVE rejeitar/lançar o erro original do cliente HTTP
AND o erro DEVE ser propagado ao chamador para tratamento na camada superior

#### Scenario: Erro de servidor (5xx) é propagado

WHEN qualquer função do serviço é chamada
AND a API retorna um status 500, 502, 503 ou outro erro 5xx
THEN a função DEVE rejeitar/lançar o erro com as informações da resposta HTTP
AND o erro DEVE ser propagado ao chamador

#### Scenario: Erro de autenticação (401) é propagado

WHEN qualquer função do serviço é chamada
AND a API retorna status 401 (Unauthorized)
THEN a função DEVE rejeitar/lançar o erro
AND o chamador DEVE poder identificar que se trata de um erro de autenticação pelo status da resposta

---

### Requirement: Interface exportada do serviço

O serviço DEVE exportar as quatro funções como um módulo reutilizável, de modo que outros módulos da aplicação possam importar e utilizar qualquer uma delas individualmente.

#### Scenario: Todas as funções são exportadas

WHEN o módulo do serviço é importado
THEN as seguintes funções DEVEM estar disponíveis para importação:
  - `getBooks`
  - `getBookDetails`
  - `getChapterVerses`
  - `getVersions`

#### Scenario: Funções podem ser importadas individualmente

WHEN um consumidor importa apenas `getBooks` do módulo
THEN a importação DEVE funcionar sem erros
AND a função importada DEVE estar pronta para uso sem configuração adicional

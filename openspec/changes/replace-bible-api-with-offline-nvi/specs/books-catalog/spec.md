## MODIFIED Requirements

### Requirement: Listagem de livros agrupados
A tela de livros MUST carregar da base NVI local todos os 66 livros e exibi-los agrupados por testamento e grupo, na ordem canônica da base empacotada.

#### Scenario: Exibição dos livros do Velho Testamento agrupados
- **WHEN** o usuário acessa a tela de livros sem conectividade
- **THEN** a tela DEVE exibir os 39 livros do Velho Testamento agrupados a partir da base local

#### Scenario: Exibição dos livros do Novo Testamento agrupados
- **WHEN** o usuário acessa a tela de livros sem conectividade
- **THEN** a tela DEVE exibir os 27 livros do Novo Testamento agrupados a partir da base local

#### Scenario: Ordem dos grupos na listagem
- **WHEN** a lista é exibida
- **THEN** os grupos e livros DEVEM manter a ordem canônica definida pelos metadados locais

### Requirement: Estados de carregamento e erro na listagem
A tela MUST indicar o carregamento durante a preparação local do catálogo e apresentar erro com opção de tentar novamente somente quando a leitura ou preparação dos dados locais falhar.

#### Scenario: Estado de carregamento na listagem
- **WHEN** o catálogo empacotado está sendo preparado
- **THEN** a tela DEVE exibir um indicador de carregamento até os livros estarem disponíveis

#### Scenario: Erro na listagem com retry
- **WHEN** a preparação local falha
- **THEN** a tela DEVE informar que o conteúdo local não pôde ser carregado e oferecer nova tentativa

### Requirement: Navegação para tela de detalhes do livro
A tela de catálogo MUST navegar para os detalhes do livro selecionado e carregar seus dados e comentários exclusivamente do armazenamento local.

#### Scenario: Toque em um livro navega para detalhes
- **WHEN** o usuário toca em um livro da lista
- **THEN** o sistema DEVE abrir a tela de detalhes correspondente

#### Scenario: Carregamento dos detalhes via API
- **WHEN** a tela de detalhes é aberta sem conectividade
- **THEN** os metadados e o comentário persistido DEVEM ser carregados localmente

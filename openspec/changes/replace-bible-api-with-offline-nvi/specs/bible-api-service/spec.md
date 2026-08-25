## ADDED Requirements

### Requirement: Interface local de conteúdo bíblico
O serviço de conteúdo bíblico MUST fornecer catálogo, detalhes de livros, capítulos e a tradução NVI usando somente a fonte empacotada, sem exigir token, conectividade ou servidor externo.

#### Scenario: Consumidores obtêm conteúdo pelo serviço local
- **WHEN** um consumidor solicita livros, detalhes ou um capítulo válido
- **THEN** o serviço DEVE responder com dados da NVI empacotada e NÃO DEVE emitir requisições HTTP

## REMOVED Requirements

### Requirement: Configuração do cliente HTTP com autenticação
**Reason**: A API remota foi descontinuada e não participa mais do fornecimento de conteúdo.
**Migration**: Consumidores devem usar a interface local de conteúdo bíblico.

### Requirement: Leitura do token de acesso da variável de ambiente
**Reason**: A fonte offline não exige autenticação.
**Migration**: Remover `EXPO_PUBLIC_ACCESS_TOKEN` e qualquer tratamento de token ausente.

### Requirement: Listar todos os livros da Bíblia
**Reason**: A listagem via endpoint remoto foi substituída pelo catálogo empacotado.
**Migration**: Obter os livros pela interface local.

### Requirement: Obter detalhes de um livro específico
**Reason**: A consulta via endpoint remoto foi substituída por metadados locais.
**Migration**: Obter detalhes pela interface local e preservar comentários editados pelo usuário no SQLite.

### Requirement: Obter versículos de um capítulo
**Reason**: A consulta remota sob demanda não está mais disponível.
**Migration**: Resolver o capítulo diretamente na NVI empacotada.

### Requirement: Listar versões disponíveis da Bíblia
**Reason**: O produto passa a oferecer somente NVI.
**Migration**: Usar a constante canônica `nvi` e o nome público da tradução.

### Requirement: Tratamento de erros de rede e servidor
**Reason**: O fluxo de conteúdo não depende mais de rede ou servidor.
**Migration**: Tratar somente erros de integridade ou leitura da base local.

### Requirement: Interface exportada do serviço
**Reason**: A interface HTTP antiga deixa de existir.
**Migration**: Atualizar imports para a interface local equivalente e eliminar exports exclusivos da API.

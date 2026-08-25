## MODIFIED Requirements

### Requirement: Exibição de versículos do capítulo atual
A tela de leitura MUST exibir todos os versículos do capítulo atual exclusivamente na tradução NVI, obtidos da base empacotada ou de sua representação local preparada, mantendo número e texto na ordem original.

#### Scenario: Exibir versículos ao abrir um capítulo
- **WHEN** o usuário abre um livro e capítulo válidos sem conectividade
- **THEN** todos os versículos NVI do capítulo DEVEM ser exibidos na ordem original

#### Scenario: Renderizar versículos com dados da API
- **WHEN** os versículos NVI locais são retornados para o capítulo
- **THEN** a tela DEVE renderizar número e texto de cada versículo sem consultar a API

#### Scenario: Exibir capítulo vazio quando não há versículos
- **WHEN** uma referência fora dos limites da base NVI é solicitada
- **THEN** a tela DEVE exibir um estado de referência inválida e NÃO DEVE tentar buscar dados na rede

### Requirement: Estados de carregamento
A tela MUST exibir carregamento somente enquanto consulta ou prepara dados locais e distinguir falha da base local de uma referência inexistente.

#### Scenario: Exibir indicador de carregamento ao buscar versículos
- **WHEN** o usuário navega para outro capítulo e a leitura local ainda não terminou
- **THEN** um indicador DEVE ser exibido

#### Scenario: Substituir indicador por conteúdo após carregamento
- **WHEN** a consulta local termina com sucesso
- **THEN** o indicador DEVE ser substituído pelos versículos

#### Scenario: Exibir estado de erro quando o carregamento falha
- **WHEN** o conteúdo empacotado não pode ser lido ou validado
- **THEN** a tela DEVE exibir um erro de conteúdo local sem mensagem de conectividade

#### Scenario: Carregamento durante transição entre capítulos por swipe
- **WHEN** um swipe inicia a consulta local do capítulo adjacente
- **THEN** a tela DEVE indicar carregamento até o novo capítulo estar disponível
